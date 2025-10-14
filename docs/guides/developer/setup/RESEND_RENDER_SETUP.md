# Resend Email Setup for Render Deployment

## 🚨 Problem

You want to use Resend API for email functionality in your Lalisure application on Render, but you can't configure DNS settings for a custom domain on Render's free tier.

## ✅ Solution: Use Resend's Default Domain

### Option 1: Use Resend's Default Domain (Recommended for Free Tier)

1. **Use Resend's Default Sending Domain**

   - Instead of `noreply@lalisure.com`, use `noreply@resend.dev`
   - This doesn't require DNS configuration
   - Works immediately with your existing setup

2. **Update Environment Variables on Render**

   ```bash
   RESEND_FROM_EMAIL="noreply@resend.dev"
   RESEND_API_KEY="re_your_actual_api_key"
   ```

3. **Update Your Application Code**
   - The code is already configured correctly
   - Just need to update the environment variable

### Option 2: Use a Subdomain of Your Main Domain

If you have a main domain (e.g., `yourdomain.com`), you can:

1. **Add a subdomain in Resend**

   - Use `mail.yourdomain.com` or `noreply.yourdomain.com`
   - Add DNS records to your main domain's DNS provider
   - This works even if your app is hosted on Render

2. **DNS Configuration**

   ```
   Type: TXT
   Name: mail.yourdomain.com
   Value: [Resend verification string]

   Type: CNAME
   Name: resend._domainkey.mail.yourdomain.com
   Value: [Resend DKIM value]
   ```

### Option 3: Use a Third-Party Domain Service

1. **Use a domain you control**
   - Purchase a domain specifically for email
   - Configure DNS records there
   - Use that domain for sending emails

## 🛠️ Implementation Steps

### Step 1: Update Render Environment Variables

1. Go to your Render dashboard
2. Navigate to your Lalisure service
3. Go to Environment tab
4. Update these variables:

```bash
# Use Resend's default domain (no DNS setup required)
RESEND_FROM_EMAIL="noreply@resend.dev"

# Your actual Resend API key
RESEND_API_KEY="re_your_actual_resend_api_key"

# Optional: Webhook secret for email tracking
RESEND_WEBHOOK_SECRET="your_webhook_secret"
```

### Step 2: Test Email Functionality

1. **Deploy the changes**
2. **Test using the admin panel**:

   - Go to `/admin/email-testing`
   - Send a test email
   - Verify it's received

3. **Test programmatically**:

   ```typescript
   import { EmailService } from "@/lib/services/email";

   await EmailService.sendEmail({
     to: "your-email@example.com",
     subject: "Test from Lalisure",
     html: "<p>This is a test email from Lalisure!</p>",
   });
   ```

### Step 3: Update Email Templates (Optional)

If you want to use a more professional sender name:

```typescript
// In your email service
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@resend.dev';

// You can also set a custom "from" name
const FROM_NAME = "Lalisure Insurance";

// Update the sendEmail method to include the name
static async sendEmail({ to, from = FROM_EMAIL, subject, html, text }: EmailTemplate) {
  try {
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${from}>`, // This adds a display name
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
```

## 🔍 Verification Steps

### 1. Check Environment Variables

```bash
# In your Render service logs, you should see:
# No error about missing RESEND_API_KEY
```

### 2. Test Email Sending

```bash
# Check logs for successful email sending
# Look for: "Email sent successfully" or similar success messages
```

### 3. Verify Email Delivery

- Check the recipient's inbox
- Check spam folder if not in inbox
- Verify sender shows as "noreply@resend.dev" or your configured sender

## 🚀 Advanced Configuration (Optional)

### Custom Domain Setup (When You Have DNS Access)

If you later get access to DNS configuration:

1. **Add Domain in Resend**

   - Go to Resend dashboard
   - Add your domain (e.g., `lalisure.com`)
   - Get DNS records to add

2. **Add DNS Records**

   ```
   TXT Record:
   Name: @
   Value: [Resend verification string]

   CNAME Record:
   Name: resend._domainkey
   Value: [Resend DKIM value]
   ```

3. **Update Environment Variable**
   ```bash
   RESEND_FROM_EMAIL="noreply@lalisure.com"
   ```

### Email Tracking Setup

1. **Configure Webhook in Resend**

   - Webhook URL: `https://lalisure.onrender.com/api/webhooks/resend`
   - Events: `email.delivered`, `email.opened`, `email.clicked`, `email.bounced`

2. **Add Webhook Handler** (if not already exists)

   ```typescript
   // src/app/api/webhooks/resend/route.ts
   import { NextRequest, NextResponse } from "next/server";

   export async function POST(request: NextRequest) {
     const body = await request.json();

     // Handle email events
     console.log("Email event:", body);

     return NextResponse.json({ received: true });
   }
   ```

## 🎯 Quick Fix for Immediate Use

**For immediate email functionality:**

1. **Update Render Environment Variables:**

   ```bash
   RESEND_FROM_EMAIL="noreply@resend.dev"
   RESEND_API_KEY="your_actual_resend_api_key"
   ```

2. **Redeploy your service**

3. **Test email sending**

This will work immediately without any DNS configuration!

## 📧 Email Templates That Will Work

Your existing email templates will work with this setup:

- ✅ Policy notifications
- ✅ Claim updates
- ✅ Payment confirmations
- ✅ User invitations
- ✅ Password resets
- ✅ Welcome emails

## 🔧 Troubleshooting

### Common Issues:

1. **"RESEND_API_KEY is not set"**

   - Check environment variables in Render dashboard
   - Ensure the variable name is exactly `RESEND_API_KEY`

2. **"Invalid API key"**

   - Verify your Resend API key is correct
   - Check if the key has expired or been regenerated

3. **Emails not delivered**

   - Check spam folder
   - Verify recipient email address
   - Check Resend dashboard for delivery status

4. **"Domain not verified"**
   - Use `noreply@resend.dev` instead of custom domain
   - Or properly configure DNS for your custom domain

### Debug Commands:

```bash
# Check if environment variables are set
echo $RESEND_API_KEY
echo $RESEND_FROM_EMAIL

# Test API key validity
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer YOUR_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"from": "noreply@resend.dev", "to": ["test@example.com"], "subject": "Test", "html": "<p>Test</p>"}'
```

## 🎉 Expected Results

After implementing this solution:

- ✅ Emails will be sent successfully
- ✅ No DNS configuration required
- ✅ Works with Render's free tier
- ✅ Professional email delivery
- ✅ Full email tracking and analytics
- ✅ All existing email functionality preserved
