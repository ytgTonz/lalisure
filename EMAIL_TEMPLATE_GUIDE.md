# Email Template Management Guide

## 🎯 Overview

This guide shows how non-technical users (Underwriters, Admins) can easily create and manage email templates without coding knowledge.

## 📧 Accessing Email Templates

1. **Login as Admin** to your dashboard
2. **Navigate** to "Email Templates" in the sidebar
3. **View all templates** organized by category

## 🆕 Creating New Templates

### Step 1: Start Creating

- Click **"New Template"** button
- Fill in basic information:
  - **Template Name**: Unique identifier (e.g., `claim_approved`)
  - **Display Title**: User-friendly name (e.g., "Claim Approval Notification")
  - **Category**: Choose from Claims, Payments, Policies, etc.
  - **Subject Line**: Email subject with variables

### Step 2: Add Variables

- **Define variables** you'll use in your email
- **Use suggested variables** based on category
- **Add custom variables** as needed

Example variables:

- `{{userName}}` - Customer's full name
- `{{claimNumber}}` - Unique claim identifier
- `{{policyNumber}}` - Policy reference number
- `{{amount}}` - Monetary amount

### Step 3: Design Your Email

- **Switch between Edit/Preview modes**
- **Write HTML content** with variable placeholders
- **Use the variable buttons** to insert `{{variableName}}` quickly
- **Preview your email** with sample data

### Step 4: Save and Test

- **Save your template**
- **Set as Active** to start using it
- **Test with sample data** using the preview feature

## ✏️ Editing Existing Templates

1. **Find the template** in the templates list
2. **Click "Edit"** or view details first
3. **Make changes** to content, variables, or settings
4. **Preview changes** before saving
5. **Save updates**

## 🎨 Template Categories

### Claims

- **Variables**: `claimNumber`, `policyNumber`, `userName`, `claimType`, `incidentDate`, `status`, `estimatedAmount`
- **Use for**: Claim submissions, status updates, approvals

### Payments

- **Variables**: `policyNumber`, `userName`, `amount`, `dueDate`, `paymentMethod`
- **Use for**: Payment confirmations, due reminders, receipts

### Policies

- **Variables**: `policyNumber`, `userName`, `coverageAmount`, `effectiveDate`, `premiumAmount`
- **Use for**: Policy creation, renewals, updates

### Invitations

- **Variables**: `inviteeEmail`, `inviterName`, `role`, `department`, `acceptUrl`, `expiresAt`
- **Use for**: Team member invitations

## 📝 Writing Email Content

### Basic HTML Structure

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #2563eb;">Email Title</h2>
  <p>Dear {{userName}},</p>

  <div
    style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;"
  >
    <h3>Important Information</h3>
    <p><strong>Reference:</strong> {{referenceNumber}}</p>
    <p><strong>Amount:</strong> R{{amount}}</p>
  </div>

  <p>Best regards,<br />Your Company Team</p>
</div>
```

### Variable Usage

- **Always use double curly braces**: `{{variableName}}`
- **Variables are case-sensitive**: `{{userName}}` ≠ `{{username}}`
- **Test all variables** in preview mode
- **Provide fallbacks** for optional variables

### Email Best Practices

- ✅ **Mobile-friendly** design
- ✅ **Clear call-to-action** buttons
- ✅ **Branded colors** and styling
- ✅ **Professional language**
- ✅ **Contact information**
- ✅ **Unsubscribe options** (if applicable)

## 🔍 Preview and Testing

### Preview Mode

- **Switch to Preview** to see how email looks
- **Sample data** automatically fills variables
- **Test different scenarios**
- **Check mobile responsiveness**

### Testing Checklist

- [ ] Email renders correctly in preview
- [ ] All variables are replaced
- [ ] Links work (if any)
- [ ] Images load (if any)
- [ ] Mobile-friendly layout
- [ ] Professional appearance

## ⚙️ Managing Templates

### Template Status

- **Active**: Template is live and being used
- **Inactive**: Template is saved but not used
- **System Templates**: Cannot be deleted (marked with lock icon)

### Template Operations

- **Edit**: Modify content and settings
- **Duplicate**: Create copy for similar templates
- **Activate/Deactivate**: Control usage
- **Delete**: Remove unused custom templates

### Bulk Operations

- **Filter by category** or status
- **Search by name** or content
- **Bulk activate/deactivate**
- **Export templates** for backup

## 📊 Template Analytics

### Usage Statistics

- **Send count** - How many times template was used
- **Open rate** - Percentage of emails opened
- **Click rate** - Link click performance
- **Bounce rate** - Delivery issues

### Performance Tips

- **Test subject lines** for better open rates
- **Personalize content** using variables
- **Optimize send times** based on analytics
- **A/B test** different versions

## 🆘 Troubleshooting

### Common Issues

- **Variables not replaced**: Check spelling and case
- **Email not rendering**: Validate HTML structure
- **Links not working**: Use absolute URLs
- **Images not loading**: Use hosted images

### Getting Help

- **Preview feature** for immediate feedback
- **Variable guide** sidebar for reference
- **Template tips** for best practices
- **Contact support** for advanced issues

## 🔐 Security & Permissions

### Access Control

- **Admin-only access** to template management
- **Audit trail** for all changes
- **Version history** for rollbacks
- **Approval workflow** for production changes

### Data Protection

- **No sensitive data** in templates
- **Secure variable replacement**
- **GDPR compliance** considerations
- **Data retention** policies

---

## 🚀 Quick Start Checklist

- [ ] Access Email Templates section
- [ ] Create your first template
- [ ] Add relevant variables
- [ ] Write professional content
- [ ] Preview and test
- [ ] Set as active
- [ ] Monitor performance

**Need help?** Use the built-in help tooltips and preview features to guide you through the process! 🎯
