/**
 * Validation utilities for forms and inputs
 */

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validateRequired(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value != null;
}

export function validateMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function validateMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function validateMin(value: number, min: number): boolean {
  return value >= min;
}

export function validateMax(value: number, max: number): boolean {
  return value <= max;
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-()]+$/;
  const digits = phone.replace(/\D/g, '');
  return phoneRegex.test(phone) && digits.length >= 10 && digits.length <= 15;
}

export function validatePattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

export function validateCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d{13,19}$/.test(cleaned)) {
    return false;
  }

  let sum = 0;
  let isEven = false;

  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export type ValidationRule<T = string> = {
  validate: (value: T) => boolean;
  message: string;
};

export function createValidator<T = string>(
  rules: ValidationRule<T>[]
): (value: T) => string | null {
  return (value: T) => {
    for (const rule of rules) {
      if (!rule.validate(value)) {
        return rule.message;
      }
    }
    return null;
  };
}

export const commonValidators = {
  email: createValidator([
    {
      validate: (value: string) => validateRequired(value),
      message: 'Email is required',
    },
    {
      validate: validateEmail,
      message: 'Enter a valid email address',
    },
  ]),

  password: createValidator([
    {
      validate: (value: string) => validateRequired(value),
      message: 'Password is required',
    },
    {
      validate: (value: string) => validateMinLength(value, 8),
      message: 'Password must be at least 8 characters',
    },
  ]),

  required: createValidator([
    {
      validate: validateRequired,
      message: 'This field is required',
    },
  ]),
};
