# Email Setup Guide for Lalisure

This guide will help you set up and configure the email functionality for the Lalisure platform.

## 📧 Email Service Configuration

### 1. Resend Setup

1. **Create a Resend Account**

   - Go to [resend.com](https://resend.com)
   - Sign up for an account
   - Verify your email address

2. **Get API Key**

   - Navigate to API Keys in your Resend dashboard
   - Create a new API key
   - Copy the API key (starts with `re_`)

3. **Configure Domain (Production)**
   - Add your domain in Resend dashboard
   - Add the required DNS records
   - Verify domain ownership

### 2. Environment Variables

Add these variables to your `.env.local` file:

```bash
# Email Service (Resend)
RESEND_API_KEY="re_your_actual_api_key_here"
RESEND_FROM_EMAIL="noreply@yourdomain.com"
RESEND_WEBHOOK_SECRET="your_webhook_secret_here"

# Application
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
CRON_SECRET="your_cron_secret_here"
```

### 3. Webhook Configuration

1. **Set up Webhook in Resend**

   - Go to Webhooks in your Resend dashboard
   - Add webhook URL: `https://yourdomain.com/api/webhooks/resend`
   - Select events: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`, `email.complained`
   - Set webhook secret

2. **Update Environment**
   - Add the webhook secret to `RESEND_WEBHOOK_SECRET`

## 🧪 Testing Email Functionality

### 1. Using the Admin Panel

1. Navigate to `/admin/email-testing`
2. Use the "Send Test Email" form
3. Test different email types:
   - **Basic Email**: Simple HTML email
   - **Template Email**: Uses database templates
   - **Tracked Email**: Includes tracking and analytics

### 2. Manual Testing

```typescript
import { EmailService } from "@/lib/services/email";

// Test basic email
await EmailService.sendEmail({
  to: "test@example.com",
  subject: "Test Email",
  html: "<p>This is a test email</p>",
});

// Test tracked email
await EmailService.sendTrackedEmail({
  to: "test@example.com",
  subject: "Test Tracked Email",
  html: "<p>This is a tracked email</p>",
  type: EmailType.TEST,
});
```

## 📊 Email Analytics

### 1. View Analytics

- Go to `/admin/email-testing`
- Click on the "Analytics" tab
- View delivery rates, open rates, click rates, and bounce rates

### 2. Email Logs

- Check the "Email Logs" tab for detailed sending history
- View status of each email (sent, delivered, opened, bounced, etc.)
- See error messages for failed emails

## 🔄 Email Queue & Retry System

### 1. Automatic Retry

Failed emails are automatically retried with exponential backoff:

- 1st retry: 2 minutes
- 2nd retry: 4 minutes
- 3rd retry: 8 minutes
- 4th retry: 16 minutes
- 5th retry: 32 minutes

### 2. Manual Retry

- Use the "Retry Failed Emails" button in the admin panel
- Or call the API endpoint: `POST /api/cron/retry-emails`

### 3. Cron Job Setup

Set up a cron job to automatically retry failed emails:

```bash
# Run every 5 minutes
*/5 * * * * curl -X POST https://yourdomain.com/api/cron/retry-emails -H "Authorization: Bearer your_cron_secret"
```

## 📝 Email Templates

### 1. Database Templates

Email templates are stored in the database and can be managed through the admin panel:

- **Name**: Unique identifier for the template
- **Subject**: Email subject line (supports variables)
- **HTML Content**: HTML email body (supports variables)
- **Text Content**: Plain text version (optional)
- **Variables**: List of supported variables

### 2. Variable System

Templates support variable replacement using `{{variableName}}` syntax:

```html
<h1>Hello {{firstName}}!</h1>
<p>Your policy {{policyNumber}} is ready.</p>
```

### 3. Built-in Templates

The system includes these built-in templates:

- **Invitation**: User invitation emails
- **Welcome**: New user welcome emails
- **Policy Created**: Policy confirmation emails
- **Policy Renewal**: Renewal reminder emails
- **Claim Submitted**: Claim confirmation emails
- **Claim Status Update**: Claim status change notifications
- **Payment Due**: Payment reminder emails
- **Payment Confirmation**: Payment confirmation emails

## 🚀 Production Deployment

### 1. Render.com Setup

1. **Environment Variables**

   - Add all email-related environment variables in Render dashboard
   - Ensure `RESEND_FROM_EMAIL` matches your verified domain

2. **Cron Jobs**

   - Set up a cron job for email retry: `*/5 * * * *`
   - Use the `/api/cron/retry-emails` endpoint

3. **Webhook URL**
   - Update Resend webhook URL to your production domain
   - Test webhook delivery

### 2. Domain Configuration

1. **DNS Records**

   - Add SPF record: `v=spf1 include:_spf.resend.com ~all`
   - Add DKIM record (provided by Resend)
   - Add DMARC record (optional but recommended)

2. **Email Authentication**
   - Verify domain in Resend dashboard
   - Test email delivery to major providers

## 🔧 Troubleshooting

### Common Issues

1. **Emails not sending**

   - Check `RESEND_API_KEY` is correct
   - Verify domain is configured in Resend
   - Check email logs for error messages

2. **Emails going to spam**

   - Set up proper DNS records (SPF, DKIM, DMARC)
   - Use a verified domain for `RESEND_FROM_EMAIL`
   - Avoid spam trigger words in subject/content

3. **Webhook not working**

   - Verify webhook URL is accessible
   - Check `RESEND_WEBHOOK_SECRET` matches
   - Test webhook endpoint manually

4. **Template variables not working**
   - Ensure variable names match exactly
   - Check template is active in database
   - Verify variables are passed in the API call

### Debug Mode

Enable debug logging by setting:

```bash
NODE_ENV=development
```

This will log detailed email sending information to the console.

## 📚 API Reference

### Email Service Methods

```typescript
// Send basic email
EmailService.sendEmail({ to, subject, html, text });

// Send tracked email
EmailService.sendTrackedEmail({ to, subject, html, type, metadata });

// Send template email
EmailService.sendTemplateEmail(templateName, email, name, variables);

// Send invitation email
EmailService.sendInvitationEmail(invitationData);

// Get analytics
EmailService.getEmailAnalytics({ startDate, endDate, type });

// Retry failed emails
EmailService.retryFailedEmails();
```

### tRPC Endpoints

```typescript
// Get email analytics
api.email.getAnalytics.useQuery({ startDate, endDate, type });

// Send test email
api.email.sendTestEmail.useMutation({ to, templateName, subject, html, type });

// Get email logs
api.email.getEmailLogs.useQuery({ page, limit, status, type });

// Retry failed emails
api.email.retryFailedEmails.useMutation();
```

## 🎯 Best Practices

1. **Email Content**

   - Keep subject lines under 50 characters
   - Use clear, actionable language
   - Include unsubscribe links where required
   - Test emails across different clients

2. **Performance**

   - Use bulk email sending for large lists
   - Implement rate limiting for API calls
   - Monitor bounce rates and clean lists

3. **Security**

   - Never expose API keys in client-side code
   - Validate webhook signatures
   - Use HTTPS for all email-related endpoints

4. **Monitoring**
   - Set up alerts for high bounce rates
   - Monitor email delivery times
   - Track engagement metrics

## 📞 Support

If you encounter issues with email setup:

1. Check the email logs in the admin panel
2. Review the troubleshooting section above
3. Test with the email testing tools
4. Check Resend dashboard for delivery status
5. Contact support with specific error messages

---

**Note**: This guide assumes you're using Resend as the email service provider. The system is designed to be easily extensible to other providers if needed.
