# Deployment Checklist for Lalisure Insurance Platform

## Pre-Deployment Setup ✅

- [ ] **MongoDB Atlas Account**: Created and configured cluster
- [ ] **Clerk Account**: Application created, keys obtained
- [ ] **Stripe Account**: API keys and webhooks configured
- [ ] **Paystack Account**: API keys obtained
- [ ] **UploadThing Account**: App created, keys obtained
- [ ] **Resend Account**: API key obtained
- [ ] **Twilio Account**: Credentials and phone number configured
- [ ] **PostHog Account**: Project created, keys obtained

## Environment Variables ✅

- [ ] `DATABASE_URL`: MongoDB Atlas connection string
- [ ] `NEXTAUTH_URL`: Set to Render app URL
- [ ] `NEXTAUTH_SECRET`: Generated secure random string
- [ ] `CLERK_SECRET_KEY`: From Clerk dashboard
- [ ] `CLERK_PUBLISHABLE_KEY`: From Clerk dashboard
- [ ] `STRIPE_SECRET_KEY`: From Stripe dashboard
- [ ] `STRIPE_PUBLISHABLE_KEY`: From Stripe dashboard
- [ ] `PAYSTACK_SECRET_KEY`: From Paystack dashboard
- [ ] `PAYSTACK_PUBLIC_KEY`: From Paystack dashboard
- [ ] `UPLOADTHING_SECRET`: From UploadThing dashboard
- [ ] `UPLOADTHING_APP_ID`: From UploadThing dashboard
- [ ] `RESEND_API_KEY`: From Resend dashboard
- [ ] `TWILIO_ACCOUNT_SID`: From Twilio dashboard
- [ ] `TWILIO_AUTH_TOKEN`: From Twilio dashboard
- [ ] `TWILIO_PHONE_NUMBER`: From Twilio dashboard
- [ ] `POSTHOG_KEY`: From PostHog dashboard
- [ ] `POSTHOG_HOST`: From PostHog dashboard
- [ ] `NEXT_PUBLIC_APP_URL`: Set to Render app URL
- [ ] `NODE_ENV`: Set to "production"

## Render Service Configuration ✅

- [ ] **Service Name**: `lalisure-app`
- [ ] **Runtime**: Node.js
- [ ] **Build Command**: `npm run build`
- [ ] **Start Command**: `npm start`
- [ ] **Node Version**: Compatible version (18+ recommended)

## Post-Deployment Verification ✅

- [ ] **App Accessible**: Visit Render URL
- [ ] **Database Connection**: Test database operations
- [ ] **Authentication**: Test user registration/login
- [ ] **Payments**: Test Stripe/Paystack integration
- [ ] **File Uploads**: Test UploadThing integration
- [ ] **Email Service**: Test Resend integration
- [ ] **SMS Service**: Test Twilio integration (if used)
- [ ] **Analytics**: Test PostHog integration

## Security & Configuration ✅

- [ ] **Clerk Redirect URLs**: Updated with Render domain
- [ ] **Stripe Webhooks**: Configured with Render endpoint
- [ ] **UploadThing Origins**: Render domain added
- [ ] **Environment Variables**: All secrets properly set
- [ ] **Database Security**: IP whitelisting configured
- [ ] **HTTPS**: SSL certificate active

## Performance & Monitoring ✅

- [ ] **Build Success**: Application builds without errors
- [ ] **Database Migration**: Schema deployed successfully
- [ ] **Logs**: Error-free startup logs
- [ ] **Response Times**: Acceptable performance
- [ ] **Memory Usage**: Within limits
- [ ] **Database Performance**: Queries optimized

## Quick Commands Reference

```bash
# Build locally for testing
npm run build

# Run database migrations
npm run db:migrate

# Seed database with initial data
npm run db:seed

# Check app health
curl https://your-app-name.onrender.com/api/health
```

## Emergency Contacts

- **Render Support**: [render.com/support](https://render.com/support)
- **MongoDB Atlas Support**: [mongodb.com/support](https://www.mongodb.com/support)
- **Clerk Support**: [clerk.com/support](https://clerk.com/support)

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Completed
