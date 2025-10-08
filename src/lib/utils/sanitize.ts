/**
 * Input Sanitization Utilities
 * Provides functions to sanitize and validate user inputs
 */

/**
 * Remove HTML tags and potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]+>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w\s@.+-]/g, ''); // Only allow alphanumeric, @, ., +, -
}

/**
 * Sanitize phone numbers (South African format)
 */
export function sanitizePhone(phone: string): string {
  if (typeof phone !== 'string') return '';
  
  // Remove all non-digit characters except + at start
  let sanitized = phone.trim().replace(/[^\d+]/g, '');
  
  // Ensure it starts with +27 for SA
  if (sanitized.startsWith('0')) {
    sanitized = '+27' + sanitized.substring(1);
  } else if (!sanitized.startsWith('+')) {
    sanitized = '+27' + sanitized;
  }
  
  return sanitized;
}

/**
 * Sanitize URLs
 */
export function sanitizeUrl(url: string): string {
  if (typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    
    return parsed.toString();
  } catch {
    return '';
  }
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: string | number): number | null {
  if (typeof input === 'number') {
    return isNaN(input) ? null : input;
  }
  
  if (typeof input !== 'string') return null;
  
  const parsed = parseFloat(input.replace(/[^\d.-]/g, ''));
  return isNaN(parsed) ? null : parsed;
}

/**
 * Sanitize file names
 */
export function sanitizeFileName(fileName: string): string {
  if (typeof fileName !== 'string') return '';
  
  return fileName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace special chars with underscore
    .replace(/\.{2,}/g, '.') // Remove multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .trim();
}

/**
 * Validate and sanitize South African ID number
 */
export function sanitizeIdNumber(idNumber: string): string {
  if (typeof idNumber !== 'string') return '';
  
  return idNumber
    .replace(/\D/g, '') // Only keep digits
    .slice(0, 13); // SA ID numbers are 13 digits
}

/**
 * Validate SA ID number checksum (Luhn algorithm)
 */
export function validateIdNumber(idNumber: string): boolean {
  const sanitized = sanitizeIdNumber(idNumber);
  
  if (sanitized.length !== 13) return false;
  
  // Luhn algorithm
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized.charAt(i), 10);
    
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  
  return sum % 10 === 0;
}

/**
 * Sanitize address fields
 */
export function sanitizeAddress(address: string): string {
  if (typeof address !== 'string') return '';
  
  return address
    .replace(/<[^>]+>/g, '') // Remove HTML
    .replace(/[^\w\s,.-]/g, '') // Only allow alphanumeric, spaces, commas, dots, hyphens
    .trim();
}

/**
 * Sanitize currency amount (ZAR)
 */
export function sanitizeCurrency(amount: string | number): number {
  const sanitized = sanitizeNumber(amount);
  if (sanitized === null) return 0;
  
  // Round to 2 decimal places
  return Math.round(sanitized * 100) / 100;
}

/**
 * Deep sanitize object (recursively sanitize all string values)
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key as keyof T] = sanitizeString(value) as T[keyof T];
    } else if (Array.isArray(value)) {
      sanitized[key as keyof T] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      ) as T[keyof T];
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key as keyof T] = sanitizeObject(value) as T[keyof T];
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}

/**
 * SQL injection prevention (for raw queries - prefer parameterized queries)
 */
export function escapeSqlString(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
      switch (char) {
        case '\0': return '\\0';
        case '\x08': return '\\b';
        case '\x09': return '\\t';
        case '\x1a': return '\\z';
        case '\n': return '\\n';
        case '\r': return '\\r';
        case '"':
        case "'":
        case '\\':
        case '%':
          return '\\' + char;
        default:
          return char;
      }
    });
}

/**
 * XSS prevention for display
 */
export function escapeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';
  
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

