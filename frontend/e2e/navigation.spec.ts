import { test, expect } from '@playwright/test';

// Helper to login before each test
async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByPlaceholder('Nhập tên đăng nhập').fill('admin');
  await page.getByPlaceholder('Nhập mật khẩu').fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should navigate to examination page', async ({ page }) => {
    await page.goto('/examination');
    await expect(page.locator('.ant-layout-content')).toBeVisible();
  });

  test('should navigate to pharmacy page', async ({ page }) => {
    await page.goto('/pharmacy');
    await expect(page.locator('.ant-layout-content')).toBeVisible();
  });

  test('should navigate to billing page', async ({ page }) => {
    await page.goto('/billing');
    await expect(page.locator('.ant-layout-content')).toBeVisible();
  });

  test('should navigate to inpatient page', async ({ page }) => {
    await page.goto('/inpatient');
    await expect(page.locator('.ant-layout-content')).toBeVisible();
  });

  test('should navigate to lab page', async ({ page }) => {
    await page.goto('/lab');
    await expect(page.locator('.ant-layout-content')).toBeVisible();
  });

  test('should navigate to reports page', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('.ant-layout-content')).toBeVisible();
  });
});
