/**
 * Security Headers Configuration
 * Implements secure HTTP headers for the application
 */

export interface SecurityHeaders {
  [key: string]: string;
}

/**
 * Get recommended security headers for the application
 */
export function getSecurityHeaders(): SecurityHeaders {
  return {
    // Content Security Policy
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.lalisure.com https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com data:",
      "connect-src 'self' https://api.paystack.co https://*.clerk.accounts.dev https://clerk.lalisure.com https://api.resend.com https://api.twilio.com https://vitals.vercel-insights.com",
      "frame-src 'self' https://js.paystack.co https://*.clerk.accounts.dev https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join('; '),
    
    // Strict Transport Security (HSTS)
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',
    
    // XSS Protection
    'X-XSS-Protection': '1; mode=block',
    
    // Frame Options
    'X-Frame-Options': 'DENY',
    
    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    
    // Permissions Policy (formerly Feature Policy)
    'Permissions-Policy': [
      'camera=()',
      'microphone=()',
      'geolocation=(self)',
      'payment=(self)',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
    ].join(', '),
    
    // Remove server identification
    'X-Powered-By': '',
    
    // DNS Prefetch Control
    'X-DNS-Prefetch-Control': 'on',
    
    // Download Options (IE only)
    'X-Download-Options': 'noopen',
    
    // Permitted Cross-Domain Policies
    'X-Permitted-Cross-Domain-Policies': 'none',
  };
}

/**
 * Get security headers for API routes
 */
export function getApiSecurityHeaders(): SecurityHeaders {
  return {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'interest-cohort=()',
  };
}

/**
 * Apply security headers to a Response object
 */
export function applySecurityHeaders(
  response: Response,
  headers?: SecurityHeaders
): Response {
  const securityHeaders = headers || getSecurityHeaders();
  
  for (const [key, value] of Object.entries(securityHeaders)) {
    if (value) {
      response.headers.set(key, value);
    }
  }
  
  return response;
}

/**
 * Create a new Response with security headers
 */
export function createSecureResponse(
  body: BodyInit | null,
  init?: ResponseInit
): Response {
  const response = new Response(body, init);
  return applySecurityHeaders(response);
}

/**
 * CORS configuration for API endpoints
 */
export interface CorsOptions {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
}

/**
 * Get CORS headers based on configuration
 */
export function getCorsHeaders(
  origin: string | null,
  options: CorsOptions = {}
): SecurityHeaders {
  const {
    origin: allowedOrigins = process.env.NEXT_PUBLIC_APP_URL || '*',
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    exposedHeaders = [],
    credentials = true,
    maxAge = 86400, // 24 hours
  } = options;

  const headers: SecurityHeaders = {};

  // Check if origin is allowed
  if (origin) {
    if (Array.isArray(allowedOrigins)) {
      if (allowedOrigins.includes(origin)) {
        headers['Access-Control-Allow-Origin'] = origin;
      }
    } else if (allowedOrigins === '*' || allowedOrigins === origin) {
      headers['Access-Control-Allow-Origin'] = origin;
    }
  }

  headers['Access-Control-Allow-Methods'] = methods.join(', ');
  headers['Access-Control-Allow-Headers'] = allowedHeaders.join(', ');
  
  if (exposedHeaders.length > 0) {
    headers['Access-Control-Expose-Headers'] = exposedHeaders.join(', ');
  }
  
  if (credentials) {
    headers['Access-Control-Allow-Credentials'] = 'true';
  }
  
  headers['Access-Control-Max-Age'] = maxAge.toString();

  return headers;
}

