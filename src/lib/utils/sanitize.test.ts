import { describe, it, expect } from 'vitest';
import {
  sanitizeString,
  sanitizeHTML,
  sanitizeEmail,
  sanitizePhone,
  sanitizeIdNumber,
  sanitizeURL,
  sanitizeFileName,
  sanitizeCurrency,
  sanitizeInput,
  preventXSS,
  preventSQLInjection
} from './sanitize';

describe('sanitizeString', () => {
  it('should remove HTML tags', () => {
    const input = '<script>alert("XSS")</script>Hello';
    const result = sanitizeString(input);
    expect(result).toBe('Hello');
  });

  it('should handle empty strings', () => {
    expect(sanitizeString('')).toBe('');
  });

  it('should trim whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello');
  });

  it('should remove multiple HTML tags', () => {
    const input = '<div><span>Hello</span></div>';
    expect(sanitizeString(input)).toBe('Hello');
  });
});

describe('sanitizeHTML', () => {
  it('should remove script tags', () => {
    const input = '<div>Safe content</div><script>alert("XSS")</script>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('Safe content');
  });

  it('should remove event handlers', () => {
    const input = '<div onclick="alert()">Click me</div>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('onclick');
  });

  it('should remove javascript: URLs', () => {
    const input = '<a href="javascript:alert()">Link</a>';
    const result = sanitizeHTML(input);
    expect(result).not.toContain('javascript:');
  });

  it('should preserve safe HTML', () => {
    const input = '<div><p>Safe <strong>content</strong></p></div>';
    const result = sanitizeHTML(input);
    expect(result).toContain('Safe');
    expect(result).toContain('content');
  });
});

describe('sanitizeEmail', () => {
  it('should validate correct email', () => {
    const result = sanitizeEmail('test@example.com');
    expect(result).toBe('test@example.com');
  });

  it('should reject invalid email', () => {
    const result = sanitizeEmail('not-an-email');
    expect(result).toBe('');
  });

  it('should convert to lowercase', () => {
    const result = sanitizeEmail('Test@Example.COM');
    expect(result).toBe('test@example.com');
  });

  it('should trim whitespace', () => {
    const result = sanitizeEmail('  test@example.com  ');
    expect(result).toBe('test@example.com');
  });

  it('should reject email with spaces', () => {
    const result = sanitizeEmail('test @example.com');
    expect(result).toBe('');
  });

  it('should handle empty string', () => {
    expect(sanitizeEmail('')).toBe('');
  });
});

describe('sanitizePhone (South African)', () => {
  it('should format valid SA phone number', () => {
    const result = sanitizePhone('0821234567');
    expect(result).toBe('+27821234567');
  });

  it('should handle already formatted number', () => {
    const result = sanitizePhone('+27821234567');
    expect(result).toBe('+27821234567');
  });

  it('should handle number with country code without +', () => {
    const result = sanitizePhone('27821234567');
    expect(result).toBe('+27821234567');
  });

  it('should remove spaces and hyphens', () => {
    const result = sanitizePhone('082 123 4567');
    expect(result).toBe('+27821234567');
  });

  it('should reject invalid format', () => {
    const result = sanitizePhone('123');
    expect(result).toBe('');
  });

  it('should handle empty string', () => {
    expect(sanitizePhone('')).toBe('');
  });

  it('should reject non-SA numbers', () => {
    const result = sanitizePhone('+1234567890');
    expect(result).toBe('');
  });
});

describe('sanitizeIdNumber (South African)', () => {
  it('should validate correct SA ID format', () => {
    const result = sanitizeIdNumber('9001015009087');
    expect(result).toBe('9001015009087');
  });

  it('should reject ID with letters', () => {
    const result = sanitizeIdNumber('900101500908A');
    expect(result).toBe('');
  });

  it('should reject ID with wrong length', () => {
    expect(sanitizeIdNumber('90010150090')).toBe('');
    expect(sanitizeIdNumber('90010150090875')).toBe('');
  });

  it('should trim whitespace', () => {
    const result = sanitizeIdNumber('  9001015009087  ');
    expect(result).toBe('9001015009087');
  });

  it('should handle empty string', () => {
    expect(sanitizeIdNumber('')).toBe('');
  });

  it('should remove spaces in ID', () => {
    const result = sanitizeIdNumber('900101 5009 087');
    expect(result).toBe('9001015009087');
  });
});

