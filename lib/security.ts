/**
 * Security utilities for input sanitization and XSS prevention
 */

import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: return as-is (sanitize on client)
    return dirty;
  }
  
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Sanitize user input (remove all HTML)
 */
export function sanitizeInput(input: string): string {
  if (typeof window === 'undefined') {
    return input;
  }
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  const trimmed = url.trim().toLowerCase();
  
  // Block dangerous protocols
  if (
    trimmed.startsWith('javascript:') ||
    trimmed.startsWith('data:') ||
    trimmed.startsWith('vbscript:') ||
    trimmed.startsWith('file:')
  ) {
    return '';
  }
  
  return url;
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => map[char]);
}

/**
 * Validate and sanitize email address
 */
export function sanitizeEmail(email: string): string {
  const sanitized = email.trim().toLowerCase();
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return '';
  }
  
  return sanitized;
}

/**
 * Validate file upload
 */
export function validateFileUpload(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {}
): { valid: boolean; error?: string } {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  } = options;
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`,
    };
  }
  
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not allowed`,
    };
  }
  
  // Check file extension
  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: `File extension ${extension} is not allowed`,
    };
  }
  
  return { valid: true };
}

/**
 * Rate limiting helper (client-side)
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  constructor(
    private maxAttempts: number = 5,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];
    
    // Remove old attempts outside the window
    const recentAttempts = attempts.filter((time) => now - time < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  reset(key: string): void {
    this.attempts.delete(key);
  }
}

/**
 * Secure local storage wrapper
 */
export const secureStorage = {
  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      // In production, consider encrypting sensitive data
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Failed to store item:', error);
    }
  },
  
  getItem(key: string): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Failed to retrieve item:', error);
      return null;
    }
  },
  
  removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  },
  
  clear(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};
