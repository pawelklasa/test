// Email Service with EmailJS integration for real email sending
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import emailjs from '@emailjs/browser';

/**
 * Email Notification Service with EmailJS Integration
 * Configure your EmailJS credentials below
 */

// EmailJS Configuration
const EMAILJS_CONFIG = {
  SERVICE_ID: process.env.REACT_APP_EMAILJS_SERVICE_ID || 'your_service_id',
  TEMPLATE_ID: process.env.REACT_APP_EMAILJS_TEMPLATE_ID || 'your_template_id',
  PUBLIC_KEY: process.env.REACT_APP_EMAILJS_PUBLIC_KEY || 'your_public_key'
};

// Initialize EmailJS
if (EMAILJS_CONFIG.PUBLIC_KEY !== 'your_public_key') {
  emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
}

export class EmailNotificationService {
  constructor() {
    this.collections = {
      emailQueue: 'email_queue',
      emailHistory: 'email_history',
      emailPreferences: 'email_preferences',
      emailTemplates: 'email_templates'
    };
  }

  // ============================================================================
  // EMAIL SENDING (Real EmailJS + Mock fallback)
  // ============================================================================

  async sendEmail(templateId, templateParams, userEmail, options = {}) {
    try {
      // Validate and clean email address first
      const cleanedEmail = this.validateAndCleanEmail(userEmail);
      
      let emailResult;
      
      // Check if EmailJS is configured
      if (this.isEmailJSConfigured()) {
        // Send real email via EmailJS
        emailResult = await this.sendRealEmail(templateParams, cleanedEmail, templateId);
      } else {
        // Fallback to mock + show instructions
        emailResult = await this.sendMockEmail(templateId, templateParams, cleanedEmail);
      }

      // Log email to history
      await this.logEmailHistory({
        templateId,
        userEmail: cleanedEmail,
        templateParams,
        status: emailResult.success ? 'sent' : 'failed',
        response: emailResult.response,
        ...options
      });

      return emailResult;

    } catch (error) {
      console.error('Error sending email:', error);
      
      await this.logEmailHistory({
        templateId,
        userEmail,
        templateParams,
        status: 'failed',
        error: error.message,
        ...options
      });

      return { success: false, error: error.message };
    }
  }

  isEmailJSConfigured() {
    return EMAILJS_CONFIG.SERVICE_ID !== 'your_service_id' && 
           EMAILJS_CONFIG.TEMPLATE_ID !== 'your_template_id' && 
           EMAILJS_CONFIG.PUBLIC_KEY !== 'your_public_key';
  }

  // Email validation and cleaning helper
  validateAndCleanEmail(email) {
    if (!email || typeof email !== 'string') {
      throw new Error('Email address is required');
    }
    
    // Clean the email - remove extra spaces and convert to lowercase
    const cleanedEmail = email.trim().toLowerCase();
    
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(cleanedEmail)) {
      throw new Error('Invalid email address format');
    }
    
    // Check for suspicious characters that might corrupt EmailJS
    const suspiciousChars = /[<>"\s]/;
    if (suspiciousChars.test(cleanedEmail)) {
      throw new Error('Email address contains invalid characters');
    }
    
    return cleanedEmail;
  }

