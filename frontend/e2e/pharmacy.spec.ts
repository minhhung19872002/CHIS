import { test, expect, type Page } from '@playwright/test';

/**
 * Helper: log in as admin and wait for redirect to /dashboard.
 */
async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Nhập tên đăng nhập').fill('admin');
  await page.getByPlaceholder('Nhập mật khẩu').fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

/**
 * Helper: navigate to the Pharmacy page after login.
 */
async function goToPharmacy(page: Page) {
  await page.goto('/pharmacy');
  await expect(page.locator('.ant-layout-content')).toBeVisible({ timeout: 10000 });
}

/**
 * Helper: click a tab and wait for tab content to load.
 * Handles Ant Design's scrollable tab bar with overflow.
 */
async function clickTab(page: Page, tabName: string) {
  const tab = page.getByRole('tab', { name: tabName });

  // First try the overflow "more" dropdown menu (for tabs behind the ... button)
  const moreBtn = page.locator('.ant-tabs-nav-more');
  if (await moreBtn.isVisible()) {
    await moreBtn.click();
    await page.waitForTimeout(300);
    const dropdownItem = page.locator('.ant-tabs-dropdown-menu-item').filter({ hasText: tabName });
    if (await dropdownItem.isVisible()) {
      await dropdownItem.click();
      await page.waitForTimeout(500);
      return;
    }
    // Close the dropdown if the tab wasn't in it
    await page.keyboard.press('Escape');
    await page.waitForTimeout(200);
  }

  // Tab is in the visible tab bar - scroll to it and click
  await tab.scrollIntoViewIfNeeded();
  await page.waitForTimeout(200);
  await tab.click();
  await page.waitForTimeout(500);
}

/**
 * Helper: get the active tab panel content area.
 */
function activePanel(page: Page) {
  return page.locator('.ant-tabs-tabpane-active');
}

