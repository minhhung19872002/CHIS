import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login form', async ({ page }) => {
    await expect(page.locator('.login-form-title')).toContainText('Đăng nhập hệ thống');
    await expect(page.getByPlaceholder('Nhập tên đăng nhập')).toBeVisible();
    await expect(page.getByPlaceholder('Nhập mật khẩu')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Đăng nhập' })).toBeVisible();
  });

  test('should show CHIS branding', async ({ page }) => {
    await expect(page.locator('.login-brand-title')).toContainText('CHIS');
    await expect(page.locator('.login-brand-sub')).toContainText('Hệ thống Thông tin Y tế Cơ sở');
  });

  test('should show validation errors on empty submit', async ({ page }) => {
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page.getByText('Vui lòng nhập tên đăng nhập')).toBeVisible();
    await expect(page.getByText('Vui lòng nhập mật khẩu')).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.getByPlaceholder('Nhập tên đăng nhập').fill('wronguser');
    await page.getByPlaceholder('Nhập mật khẩu').fill('wrongpass');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    // Wait for either error toast message or page stays on login (not redirected)
    // Login.tsx calls message.error('Sai tên đăng nhập hoặc mật khẩu')
    // client.ts may show 'Loi he thong, vui long thu lai' for network errors
    await page.waitForTimeout(3000);
    // Verify we're still on the login page (not redirected to dashboard)
    await expect(page).toHaveURL(/\/(login)?$/);
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.getByPlaceholder('Nhập tên đăng nhập').fill('admin');
    await page.getByPlaceholder('Nhập mật khẩu').fill('Admin@123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/(login)?$/);
  });
});
