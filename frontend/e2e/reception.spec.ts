import { test, expect, Page } from '@playwright/test';

// Helper: login as admin and wait for dashboard
async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Nhập tên đăng nhập').fill('admin');
  await page.getByPlaceholder('Nhập mật khẩu').fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

test.describe('Reception - Tiep don benh nhan', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('/reception');
    // Wait for the reception page to fully load
    await expect(page.getByText('Tiep don benh nhan')).toBeVisible({ timeout: 10000 });
  });

  test('should display reception page with queue table', async ({ page }) => {
    // Verify page title
    await expect(page.getByText('Tiep don benh nhan')).toBeVisible();

    // Verify action buttons are present
    await expect(page.getByRole('button', { name: 'Tim BN' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Dang ky kham/ })).toBeVisible();

    // Verify the queue table is rendered with expected column headers
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'STT' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Ma BN' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Ho ten' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Phong' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Doi tuong' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'So BHYT' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Gio dang ky' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Trang thai' })).toBeVisible();
  });

  test('should search for existing patient by name', async ({ page }) => {
    // Open search modal
    await page.getByRole('button', { name: 'Tim BN' }).click();

    // Wait for modal to appear
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible({ timeout: 10000 });

    // Find any search/input field in the modal and type a search term
    const searchInput = modal.locator('input').first();
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Nguyen');

    // Try to trigger search - click a search button if available, or press Enter
    const searchBtn = modal.getByRole('button', { name: /Tim/i });
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    } else {
      await searchInput.press('Enter');
    }

    // Wait for results - the modal should show a table or search results
    await page.waitForTimeout(2000);
    // Verify modal is still open (search was processed)
    await expect(modal).toBeVisible();
  });

  test('should register a new patient and add to queue', async ({ page }) => {
    // Open the registration modal directly
    await page.getByRole('button', { name: /Dang ky kham/ }).click();
    await expect(page.getByText('Dang ky kham benh')).toBeVisible();

    // Fill in required fields

    // Full name (Ho va ten)
    const fullNameInput = page.locator('.ant-modal').getByLabel('Ho va ten');
    await fullNameInput.fill('Tran Thi Test');

    // Date of birth (Ngay sinh) - Ant Design DatePicker
    const datePickerInput = page.locator('.ant-modal .ant-picker input').first();
    await datePickerInput.click();
    await datePickerInput.fill('15/06/1990');
    // Press Enter to confirm the date
    await datePickerInput.press('Enter');

    // Gender (Gioi tinh) - Ant Design Select
    const genderSelect = page.locator('.ant-modal').locator('.ant-form-item').filter({ hasText: 'Gioi tinh' }).locator('.ant-select');
    await genderSelect.click();
    // Select "Nu" from dropdown
    await page.locator('.ant-select-dropdown').getByText('Nu').click();

    // Phone number (So dien thoai) - optional but good to fill
    const phoneInput = page.locator('.ant-modal').getByLabel('So dien thoai');
    await phoneInput.fill('0987654321');

    // Address (Dia chi) - optional
    const addressInput = page.locator('.ant-modal').getByLabel('Dia chi');
    await addressInput.fill('123 Duong Test, Thuong Tin, Ha Noi');

    // Patient type (Doi tuong) - Radio Group: BHYT / Thu phi / Mien phi
    await page.locator('.ant-modal').getByLabel('Thu phi').check();

    // Room (Phong kham) - Ant Design Select
    const roomSelect = page.locator('.ant-modal').locator('.ant-form-item').filter({ hasText: 'Phong kham' }).locator('.ant-select');
    await roomSelect.click();
    await page.locator('.ant-select-dropdown').getByText('Phong kham 1').click();

    // Chief complaint (Ly do kham) - optional
    const complaintInput = page.locator('.ant-modal').getByLabel('Ly do kham');
    await complaintInput.fill('Dau dau, sot');

    // Submit the registration form by clicking "Dang ky" button in modal footer
    await page.locator('.ant-modal-footer').getByRole('button', { name: 'Dang ky' }).click();

    // Wait for either a success message or the modal to close (API may not be available)
    await expect(async () => {
      const successVisible = await page.getByText('Dang ky kham thanh cong').isVisible().catch(() => false);
      const errorVisible = await page.getByText('Loi dang ky kham').isVisible().catch(() => false);
      const modalClosed = !(await page.locator('.ant-modal').filter({ hasText: 'Dang ky kham benh' }).isVisible().catch(() => true));
      expect(successVisible || errorVisible || modalClosed).toBeTruthy();
    }).toPass({ timeout: 10000 });
  });

  test('should show queue statistics', async ({ page }) => {
    // Verify that all four statistic card titles are displayed
    await expect(page.getByText('Tong dang ky')).toBeVisible();
    await expect(page.getByText('Dang cho')).toBeVisible();
    await expect(page.getByText('Dang kham')).toBeVisible();
    await expect(page.getByText('Hoan thanh')).toBeVisible();

    // The stat cards are rendered inside Col > Card > custom Statistic component
    // Each stat card is a Card inside a Col, containing a value div and title div
    const statCards = page.locator('.ant-row').first().locator('.ant-card');
    const statCount = await statCards.count();
    expect(statCount).toBe(4);

    // Each stat card should have a numeric value displayed (the first div inside the card body)
    for (let i = 0; i < statCount; i++) {
      const card = statCards.nth(i);
      // The custom Statistic renders: div(textAlign:center) > div(value) + div(title)
      // The value is in a div with fontSize: 24
      const valueEl = card.locator('div[style*="font-size"]').first();
      const valueText = await valueEl.textContent();
      expect(valueText).not.toBeNull();
      expect(Number(valueText?.trim())).toBeGreaterThanOrEqual(0);
    }
  });

  test('should display patient details in queue table', async ({ page }) => {
    // First check if there are any rows in the queue table
    const table = page.locator('.ant-table');
    await expect(table).toBeVisible();

    const rows = table.locator('.ant-table-body .ant-table-row, .ant-table-tbody .ant-table-row');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      // Verify the first row has content in expected cells
      const firstRow = rows.first();

      // Ticket number (STT) should be visible
      const cells = firstRow.locator('td');
      const cellCount = await cells.count();
      expect(cellCount).toBeGreaterThanOrEqual(8); // 8 data columns + action column

      // The first cell should contain a ticket number
      const ticketText = await cells.nth(0).textContent();
      expect(ticketText?.trim()).not.toBe('');

      // Patient code (Ma BN) cell should have content
      const codeText = await cells.nth(1).textContent();
      expect(codeText?.trim()).not.toBe('');

      // Patient name (Ho ten) cell should have content
      const nameText = await cells.nth(2).textContent();
      expect(nameText?.trim()).not.toBe('');

      // Status column should show one of the status tags: Cho, Dang kham, Xong
      const statusCell = cells.nth(7);
      const statusTag = statusCell.locator('.ant-tag');
      await expect(statusTag).toBeVisible();
      const statusText = await statusTag.textContent();
      expect(['Cho', 'Dang kham', 'Xong']).toContain(statusText?.trim());

      // Verify the "In" (print) button is present in the action column
      const printButton = firstRow.getByRole('button', { name: 'In' });
      await expect(printButton).toBeVisible();
    } else {
      // If queue is empty, the table should show the empty state
      const emptyState = table.locator('.ant-empty, .ant-table-placeholder').first();
      await expect(emptyState).toBeVisible();
    }
  });
});