  async sendRealEmail(templateParams, userEmail, templateId) {
    try {
      // Validate and clean the email address first
      const cleanedEmail = this.validateAndCleanEmail(userEmail);
      
      // Based on successful diagnostic: your template works with simple to_email parameter
      const emailParams = {
        to_email: cleanedEmail,
        // Add template parameters but keep them simple
        ...templateParams
      };

      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        emailParams
      );

      return { 
        success: true, 
        response: `Email sent via EmailJS: ${result.text}`,
        emailId: result.text 
      };

    } catch (error) {
      throw new Error(`EmailJS Error: ${error.text || error.message}`);
    }
  }

  async sendMockEmail(templateId, templateParams, userEmail) {
    // Mock email - returns success without sending
    return { 
      success: true, 
      response: 'Mock email logged (configure EmailJS for real sending)' 
    };
  }

  // ============================================================================
  // EMAIL PREFERENCES & HISTORY
  // ============================================================================

  async getEmailPreferences(userId) {
    try {
      const prefsQuery = query(
        collection(db, this.collections.emailPreferences),
        where('userId', '==', userId)
      );
      
      const prefsSnapshot = await getDocs(prefsQuery);
      
      if (prefsSnapshot.empty) {
        return {
          billing: true,
          usage_alerts: true,
          announcements: true,
          onboarding: true,
          marketing: false
        };
      }

      return prefsSnapshot.docs[0].data().preferences;
    } catch (error) {
      console.error('Error getting email preferences:', error);
      return {};
    }
  }

  async updateEmailPreferences(userId, preferences) {
    try {
      await setDoc(doc(db, this.collections.emailPreferences, userId), {
        userId,
        preferences,
        updatedAt: serverTimestamp()
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating email preferences:', error);
      return { success: false, error: error.message };
    }
  }

  async logEmailHistory(emailData) {
    try {
      const historyDoc = {
        ...emailData,
        timestamp: serverTimestamp()
      };

      await setDoc(doc(collection(db, this.collections.emailHistory)), historyDoc);
    } catch (error) {
      console.error('Error logging email history:', error);
    }
  }

  async getEmailHistory(organizationId, limitCount = 50) {
    try {
      const historyQuery = query(
        collection(db, this.collections.emailHistory),
        where('organizationId', '==', organizationId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const historySnapshot = await getDocs(historyQuery);
      return historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting email history:', error);
      return [];
    }
  }

  // ============================================================================
  // BILLING NOTIFICATIONS
  // ============================================================================

  async sendWelcomeEmail(userEmail, userName, organizationName, options = {}) {
    const templateParams = {
      user_name: userName,
      organization_name: organizationName,
      login_url: `${window.location.origin}/login`,
      dashboard_url: `${window.location.origin}/dashboard`
    };

    return this.sendEmail(
      'welcome_template',
      templateParams,
      userEmail,
      { type: 'welcome', ...options }
    );
  }

  async sendBillingNotification(userEmail, billingData, options = {}) {
    const {
      amount,
      currency,
      invoiceNumber,
      organizationName
    } = billingData;

    const templateParams = {
      organization_name: organizationName,
      amount: `${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`,
      invoice_number: invoiceNumber
    };

    return this.sendEmail(
      'billing_template',
      templateParams,
      userEmail,
      { type: 'billing', ...options }
    );
  }

  async sendUsageAlert(userEmail, usageData, options = {}) {
    const {
      feature,
      currentUsage,
      limit,
      percentage,
      organizationName
    } = usageData;

    const templateParams = {
      organization_name: organizationName,
      feature_name: feature,
      current_usage: currentUsage.toLocaleString(),
      usage_limit: limit.toLocaleString(),
      usage_percentage: percentage.toFixed(1)
    };

    return this.sendEmail(
      'usage_alert_template',
      templateParams,
      userEmail,
      { type: 'usage_alert', priority: 'high', ...options }
    );
  }

  async sendFeatureAnnouncement(userEmail, announcementData, options = {}) {
    const {
      featureTitle,
      description,
      benefits,
      organizationName
    } = announcementData;

    const templateParams = {
      organization_name: organizationName,
      feature_title: featureTitle,
      feature_description: description,
      feature_benefits: benefits.join('\n• ')
    };

    return this.sendEmail(
      'announcement_template',
      templateParams,
      userEmail,
      { type: 'announcement', ...options }
    );
  }

  async sendInvitationEmail(userEmail, invitationData, options = {}) {
    const {
      organizationName,
      invitedByName,
      invitationLink,
      role
    } = invitationData;

    const templateParams = {
      organization_name: organizationName,
      invited_by_name: invitedByName,
      invitation_link: invitationLink,
      user_role: role,
      app_url: window.location.origin
    };

    return this.sendEmail(
      'invitation_template',
      templateParams,
      userEmail,
      { type: 'invitation', priority: 'normal', ...options }
    );
  }
}

// Export singleton instance
export const emailService = new EmailNotificationService();

// Utility functions for common email scenarios
export const sendWelcomeEmail = (userEmail, userName, organizationName) => {
  return emailService.sendWelcomeEmail(userEmail, userName, organizationName);
};

export const sendBillingAlert = (userEmail, billingData) => {
  return emailService.sendBillingNotification(userEmail, billingData);
};

export const sendUsageWarning = (userEmail, usageData) => {
  return emailService.sendUsageAlert(userEmail, usageData);
};

export const sendInvitationEmail = (userEmail, invitationData) => {
  return emailService.sendInvitationEmail(userEmail, invitationData);
};

export const scheduleOnboarding = (userEmail, userData) => {
  console.log('📬 [MOCK] Scheduling onboarding sequence for:', userEmail);
  return Promise.resolve({ success: true, message: 'Onboarding scheduled' });
};
