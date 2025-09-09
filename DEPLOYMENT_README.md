# Lalisure Insurance Platform - Render Deployment Guide

This guide will help you deploy the Lalisure Insurance Platform to Render.

## Prerequisites

Before deploying, you'll need to set up accounts and services:

### Required Services

1. **Render Account**: [render.com](https://render.com)
2. **MongoDB Atlas**: [mongodb.com/atlas](https://www.mongodb.com/atlas)
3. **Clerk Authentication**: [clerk.com](https://clerk.com)
4. **Stripe Payment Processing**: [stripe.com](https://stripe.com)
5. **Paystack Payment Processing**: [paystack.com](https://paystack.com)
6. **UploadThing File Uploads**: [uploadthing.com](https://uploadthing.com)
7. **Resend Email Service**: [resend.com](https://resend.com)
8. **Twilio SMS Service**: [twilio.com](https://twilio.com)
9. **PostHog Analytics**: [posthog.com](https://posthog.com)

## Step 1: Prepare Your Services

### 1.1 MongoDB Atlas Setup

1. Create a MongoDB Atlas account
2. Create a new cluster (free tier is fine for development)
3. Create a database user with read/write permissions
4. Get your connection string from "Connect" > "Connect your application"
5. Replace `<username>`, `<password>`, and `<database>` in the connection string

### 1.2 Clerk Setup

1. Create a Clerk application
2. Configure your authentication settings
3. Get your `CLERK_SECRET_KEY` and `CLERK_PUBLISHABLE_KEY`
4. Configure your authorized redirect URLs

### 1.3 Stripe Setup

1. Create a Stripe account
2. Get your API keys from the dashboard
3. Configure webhooks for payment processing
4. Set up products and pricing if needed

### 1.4 Other Services

- **Paystack**: Get your API keys
- **UploadThing**: Create an app and get your keys
- **Resend**: Get your API key
- **Twilio**: Get your Account SID, Auth Token, and phone number
- **PostHog**: Create a project and get your keys

## Step 2: Deploy to Render

### Option A: Using Render Dashboard (Recommended)

1. **Connect your repository**:

   - Go to [render.com](https://render.com)
   - Click "New" > "Web Service"
   - Connect your GitHub/GitLab repository
   - Select the repository containing your Lalisure app

2. **Configure the service**:

   - **Name**: `lalisure-app` (or your preferred name)
   - **Runtime**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

3. **Set environment variables**:
   Copy the values from your `env.example` file and set them in Render:

   ```
   NODE_ENV=production
   NEXT_PUBLIC_APP_URL=https://your-app-name.onrender.com
   DATABASE_URL=your_mongodb_atlas_connection_string
   NEXTAUTH_URL=https://your-app-name.onrender.com
   NEXTAUTH_SECRET=generate_a_random_secret_here
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key
   PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   UPLOADTHING_SECRET=your_uploadthing_secret
   UPLOADTHING_APP_ID=your_uploadthing_app_id
   RESEND_API_KEY=your_resend_api_key
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   POSTHOG_KEY=your_posthog_key
   POSTHOG_HOST=https://app.posthog.com
   ```

### Option B: Using render.yaml

If you prefer infrastructure as code:

1. **Push the `render.yaml` file** to your repository
2. **Deploy using the Render Dashboard**:
   - Go to Render dashboard
   - Click "New" > "Blueprint"
   - Connect your repository
   - Render will automatically detect and deploy using the `render.yaml` configuration

## Step 3: Database Setup

After deployment, you need to set up your database:

1. **Access your Render service shell**:

   - Go to your service dashboard
   - Click "Shell" tab

2. **Run database migrations**:

   ```bash
   npm run db:migrate
   ```

3. **Seed the database** (optional):
   ```bash
   npm run db:seed
   ```

## Step 4: Configure Environment-Specific Settings

### Update Clerk Redirect URLs

1. Go to your Clerk dashboard
2. Add your Render app URL to authorized redirect URLs:
   - `https://your-app-name.onrender.com`
   - `https://your-app-name.onrender.com/api/auth/callback/clerk`

### Update Stripe Webhooks

1. Go to your Stripe dashboard
2. Add webhook endpoint: `https://your-app-name.onrender.com/api/webhooks/stripe`
3. Select events to listen for (payment_intent.succeeded, etc.)

### Update UploadThing

1. Go to your UploadThing dashboard
2. Add your Render domain to allowed origins

## Step 5: Verify Deployment

1. **Check your app is running**:

   - Visit `https://your-app-name.onrender.com`
   - Test user registration and login
   - Test basic functionality

2. **Test integrations**:
   - Payment processing (Stripe/Paystack)
   - File uploads
   - Email notifications
   - SMS notifications (if configured)

## Step 6: Monitoring and Maintenance

### Environment Variables to Update

Remember to update these environment variables when needed:

- `NEXT_PUBLIC_APP_URL` - Your Render app URL
- `NEXTAUTH_URL` - Same as above
- API keys when they expire or change

### Database Backups

- MongoDB Atlas provides automatic backups
- Configure backup frequency in your Atlas dashboard

### Logs and Monitoring

- Use Render's built-in logging
- Monitor database performance in MongoDB Atlas
- Set up alerts for service downtime

## Troubleshooting

### Common Issues

1. **Build Failures**:

   - Check that all dependencies are listed in `package.json`
   - Ensure Node.js version is compatible (check `engines` field)

2. **Database Connection Issues**:

   - Verify MongoDB Atlas connection string
   - Check network access and IP whitelisting
   - Ensure database user has correct permissions

3. **Authentication Issues**:

   - Verify Clerk configuration
   - Check redirect URLs match your Render domain
   - Ensure environment variables are set correctly

4. **Payment Processing Issues**:
   - Verify Stripe/Paystack API keys
   - Check webhook endpoints are configured
   - Ensure webhook secrets are set correctly

### Useful Commands

```bash
# Check app status
curl https://your-app-name.onrender.com

# View logs
# Go to Render dashboard > Your service > Logs tab

# Access database
# Use MongoDB Atlas dashboard or connect via MongoDB Compass
```

## Security Considerations

1. **Environment Variables**: Never commit secrets to version control
2. **Database Security**: Use strong passwords and restrict IP access
3. **API Keys**: Rotate keys regularly and use least privilege
4. **HTTPS**: Render provides SSL certificates automatically
5. **Updates**: Keep dependencies updated for security patches

## Cost Optimization

1. **Render Free Tier**: Suitable for development and low-traffic apps
2. **MongoDB Atlas**: Free tier available, upgrade as needed
3. **Service Usage**: Monitor usage to avoid unexpected charges
4. **Auto-scaling**: Configure based on your traffic patterns

## Support

If you encounter issues:

1. Check Render's documentation: [docs.render.com](https://docs.render.com)
2. Review service logs in the Render dashboard
3. Check MongoDB Atlas connection and performance
4. Verify third-party service configurations

---

**Note**: This deployment guide assumes you're deploying to Render's web service. For more advanced setups (multiple services, custom domains, etc.), refer to Render's documentation.
