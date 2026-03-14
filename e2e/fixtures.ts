import { test as base, expect, type Page } from '@playwright/test';

// Test user credentials
export const TEST_USER = {
  email: 'demo@megvax.com',
  password: 'demo123',
  name: 'Demo User',
};

// Page Object Model for common operations
export class MegvaxPage {
  constructor(public page: Page) {}

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  async login(email: string = TEST_USER.email, password: string = TEST_USER.password): Promise<void> {
    await this.goto('/login');
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');
    await this.page.waitForURL('/app/dashboard', { timeout: 10000 });
  }

  async logout(): Promise<void> {
    // Click the logout button in the sidebar
    const logoutBtn = this.page.locator('button', { hasText: /Çıkış Yap|Log Out/ });
    await logoutBtn.click();
    await this.page.waitForURL('/login');
  }

  async expectToast(message: string): Promise<void> {
    await expect(this.page.locator('.toast')).toContainText(message);
  }

  async waitForLoading(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
}

// Extended test with fixtures
type TestFixtures = {
  megvaxPage: MegvaxPage;
  authenticatedPage: MegvaxPage;
};

export const test = base.extend<TestFixtures>({
  megvaxPage: async ({ page }: { page: Page }, use: (r: MegvaxPage) => Promise<void>) => {
    await use(new MegvaxPage(page));
  },
  authenticatedPage: async ({ page }: { page: Page }, use: (r: MegvaxPage) => Promise<void>) => {
    const megvaxPage = new MegvaxPage(page);
    // Skip login flow since app has no auth guards in mock mode
    // Just navigate to dashboard to establish the session context
    await page.goto('/app/dashboard');
    await page.waitForLoadState('networkidle');
    await use(megvaxPage);
  },
});

export { expect };
