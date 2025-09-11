# SMS Integration Setup Guide

## Overview

The Lalisure Insurance Platform now supports SMS notifications through Twilio integration. This document outlines how to set up and configure SMS functionality.

## Features

- ✅ Payment confirmation SMS
- ✅ Payment due reminder SMS
- ✅ Claim submission confirmation SMS
- ✅ Claim status update SMS
- ✅ Policy creation welcome SMS
- ✅ Policy renewal SMS
- ✅ Welcome SMS for new users

## Environment Variables

Add these environment variables to your `.env` file:

```bash
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Example:
# TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# TWILIO_AUTH_TOKEN=your_auth_token_here
# TWILIO_PHONE_NUMBER=+15551234567
```

## Setting Up Twilio

### 1. Create Twilio Account

1. Go to [Twilio Console](https://console.twilio.com/)
2. Sign up for a new account or log in
3. Complete account verification

### 2. Get Account Credentials

1. From the Twilio Console Dashboard
2. Find your **Account SID** and **Auth Token**
3. Copy these to your environment variables

### 3. Get a Phone Number

1. Go to **Phone Numbers** > **Manage** > **Buy a number**
2. Choose a phone number (preferably with SMS capabilities)
3. Purchase the number
4. Copy the number to `TWILIO_PHONE_NUMBER` (include country code, e.g., +27123456789 for South Africa)

### 4. Configure Webhook (Optional)

For delivery status tracking:

1. Go to **Phone Numbers** > **Manage** > **Active numbers**
2. Click on your purchased number
3. Set webhook URL for SMS status callbacks (if needed)

## SMS Message Templates

The system includes pre-built SMS templates for common scenarios:

### Payment Confirmed

```
Lalisure Insurance: Payment of R2,500 confirmed for policy POL-HOME-2024-001. Thank you! John Doe
```

### Claim Submitted

```
Lalisure Insurance: Claim CLM-2024-001 submitted successfully. We'll review and update you soon. Track: bit.ly/claims John Doe
```

### Claim Status Update

```
Lalisure Insurance: Claim CLM-2024-001 status updated to Approved. Check your account for details. John Doe
```

### Payment Due

```
Lalisure Insurance: Payment of R2,500 due for policy POL-HOME-2024-001 by 2024-02-01. Pay now to avoid late fees. John Doe
```

## Testing SMS Integration

### 1. Test in Development

```bash
# Start the development server
npm run dev

# Test SMS sending via API or admin panel
```

### 2. Test with Trial Account

- Twilio trial accounts can only send SMS to verified phone numbers
- Add your phone number to verified caller IDs in Twilio Console
- Trial accounts include "Sent from your Twilio trial account" prefix

### 3. Production Setup

- Upgrade to a paid Twilio account for production use
- Remove trial limitations
- Configure proper sender ID if available in your region

## User Phone Number Requirements

### Phone Number Format

- Must include country code (e.g., +27123456789)
- Automatically formatted by the SMS service
- Invalid numbers are rejected with error messages

### User Profile Updates

Users can add/update phone numbers in:

- User profile settings
- Account registration
- Admin user management

## SMS Preferences (Future Enhancement)

Currently, SMS is sent automatically when:

- User has a valid phone number in their profile
- Email notifications are enabled for the event type

Future enhancements may include:

- User preference controls for SMS notifications
- Opt-in/opt-out functionality
- Different notification preferences per type

## Cost Considerations

### Twilio Pricing

- SMS costs vary by destination country
- South Africa: ~$0.05 per SMS
- Set up billing alerts in Twilio Console
- Monitor usage in Twilio Console

### Usage Optimization

- SMS is only sent when user has phone number
- Failed SMS attempts are logged but don't retry automatically
- Consider implementing delivery status tracking for critical messages

## Troubleshooting

### Common Issues

1. **SMS not being sent**

   - Check Twilio credentials in environment variables
   - Verify phone number format includes country code
   - Check Twilio Console for error logs

2. **Trial account limitations**

   - Verify recipient phone number in Twilio Console
   - Upgrade to paid account for unrestricted sending

3. **Phone number validation errors**
   - Ensure phone numbers include country code (+27 for South Africa)
   - Check user profile has valid phone number

### Error Logging

SMS errors are logged in:

- Application console
- Twilio Console > Monitor > Logs
- Application notification logs

### Support

For Twilio-specific issues:

- [Twilio Documentation](https://www.twilio.com/docs/sms)
- [Twilio Support](https://support.twilio.com/)

For application-specific issues:

- Check application logs
- Verify environment configuration
- Test with valid phone numbers

## Security Considerations

1. **Environment Variables**

   - Never commit Twilio credentials to version control
   - Use secure environment variable management in production
   - Rotate credentials periodically

2. **Phone Number Privacy**

   - Phone numbers are stored securely in user profiles
   - SMS content doesn't include sensitive data beyond basic policy/claim info
   - Consider data retention policies for phone numbers

3. **Rate Limiting**
   - Twilio has built-in rate limiting
   - Consider implementing application-level rate limiting for bulk operations
   - Monitor for unusual SMS volume

## Integration Status

✅ **Completed:**

- SMS service implementation
- Integration with notification system
- Payment confirmation SMS
- Claim status update SMS
- Message templates for all notification types
- Environment variable configuration
- Error handling and logging

🔄 **In Progress:**

- User preference controls
- Delivery status tracking
- WhatsApp integration planning

📋 **Future Enhancements:**

- WhatsApp Business API integration
- Rich media messages
- Two-way SMS communication
- SMS-based authentication (2FA)
- Bulk SMS campaigns for policy renewals

---

_Last Updated: September 2025_
_Version: 1.0_

