import { test, expect } from '@playwright/test';

// Helper: login as admin before each test
async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByPlaceholder('Nhập tên đăng nhập').fill('admin');
  await page.getByPlaceholder('Nhập mật khẩu').fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test.describe('Laboratory (Xet nghiem)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/laboratory');
    await expect(page.locator('.ant-layout-content')).toBeVisible({ timeout: 10000 });
  });

  test('should display laboratory page with orders tab', async ({ page }) => {
    // Verify the tabs component is rendered
    await expect(page.locator('.ant-tabs')).toBeVisible();

    // Verify both tabs are present
    const ordersTab = page.getByRole('tab', { name: 'Phieu xet nghiem' });
    const reportTab = page.getByRole('tab', { name: 'Bao cao' });
    await expect(ordersTab).toBeVisible();
    await expect(reportTab).toBeVisible();

    // Orders tab should be active by default (getByRole('tab') returns the button element with aria-selected)
    await expect(ordersTab).toHaveAttribute('aria-selected', 'true');

    // Verify the search input and status filter are present
    await expect(page.getByPlaceholder('Tim kiem...')).toBeVisible();
    // Status filter Select - use the one with the "Trang thai" placeholder
    await expect(page.locator('.ant-select').filter({ hasText: 'Trang thai' })).toBeVisible();

    // Verify the reload button is present
    const reloadButton = page.locator('button').filter({ has: page.locator('.anticon-reload') });
    await expect(reloadButton).toBeVisible();
  });

  test('should show lab orders list', async ({ page }) => {
    // Verify the orders table is rendered
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible({ timeout: 10000 });

    // Verify all expected column headers are present
    await expect(page.getByRole('columnheader', { name: 'Ho ten' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Ngay' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'BS chi dinh' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'So XN' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Trang thai' })).toBeVisible();

    // Table should either show data rows or the empty state
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const emptyState = page.locator('.ant-empty').first();
    const hasRows = await rows.count() > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    expect(hasRows || hasEmpty).toBeTruthy();

    // If rows exist, verify action buttons are present
    if (hasRows) {
      const firstRow = rows.first();
      await expect(firstRow).toBeVisible();
      // Each row should have at least a "Chi tiet" button
      await expect(firstRow.getByRole('button', { name: 'Chi tiet' })).toBeVisible();
    }
  });

  test('should filter by status', async ({ page }) => {
    // Find the status filter select component (the one with "Trang thai" placeholder)
    const statusSelect = page.locator('.ant-select').filter({ hasText: 'Trang thai' });
    await expect(statusSelect).toBeVisible();

    // Open the status dropdown and select "Cho" (Waiting)
    await statusSelect.click();
    await page.getByTitle('Cho').click();

    // Wait for loading to finish
    await expect(page.locator('.ant-spin-spinning')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.ant-table')).toBeVisible();

    // If there are rows, all visible status tags should be "Cho"
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();
    if (rowCount > 0) {
      const statusTags = page.locator('.ant-table-tbody .ant-tag');
      const tagCount = await statusTags.count();
      for (let i = 0; i < tagCount; i++) {
        await expect(statusTags.nth(i)).toHaveText('Cho');
      }
    }

    // Clear the filter
    const clearIcon = page.locator('.ant-select-clear').first();
    if (await clearIcon.isVisible()) {
      await clearIcon.click();
      await expect(page.locator('.ant-spin-spinning')).toBeHidden({ timeout: 10000 });
    }

    // Now test selecting "Da duyet" (Approved) status
    // After clearing, the placeholder should be back
    const statusSelectAgain = page.locator('.ant-select').filter({ hasText: 'Trang thai' });
    await statusSelectAgain.click();
    await page.getByTitle('Da duyet').click();
    await expect(page.locator('.ant-spin-spinning')).toBeHidden({ timeout: 10000 });

    const rowsAfter = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCountAfter = await rowsAfter.count();
    if (rowCountAfter > 0) {
      const statusTags = page.locator('.ant-table-tbody .ant-tag');
      const tagCount = await statusTags.count();
      for (let i = 0; i < tagCount; i++) {
        await expect(statusTags.nth(i)).toHaveText('Da duyet');
      }
    }
  });

  test('should search lab orders', async ({ page }) => {
    // Verify search input is present
    const searchInput = page.getByPlaceholder('Tim kiem...');
    await expect(searchInput).toBeVisible();

    // Type a search keyword
    await searchInput.fill('Nguyen');

    // The search input should contain the typed value
    await expect(searchInput).toHaveValue('Nguyen');

    // Table should still be visible
    await expect(page.locator('.ant-table')).toBeVisible();

    // Clear search input
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');

    // Try searching for a non-existing patient
    await searchInput.fill('XYZNONEXISTENT');
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('should switch between orders and report tabs', async ({ page }) => {
    // Verify default tab is "Phieu xet nghiem"
    const ordersTab = page.getByRole('tab', { name: 'Phieu xet nghiem' });
    const reportTab = page.getByRole('tab', { name: 'Bao cao' });
    await expect(ordersTab).toBeVisible();
    await expect(reportTab).toBeVisible();

    // Orders tab should be active, table should be visible
    await expect(ordersTab).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.ant-table')).toBeVisible();

    // Click on "Bao cao" tab
    await reportTab.click();

    // Report tab content should be visible
    await expect(page.getByText('Bao cao xet nghiem')).toBeVisible();

    // Report tab should have date range picker and export button
    await expect(page.locator('.ant-picker-range')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Xuat bao cao' })).toBeVisible();

    // Switch back to orders tab
    await ordersTab.click();
    await expect(page.locator('.ant-table')).toBeVisible();

    // Verify the orders tab is active again
    await expect(ordersTab).toHaveAttribute('aria-selected', 'true');
  });
});
