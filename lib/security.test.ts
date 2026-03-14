import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  sanitizeInput,
  sanitizeUrl,
  sanitizeEmail,
  escapeHtml,
  validateFileUpload,
  RateLimiter,
} from './security';

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('removes HTML tags', () => {
      const dirty = '<script>alert("XSS")</script>Hello';
      const clean = sanitizeInput(dirty);
      expect(clean).toBe('Hello');
    });

    it('removes all HTML elements', () => {
      const dirty = '<div><p>Text</p></div>';
      const clean = sanitizeInput(dirty);
      expect(clean).toBe('Text');
    });

    it('handles empty string', () => {
      expect(sanitizeInput('')).toBe('');
    });

    it('preserves plain text', () => {
      const text = 'Just plain text';
      expect(sanitizeInput(text)).toBe(text);
    });
  });

  describe('sanitizeUrl', () => {
    it('allows http URLs', () => {
      const url = 'http://example.com';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('allows https URLs', () => {
      const url = 'https://example.com';
      expect(sanitizeUrl(url)).toBe(url);
    });

    it('blocks javascript: protocol', () => {
      const url = 'javascript:alert("XSS")';
      expect(sanitizeUrl(url)).toBe('');
    });

    it('blocks data: protocol', () => {
      const url = 'data:text/html,<script>alert("XSS")</script>';
      expect(sanitizeUrl(url)).toBe('');
    });

    it('blocks vbscript: protocol', () => {
      const url = 'vbscript:msgbox("XSS")';
      expect(sanitizeUrl(url)).toBe('');
    });

    it('blocks file: protocol', () => {
      const url = 'file:///etc/passwd';
      expect(sanitizeUrl(url)).toBe('');
    });

    it('is case insensitive', () => {
      const url = 'JAVASCRIPT:alert("XSS")';
      expect(sanitizeUrl(url)).toBe('');
    });
  });

  describe('sanitizeEmail', () => {
    it('validates and normalizes email', () => {
      const email = '  TEST@EXAMPLE.COM  ';
      expect(sanitizeEmail(email)).toBe('test@example.com');
    });

    it('returns empty string for invalid email', () => {
      expect(sanitizeEmail('notanemail')).toBe('');
      expect(sanitizeEmail('missing@domain')).toBe('');
      expect(sanitizeEmail('@example.com')).toBe('');
    });

    it('handles valid email formats', () => {
      expect(sanitizeEmail('user@example.com')).toBe('user@example.com');
      expect(sanitizeEmail('user.name@example.co.uk')).toBe('user.name@example.co.uk');
    });
  });

  describe('escapeHtml', () => {
    it('escapes special characters', () => {
      const text = '<script>alert("XSS")</script>';
      const escaped = escapeHtml(text);
      expect(escaped).toContain('&lt;');
      expect(escaped).toContain('&gt;');
      expect(escaped).not.toContain('<script>');
    });

    it('escapes quotes', () => {
      const text = 'He said "Hello"';
      const escaped = escapeHtml(text);
      expect(escaped).toContain('&quot;');
    });

    it('escapes ampersands', () => {
      const text = 'Tom & Jerry';
      const escaped = escapeHtml(text);
      expect(escaped).toBe('Tom &amp; Jerry');
    });
  });

  describe('validateFileUpload', () => {
    it('validates file size', () => {
      const file = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
      const result = validateFileUpload(file, { maxSize: 5 * 1024 * 1024 });
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('size');
    });

    it('validates file type', () => {
      const file = new File(['content'], 'file.exe', { type: 'application/exe' });
      const result = validateFileUpload(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('type');
    });

    it('validates file extension', () => {
      const file = new File(['content'], 'file.exe', { type: 'image/jpeg' });
      const result = validateFileUpload(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('extension');
    });

    it('accepts valid files', () => {
      const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
      const result = validateFileUpload(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('RateLimiter', () => {
    let limiter: RateLimiter;

    beforeEach(() => {
      limiter = new RateLimiter(3, 1000); // 3 attempts per second
      vi.useFakeTimers();
    });

    it('allows requests within limit', () => {
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
      expect(limiter.isAllowed('user1')).toBe(true);
    });

    it('blocks requests over limit', () => {
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');
      
      expect(limiter.isAllowed('user1')).toBe(false);
    });

    it('resets after time window', () => {
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');
      
      expect(limiter.isAllowed('user1')).toBe(false);
      
      vi.advanceTimersByTime(1100);
      
      expect(limiter.isAllowed('user1')).toBe(true);
    });

    it('tracks users separately', () => {
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');
      
      expect(limiter.isAllowed('user1')).toBe(false);
      expect(limiter.isAllowed('user2')).toBe(true);
    });

    it('can be manually reset', () => {
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');
      limiter.isAllowed('user1');
      
      expect(limiter.isAllowed('user1')).toBe(false);
      
      limiter.reset('user1');
      
      expect(limiter.isAllowed('user1')).toBe(true);
    });
  });
});
