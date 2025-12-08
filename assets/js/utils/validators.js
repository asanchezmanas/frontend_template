// assets/js/utils/validators.js
/**
 * Validation Utilities
 * Common validation functions
 */

export const validators = {
  /**
   * Email validation
   */
  email(value) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },

  /**
   * URL validation
   */
  url(value) {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Phone validation (basic)
   */
  phone(value) {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(value) && value.replace(/\D/g, '').length >= 9;
  },

  /**
   * Required field
   */
  required(value) {
    if (typeof value === 'string') {
      return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
  },

  /**
   * Minimum length
   */
  minLength(value, min) {
    return String(value).length >= min;
  },

  /**
   * Maximum length
   */
  maxLength(value, max) {
    return String(value).length <= max;
  },

  /**
   * Minimum value
   */
  min(value, min) {
    return Number(value) >= min;
  },

  /**
   * Maximum value
   */
  max(value, max) {
    return Number(value) <= max;
  },

  /**
   * Range validation
   */
  range(value, min, max) {
    const num = Number(value);
    return num >= min && num <= max;
  },

  /**
   * Pattern matching
   */
  pattern(value, regex) {
    return regex.test(value);
  },

  /**
   * Number validation
   */
  number(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  },

  /**
   * Integer validation
   */
  integer(value) {
    return Number.isInteger(Number(value));
  },

  /**
   * Positive number
   */
  positive(value) {
    return Number(value) > 0;
  },

  /**
   * Negative number
   */
  negative(value) {
    return Number(value) < 0;
  },

  /**
   * Credit card (Luhn algorithm)
   */
  creditCard(value) {
    const digits = value.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },

  /**
   * Date validation
   */
  date(value) {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date);
  },

  /**
   * Past date
   */
  pastDate(value) {
    const date = new Date(value);
    return date < new Date();
  },

  /**
   * Future date
   */
  futureDate(value) {
    const date = new Date(value);
    return date > new Date();
  },

  /**
   * Alpha only
   */
  alpha(value) {
    return /^[a-zA-Z]+$/.test(value);
  },

  /**
   * Alphanumeric
   */
  alphanumeric(value) {
    return /^[a-zA-Z0-9]+$/.test(value);
  },

  /**
   * Username
   */
  username(value) {
    return /^[a-zA-Z0-9_-]{3,20}$/.test(value);
  },

  /**
   * Strong password
   */
  strongPassword(value) {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
  },

  /**
   * NIF/NIE (Spanish ID)
   */
  nif(value) {
    const regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
    if (!regex.test(value)) return false;

    const letters = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const number = parseInt(value.substr(0, 8), 10);
    const letter = value.charAt(8).toUpperCase();

    return letters.charAt(number % 23) === letter;
  },

  /**
   * Postal code (Spain)
   */
  postalCode(value, country = 'ES') {
    const patterns = {
      ES: /^[0-9]{5}$/,
      US: /^\d{5}(-\d{4})?$/,
      UK: /^[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}$/i
    };

    return patterns[country]?.test(value) || false;
  },

  /**
   * Match another field
   */
  matches(value, otherValue) {
    return value === otherValue;
  },

  /**
   * File extension
   */
  fileExtension(filename, allowedExtensions) {
    const ext = filename.split('.').pop().toLowerCase();
    return allowedExtensions.includes(ext);
  },

  /**
   * File size (in bytes)
   */
  fileSize(size, maxSize) {
    return size <= maxSize;
  },

  /**
   * JSON validation
   */
  json(value) {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Custom validation
   */
  custom(value, validatorFn) {
    return validatorFn(value);
  }
};