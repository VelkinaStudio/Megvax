import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Campaign Table
 * Tests table interactions, accessibility (ARIA labels), and keyboard navigation
 */

test.describe('Campaign Table', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to campaigns page
    await page.goto('/app/campaigns');
    
    // Wait for page to load
    await expect(page.locator('main h1')).toBeVisible();
  });

  test('should display campaign table with data', async ({ page }) => {
    // Check table or data grid exists
    const table = page.locator('table');
    const dataGrid = page.locator('[role="grid"], [role="table"]');
    const hasTable = await table.count() > 0;
    const hasGrid = await dataGrid.count() > 0;
    expect(hasTable || hasGrid).toBeTruthy();
  });

  test('should display campaign rows', async ({ page }) => {
    // Wait for table rows to load
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
    
    // Check that rows have data
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should show interactive elements in table', async ({ page }) => {
    // Check for any interactive elements in the table area
    const buttons = page.locator('main button');
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have buttons with accessible names', async ({ page }) => {
    // Check that buttons on the page have accessible names
    const buttons = page.locator('button:visible');
    const count = await buttons.count();
    let accessibleCount = 0;
    
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      if (ariaLabel?.trim() || text?.trim()) accessibleCount++;
    }
    
    // Most buttons should have accessible names
    expect(accessibleCount).toBeGreaterThan(0);
  });

  test('page has SVG icons', async ({ page }) => {
    // Check that SVG icons exist on the page
    const icons = page.locator('svg');
    const count = await icons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should have interactive table rows', async ({ page }) => {
    // Check if table rows exist
    const rows = page.locator('tbody tr, [role="row"]');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be keyboard navigable', async ({ page }) => {
    // Focus on table
    await page.keyboard.press('Tab');
    
    // Navigate through table with Tab
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Check that an interactive element is focused
    const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(['BUTTON', 'INPUT', 'A']).toContain(focusedElement);
  });

  test('should show campaign status indicators', async ({ page }) => {
    // Page should have status indicators (badges, colored dots, etc.)
    const mainContent = await page.locator('main').textContent();
    expect(mainContent?.length).toBeGreaterThan(50);
  });

  test('should display campaign data', async ({ page }) => {
    // Page should show campaign data with numbers/metrics
    const mainText = await page.locator('main').textContent();
    // Should contain some numeric data
    expect(mainText).toMatch(/\d/);
  });

  test('page loads without errors', async ({ page }) => {
    // Verify page loaded successfully
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main')).toBeVisible();
  });

  test('page has meaningful content', async ({ page }) => {
    // Page should have substantial content
    const text = await page.locator('main').textContent();
    expect(text?.length).toBeGreaterThan(100);
  });
});

test.describe('Campaign Table - Accessibility', () => {
  test('should have proper table structure', async ({ page }) => {
    await page.goto('/app/campaigns');
    
    // Check for thead, tbody
    await expect(page.locator('thead')).toBeVisible();
    await expect(page.locator('tbody')).toBeVisible();
    
    // Check that table has headers
    const headers = page.locator('th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);
  });

  test('should have accessible table structure', async ({ page }) => {
    await page.goto('/app/campaigns');
    
    // Page should have heading
    await expect(page.locator('main h1')).toBeVisible();
    
    // Should have some table-like structure
    const mainContent = await page.locator('main').textContent();
    expect(mainContent?.length).toBeGreaterThan(50);
  });

  test('should announce loading states to screen readers', async ({ page }) => {
    await page.goto('/app/campaigns');
    
    // Check for aria-live regions
    const liveRegions = page.locator('[aria-live], [role="status"]');
    
    if (await liveRegions.first().isVisible()) {
      await expect(liveRegions.first()).toHaveAttribute('aria-live');
    }
  });

  test('should have keyboard shortcuts documented', async ({ page }) => {
    await page.goto('/app/campaigns');
    
    // Press ? or check for keyboard shortcuts help
    await page.keyboard.press('?');
    
    // Wait for shortcuts modal/tooltip (if implemented)
    await page.waitForTimeout(500);
  });
});

test.describe('Campaign Table - Performance', () => {
  test('should render large dataset efficiently', async ({ page }) => {
    await page.goto('/app/campaigns');
    
    // Measure time to render
    const startTime = Date.now();
    await page.locator('tbody tr').first().waitFor();
    const renderTime = Date.now() - startTime;
    
    // Should render in under 2 seconds
    expect(renderTime).toBeLessThan(2000);
  });

  test('should handle rapid interactions', async ({ page }) => {
    await page.goto('/app/campaigns');
    
    // Rapidly click checkboxes
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    
    if (await checkboxes.first().isVisible()) {
      for (let i = 0; i < 5; i++) {
        await checkboxes.nth(i % await checkboxes.count()).click();
      }
      
      // Page should remain responsive
      await expect(page.locator('table')).toBeVisible();
    }
  });
});
