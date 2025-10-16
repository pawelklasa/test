import { collection, doc, getDoc, setDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { emailService } from './emailService';

/**
 * Usage Limits & Billing Alerts System
 * Monitors subscription tier limits, detects overages, and triggers automated alerts
 */

export class UsageLimitsService {
  constructor() {
    this.subscriptionTiers = {
      free: {
        projects: 1,
        features: 10,
        teamMembers: 2,
        storageGB: 1,
        monthlyViews: 1000
      },
      starter: {
        projects: 5,
        features: 50,
        teamMembers: 5,
        storageGB: 10,
        monthlyViews: 10000
      },
      professional: {
        projects: 25,
        features: 250,
        teamMembers: 15,
        storageGB: 50,
        monthlyViews: 50000
      },
      enterprise: {
        projects: -1, // unlimited
        features: -1,
        teamMembers: -1,
        storageGB: 500,
        monthlyViews: 250000
      }
    };

    this.warningThresholds = {
      yellow: 0.8, // 80%
      red: 0.95    // 95%
    };
  }

  // ============================================================================
  // USAGE MONITORING
  // ============================================================================

  /**
   * Check usage limits for an organization
   */
  async checkUsageLimits(organizationId) {
    try {
      console.log(`🔍 Checking usage limits for organization: ${organizationId}`);
      
      // Get organization subscription info
      const subscription = await this.getOrganizationSubscription(organizationId);
      const tierLimits = this.subscriptionTiers[subscription.tier] || this.subscriptionTiers.free;
      
      // Get current usage
      const currentUsage = await this.getCurrentUsage(organizationId);
      
      // Check each limit
      const usageReport = {
        organizationId,
        subscription,
        limits: tierLimits,
        usage: currentUsage,
        warnings: [],
        overages: [],
        checkedAt: new Date().toISOString()
      };

      // Check each usage metric
      for (const [metric, limit] of Object.entries(tierLimits)) {
        if (limit === -1) continue; // unlimited

        const current = currentUsage[metric] || 0;
        const percentage = (current / limit) * 100;

        if (percentage >= 100) {
          usageReport.overages.push({
            metric,
            current,
            limit,
            percentage,
            overage: current - limit
          });
        } else if (percentage >= this.warningThresholds.red * 100) {
          usageReport.warnings.push({
            metric,
            current,
            limit,
            percentage,
            level: 'red'
          });
        } else if (percentage >= this.warningThresholds.yellow * 100) {
          usageReport.warnings.push({
            metric,
            current,
            limit,
            percentage,
            level: 'yellow'
          });
        }
      }

      // Store usage report
      await this.storeUsageReport(usageReport);
      
      // Send alerts if needed
      await this.processUsageAlerts(usageReport);

      return usageReport;

    } catch (error) {
      console.error('Error checking usage limits:', error);
      throw error;
    }
  }

  /**
   * Get organization subscription details
   */
  async getOrganizationSubscription(organizationId) {
    try {
      const subscriptionDoc = await getDoc(doc(db, 'subscriptions', organizationId));
      
      if (!subscriptionDoc.exists()) {
        return {
          tier: 'free',
          status: 'active',
          billingEmail: null,
          nextBillingDate: null
        };
      }

      return subscriptionDoc.data();
    } catch (error) {
      console.error('Error getting subscription:', error);
      return { tier: 'free', status: 'active' };
    }
  }

  /**
   * Calculate current usage for an organization
   */
  async getCurrentUsage(organizationId) {
    try {
      const usage = {
        projects: 0,
        features: 0,
        teamMembers: 0,
        storageGB: 0,
        monthlyViews: 0
      };

      // Count projects
      const projectsQuery = query(
        collection(db, 'projects'),
        where('organizationId', '==', organizationId)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      usage.projects = projectsSnapshot.size;

      // Count features across all projects
      const featuresQuery = query(
        collection(db, 'features'),
        where('organizationId', '==', organizationId)
      );
      const featuresSnapshot = await getDocs(featuresQuery);
      usage.features = featuresSnapshot.size;

      // Count team members
      const membersQuery = query(
        collection(db, 'organization_members'),
        where('organizationId', '==', organizationId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      usage.teamMembers = membersSnapshot.size;

      // Calculate monthly views (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const viewsQuery = query(
        collection(db, 'usage_analytics'),
        where('organizationId', '==', organizationId),
        where('timestamp', '>=', thirtyDaysAgo)
      );
      const viewsSnapshot = await getDocs(viewsQuery);
      usage.monthlyViews = viewsSnapshot.size;

      // Storage calculation would require file size tracking
      usage.storageGB = Math.random() * 5; // Mock for now

      return usage;
    } catch (error) {
      console.error('Error calculating usage:', error);
      return {
        projects: 0,
        features: 0,
        teamMembers: 0,
        storageGB: 0,
        monthlyViews: 0
      };
    }
  }

  // ============================================================================
  // ALERTS & NOTIFICATIONS
  // ============================================================================

  /**
   * Process usage alerts based on warnings and overages
   */
  async processUsageAlerts(usageReport) {
    try {
      const { organizationId, subscription, warnings, overages } = usageReport;
      
      // Get organization admin emails
      const adminEmails = await this.getOrganizationAdminEmails(organizationId);
      
      // Send overage alerts (high priority)
      for (const overage of overages) {
        for (const email of adminEmails) {
          await emailService.sendUsageAlert(email, {
            feature: overage.metric,
            currentUsage: overage.current,
            limit: overage.limit,
            percentage: overage.percentage,
            organizationName: subscription.organizationName || 'Your Organization',
            alertType: 'overage',
            upgradeRequired: true
          }, {
            organizationId,
            priority: 'high',
            type: 'usage_overage'
          });
        }
      }

      // Send warning alerts
      for (const warning of warnings) {
        if (warning.level === 'red') {
          for (const email of adminEmails) {
            await emailService.sendUsageAlert(email, {
              feature: warning.metric,
              currentUsage: warning.current,
              limit: warning.limit,
              percentage: warning.percentage,
              organizationName: subscription.organizationName || 'Your Organization',
              alertType: 'critical_warning'
            }, {
              organizationId,
              priority: 'high',
              type: 'usage_warning'
            });
          }
        }
      }

      console.log(`📧 Sent ${overages.length} overage alerts and ${warnings.filter(w => w.level === 'red').length} critical warnings`);

    } catch (error) {
      console.error('Error processing usage alerts:', error);
    }
  }

  /**
   * Get admin email addresses for an organization
   */
  async getOrganizationAdminEmails(organizationId) {
    try {
      const membersQuery = query(
        collection(db, 'organization_members'),
        where('organizationId', '==', organizationId),
        where('role', 'in', ['admin', 'owner'])
      );
      
      const membersSnapshot = await getDocs(membersQuery);
      const emails = [];
      
      for (const memberDoc of membersSnapshot.docs) {
        const memberData = memberDoc.data();
        if (memberData.email) {
          emails.push(memberData.email);
        }
      }

      return emails;
    } catch (error) {
      console.error('Error getting admin emails:', error);
      return [];
    }
  }

  // ============================================================================
  // BILLING CYCLE TRACKING
  // ============================================================================

  /**
   * Track billing cycle and send upcoming payment alerts
   */
  async checkBillingCycle(organizationId) {
    try {
      const subscription = await this.getOrganizationSubscription(organizationId);
      
      if (!subscription.nextBillingDate || subscription.tier === 'free') {
        return;
      }

      const nextBilling = new Date(subscription.nextBillingDate);
      const now = new Date();
      const daysUntilBilling = Math.ceil((nextBilling - now) / (1000 * 60 * 60 * 24));

      // Send alerts at 7 days, 3 days, and 1 day before billing
      if ([7, 3, 1].includes(daysUntilBilling)) {
        const adminEmails = await this.getOrganizationAdminEmails(organizationId);
        
        for (const email of adminEmails) {
          await emailService.sendBillingNotification(email, {
            amount: subscription.amount || 0,
            currency: subscription.currency || 'usd',
            invoiceNumber: `INV-${organizationId}-${Date.now()}`,
            organizationName: subscription.organizationName || 'Your Organization',
            billingDate: nextBilling,
            daysUntilBilling
          }, {
            organizationId,
            type: 'billing_reminder'
          });
        }
      }

    } catch (error) {
      console.error('Error checking billing cycle:', error);
    }
  }

  /**
   * Handle payment failures
   */
  async handlePaymentFailure(organizationId, paymentData) {
    try {
      console.log(`💳 Payment failed for organization: ${organizationId}`);
      
      const subscription = await this.getOrganizationSubscription(organizationId);
      const adminEmails = await this.getOrganizationAdminEmails(organizationId);
      
      // Send payment failure notifications
      for (const email of adminEmails) {
        await emailService.sendPaymentFailedEmail(email, {
          amount: paymentData.amount,
          currency: paymentData.currency,
          failureReason: paymentData.failureReason,
          retryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
          organizationName: subscription.organizationName || 'Your Organization'
        }, {
          organizationId,
          priority: 'high',
          type: 'payment_failed'
        });
      }

      // Update subscription status
      await setDoc(doc(db, 'subscriptions', organizationId), {
        ...subscription,
        status: 'payment_failed',
        paymentFailureDate: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

    } catch (error) {
      console.error('Error handling payment failure:', error);
    }
  }

  // ============================================================================
  // UPGRADE PROMPTS
  // ============================================================================

  /**
   * Generate upgrade recommendations based on usage patterns
   */
  async generateUpgradeRecommendations(organizationId) {
    try {
      const usageReport = await this.checkUsageLimits(organizationId);
      const { subscription, usage, limits } = usageReport;
      
      if (subscription.tier === 'enterprise') {
        return null; // Already on highest tier
      }

      const recommendations = [];
      
      // Check if any usage is near limits
      for (const [metric, current] of Object.entries(usage)) {
        const limit = limits[metric];
        if (limit !== -1 && current / limit > 0.7) { // 70% threshold
          recommendations.push({
            reason: `${metric} usage is at ${((current / limit) * 100).toFixed(1)}%`,
            metric,
            currentUsage: current,
            currentLimit: limit,
            suggestedTier: this.getSuggestedUpgradeTier(subscription.tier)
          });
        }
      }

      if (recommendations.length > 0) {
        await this.sendUpgradePrompt(organizationId, recommendations);
      }

      return recommendations;

    } catch (error) {
      console.error('Error generating upgrade recommendations:', error);
      return [];
    }
  }

  /**
   * Get suggested upgrade tier
   */
  getSuggestedUpgradeTier(currentTier) {
    const tierOrder = ['free', 'starter', 'professional', 'enterprise'];
    const currentIndex = tierOrder.indexOf(currentTier);
    return tierOrder[Math.min(currentIndex + 1, tierOrder.length - 1)];
  }

  /**
   * Send upgrade prompt to organization admins
   */
  async sendUpgradePrompt(organizationId, recommendations) {
    try {
      const subscription = await this.getOrganizationSubscription(organizationId);
      const adminEmails = await this.getOrganizationAdminEmails(organizationId);
      const suggestedTier = recommendations[0]?.suggestedTier || 'starter';
      
      const benefits = [
        `Increase ${recommendations[0]?.metric} limit`,
        'Access to advanced features',
        'Priority support',
        'Enhanced security'
      ];

      for (const email of adminEmails) {
        await emailService.sendUpgradePrompt(email, {
          currentPlan: subscription.tier,
          suggestedPlan: suggestedTier,
          benefits,
          organizationName: subscription.organizationName || 'Your Organization'
        }, {
          organizationId,
          type: 'upgrade_prompt'
        });
      }

    } catch (error) {
      console.error('Error sending upgrade prompt:', error);
    }
  }

  // ============================================================================
  // STORAGE & REPORTING
  // ============================================================================

  /**
   * Store usage report for historical tracking
   */
  async storeUsageReport(usageReport) {
    try {
      const reportId = `${usageReport.organizationId}_${Date.now()}`;
      await setDoc(doc(db, 'usage_reports', reportId), {
        ...usageReport,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error storing usage report:', error);
    }
  }

  /**
   * Get usage history for an organization
   */
  async getUsageHistory(organizationId, days = 30) {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      
      const reportsQuery = query(
        collection(db, 'usage_reports'),
        where('organizationId', '==', organizationId),
        where('timestamp', '>=', startDate),
        orderBy('timestamp', 'desc'),
        limit(100)
      );
      
      const reportsSnapshot = await getDocs(reportsQuery);
      return reportsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting usage history:', error);
      return [];
    }
  }

  // ============================================================================
  // BATCH OPERATIONS
  // ============================================================================

  /**
   * Check usage limits for all organizations (scheduled job)
   */
  async checkAllOrganizationsUsage() {
    try {
      console.log('🔄 Starting batch usage check for all organizations...');
      
      const subscriptionsSnapshot = await getDocs(collection(db, 'subscriptions'));
      const results = [];
      
      for (const subscriptionDoc of subscriptionsSnapshot.docs) {
        const organizationId = subscriptionDoc.id;
        try {
          const usageReport = await this.checkUsageLimits(organizationId);
          results.push({
            organizationId,
            status: 'success',
            warnings: usageReport.warnings.length,
            overages: usageReport.overages.length
          });
        } catch (error) {
          results.push({
            organizationId,
            status: 'error',
            error: error.message
          });
        }
      }

      console.log(`✅ Batch usage check completed: ${results.length} organizations processed`);
      return results;

    } catch (error) {
      console.error('Error in batch usage check:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const usageLimitsService = new UsageLimitsService();

// Utility functions
export const checkOrganizationUsage = (organizationId) => {
  return usageLimitsService.checkUsageLimits(organizationId);
};

export const handlePaymentFailure = (organizationId, paymentData) => {
  return usageLimitsService.handlePaymentFailure(organizationId, paymentData);
};

export const generateUpgradeRecommendations = (organizationId) => {
  return usageLimitsService.generateUpgradeRecommendations(organizationId);
};
