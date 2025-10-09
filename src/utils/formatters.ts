/**
 * Formatting utilities for addresses, amounts, dates, and more
 */

import { UI_CONSTANTS } from '@/constants';

/**
 * Formats a Klever address for display
 * @param address - Full Klever address (klv1...)
 * @param startChars - Number of characters to show at start (default: 6)
 * @param endChars - Number of characters to show at end (default: 4)
 * @returns Formatted address (e.g., "klv1ab...xyz9")
 * @example
 * formatAddress('klv1abcdefghijklmnopqrstuvwxyz1234567890')
 * // Returns: 'klv1ab...7890'
 */
export const formatAddress = (
  address: string,
  startChars: number = UI_CONSTANTS.ADDRESS_DISPLAY_START,
  endChars: number = UI_CONSTANTS.ADDRESS_DISPLAY_END
): string => {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
};

/**
 * Formats a token amount with proper decimals and token symbol
 * @param amount - Amount in smallest units (e.g., 1000000 for 1 KLV with precision 6)
 * @param precision - Token precision (decimals)
 * @param symbol - Token symbol
 * @param maxDecimals - Maximum decimals to display (default: 6)
 * @returns Formatted amount string
 * @example
 * formatTokenAmount(1234567, 6, 'KLV')
 * // Returns: '1.234567 KLV'
 */
export const formatTokenAmount = (
  amount: number | string,
  precision: number,
  symbol: string,
  maxDecimals: number = 6
): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const displayAmount = numAmount / Math.pow(10, precision);
  const decimals = Math.min(precision, maxDecimals);
  return `${displayAmount.toFixed(decimals)} ${symbol}`;
};

/**
 * Formats a balance for display with proper decimals
 * @param amount - Amount as number
 * @param token - Token symbol
 * @param decimals - Number of decimals to show (default: 4)
 * @returns Formatted balance string
 * @example
 * formatBalance(123.456789, 'KLV', 4)
 * // Returns: '123.4568 KLV'
 */
export const formatBalance = (amount: number, token: string, decimals: number = 4): string => {
  return `${amount.toFixed(decimals)} ${token}`;
};

/**
 * Formats a timestamp for display
 * @param date - Date object or ISO string
 * @param format - Format type ('short' | 'long' | 'relative')
 * @returns Formatted date string
 * @example
 * formatDate(new Date(), 'relative')
 * // Returns: '2 minutes ago'
 * @example
 * formatDate(new Date(), 'short')
 * // Returns: 'Jan 9, 10:30'
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' | 'relative' = 'short'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'relative') {
    return formatRelativeTime(dateObj);
  }

  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      : {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        };

  return dateObj.toLocaleDateString(undefined, options);
};

/**
 * Formats a relative time (e.g., "2 minutes ago")
 * @param date - Date to format
 * @returns Relative time string
 * @example
 * formatRelativeTime(new Date(Date.now() - 120000))
 * // Returns: '2 minutes ago'
 */
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  return formatDate(date, 'short');
};

/**
 * Formats a transaction hash for display
 * @param hash - Transaction hash
 * @returns Formatted hash
 * @example
 * formatTxHash('abcdef1234567890abcdef1234567890')
 * // Returns: 'abcdef12...567890'
 */
export const formatTxHash = (hash: string): string => {
  return formatAddress(hash, UI_CONSTANTS.TX_HASH_DISPLAY_START, UI_CONSTANTS.TX_HASH_DISPLAY_END);
};

/**
 * Validates and formats user input for token amounts
 * Removes non-numeric characters and limits decimal places
 * @param input - User input string
 * @param maxDecimals - Maximum decimal places allowed (default: 6)
 * @returns Cleaned and formatted input
 * @example
 * formatAmountInput('123.456789', 4)
 * // Returns: '123.4567'
 */
export const formatAmountInput = (input: string, maxDecimals: number = 6): string => {
  // Remove any non-numeric characters except decimal point
  let cleaned = input.replace(/[^\d.]/g, '');

  // Ensure only one decimal point
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places
  if (parts.length === 2 && parts[1].length > maxDecimals) {
    cleaned = parts[0] + '.' + parts[1].slice(0, maxDecimals);
  }

  return cleaned;
};

/**
 * Formats a number with thousand separators
 * @param num - Number to format
 * @param decimals - Number of decimal places (optional)
 * @returns Formatted number string
 * @example
 * formatNumber(1234567.89, 2)
 * // Returns: '1,234,567.89'
 */
export const formatNumber = (num: number, decimals?: number): string => {
  const options: Intl.NumberFormatOptions = {};
  if (decimals !== undefined) {
    options.minimumFractionDigits = decimals;
    options.maximumFractionDigits = decimals;
  }
  return num.toLocaleString(undefined, options);
};

/**
 * Copies text to clipboard with fallback for older browsers
 * @param text - Text to copy
 * @returns Promise resolving to success boolean
 * @example
 * const success = await copyToClipboard('klv1...');
 * if (success) {
 *   console.log('Copied!');
 * }
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        return successful;
      } catch (err) {
        console.error('Fallback copy failed:', err);
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (err) {
    console.error('Failed to copy text:', err);
    return false;
  }
};

/**
 * Truncates a string to a maximum length with ellipsis
 * @param str - String to truncate
 * @param maxLength - Maximum length
 * @param ellipsis - Ellipsis string (default: '...')
 * @returns Truncated string
 * @example
 * truncateString('This is a very long string', 10)
 * // Returns: 'This is...'
 */
export const truncateString = (
  str: string,
  maxLength: number,
  ellipsis: string = '...'
): string => {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - ellipsis.length) + ellipsis;
};

/**
 * Formats a percentage value
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted percentage string
 * @example
 * formatPercentage(66.666, 1)
 * // Returns: '66.7%'
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Converts a value to its display form based on type
 * Handles strings, numbers, booleans, and objects
 * @param value - Value to format
 * @returns Formatted string representation
 */
export const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return '-';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (typeof value === 'number') {
    return formatNumber(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }

  return String(value);
};
