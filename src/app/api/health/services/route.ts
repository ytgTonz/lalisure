import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import SmsService from '@/lib/services/sms';
import twilio from 'twilio';

export const runtime = 'nodejs';

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'unhealthy' | 'warning';
  details?: string;
  responseTime?: number;
}

interface HealthCheckResponse {
  overall: 'healthy' | 'unhealthy' | 'warning';
  timestamp: string;
  services: ServiceStatus[];
}

export async function GET() {
  const startTime = Date.now();
  const services: ServiceStatus[] = [];
  let overallStatus: 'healthy' | 'unhealthy' | 'warning' = 'healthy';

  // Database connectivity check (MongoDB)
  try {
    const dbStart = Date.now();
    // Use a MongoDB-compatible query instead of $queryRaw
    await db.user.findMany({ take: 1 });
    services.push({
      name: 'Database (MongoDB)',
      status: 'healthy',
      details: 'Connected successfully',
      responseTime: Date.now() - dbStart
    });
  } catch (error) {
    services.push({
      name: 'Database (MongoDB)',
      status: 'unhealthy',
      details: error instanceof Error ? error.message : 'Connection failed'
    });
    overallStatus = 'unhealthy';
  }

  // Clerk Authentication check
  try {
    const clerkPublicKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;

    if (clerkPublicKey && clerkSecretKey) {
      services.push({
        name: 'Clerk Authentication',
        status: 'healthy',
        details: 'Keys configured'
      });
    } else {
      services.push({
        name: 'Clerk Authentication',
        status: 'warning',
        details: 'Missing configuration keys'
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }
  } catch (error) {
    services.push({
      name: 'Clerk Authentication',
      status: 'unhealthy',
      details: error instanceof Error ? error.message : 'Configuration error'
    });
    overallStatus = 'unhealthy';
  }

  // Resend Email Service check
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const resendFromEmail = process.env.RESEND_FROM_EMAIL;

    if (resendApiKey && resendFromEmail) {
      // Basic validation without making actual API call
      if (resendApiKey.startsWith('re_') && resendFromEmail.includes('@')) {
        services.push({
          name: 'Resend Email Service',
          status: 'healthy',
          details: 'API key and sender email configured'
        });
      } else {
        services.push({
          name: 'Resend Email Service',
          status: 'warning',
          details: 'Invalid API key or email format'
        });
        if (overallStatus === 'healthy') overallStatus = 'warning';
      }
    } else {
      services.push({
        name: 'Resend Email Service',
        status: 'warning',
        details: 'Missing API key or sender email'
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }
  } catch (error) {
    services.push({
      name: 'Resend Email Service',
      status: 'unhealthy',
      details: error instanceof Error ? error.message : 'Configuration error'
    });
    overallStatus = 'unhealthy';
  }

  // Twilio SMS Service check
  try {
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      // Validate format without making API calls
      const isValidSid = twilioAccountSid.startsWith('AC') && twilioAccountSid.length >= 34;
      const isValidToken = twilioAuthToken.length >= 32;
      const isValidPhoneFormat = twilioPhoneNumber.startsWith('+');
      const isSouthAfricanPhone = twilioPhoneNumber.startsWith('+27');
      const isUSPhone = twilioPhoneNumber.startsWith('+1');

      if (isValidSid && isValidToken && isValidPhoneFormat) {
        if (isSouthAfricanPhone) {
          services.push({
            name: 'Twilio SMS Service',
            status: 'healthy',
            details: 'Credentials configured for South African market'
          });
        } else if (isUSPhone) {
          services.push({
            name: 'Twilio SMS Service',
            status: 'warning',
            details: 'Using US phone number - recommend switching to South African number for local market'
          });
          if (overallStatus === 'healthy') overallStatus = 'warning';
        } else {
          services.push({
            name: 'Twilio SMS Service',
            status: 'warning',
            details: 'Phone number format is valid but may not match target market'
          });
          if (overallStatus === 'healthy') overallStatus = 'warning';
        }
      } else {
        services.push({
          name: 'Twilio SMS Service',
          status: 'warning',
          details: `Invalid credentials format - SID: ${isValidSid}, Token: ${isValidToken}, Phone: ${isValidPhoneFormat}`
        });
        if (overallStatus === 'healthy') overallStatus = 'warning';
      }
    } else {
      services.push({
        name: 'Twilio SMS Service',
        status: 'warning',
        details: 'Missing credentials'
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }
  } catch (error) {
    services.push({
      name: 'Twilio SMS Service',
      status: 'unhealthy',
      details: error instanceof Error ? error.message : 'Configuration error'
    });
    overallStatus = 'unhealthy';
  }

  // Paystack Payment Service check
  try {
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    const paystackPublicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

    if (paystackSecretKey && paystackPublicKey) {
      const isValidSecret = paystackSecretKey.startsWith('sk_');
      const isValidPublic = paystackPublicKey.startsWith('pk_');

      if (isValidSecret && isValidPublic) {
        services.push({
          name: 'Paystack Payment Service',
          status: 'healthy',
          details: 'API keys configured for South African market'
        });
      } else {
        services.push({
          name: 'Paystack Payment Service',
          status: 'warning',
          details: 'Invalid API key format'
        });
        if (overallStatus === 'healthy') overallStatus = 'warning';
      }
    } else {
      services.push({
        name: 'Paystack Payment Service',
        status: 'warning',
        details: 'Missing API keys'
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }
  } catch (error) {
    services.push({
      name: 'Paystack Payment Service',
      status: 'unhealthy',
      details: error instanceof Error ? error.message : 'Configuration error'
    });
    overallStatus = 'unhealthy';
  }

  // UploadThing File Storage check
  try {
    const uploadthingSecret = process.env.UPLOADTHING_SECRET;
    const uploadthingAppId = process.env.UPLOADTHING_APP_ID;

    if (uploadthingSecret && uploadthingAppId) {
      const isValidSecret = uploadthingSecret.startsWith('sk_');

      if (isValidSecret && uploadthingAppId.length > 0) {
        services.push({
          name: 'UploadThing File Storage',
          status: 'healthy',
          details: 'API credentials configured'
        });
      } else {
        services.push({
          name: 'UploadThing File Storage',
          status: 'warning',
          details: 'Invalid credentials format'
        });
        if (overallStatus === 'healthy') overallStatus = 'warning';
      }
    } else {
      services.push({
        name: 'UploadThing File Storage',
        status: 'warning',
        details: 'Missing credentials'
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }
  } catch (error) {
    services.push({
      name: 'UploadThing File Storage',
      status: 'unhealthy',
      details: error instanceof Error ? error.message : 'Configuration error'
    });
    overallStatus = 'unhealthy';
  }

  // PostHog Analytics check
  try {
    const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;

    if (posthogKey && posthogHost) {
      const isValidKey = posthogKey.startsWith('phc_');
      const isValidHost = posthogHost.startsWith('http');

      if (isValidKey && isValidHost) {
        services.push({
          name: 'PostHog Analytics',
          status: 'healthy',
          details: 'Analytics configured'
        });
      } else {
        services.push({
          name: 'PostHog Analytics',
          status: 'warning',
          details: 'Invalid configuration format'
        });
        if (overallStatus === 'healthy') overallStatus = 'warning';
      }
    } else {
      services.push({
        name: 'PostHog Analytics',
        status: 'warning',
        details: 'Missing analytics configuration'
      });
      if (overallStatus === 'healthy') overallStatus = 'warning';
    }
  } catch (error) {
    services.push({
      name: 'PostHog Analytics',
      status: 'unhealthy',
      details: error instanceof Error ? error.message : 'Configuration error'
    });
    overallStatus = 'unhealthy';
  }

  const response: HealthCheckResponse = {
    overall: overallStatus,
    timestamp: new Date().toISOString(),
    services
  };

  // Set appropriate HTTP status based on overall health
  const httpStatus = overallStatus === 'healthy' ? 200 :
                    overallStatus === 'warning' ? 207 : 503;

  return NextResponse.json(response, { status: httpStatus });
}

// Optional: Add a simple ping endpoint
export async function HEAD() {
  return new NextResponse(null, { status: 200 });
}