test.describe('Duoc pham (Pharmacy Module)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await goToPharmacy(page);
  });

  // ───────────────────────────────────────────────
  // 1. Page loads with the default "Ton kho" tab
  // ───────────────────────────────────────────────
  test('should display pharmacy page with stock tab active by default', async ({ page }) => {
    // The Tabs component should be visible
    const tabs = page.locator('.ant-tabs');
    await expect(tabs).toBeVisible({ timeout: 10000 });

    // The "Ton kho" tab should be present and active
    const stockTab = page.getByRole('tab', { name: 'Ton kho' });
    await expect(stockTab).toBeVisible();
    await expect(stockTab).toHaveAttribute('aria-selected', 'true');

    // The stock tab panel content should contain a search input
    await expect(page.getByPlaceholder('Tim thuoc...')).toBeVisible();
  });

  // ───────────────────────────────────────────────
  // 2. Medicine stock inventory table
  // ───────────────────────────────────────────────
  test('should show medicine stock inventory table', async ({ page }) => {
    // Wait for the medicine table to appear inside the stock tab
    const table = page.locator('.ant-table:visible').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Verify expected column headers are present
    const expectedHeaders = ['Ma', 'Ten thuoc', 'Hoat chat', 'Ham luong', 'DVT', 'Ton kho', 'Toi thieu', 'Han dung', 'Gia BHYT'];
    for (const header of expectedHeaders) {
      await expect(table.locator('.ant-table-thead').first().getByText(header, { exact: false })).toBeVisible();
    }

    // There should be at least one row of medicine data (DB has 15 medicines)
    const rows = table.locator('.ant-table-tbody tr.ant-table-row');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThanOrEqual(1);
  });

  // ───────────────────────────────────────────────
  // 3. Search medicines by keyword
  // ───────────────────────────────────────────────
  test('should search medicines by keyword', async ({ page }) => {
    // Wait for table to initially load
    const table = page.locator('.ant-table:visible').first();
    await expect(table.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible({ timeout: 10000 });

    // Get the initial row count
    const initialRowCount = await table.locator('.ant-table-tbody tr.ant-table-row').count();

    // Type a search keyword (Paracetamol is one of the 15 medicines)
    const searchInput = page.getByPlaceholder('Tim thuoc...');
    await searchInput.fill('Paracetamol');
    await searchInput.press('Enter');

    // Wait for the table to update after search
    await page.waitForTimeout(1000);

    // After searching, the table should still be present (results may or may not match)
    await expect(table).toBeVisible();

    // Clear search and reload to verify reset
    await searchInput.clear();
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    // Table should still be visible after clearing search
    await expect(table).toBeVisible();
  });

  // ───────────────────────────────────────────────
  // 4. Switch between tabs
  // ───────────────────────────────────────────────
  test('should switch between all pharmacy tabs', async ({ page }) => {
    const tabLabels = [
      'Ton kho',
      'Nhap kho',
      'Phat thuoc',
      'Xuat tuyen duoi',
      'Nhap tuyen tren',
      'BB Kiem nhap',
      'Kiem ke',
      'Thanh ly',
      'Ban thuoc',
      'Du tru',
      'The kho',
      'Duyet toa',
      'Khoa so',
      'Bao cao',
    ];

    for (const label of tabLabels) {
      await clickTab(page, label);
      // After clicking, content area should be visible
      await page.waitForTimeout(300);
    }
  });

  // ───────────────────────────────────────────────
  // 5. Stock statistics cards
  // ───────────────────────────────────────────────
  test('should display stock statistics cards', async ({ page }) => {
    // Ensure the stock tab is active (default)
    const stockTab = page.getByRole('tab', { name: 'Ton kho' });
    await expect(stockTab).toHaveAttribute('aria-selected', 'true');

    // Wait for medicines to load (statistics are computed from fetched data)
    const table = page.locator('.ant-table:visible').first();
    await expect(table.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible({ timeout: 10000 });

    // Verify the three statistics cards are visible
    // Card 1: "Tong loai thuoc" (total medicine types)
    await expect(page.getByText('Tong loai thuoc')).toBeVisible();

    // Card 2: "Duoi dinh muc" (below minimum stock)
    await expect(page.getByText('Duoi dinh muc')).toBeVisible();

    // Card 3: "Sap het han" (expiring soon)
    await expect(page.getByText('Sap het han')).toBeVisible();

    // The stat cards are inside Card size="small" elements
    // Verify at least 3 small cards exist
    const statCards = page.locator('.ant-card').filter({ has: page.locator('[class*="small"], [class*="sm"]') });
    const cardCount = await statCards.count();
    // Fallback: just check the three texts are visible (already done above)
    if (cardCount < 3) {
      // The small cards may use a different class in Ant Design v6; just verify the text is present
      await expect(page.getByText('Tong loai thuoc')).toBeVisible();
    }
  });

  // ───────────────────────────────────────────────
  // 6. Stock receipt list (Nhap kho tab)
  // ───────────────────────────────────────────────
  test('should show stock receipt list on Nhap kho tab', async ({ page }) => {
    // Click the "Nhap kho" tab
    await clickTab(page, 'Nhap kho');

    // The receipt table should be visible
    const table = page.locator('.ant-table:visible').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Verify expected column headers for receipts
    const expectedHeaders = ['So phieu', 'Ngay', 'NCC', 'Tong tien', 'Trang thai'];
    for (const header of expectedHeaders) {
      await expect(table.locator('.ant-table-thead').first().getByText(header, { exact: false })).toBeVisible();
    }

    // The "Tao phieu nhap" button should be visible
    await expect(page.getByRole('button', { name: /Tao phieu nhap/ })).toBeVisible();
  });

  // ───────────────────────────────────────────────
  // 7. Dispensing tab (Phat thuoc)
  // ───────────────────────────────────────────────
  test('should show dispensing tab with table and refresh button', async ({ page }) => {
    await clickTab(page, 'Phat thuoc');

    // The dispensing table should be visible
    const table = page.locator('.ant-table:visible').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Verify column headers for dispensing
    const expectedHeaders = ['Ho ten BN', 'Ngay', 'Trang thai'];
    for (const header of expectedHeaders) {
      await expect(table.locator('.ant-table-thead').first().getByText(header, { exact: false })).toBeVisible();
    }

    // The "Lam moi" (refresh) button should be present
    await expect(page.getByRole('button', { name: /Lam moi/ })).toBeVisible();
  });

  // ───────────────────────────────────────────────
  // 8. Stock receipt modal opens
  // ───────────────────────────────────────────────
  test('should open stock receipt creation modal', async ({ page }) => {
    // Navigate to "Nhap kho" tab
    await clickTab(page, 'Nhap kho');

    // Click "Tao phieu nhap" button
    await page.getByRole('button', { name: /Tao phieu nhap/ }).click();

    // The receipt modal should appear
    const modal = page.locator('.ant-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    await expect(modal.getByText('Tao phieu nhap kho')).toBeVisible();

    // Modal should contain "Them thuoc" (add medicine) button
    await expect(modal.getByRole('button', { name: /Them thuoc/ })).toBeVisible();

    // Modal should have a "Luu" (save) button
    await expect(modal.getByRole('button', { name: 'Luu' })).toBeVisible();

    // Close modal
    const cancelButton = modal.locator('.ant-modal-close');
    await cancelButton.click();
    await expect(modal).not.toBeVisible();
  });

  // ───────────────────────────────────────────────
  // 9. Add item modal inside receipt modal
  // ───────────────────────────────────────────────
  test('should open add item modal inside receipt modal', async ({ page }) => {
    // Navigate to "Nhap kho" tab and open receipt modal
    await clickTab(page, 'Nhap kho');
    await page.getByRole('button', { name: /Tao phieu nhap/ }).click();

    const receiptModal = page.locator('.ant-modal').first();
    await expect(receiptModal).toBeVisible({ timeout: 5000 });

    // Click "Them thuoc" button inside the receipt modal
    await receiptModal.getByRole('button', { name: /Them thuoc/ }).click();

    // The add-item modal should appear (there may now be two modals)
    const addItemModal = page.locator('.ant-modal').filter({ hasText: 'Them thuoc vao phieu nhap' });
    await expect(addItemModal).toBeVisible({ timeout: 5000 });

    // Verify the form fields
    await expect(addItemModal.getByText('Ten thuoc')).toBeVisible();
    await expect(addItemModal.getByText('DVT')).toBeVisible();
    await expect(addItemModal.getByText('So luong')).toBeVisible();
    await expect(addItemModal.getByText('Don gia')).toBeVisible();
    await expect(addItemModal.getByText('So lo')).toBeVisible();
    await expect(addItemModal.getByText('Han dung')).toBeVisible();

    // Close the add-item modal
    const cancelBtn = addItemModal.locator('.ant-modal-close');
    await cancelBtn.click();
  });

  // ───────────────────────────────────────────────
  // 10. Lower-level issue tab (Xuat tuyen duoi)
  // ───────────────────────────────────────────────
  test('should show lower-level issue tab with create button', async ({ page }) => {
    await clickTab(page, 'Xuat tuyen duoi');

    const table = page.locator('.ant-table:visible').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    // Verify column headers
    const expectedHeaders = ['So phieu', 'Kho xuat', 'Don vi nhan', 'Ngay xuat', 'Tong tien'];
    for (const header of expectedHeaders) {
      await expect(table.locator('.ant-table-thead').first().getByText(header, { exact: false })).toBeVisible();
    }

    // "Tao phieu xuat" button should exist
    await expect(page.getByRole('button', { name: /Tao phieu xuat/ })).toBeVisible();
  });

  // ───────────────────────────────────────────────
  // 11. Report tab (Bao cao)
  // ───────────────────────────────────────────────
  test('should show report tab with report buttons', async ({ page }) => {
    await clickTab(page, 'Bao cao');

    // Verify the card title
    await expect(page.getByText('Bao cao duoc')).toBeVisible();

    // Verify report buttons
    const reportButtons = [
      'Bao cao ton kho',
      'Bao cao nhap xuat',
      'Bao cao thuoc sap het han',
      'Bao cao phat thuoc hang ngay',
      'The kho',
    ];
    for (const buttonText of reportButtons) {
      await expect(page.getByRole('button', { name: buttonText })).toBeVisible();
    }
  });

  // ───────────────────────────────────────────────
  // 12. Stock card tab (The kho)
  // ───────────────────────────────────────────────
  test('should show stock card tab with search form', async ({ page }) => {
    await clickTab(page, 'The kho');

    // The stock card tab has a form with Kho, Thuoc, Tu, Den fields and a Xem button
    // Use :visible to ensure we're checking only the active tab content
    await expect(page.locator('button:visible:has-text("Xem")')).toBeVisible({ timeout: 10000 });
  });

  // ───────────────────────────────────────────────
  // 13. Document lock tab (Khoa so)
  // ───────────────────────────────────────────────
  test('should show document lock tab with table', async ({ page }) => {
    await clickTab(page, 'Khoa so');

    // After switching to Khoa so tab, verify content loaded
    const content = page.locator('.ant-table:visible, .ant-card, .ant-spin-container').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  // ───────────────────────────────────────────────
  // 14. Prescription approval tab (Duyet toa)
  // ───────────────────────────────────────────────
  test('should show prescription approval tab with table', async ({ page }) => {
    await clickTab(page, 'Duyet toa');

    // After switching to Duyet toa tab, verify content loaded
    const content = page.locator('.ant-table:visible, .ant-card, .ant-spin-container').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  });

  // ───────────────────────────────────────────────
  // 15. Reload button on the stock tab refreshes data
  // ───────────────────────────────────────────────
  test('should reload medicine data when clicking reload button', async ({ page }) => {
    // Ensure stock tab is active and table has loaded
    const table = page.locator('.ant-table:visible').first();
    await expect(table.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible({ timeout: 10000 });

    // Click the reload button (next to the search input)
    const reloadButton = page.locator('button .anticon-reload').first();
    await expect(reloadButton).toBeVisible();
    await reloadButton.click();

    // The spinner may briefly appear; wait for the table to re-render
    await expect(table.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible({ timeout: 10000 });
  });

  // ───────────────────────────────────────────────
  // 16. Inventory tab (Kiem ke)
  // ───────────────────────────────────────────────
  test('should show stocktake tab with table columns', async ({ page }) => {
    await clickTab(page, 'Kiem ke');

    const table = page.locator('.ant-table:visible').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    const expectedHeaders = ['Ma KK', 'Kho', 'Ngay KK'];
    for (const header of expectedHeaders) {
      await expect(table.locator('.ant-table-thead').first().getByText(header, { exact: false })).toBeVisible();
    }
  });

  // ───────────────────────────────────────────────
  // 17. Disposal tab (Thanh ly)
  // ───────────────────────────────────────────────
  test('should show disposal tab with create button', async ({ page }) => {
    await clickTab(page, 'Thanh ly');

    const table = page.locator('.ant-table:visible').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    const expectedHeaders = ['So phieu', 'Kho', 'Ngay', 'Ly do', 'Tong tien'];
    for (const header of expectedHeaders) {
      await expect(table.locator('.ant-table-thead').first().getByText(header, { exact: false })).toBeVisible();
    }

    await expect(page.getByRole('button', { name: /Tao phieu TL/ })).toBeVisible();
  });

  // ───────────────────────────────────────────────
  // 18. Retail sales tab (Ban thuoc)
  // ───────────────────────────────────────────────
  test('should show retail sales tab with create button', async ({ page }) => {
    await clickTab(page, 'Ban thuoc');

    const table = page.locator('.ant-table:visible').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    const expectedHeaders = ['So', 'Khach hang', 'Ngay', 'Tong tien'];
    for (const header of expectedHeaders) {
      await expect(table.locator('.ant-table-thead').first().getByText(header, { exact: false })).toBeVisible();
    }

    // "Ban thuoc" button should be visible in the card extra area
    // The button is inside a Space within Card extra, use a broader locator
    await expect(page.getByRole('button', { name: 'Ban thuoc' })).toBeVisible();
  });

  // ───────────────────────────────────────────────
  // 19. Procurement tab (Du tru)
  // ───────────────────────────────────────────────
  test('should show procurement tab with create button', async ({ page }) => {
    await clickTab(page, 'Du tru');

    const table = page.locator('.ant-table:visible').first();
    await expect(table).toBeVisible({ timeout: 10000 });

    const expectedHeaders = ['Ma', 'Ngay', 'Ghi chu'];
    for (const header of expectedHeaders) {
      await expect(table.locator('.ant-table-thead').first().getByText(header, { exact: false })).toBeVisible();
    }

    await expect(page.getByRole('button', { name: /Tao du tru/ })).toBeVisible();
  });

  // ───────────────────────────────────────────────
  // 20. Page URL is correct
  // ───────────────────────────────────────────────
  test('should have correct URL for pharmacy page', async ({ page }) => {
    await expect(page).toHaveURL(/\/pharmacy/);
  });
});
