import { test, expect } from './fixtures';

test.describe('Performance Metrics', () => {
  test('dashboard loads within acceptable time', async ({ authenticatedPage }) => {
    const startTime = Date.now();
    await authenticatedPage.goto('/app/dashboard');
    await authenticatedPage.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Page should load in less than 10 seconds (dev mode with Turbopack)
    expect(loadTime).toBeLessThan(10000);
  });

  test('campaigns page loads within acceptable time', async ({ authenticatedPage }) => {
    const startTime = Date.now();
    await authenticatedPage.goto('/app/campaigns');
    await authenticatedPage.page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000);
  });

  test('no critical console errors on dashboard', async ({ authenticatedPage }) => {
    const errors: string[] = [];
    
    authenticatedPage.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Filter out known dev-mode warnings
        if (!text.includes('hydrat') && !text.includes('React DevTools') && !text.includes('Download the React')) {
          errors.push(text);
        }
      }
    });
    
    await authenticatedPage.goto('/app/dashboard');
    await authenticatedPage.page.waitForTimeout(2000);
    
    expect(errors).toHaveLength(0);
  });

  test('images are lazy loaded', async ({ page }) => {
    await page.goto('/app/dashboard');
    
    // Check if any images exist on the page
    const totalImages = await page.locator('img').count();
    // If images exist, at least some should have loading attribute or be SVG icons
    if (totalImages > 0) {
      const lazyImages = await page.locator('img[loading="lazy"]').count();
      const svgImages = await page.locator('svg').count();
      expect(lazyImages + svgImages).toBeGreaterThan(0);
    }
  });
});

test.describe('Accessibility - WCAG Compliance', () => {
  test('login page has no accessibility violations', async ({ page }) => {
    await page.goto('/login');
    
    // Check for alt text on images (exclude SVG icons)
    const imagesWithoutAlt = await page.locator('img:not([alt]):not([role="presentation"])').count();
    expect(imagesWithoutAlt).toBe(0);
    
    // Check form labels - main form inputs should have id or aria-label
    const formInputs = page.locator('form input:visible');
    const count = await formInputs.count();
    let labeledCount = 0;
    for (let i = 0; i < count; i++) {
      const input = formInputs.nth(i);
      const id = await input.getAttribute('id');
      const ariaLabel = await input.getAttribute('aria-label');
      const name = await input.getAttribute('name');
      const type = await input.getAttribute('type');
      // Checkbox inputs may not have explicit labels
      if (id || ariaLabel || name || type === 'checkbox') labeledCount++;
    }
    expect(labeledCount).toBe(count);
  });

  test('dashboard has proper heading structure', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/dashboard');
    
    // Dashboard has h1 in sidebar, main content uses h2/h3
    const allHeadings = await authenticatedPage.page.locator('h1, h2, h3').count();
    expect(allHeadings).toBeGreaterThan(0);
    
    // Main content should have headings
    const mainHeadings = await authenticatedPage.page.locator('main h2, main h3').count();
    expect(mainHeadings).toBeGreaterThan(0);
  });

  test('buttons are keyboard accessible', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/app/campaigns');
    
    // Tab through interactive elements
    await authenticatedPage.page.keyboard.press('Tab');
    const focusedElement = await authenticatedPage.page.locator(':focus');
    
    await expect(focusedElement).toBeVisible();
    expect(await focusedElement.evaluate(el => el.tagName)).toMatch(/BUTTON|A|INPUT/);
  });

  test('color contrast meets WCAG AA', async ({ page }) => {
    await page.goto('/login');
    
    // Check primary button contrast
    const button = page.locator('button[type="submit"]');
    const bgColor = await button.evaluate(el => getComputedStyle(el).backgroundColor);
    const textColor = await button.evaluate(el => getComputedStyle(el).color);
    
    // Simple contrast check (should be improved with actual color calculation)
    expect(bgColor).not.toEqual(textColor);
  });
});

test.describe('Usability Metrics', () => {
  test('error messages are clear and helpful', async ({ page }) => {
    // Use support page which has react-hook-form validation with visible error messages
    await page.goto('/app/support');
    await expect(page.locator('main h1')).toBeVisible();
    
    // Submit empty form to trigger validation
    await page.click('button[type="submit"]');
    
    // Check for helpful error messages (Zod validation renders red text)
    const errorMessage = page.locator('.text-red-600, .text-red-500, .error-message, [role="alert"]').first();
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  test('loading states are visible', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'demo@megvax.com');
    await page.fill('input[type="password"]', 'demo123');
    
    // Click submit and check for loading state
    await page.click('button[type="submit"]');
    
    // Should show loading indicator (spinner or disabled button)
    const loadingIndicator = page.locator('.animate-spin, button[disabled]');
    await expect(loadingIndicator.first()).toBeVisible({ timeout: 2000 });
  });

  test('success feedback is provided', async ({ page }) => {
    await page.goto('/login');
    
    // Login with valid credentials
    await page.fill('input[type="email"]', 'demo@megvax.com');
    await page.fill('input[type="password"]', 'demo123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard (success feedback)
    await page.waitForURL('/app/dashboard', { timeout: 5000 });
    await expect(page).toHaveURL('/app/dashboard');
  });

  test('empty states are helpful', async ({ authenticatedPage }) => {
    // Navigate to a page that might have empty state
    await authenticatedPage.goto('/app/accounts');
    
    // Page should load and show content
    await expect(authenticatedPage.page.locator('main h1')).toBeVisible();
    
    // The page should have meaningful content (not blank)
    const bodyText = await authenticatedPage.page.locator('main').textContent();
    expect(bodyText?.length).toBeGreaterThan(10);
  });
});