describe('sanitizeURL', () => {
  it('should allow https URLs', () => {
    const url = 'https://example.com';
    expect(sanitizeURL(url)).toBe(url);
  });

  it('should allow http URLs', () => {
    const url = 'http://example.com';
    expect(sanitizeURL(url)).toBe(url);
  });

  it('should reject javascript: URLs', () => {
    const url = 'javascript:alert("XSS")';
    expect(sanitizeURL(url)).toBe('');
  });

  it('should reject data: URLs', () => {
    const url = 'data:text/html,<script>alert()</script>';
    expect(sanitizeURL(url)).toBe('');
  });

  it('should handle relative URLs', () => {
    const url = '/path/to/page';
    expect(sanitizeURL(url)).toBe(url);
  });

  it('should handle empty string', () => {
    expect(sanitizeURL('')).toBe('');
  });

  it('should encode special characters', () => {
    const url = 'https://example.com/path?param=<script>';
    const result = sanitizeURL(url);
    expect(result).not.toContain('<script>');
  });
});

describe('sanitizeFileName', () => {
  it('should allow safe filenames', () => {
    const filename = 'document.pdf';
    expect(sanitizeFileName(filename)).toBe(filename);
  });

  it('should remove path traversal attempts', () => {
    const filename = '../../../etc/passwd';
    const result = sanitizeFileName(filename);
    expect(result).not.toContain('..');
    expect(result).not.toContain('/');
  });

  it('should remove special characters', () => {
    const filename = 'file<>:"|?*.txt';
    const result = sanitizeFileName(filename);
    expect(result).toBe('file.txt');
  });

  it('should preserve extension', () => {
    const filename = 'my-file.pdf';
    const result = sanitizeFileName(filename);
    expect(result).toContain('.pdf');
  });

  it('should limit filename length', () => {
    const longName = 'a'.repeat(300) + '.txt';
    const result = sanitizeFileName(longName);
    expect(result.length).toBeLessThan(256);
  });

  it('should handle filename without extension', () => {
    const result = sanitizeFileName('README');
    expect(result).toBe('README');
  });
});

describe('sanitizeCurrency', () => {
  it('should parse valid ZAR amount', () => {
    const result = sanitizeCurrency('R1,234.56');
    expect(result).toBe(1234.56);
  });

  it('should parse number string', () => {
    const result = sanitizeCurrency('1234.56');
    expect(result).toBe(1234.56);
  });

  it('should handle number input', () => {
    const result = sanitizeCurrency(1234.56);
    expect(result).toBe(1234.56);
  });

  it('should reject negative amounts', () => {
    const result = sanitizeCurrency('-1234');
    expect(result).toBe(0);
  });

  it('should round to 2 decimal places', () => {
    const result = sanitizeCurrency('1234.567');
    expect(result).toBe(1234.57);
  });

  it('should handle empty string', () => {
    expect(sanitizeCurrency('')).toBe(0);
  });

  it('should handle invalid input', () => {
    expect(sanitizeCurrency('not a number')).toBe(0);
  });

  it('should remove currency symbols', () => {
    const result = sanitizeCurrency('R 1,234.56 ZAR');
    expect(result).toBe(1234.56);
  });
});

describe('sanitizeInput (comprehensive)', () => {
  it('should sanitize all fields in object', () => {
    const input = {
      name: '<script>alert()</script>John',
      email: 'TEST@EXAMPLE.COM',
      phone: '082 123 4567',
      amount: 'R1,234.56'
    };

    const result = sanitizeInput(input);

    expect(result.name).toBe('John');
    expect(result.email).toBe('test@example.com');
    expect(result.phone).toBe('+27821234567');
    expect(result.amount).toBe('1234.56');
  });

  it('should handle nested objects', () => {
    const input = {
      user: {
        name: '  John  ',
        details: {
          city: '<b>Johannesburg</b>'
        }
      }
    };

    const result = sanitizeInput(input);

    expect(result.user.name).toBe('John');
    expect(result.user.details.city).toBe('Johannesburg');
  });

  it('should handle arrays', () => {
    const input = {
      tags: ['<script>tag1</script>', 'tag2', 'tag3']
    };

    const result = sanitizeInput(input);

    expect(result.tags[0]).toBe('tag1');
    expect(result.tags).toHaveLength(3);
  });

  it('should preserve numbers', () => {
    const input = {
      count: 42,
      price: 99.99
    };

    const result = sanitizeInput(input);

    expect(result.count).toBe(42);
    expect(result.price).toBe(99.99);
  });

  it('should preserve booleans', () => {
    const input = {
      active: true,
      verified: false
    };

    const result = sanitizeInput(input);

    expect(result.active).toBe(true);
    expect(result.verified).toBe(false);
  });
});

