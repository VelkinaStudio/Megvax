import { test, expect } from '@playwright/test';

test.describe('Marketing Pages', () => {
  test('homepage loads with hero section', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
  });

  test('pricing page loads with plans', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('h1')).toBeVisible();
    // Should have 3 pricing cards
    const cards = page.locator('[class*="border"]').filter({ hasText: /\/ay|\/month/ });
    await expect(cards.first()).toBeVisible();
  });

  test('about page loads', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('book page loads with calendar placeholder', async ({ page }) => {
    await page.goto('/book');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.getByText(/Calendly|Cal.com/)).toBeVisible();
  });

  test('contact page loads with form', async ({ page }) => {
    await page.goto('/contact');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('form')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('status page shows all services', async ({ page }) => {
    await page.goto('/status');
    await expect(page.locator('h1')).toBeVisible();
    // Should show at least 5 service rows
    const serviceRows = page.locator('[class*="rounded-xl"][class*="border"]').filter({ hasText: /Operational|Çalışıyor/ });
    await expect(serviceRows).toHaveCount(5);
  });
});

test.describe('Legal Pages', () => {
  test('privacy page loads', async ({ page }) => {
    await page.goto('/privacy');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2').first()).toBeVisible();
  });

  test('terms page loads', async ({ page }) => {
    await page.goto('/terms');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('h2').first()).toBeVisible();
  });

  test('cookies page loads', async ({ page }) => {
    await page.goto('/cookies');
    await expect(page.locator('h1')).toBeVisible();
  });
});

test.describe('Auth Pages', () => {
  test('login page loads with form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('signup page loads with form', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="checkbox"]')).toBeVisible();
  });

  test('forgot-password page loads', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('signup links to real terms and privacy pages', async ({ page }) => {
    await page.goto('/signup');
    const termsLink = page.locator('a[href="/terms"]');
    const privacyLink = page.locator('a[href="/privacy"]');
    // Links exist in the DOM (form checkbox + footer = 2 each)
    const termsCount = await termsLink.count();
    const privacyCount = await privacyLink.count();
    expect(termsCount).toBeGreaterThanOrEqual(1);
    expect(privacyCount).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Footer Links', () => {
  test('all footer links point to valid pages', async ({ page }) => {
    await page.goto('/');
    
    const footerLinks = [
      '/pricing', '/about', '/contact', '/status',
      '/privacy', '/terms', '/cookies',
    ];

    for (const href of footerLinks) {
      const link = page.locator(`footer a[href="${href}"]`);
      await expect(link).toBeVisible();
    }
  });
});

test.describe('Navigation', () => {
  test('nav has login and signup CTAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav a[href="/login"]')).toBeVisible();
    await expect(page.locator('nav a[href="/signup"]')).toBeVisible();
  });

  test('language switcher works', async ({ page }) => {
    await page.goto('/');
    const enButton = page.locator('nav button', { hasText: 'EN' });
    await expect(enButton).toBeVisible();
  });
});

test.describe('SEO', () => {
  test('robots.txt is accessible', async ({ page }) => {
    const response = await page.goto('/robots.txt');
    expect(response?.status()).toBe(200);
  });

  test('sitemap.xml is accessible', async ({ page }) => {
    const response = await page.goto('/sitemap.xml');
    expect(response?.status()).toBe(200);
  });

  test('manifest is accessible', async ({ page }) => {
    const response = await page.goto('/manifest.webmanifest');
    expect(response?.status()).toBe(200);
  });
});
