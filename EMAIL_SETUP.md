# Email Setup Guide

This application uses **EmailJS** to send real invitation emails. Currently, the system is in **mock mode** and only logs email details to the console.

## 🚀 Quick Setup

### 1. Sign up for EmailJS
- Go to [EmailJS.com](https://www.emailjs.com/) and create a free account
- Free tier includes 200 emails/month

### 2. Create Email Service
1. In EmailJS dashboard, click **"Add New Service"**
2. Choose your email provider (Gmail, Outlook, etc.)
3. Follow the setup instructions
4. Copy your **Service ID** (e.g., `service_abc123`)

### 3. Create Email Template
1. Go to **"Email Templates"** → **"Create New Template"**
2. Design your invitation email with these variables:
   ```
   {{to_name}} - Recipient's name
   {{organization_name}} - Your organization
   {{invited_by_name}} - Your name
   {{invitation_link}} - Acceptance link
   {{user_role}} - User's role
   ```
3. Copy your **Template ID** (e.g., `template_xyz789`)

### 4. Get Public Key
1. Go to **"Account"** → **"General"**
2. Copy your **Public Key** (e.g., `user_def456`)

### 5. Configure Environment Variables
Create a `.env` file in your project root:

```env
# EmailJS Configuration
REACT_APP_EMAILJS_SERVICE_ID=your_service_id
REACT_APP_EMAILJS_TEMPLATE_ID=your_template_id
REACT_APP_EMAILJS_PUBLIC_KEY=your_public_key
```

### 6. Restart Application
```bash
npm start
```

## 📧 Testing Email Setup

1. Navigate to **Dashboard** → **Email Setup**
2. Use the built-in setup guide
3. Test email sending with the test button

## 🔧 Current Status

**Without Configuration:**
- ✅ Invitation records are created in database
- ✅ Users can accept invitations via direct links
- ❌ No actual emails are sent (mock mode)
- 📝 Email details logged to console

**With EmailJS Configuration:**
- ✅ Real emails sent to invited users
- ✅ Professional invitation templates
- ✅ Automatic invitation link generation
- ✅ Email history tracking

## 📋 Email Template Example

```html
Subject: You're invited to join {{organization_name}}

Hi {{to_name}},

{{invited_by_name}} has invited you to join {{organization_name}} as a {{user_role}}.

Click here to accept your invitation:
{{invitation_link}}

Welcome to the team!
```

## 🔍 Troubleshooting

**Emails not sending?**
1. Check environment variables are set correctly
2. Verify EmailJS service is active
3. Check browser console for error messages
4. Test with the Email Setup guide in the dashboard

**Still in mock mode?**
- Ensure all three environment variables are set
- Restart the application after adding `.env` file
- Check that `.env` file is in the project root

## 💡 Alternative Email Services

While this guide uses EmailJS, you can also integrate:
- **SendGrid** - For high-volume sending
- **AWS SES** - For enterprise applications
- **Mailgun** - For developer-focused features

## 🚀 Next Steps

Once email is configured:
1. Invite team members via **Dashboard** → **Team Management**
2. Users will receive professional invitation emails
3. Monitor email delivery in **Dashboard** → **Email Management**
4. Track invitation acceptance rates in analytics

---

**Need help?** Check the Email Setup guide in your dashboard or contact support.
