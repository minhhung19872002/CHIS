import { test, expect } from '@playwright/test';

// Helper: login as admin before each test
async function loginAsAdmin(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByPlaceholder('Nhập tên đăng nhập').fill('admin');
  await page.getByPlaceholder('Nhập mật khẩu').fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test.describe('Billing (Vien phi)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/billing');
    await expect(page.locator('.ant-layout-content')).toBeVisible({ timeout: 10000 });
  });

  test('should display billing page with statistics', async ({ page }) => {
    // Verify the billing tab is active by default
    await expect(page.locator('.ant-tabs')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Vien phi' })).toBeVisible();

    // Verify all 4 statistics cards are rendered
    await expect(page.getByText('Tong hoa don')).toBeVisible();
    await expect(page.getByText('Chua thu').first()).toBeVisible();
    await expect(page.getByText('Da thu').first()).toBeVisible();
    await expect(page.getByText('Con no')).toBeVisible();

    // Statistics cards should be inside Ant Statistic components
    const statisticCards = page.locator('.ant-statistic');
    await expect(statisticCards.first()).toBeVisible();
    const count = await statisticCards.count();
    expect(count).toBe(4);
  });

  test('should show billing list table', async ({ page }) => {
    // Verify the billing table is rendered
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible({ timeout: 10000 });

    // Verify all expected column headers are present
    await expect(page.getByRole('columnheader', { name: 'Ho ten' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'So BHYT' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Tong phi' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'BHYT tra' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'BN tra' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Trang thai' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Ngay' })).toBeVisible();

    // Table should either show data rows or the empty state
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const emptyState = page.locator('.ant-empty').first();
    const hasRows = await rows.count() > 0;
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    expect(hasRows || hasEmpty).toBeTruthy();

    // If rows exist, verify status tags are shown
    if (hasRows) {
      const firstRow = rows.first();
      await expect(firstRow).toBeVisible();
      // Each row should have a "Chi tiet" button
      await expect(firstRow.getByRole('button', { name: 'Chi tiet' })).toBeVisible();
    }
  });

  test('should search billings', async ({ page }) => {
    // Verify search input is present with correct placeholder
    const searchInput = page.getByPlaceholder('Tim kiem...');
    await expect(searchInput).toBeVisible();

    // Type a search keyword and trigger search
    await searchInput.fill('Nguyen');
    await searchInput.press('Enter');

    // Wait for loading to complete
    await expect(page.locator('.ant-spin-spinning')).toBeHidden({ timeout: 10000 });

    // Table should still be visible after search
    await expect(page.locator('.ant-table')).toBeVisible();

    // Clear search and verify table reloads
    await searchInput.clear();
    await searchInput.press('Enter');
    await expect(page.locator('.ant-spin-spinning')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.ant-table')).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    // Find the status filter select (the one with "Trang thai" placeholder)
    const statusSelect = page.locator('.ant-select').filter({ hasText: 'Trang thai' });
    await expect(statusSelect).toBeVisible();

    // Open the status dropdown and select "Chua thu"
    await statusSelect.click();
    await page.getByTitle('Chua thu').click();

    // Wait for data to reload
    await expect(page.locator('.ant-spin-spinning')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('.ant-table')).toBeVisible();

    // If there are rows, all visible status tags should be "Chua thu"
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();
    if (rowCount > 0) {
      const statusTags = page.locator('.ant-table-tbody .ant-tag');
      const tagCount = await statusTags.count();
      for (let i = 0; i < tagCount; i++) {
        await expect(statusTags.nth(i)).toHaveText('Chua thu');
      }
    }

    // Clear the filter by clicking the clear icon
    const clearIcon = page.locator('.ant-select-clear').first();
    if (await clearIcon.isVisible()) {
      await clearIcon.click();
      await expect(page.locator('.ant-spin-spinning')).toBeHidden({ timeout: 10000 });
    }
  });

  test('should switch between billing and report tabs', async ({ page }) => {
    // Verify default tab is "Vien phi"
    const billingTab = page.getByRole('tab', { name: 'Vien phi' });
    const reportTab = page.getByRole('tab', { name: 'Bao cao' });
    await expect(billingTab).toBeVisible();
    await expect(reportTab).toBeVisible();

    // Billing tab should be active
    await expect(billingTab).toHaveAttribute('aria-selected', 'true');

    // Click on "Bao cao" tab
    await reportTab.scrollIntoViewIfNeeded();
    await reportTab.click({ force: true });
    await page.waitForTimeout(500);
    await expect(reportTab).toHaveAttribute('aria-selected', 'true', { timeout: 5000 });

    // Report tab content should have some content visible
    const reportContent = page.locator('.ant-card, .ant-spin-container').first();
    await expect(reportContent).toBeVisible({ timeout: 10000 });

    // Switch back to billing tab
    await billingTab.click({ force: true });
    await page.waitForTimeout(500);
    await expect(billingTab).toHaveAttribute('aria-selected', 'true', { timeout: 5000 });
  });
});
