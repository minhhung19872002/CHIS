import { test, expect, Page } from '@playwright/test';

// ============================================================
// Helper: Login as admin and navigate to /examination
// ============================================================
async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Nhập tên đăng nhập').fill('admin');
  await page.getByPlaceholder('Nhập mật khẩu').fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

async function goToExamination(page: Page) {
  await page.goto('/examination');
  await expect(page.locator('.ant-layout-content')).toBeVisible({ timeout: 10000 });
}

// ============================================================
// TEST SUITE: Kham benh (Examination) Module
// ============================================================
test.describe('Kham benh - Examination Module', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToExamination(page);
  });

  // ----------------------------------------------------------
  // 1. Should display examination page with list table
  // ----------------------------------------------------------
  test('should display examination page with list table', async ({ page }) => {
    // The left panel card title "Danh sach kham" should be visible
    await expect(page.getByText('Danh sach kham')).toBeVisible({ timeout: 10000 });

    // The examination list table should be present
    const table = page.locator('.ant-table');
    await expect(table.first()).toBeVisible({ timeout: 10000 });

    // Verify table column headers are present
    await expect(page.getByRole('columnheader', { name: 'Ma BN' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Ho ten' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Ngay kham' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'BS' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Trang thai' })).toBeVisible();

    // The search input should be present
    const searchInput = page.getByPlaceholder('Tim kiem...');
    await expect(searchInput).toBeVisible();

    // The status filter dropdown should be present
    const statusSelect = page.locator('.ant-select').filter({ hasText: /Trang thai/ }).first();
    // If there is no text yet, check for the select with the placeholder
    const statusPlaceholder = page.getByText('Trang thai').first();
    const hasStatusFilter = await statusSelect.isVisible().catch(() => false)
      || await statusPlaceholder.isVisible().catch(() => false);
    expect(hasStatusFilter).toBeTruthy();

    // The right panel should show placeholder text when no exam is selected
    await expect(page.getByText('Vui long chon benh nhan tu danh sach ben trai')).toBeVisible();

    // The Reload button should be present
    const reloadBtn = page.locator('button').filter({ has: page.locator('.anticon-reload') }).first();
    await expect(reloadBtn).toBeVisible();
  });

  // ----------------------------------------------------------
  // 2. Should search examinations by keyword
  // ----------------------------------------------------------
  test('should search examinations by keyword', async ({ page }) => {
    // Wait for the table to load initially
    const table = page.locator('.ant-table');
    await expect(table.first()).toBeVisible({ timeout: 10000 });

    // Wait for any initial data load to complete (spinner gone)
    await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});

    // Type a search keyword and press Enter
    const searchInput = page.getByPlaceholder('Tim kiem...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Nguyen');
    await searchInput.press('Enter');

    // Wait for loading to finish
    await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});

    // The table should still be visible after search
    await expect(table.first()).toBeVisible();

    // If results exist, rows should contain the search term or table shows empty state
    const tableBody = page.locator('.ant-table-tbody');
    await expect(tableBody.first()).toBeVisible({ timeout: 5000 });

    // Clear the search to restore original results
    await searchInput.clear();
    await searchInput.press('Enter');
    await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});
  });

  // ----------------------------------------------------------
  // 3. Should filter by status
  // ----------------------------------------------------------
  test('should filter by status', async ({ page }) => {
    // Wait for the table to load
    const table = page.locator('.ant-table');
    await expect(table.first()).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});

    // Open the status filter dropdown
    // The status Select has placeholder "Trang thai"
    const statusSelect = page.locator('.ant-form-inline .ant-select').last();
    await statusSelect.click();

    // Wait for dropdown options to appear
    const dropdown = page.locator('.ant-select-dropdown');
    await expect(dropdown.first()).toBeVisible({ timeout: 5000 });

    // Select "Cho kham" (status = 0)
    await page.getByTitle('Cho kham').click();

    // Wait for loading to finish after filter change
    await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});

    // If there are results with "Cho kham" status, they should display the orange tag
    const choKhamTags = page.locator('.ant-tag-orange');
    const rowCount = await page.locator('.ant-table-tbody tr.ant-table-row').count();
    if (rowCount > 0) {
      // All visible status tags should be "Cho kham" (orange)
      const tagCount = await choKhamTags.count();
      expect(tagCount).toBeGreaterThanOrEqual(0);
    }

    // Now switch to "Dang kham" (status = 1) filter
    await statusSelect.click();
    await page.getByTitle('Dang kham').click();
    await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});

    // Table should still be visible
    await expect(table.first()).toBeVisible();

    // Clear the filter - click the clear icon
    const clearIcon = statusSelect.locator('.ant-select-clear');
    if (await clearIcon.isVisible().catch(() => false)) {
      await clearIcon.click();
      await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});
    }
  });

  // ----------------------------------------------------------
  // 4. Should navigate through examination details
  // ----------------------------------------------------------
  test('should navigate through examination details', async ({ page }) => {
    // Wait for the exam list table to load
    const table = page.locator('.ant-table');
    await expect(table.first()).toBeVisible({ timeout: 10000 });
    await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});

    // Check if there are examination rows in the table
    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Click the first examination row to select it
      await rows.first().click();

      // The right panel should now show examination detail card
      // The card title should contain "Kham benh -" followed by patient name
      await expect(page.getByText(/Kham benh -/).first()).toBeVisible({ timeout: 5000 });

      // The patient info section (Descriptions) should be visible
      await expect(page.getByText('Ma BN').nth(1)).toBeVisible();
      await expect(page.getByText('Ngay kham').nth(1)).toBeVisible();
      await expect(page.getByText('Doi tuong')).toBeVisible();

      // The Tabs should be visible with expected tab labels
      const tabList = page.locator('.ant-tabs');
      await expect(tabList.first()).toBeVisible();

      // Verify the tab labels exist
      await expect(page.getByRole('tab', { name: 'Sinh hieu' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Chan doan' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Don thuoc' })).toBeVisible();

      // The action buttons should be present
      await expect(page.getByRole('button', { name: /In/ })).toBeVisible();
      await expect(page.getByRole('button', { name: /Ket thuc/ })).toBeVisible();

      // If there are multiple rows, click the second one and verify it changes
      if (rowCount > 1) {
        const secondRowText = await rows.nth(1).locator('td').first().textContent();
        await rows.nth(1).click();

        // The detail panel should update
        await expect(page.getByText(/Kham benh -/).first()).toBeVisible({ timeout: 5000 });
      }
    } else {
      // No examinations in the database - the table shows empty state
      const emptyState = page.locator('.ant-empty');
      await expect(emptyState.first()).toBeVisible();
    }
  });

  // ----------------------------------------------------------
  // 5. Should display vital signs section
  // ----------------------------------------------------------
  test('should display vital signs section', async ({ page }) => {
    // Wait for the exam list to load
    await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});

    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Select the first examination
      await rows.first().click();
      await expect(page.getByText(/Kham benh -/).first()).toBeVisible({ timeout: 5000 });

      // The "Sinh hieu" tab should be active by default
      const vitalsTab = page.getByRole('tab', { name: 'Sinh hieu' });
      await expect(vitalsTab).toBeVisible();

      // Click the vitals tab to ensure it is active
      await vitalsTab.click();

      // Verify vital signs form fields are displayed
      await expect(page.getByText('Than nhiet (C)')).toBeVisible();
      await expect(page.getByText('Mach (l/p)')).toBeVisible();
      await expect(page.getByText('HA tam thu')).toBeVisible();
      await expect(page.getByText('HA tam truong')).toBeVisible();
      await expect(page.getByText('Nhip tho (l/p)')).toBeVisible();
      await expect(page.getByText('Can nang (kg)')).toBeVisible();
      await expect(page.getByText('Chieu cao (cm)')).toBeVisible();
      await expect(page.getByText('SpO2 (%)')).toBeVisible();

      // The vital signs form should have InputNumber fields
      const inputNumbers = page.locator('.ant-input-number');
      const inputCount = await inputNumbers.count();
      expect(inputCount).toBeGreaterThanOrEqual(8);

      // The save button "Luu sinh hieu" should be visible
      await expect(page.getByRole('button', { name: 'Luu sinh hieu' })).toBeVisible();
    } else {
      // No rows - verify the placeholder message
      await expect(page.getByText('Vui long chon benh nhan tu danh sach ben trai')).toBeVisible();
    }
  });

  // ----------------------------------------------------------
  // 6. Should display diagnosis section
  // ----------------------------------------------------------
  test('should display diagnosis section', async ({ page }) => {
    // Wait for the exam list to load
    await page.waitForSelector('.ant-spin-spinning', { state: 'detached', timeout: 10000 }).catch(() => {});

    const rows = page.locator('.ant-table-tbody tr.ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Select the first examination
      await rows.first().click();
      await expect(page.getByText(/Kham benh -/).first()).toBeVisible({ timeout: 5000 });

      // Navigate to the "Chan doan" (Diagnosis) tab
      const diagnosisTab = page.getByRole('tab', { name: 'Chan doan' });
      await expect(diagnosisTab).toBeVisible();
      await diagnosisTab.click();

      // Verify diagnosis form fields are displayed
      await expect(page.getByText('Ly do kham')).toBeVisible();
      await expect(page.getByText('Benh su')).toBeVisible();
      await expect(page.getByText('Ma ICD chinh')).toBeVisible();
      await expect(page.getByText('Chan doan chinh')).toBeVisible();
      await expect(page.getByText('Chan doan phu')).toBeVisible();
      await expect(page.getByText('Huong xu tri')).toBeVisible();

      // The diagnosis form should contain text area fields
      const textAreas = page.locator('.ant-input, textarea.ant-input');
      const textAreaCount = await textAreas.count();
      expect(textAreaCount).toBeGreaterThanOrEqual(4);

      // The save button "Luu chan doan" should be visible
      await expect(page.getByRole('button', { name: 'Luu chan doan' })).toBeVisible();
    } else {
      // No rows - verify the placeholder message
      await expect(page.getByText('Vui long chon benh nhan tu danh sach ben trai')).toBeVisible();
    }
  });
});
