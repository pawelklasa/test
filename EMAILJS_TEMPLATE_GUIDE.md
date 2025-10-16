## EmailJS Template Configuration Guide

If all diagnostic tests are failing, your EmailJS template might need to be reconfigured. Here's how to create a working template:

### 1. Go to EmailJS Dashboard
- Visit [emailjs.com](https://emailjs.com)
- Log in to your account
- Go to Email Templates

### 2. Create or Edit Your Template
Your template ID is: `template_oy84o0d`

**Basic Template Structure:**
```html
Subject: Invitation to join {{organization_name}}

Hi {{to_name}},

You've been invited by {{invited_by_name}} to join {{organization_name}} as a {{user_role}}.

Click here to accept: {{invitation_link}}

Best regards,
The Team
```

### 3. Required Variables
Make sure your template includes these variables exactly:
- `{{to_email}}` - Recipient email address (REQUIRED)
- `{{to_name}}` - Recipient name
- `{{organization_name}}` - Organization name
- `{{invited_by_name}}` - Who sent the invitation
- `{{invitation_link}}` - Link to accept invitation
- `{{user_role}}` - Role being assigned

### 4. Template Settings
- **To Email:** `{{to_email}}`
- **To Name:** `{{to_name}}`
- **From Name:** Your App Name
- **From Email:** Your verified email
- **Subject:** Invitation to join {{organization_name}}

### 5. Test Your Template
After creating/updating the template:
1. Use the "Test" button in EmailJS dashboard
2. Send a test email with sample data
3. Verify the email arrives correctly

### 6. Common Issues
- **"Recipients address is empty"** = Template doesn't use `{{to_email}}`
- **"Template not found"** = Wrong template ID
- **"Service not found"** = Wrong service ID
- **Permission denied** = Email service not properly connected

### 7. Alternative Template Variables
If `{{to_email}}` doesn't work, try recreating your template with exactly:
```
To: {{to_email}}
```

Or check if your template uses:
- `{{user_email}}`
- `{{recipient_email}}`
- `{{email}}`
