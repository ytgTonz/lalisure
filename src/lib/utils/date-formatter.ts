/**
 * Date formatting utilities that ensure consistent rendering between server and client
 * to prevent hydration mismatches.
 */

export interface DateFormatOptions {
  includeTime?: boolean;
  format?: 'short' | 'medium' | 'long';
}

/**
 * Formats a date consistently for both server and client rendering.
 * Uses a fixed format to prevent hydration mismatches from locale differences.
 */
export function formatDateConsistent(
  date: Date | string | null | undefined,
  options: DateFormatOptions = {}
): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';

  const { includeTime = false, format = 'medium' } = options;
  
  // Use consistent formatting regardless of locale
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  let formatted = '';
  
  switch (format) {
    case 'short':
      formatted = `${month}/${day}/${year}`;
      break;
    case 'long':
      formatted = `${getMonthName(dateObj.getMonth())} ${day}, ${year}`;
      break;
    case 'medium':
    default:
      formatted = `${month}/${day}/${year}`;
      break;
  }
  
  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    formatted += ` ${hours}:${minutes}`;
  }
  
  return formatted;
}

/**
 * Formats a date for display in forms and reviews.
 * Uses a human-readable format that's consistent across environments.
 */
export function formatDateForDisplay(date: Date | string | null | undefined): string {
  return formatDateConsistent(date, { format: 'long' });
}

/**
 * Formats a date for form inputs (YYYY-MM-DD format)
 */
export function formatDateForInput(date: Date | string | null | undefined): string {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Gets month name for consistent formatting
 */
function getMonthName(monthIndex: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex] || '';
}

// Note: HydrationSafeDateDisplay component removed as it requires React JSX
// Use the formatting functions directly in your components with suppressHydrationWarning