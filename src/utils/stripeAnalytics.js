import { collection, doc, setDoc, updateDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Stripe Analytics & Usage Tracking System
 * Tracks subscription revenue, customer lifecycle, and usage patterns
 */

export class StripeAnalytics {
  constructor() {
    this.collections = {
      subscriptions: 'stripe_subscriptions',
      payments: 'stripe_payments', 
      customers: 'stripe_customers',
      analytics: 'stripe_analytics',
      usage: 'usage_analytics'
    };
  }

  // ============================================================================
  // SUBSCRIPTION ANALYTICS
  // ============================================================================

  /**
   * Track subscription creation/updates
   */
  async trackSubscription(subscriptionData) {
    try {
      const {
        id,
        customer,
        status,
        current_period_start,
        current_period_end,
        plan,
        items,
        trial_end,
        cancel_at_period_end,
        created
      } = subscriptionData;

      const subscription = {
        stripeSubscriptionId: id,
        customerId: customer,
        status,
        planId: plan?.id,
        planName: plan?.nickname || plan?.id,
        amount: plan?.amount || 0,
        currency: plan?.currency || 'usd',
        interval: plan?.interval,
        intervalCount: plan?.interval_count || 1,
        currentPeriodStart: new Date(current_period_start * 1000),
        currentPeriodEnd: new Date(current_period_end * 1000),
        trialEnd: trial_end ? new Date(trial_end * 1000) : null,
        cancelAtPeriodEnd: cancel_at_period_end,
        created: new Date(created * 1000),
        updatedAt: serverTimestamp(),
        // Calculate MRR
        mrr: this.calculateMRR(plan?.amount || 0, plan?.interval, plan?.interval_count || 1)
      };

      await setDoc(doc(db, this.collections.subscriptions, id), subscription);
      
      // Update analytics aggregates
      await this.updateAnalyticsAggregates();
      
      console.log(`📊 Tracked subscription: ${id} - ${status}`);
      return subscription;
    } catch (error) {
      console.error('Error tracking subscription:', error);
      throw error;
    }
  }

  /**
   * Track payment events
   */
  async trackPayment(paymentData) {
    try {
      const {
        id,
        customer,
        subscription,
        amount,
        currency,
        status,
        created,
        description,
        failure_code,
        failure_message
      } = paymentData;

      const payment = {
        stripePaymentId: id,
        customerId: customer,
        subscriptionId: subscription,
        amount: amount,
        currency: currency || 'usd',
        status,
        description,
        failureCode: failure_code,
        failureMessage: failure_message,
        created: new Date(created * 1000),
        timestamp: serverTimestamp()
      };

      await setDoc(doc(db, this.collections.payments, id), payment);
      
      // Update customer analytics
      await this.updateCustomerAnalytics(customer, payment);
      
      console.log(`💳 Tracked payment: ${id} - ${status} - $${amount/100}`);
      return payment;
    } catch (error) {
      console.error('Error tracking payment:', error);
      throw error;
    }
  }

  /**
   * Track customer lifecycle events
   */
  async trackCustomer(customerData, organizationId = null) {
    try {
      const {
        id,
        email,
        created,
        subscriptions,
        default_source
      } = customerData;

      const customer = {
        stripeCustomerId: id,
        email,
        organizationId,
        created: new Date(created * 1000),
        hasPaymentMethod: !!default_source,
        subscriptionsCount: subscriptions?.data?.length || 0,
        updatedAt: serverTimestamp(),
        // Lifecycle tracking
        status: 'active',
        firstSubscriptionDate: null,
        churnDate: null,
        totalRevenue: 0,
        lifetimeValue: 0
      };

      await setDoc(doc(db, this.collections.customers, id), customer);
      console.log(`👤 Tracked customer: ${email}`);
      return customer;
    } catch (error) {
      console.error('Error tracking customer:', error);
      throw error;
    }
  }

  // ============================================================================
  // USAGE ANALYTICS
  // ============================================================================

  /**
   * Track feature usage
   */
  async trackFeatureUsage(organizationId, userId, feature, metadata = {}) {
    try {
      const usageId = `${organizationId}_${userId}_${feature}_${Date.now()}`;
      
      const usage = {
        organizationId,
        userId,
        feature,
        timestamp: serverTimestamp(),
        metadata,
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        hour: new Date().getHours()
      };

      await setDoc(doc(db, this.collections.usage, usageId), usage);
      
      // Update daily aggregates
      await this.updateUsageAggregates(organizationId, feature);
      
      return usage;
    } catch (error) {
      console.error('Error tracking feature usage:', error);
      throw error;
    }
  }

  /**
   * Track user session
   */
  async trackSession(organizationId, userId, sessionData) {
    try {
      const {
        sessionId,
        startTime,
        endTime,
        pageViews,
        actions,
        duration
      } = sessionData;

      const session = {
        organizationId,
        userId,
        sessionId,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        pageViews: pageViews || [],
        actions: actions || [],
        timestamp: serverTimestamp()
      };

      // Only include duration if it's defined (not undefined)
      if (duration !== undefined) {
        session.duration = duration;
      }

      await setDoc(doc(db, 'user_sessions', sessionId), session);
      return session;
    } catch (error) {
      console.error('Error tracking session:', error);
      throw error;
    }
  }

  // ============================================================================
  // ANALYTICS CALCULATIONS
  // ============================================================================

  /**
   * Calculate Monthly Recurring Revenue (MRR)
   */
  calculateMRR(amount, interval, intervalCount = 1) {
    const monthlyAmount = amount / 100; // Convert from cents
    
    switch (interval) {
      case 'month':
        return monthlyAmount / intervalCount;
      case 'year':
        return (monthlyAmount / intervalCount) / 12;
      case 'week':
        return (monthlyAmount / intervalCount) * 4.33; // Average weeks per month
      case 'day':
        return (monthlyAmount / intervalCount) * 30; // Average days per month
      default:
        return monthlyAmount;
    }
  }

  /**
   * Calculate customer lifetime value
   */
  async calculateCustomerLTV(customerId) {
    try {
      const paymentsQuery = query(
        collection(db, this.collections.payments),
        where('customerId', '==', customerId),
        where('status', '==', 'succeeded')
      );
      
      const paymentsSnapshot = await getDocs(paymentsQuery);
      const totalRevenue = paymentsSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().amount || 0);
      }, 0);

      return totalRevenue / 100; // Convert from cents
    } catch (error) {
      console.error('Error calculating LTV:', error);
      return 0;
    }
  }

  /**
   * Calculate churn rate
   */
  async calculateChurnRate(periodDays = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (periodDays * 24 * 60 * 60 * 1000));

      // Get subscriptions that were active at start of period
      const activeQuery = query(
        collection(db, this.collections.subscriptions),
        where('currentPeriodStart', '<=', endDate),
        where('currentPeriodEnd', '>=', startDate)
      );
      
      const activeSnapshot = await getDocs(activeQuery);
      const totalActive = activeSnapshot.size;

      // Get subscriptions that churned during period
      const churnedQuery = query(
        collection(db, this.collections.subscriptions),
        where('status', 'in', ['canceled', 'unpaid']),
        where('updatedAt', '>=', startDate),
        where('updatedAt', '<=', endDate)
      );
      
      const churnedSnapshot = await getDocs(churnedQuery);
      const totalChurned = churnedSnapshot.size;

      const churnRate = totalActive > 0 ? (totalChurned / totalActive) * 100 : 0;
      
      return {
        churnRate,
        totalActive,
        totalChurned,
        period: periodDays
      };
    } catch (error) {
      console.error('Error calculating churn rate:', error);
      return { churnRate: 0, totalActive: 0, totalChurned: 0 };
    }
  }

  // ============================================================================
  // AGGREGATE UPDATES
  // ============================================================================

  /**
   * Update analytics aggregates
   */
  async updateAnalyticsAggregates() {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Calculate MRR
      const subscriptionsQuery = query(
        collection(db, this.collections.subscriptions),
        where('status', 'in', ['active', 'trialing'])
      );
      
      const subscriptionsSnapshot = await getDocs(subscriptionsQuery);
      const totalMRR = subscriptionsSnapshot.docs.reduce((sum, doc) => {
        return sum + (doc.data().mrr || 0);
      }, 0);

      // Calculate ARR
      const totalARR = totalMRR * 12;

      // Get customer count
      const customersSnapshot = await getDocs(collection(db, this.collections.customers));
      const totalCustomers = customersSnapshot.size;

      const analytics = {
        date: today,
        mrr: totalMRR,
        arr: totalARR,
        totalCustomers,
        totalSubscriptions: subscriptionsSnapshot.size,
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, this.collections.analytics, today), analytics);
      console.log(`📈 Updated analytics: MRR $${totalMRR}, ARR $${totalARR}`);
      
      return analytics;
    } catch (error) {
      console.error('Error updating analytics aggregates:', error);
      throw error;
    }
  }

  /**
   * Update customer analytics
   */
  async updateCustomerAnalytics(customerId, paymentData) {
    try {
      const customerRef = doc(db, this.collections.customers, customerId);
      const ltv = await this.calculateCustomerLTV(customerId);
      
      await updateDoc(customerRef, {
        totalRevenue: ltv,
        lifetimeValue: ltv,
        lastPaymentDate: paymentData.created,
        lastPaymentAmount: paymentData.amount,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating customer analytics:', error);
    }
  }

  /**
   * Update usage aggregates
   */
  async updateUsageAggregates(organizationId, feature) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const aggregateId = `${organizationId}_${feature}_${today}`;
      
      const usageQuery = query(
        collection(db, this.collections.usage),
        where('organizationId', '==', organizationId),
        where('feature', '==', feature),
        where('date', '==', today)
      );
      
      const usageSnapshot = await getDocs(usageQuery);
      const totalUsage = usageSnapshot.size;

      await setDoc(doc(db, 'usage_aggregates', aggregateId), {
        organizationId,
        feature,
        date: today,
        totalUsage,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating usage aggregates:', error);
    }
  }

  // ============================================================================
  // ANALYTICS QUERIES
  // ============================================================================

  /**
   * Get revenue analytics
   */
  async getRevenueAnalytics(days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const analyticsQuery = query(
        collection(db, this.collections.analytics),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        orderBy('date', 'desc'),
        limit(days)
      );
      
      const analyticsSnapshot = await getDocs(analyticsQuery);
      return analyticsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting revenue analytics:', error);
      return [];
    }
  }

  /**
   * Get usage analytics for organization
   */
  async getUsageAnalytics(organizationId, days = 30) {
    try {
      const endDate = new Date();
      const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));
      
      const usageQuery = query(
        collection(db, 'usage_aggregates'),
        where('organizationId', '==', organizationId),
        where('date', '>=', startDate.toISOString().split('T')[0]),
        orderBy('date', 'desc')
      );
      
      const usageSnapshot = await getDocs(usageQuery);
      return usageSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting usage analytics:', error);
      return [];
    }
  }
}

// Export singleton instance
export const stripeAnalytics = new StripeAnalytics();

// Export utility functions
export const trackPageView = async (organizationId, userId, page, metadata = {}) => {
  return stripeAnalytics.trackFeatureUsage(organizationId, userId, `page_view_${page}`, {
    ...metadata,
    type: 'page_view',
    page
  });
};

export const trackFeatureClick = async (organizationId, userId, feature, metadata = {}) => {
  return stripeAnalytics.trackFeatureUsage(organizationId, userId, `feature_${feature}`, {
    ...metadata,
    type: 'feature_usage',
    feature
  });
};

export const trackProjectAction = async (organizationId, userId, action, projectId, metadata = {}) => {
  return stripeAnalytics.trackFeatureUsage(organizationId, userId, `project_${action}`, {
    ...metadata,
    type: 'project_action',
    action,
    projectId
  });
};
