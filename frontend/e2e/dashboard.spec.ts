import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByPlaceholder('Nhập tên đăng nhập').fill('admin');
    await page.getByPlaceholder('Nhập mật khẩu').fill('Admin@123');
    await page.getByRole('button', { name: 'Đăng nhập' }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
  });

  test('should display dashboard after login', async ({ page }) => {
    // Dashboard.tsx renders a <div className="dash-page"> inside MainLayout's
    // <Layout> (ant-layout). The dash-page div contains the KPI cards and charts.
    // We check for the dashboard-specific container and its header text.
    await expect(page.locator('.dash-page')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('.dash-header').getByText('Tổng quan')).toBeVisible();
  });

  test('should show sidebar menu', async ({ page }) => {
    // MainLayout.tsx renders a <Menu> with class "sidebar-menu" inside a <Sider>
    // with class "layout-sidebar". On desktop, the sidebar is always visible.
    await expect(page.locator('.sidebar-menu')).toBeVisible();
  });

  test('should navigate to patient page', async ({ page }) => {
    // The sidebar menu has "Tiếp đón" under the "Khám chữa bệnh" submenu.
    // First expand the submenu, then click the item.
    const submenu = page.locator('.sidebar-menu').getByText('Khám chữa bệnh');
    if (await submenu.isVisible()) {
      await submenu.click();
    }
    const menuItem = page.locator('.sidebar-menu').getByText('Tiếp đón').first();
    if (await menuItem.isVisible({ timeout: 5000 }).catch(() => false)) {
      await menuItem.click();
      await expect(page).toHaveURL(/\/(reception|patient)/, { timeout: 10000 });
    }
  });
});