describe('preventXSS', () => {
  it('should escape HTML entities', () => {
    const input = '<script>alert("XSS")</script>';
    const result = preventXSS(input);
    expect(result).not.toContain('<script>');
    expect(result).toContain('&lt;script&gt;');
  });

  it('should escape quotes', () => {
    const input = 'He said "Hello"';
    const result = preventXSS(input);
    expect(result).toContain('&quot;');
  });

  it('should escape ampersands', () => {
    const input = 'A & B';
    const result = preventXSS(input);
    expect(result).toContain('&amp;');
  });

  it('should handle single quotes', () => {
    const input = "It's working";
    const result = preventXSS(input);
    expect(result).toContain('&#x27;');
  });

  it('should not double-escape', () => {
    const input = '&lt;script&gt;';
    const result = preventXSS(input);
    const doubleEscape = preventXSS(result);
    expect(doubleEscape).toBe(result);
  });
});

describe('preventSQLInjection', () => {
  it('should escape single quotes', () => {
    const input = "O'Brien";
    const result = preventSQLInjection(input);
    expect(result).toContain("O''Brien");
  });

  it('should remove SQL keywords', () => {
    const input = "'; DROP TABLE users; --";
    const result = preventSQLInjection(input);
    expect(result.toLowerCase()).not.toContain('drop table');
  });

  it('should remove comments', () => {
    const input = "test -- comment";
    const result = preventSQLInjection(input);
    expect(result).not.toContain('--');
  });

  it('should escape backslashes', () => {
    const input = "test\\test";
    const result = preventSQLInjection(input);
    expect(result).toContain('\\\\');
  });

  it('should handle multiple attacks', () => {
    const input = "admin' OR '1'='1";
    const result = preventSQLInjection(input);
    expect(result).not.toContain("OR '1'='1");
  });

  it('should preserve safe strings', () => {
    const input = "John Doe";
    const result = preventSQLInjection(input);
    expect(result).toBe(input);
  });
});

describe('Edge Cases', () => {
  it('should handle null values', () => {
    expect(sanitizeString(null as any)).toBe('');
    expect(sanitizeEmail(null as any)).toBe('');
    expect(sanitizePhone(null as any)).toBe('');
  });

  it('should handle undefined values', () => {
    expect(sanitizeString(undefined as any)).toBe('');
    expect(sanitizeEmail(undefined as any)).toBe('');
    expect(sanitizePhone(undefined as any)).toBe('');
  });

  it('should handle very long strings', () => {
    const longString = 'a'.repeat(10000);
    const result = sanitizeString(longString);
    expect(result.length).toBeLessThanOrEqual(10000);
  });

  it('should handle unicode characters', () => {
    const input = 'Hello 世界 🌍';
    const result = sanitizeString(input);
    expect(result).toContain('世界');
    expect(result).toContain('🌍');
  });

  it('should handle special characters in email', () => {
    const result = sanitizeEmail('test+tag@example.co.za');
    expect(result).toBe('test+tag@example.co.za');
  });

  it('should handle various SA phone formats', () => {
    expect(sanitizePhone('(082) 123-4567')).toBe('+27821234567');
    expect(sanitizePhone('082-123-4567')).toBe('+27821234567');
    expect(sanitizePhone('082 123 4567')).toBe('+27821234567');
  });
});

describe('Performance', () => {
  it('should handle large arrays efficiently', () => {
    const largeArray = Array(1000).fill('<script>test</script>');
    const start = Date.now();
    
    const result = sanitizeInput({ items: largeArray });
    
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    expect(result.items[0]).toBe('test');
  });

  it('should handle deeply nested objects', () => {
    let deepObject: any = { value: '<script>test</script>' };
    for (let i = 0; i < 10; i++) {
      deepObject = { nested: deepObject };
    }

    const result = sanitizeInput(deepObject);
    
    let current = result;
    for (let i = 0; i < 10; i++) {
      current = current.nested;
    }
    expect(current.value).toBe('test');
  });
});

