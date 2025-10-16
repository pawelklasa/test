## Working EmailJS Template Configuration

**Template Name:** Organization Invitation
**Template ID:** template_oy84o0d (use your existing ID)

### **Email Template Content:**

**Subject Line:**
```
Invitation to join {{organization_name}}
```

**Email Body:**
```
Hi there,

You've been invited by {{invited_by_name}} to join {{organization_name}} as a {{user_role}}.

Click the link below to accept your invitation:
{{invitation_link}}

If you have any questions, please don't hesitate to reach out.

Best regards,
The {{organization_name}} Team
```

### **Template Settings in EmailJS Dashboard:**

1. **To Email:** `{{to_email}}`
2. **To Name:** `{{to_name}}`
3. **From Name:** `{{organization_name}}`
4. **From Email:** `your-verified-email@domain.com`
5. **Reply To:** `your-verified-email@domain.com`

### **Critical: Template Variables**

Make sure these EXACT variable names are in your template:
- `{{to_email}}` - MUST be set in "To Email" field
- `{{to_name}}` - Can be set in "To Name" field
- `{{organization_name}}` - Use in subject and body
- `{{invited_by_name}}` - Use in body
- `{{user_role}}` - Use in body
- `{{invitation_link}}` - Use in body

### **Template Configuration Fields:**

In your EmailJS template editor, set:

**TO EMAIL FIELD:** `{{to_email}}`
**TO NAME FIELD:** `{{to_name}}`

This is crucial - if the "To Email" field doesn't contain `{{to_email}}`, the recipient address will be empty.
