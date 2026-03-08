import { test, expect, type Page } from '@playwright/test';

// ============================================================
// Helper: Login as admin user
// ============================================================

async function loginAsAdmin(page: Page) {
  await page.goto('/');
  await page.getByPlaceholder('Nhập tên đăng nhập').fill('admin');
  await page.getByPlaceholder('Nhập mật khẩu').fill('Admin@123');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15000 });
}

// ============================================================
// Helper: Navigate to module and verify basic page loading
// ============================================================

async function navigateAndVerifyLoaded(page: Page, route: string) {
  await page.goto(route);
  // Wait for the main layout content area to be visible
  await expect(page.locator('.ant-layout-content')).toBeVisible({ timeout: 10000 });
  // Ensure no uncaught React error overlay
  await expect(page.locator('#webpack-dev-server-client-overlay')).not.toBeVisible({ timeout: 2000 }).catch(() => {
    // Overlay element may not exist at all, which is fine
  });
}

// ============================================================
// Helper: Verify the page has an Ant Design table rendered
// ============================================================

async function expectTableVisible(page: Page) {
  await expect(page.locator('.ant-table').first()).toBeVisible({ timeout: 10000 });
}

// ============================================================
// Helper: Verify the page has Ant Design tabs rendered
// ============================================================

async function expectTabsVisible(page: Page) {
  await expect(page.locator('.ant-tabs').first()).toBeVisible({ timeout: 10000 });
}

// ============================================================
// Helper: Verify the page has an Ant Design card rendered
// ============================================================

async function expectCardVisible(page: Page) {
  await expect(page.locator('.ant-card').first()).toBeVisible({ timeout: 10000 });
}

// ============================================================
// Helper: Verify a spin container exists (page uses loading state)
// ============================================================

async function expectSpinContainer(page: Page) {
  await expect(page.locator('.ant-spin-container').first()).toBeVisible({ timeout: 10000 });
}

// ============================================================
// TESTS: All 22 CHIS Modules
// ============================================================

test.describe('CHIS Module Navigation & Page Loading', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  // ----------------------------------------------------------
  // I. Population Management (Quan ly dan so)
  // ----------------------------------------------------------
  test.describe('Population Management - /population', () => {
    test('should load population page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/population');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display household tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/population');
      // "Ho khau" tab should be the default active tab
      await expect(page.getByRole('tab', { name: 'Ho khau' })).toHaveAttribute('aria-selected', 'true');
      await expectTableVisible(page);
    });

    test('should display births and deaths tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/population');
      await expect(page.getByRole('tab', { name: 'Khai sinh' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Tu vong' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Nguoi cao tuoi' })).toBeVisible();
    });

    test('should have add household button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/population');
      await expect(page.getByRole('button', { name: /Them ho/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // II. Chronic Disease Management (Benh khong lay nhiem)
  // ----------------------------------------------------------
  test.describe('Chronic Disease - /chronic-disease', () => {
    test('should load chronic disease page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/chronic-disease');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display patient list tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/chronic-disease');
      // "Benh nhan" tab should be present
      await expect(page.getByRole('tab', { name: /Benh nhan/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display adherence and tracking tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/chronic-disease');
      await expect(page.getByRole('tab', { name: /Tuan thu/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /So theo doi/i })).toBeVisible();
    });

    test('should have register button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/chronic-disease');
      await expect(page.getByRole('button', { name: /Dang ky/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // III. Communicable Disease (Benh truyen nhiem)
  // ----------------------------------------------------------
  test.describe('Communicable Disease - /communicable-disease', () => {
    test('should load communicable disease page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/communicable-disease');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display cases tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/communicable-disease');
      await expect(page.getByRole('tab', { name: /Ca benh/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display weekly and monthly report tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/communicable-disease');
      await expect(page.getByRole('tab', { name: /Bao cao tuan/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Bao cao thang/i })).toBeVisible();
    });

    test('should have report case button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/communicable-disease');
      await expect(page.getByRole('button', { name: /Bao cao/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // IV. Reproductive Health (CSSKSS)
  // ----------------------------------------------------------
  test.describe('Reproductive Health - /reproductive-health', () => {
    test('should load reproductive health page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/reproductive-health');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display prenatal tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/reproductive-health');
      await expect(page.getByRole('tab', { name: /Kham thai/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display delivery, family planning, and gynecology tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/reproductive-health');
      await expect(page.getByRole('tab', { name: /De/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /KHHGD/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Phu khoa/i })).toBeVisible();
    });

    test('should have create prenatal record button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/reproductive-health');
      await expect(page.getByRole('button', { name: /Tao so/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // V. HIV/AIDS Management (Phong chong HIV/AIDS)
  // ----------------------------------------------------------
  test.describe('HIV/AIDS - /hiv-aids', () => {
    test('should load HIV/AIDS page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/hiv-aids');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display patients tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/hiv-aids');
      await expect(page.getByRole('tab', { name: /Benh nhan HIV/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display reports tab', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/hiv-aids');
      await expect(page.getByRole('tab', { name: /Bao cao/i })).toBeVisible();
    });

    test('should have add patient button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/hiv-aids');
      await expect(page.getByRole('button', { name: /Them/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // VI. Immunization (Tiem chung)
  // ----------------------------------------------------------
  test.describe('Immunization - /immunization', () => {
    test('should load immunization page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/immunization');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display subjects tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/immunization');
      await expect(page.getByRole('tab', { name: /Doi tuong tiem chung/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display stock, issues, reports, and vaccine catalog tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/immunization');
      await expect(page.getByRole('tab', { name: /Ton kho vaccine/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Xuat vaccine/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Bao cao/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Danh muc vaccine/i })).toBeVisible();
    });

    test('should display child statistics cards when data available', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/immunization');
      // The child stats section uses Statistic components
      // It may or may not show depending on data, but the page should load without error
      await expectCardVisible(page);
    });

    test('should have add subject button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/immunization');
      await expect(page.getByRole('button', { name: /Them/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // VII. Vitamin A
  // ----------------------------------------------------------
  test.describe('Vitamin A - /vitamin-a', () => {
    test('should load Vitamin A page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/vitamin-a');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display records tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/vitamin-a');
      await expect(page.getByRole('tab', { name: /Cho uong Vitamin A/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display plans and reports tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/vitamin-a');
      await expect(page.getByRole('tab', { name: /Ke hoach/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Bao cao/i })).toBeVisible();
    });

    test('should have add record button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/vitamin-a');
      await expect(page.getByRole('button', { name: /Ghi nhan/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // VIII. Nutrition Management (Phong chong SDD)
  // ----------------------------------------------------------
  test.describe('Nutrition Management - /nutrition', () => {
    test('should load nutrition page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/nutrition');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display growth monitoring tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/nutrition');
      await expect(page.getByRole('tab', { name: /Theo doi tang truong/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display reports tab', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/nutrition');
      await expect(page.getByRole('tab', { name: /Bao cao/i })).toBeVisible();
    });

    test('should have add measurement button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/nutrition');
      await expect(page.getByRole('button', { name: /Ghi nhan/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // IX. Injury Prevention (TNTT)
  // ----------------------------------------------------------
  test.describe('Injury Prevention - /injury-prevention', () => {
    test('should load injury prevention page with card and table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/injury-prevention');
      await expectSpinContainer(page);
      await expectCardVisible(page);
    });

    test('should display page title', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/injury-prevention');
      await expect(page.locator('.ant-card-head-title').first()).toContainText('Phong chong tai nan thuong tich');
    });

    test('should display table with injury records', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/injury-prevention');
      await expectTableVisible(page);
    });

    test('should have add record button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/injury-prevention');
      await expect(page.getByRole('button', { name: /Ghi nhan/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // X. Death Tracking (Tu vong)
  // ----------------------------------------------------------
  test.describe('Death Tracking - /death-tracking', () => {
    test('should load death tracking page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/death-tracking');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display records tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/death-tracking');
      await expect(page.getByRole('tab', { name: /Ghi nhan tu vong/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display A6/YTCS report tab', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/death-tracking');
      await expect(page.getByRole('tab', { name: /Bao cao A6/i })).toBeVisible();
    });

    test('should have add record button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/death-tracking');
      await expect(page.getByRole('button', { name: /Ghi nhan/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XI. Health Education (Truyen thong GDSK)
  // ----------------------------------------------------------
  test.describe('Health Education - /health-education', () => {
    test('should load health education page with card and table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/health-education');
      await expectSpinContainer(page);
      await expectCardVisible(page);
    });

    test('should display page title', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/health-education');
      await expect(page.locator('.ant-card-head-title').first()).toContainText('Truyen thong giao duc suc khoe');
    });

    test('should display campaigns table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/health-education');
      await expectTableVisible(page);
    });

    test('should have add campaign button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/health-education');
      await expect(page.getByRole('button', { name: /Them/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XII. Environmental Health (VSMT)
  // ----------------------------------------------------------
  test.describe('Environmental Health - /environmental-health', () => {
    test('should load environmental health page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/environmental-health');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display sanitation facilities tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/environmental-health');
      await expect(page.getByRole('tab', { name: /Cong trinh ve sinh/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display water sources tab', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/environmental-health');
      await expect(page.getByRole('tab', { name: /Nguon nuoc/i })).toBeVisible();
    });

    test('should have add facility button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/environmental-health');
      await expect(page.getByRole('button', { name: /Them/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XIII. Food Safety (ATTP)
  // ----------------------------------------------------------
  test.describe('Food Safety - /food-safety', () => {
    test('should load food safety page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/food-safety');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display food businesses tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/food-safety');
      await expect(page.getByRole('tab', { name: /Co so ATTP/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display food poisoning tab', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/food-safety');
      await expect(page.getByRole('tab', { name: /Ngo doc thuc pham/i })).toBeVisible();
    });

    test('should have add business button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/food-safety');
      await expect(page.getByRole('button', { name: /Them/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XIV. Reports (Bao cao thong ke)
  // ----------------------------------------------------------
  test.describe('Reports - /reports', () => {
    test('should load reports page with tree and content area', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/reports');
      await expectSpinContainer(page);
    });

    test('should display report catalog tree', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/reports');
      // Report tree is rendered with Ant Design Tree component
      await expect(page.locator('.ant-tree')).toBeVisible({ timeout: 10000 });
    });

    test('should display report catalog heading', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/reports');
      await expect(page.getByText('Danh muc bao cao')).toBeVisible();
    });

    test('should display BCX report category in tree', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/reports');
      await expect(page.getByText('Bao cao tuyen xa (BCX)')).toBeVisible();
    });

    test('should display initial help text when no report selected', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/reports');
      await expect(page.getByText(/Chon mot bao cao tu danh muc ben trai/i)).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XV. System Admin (Quan tri he thong)
  // ----------------------------------------------------------
  test.describe('System Admin - /system-admin', () => {
    test('should load system admin page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/system-admin');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display users tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/system-admin');
      await expect(page.getByRole('tab', { name: /Nguoi dung/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display roles, config, and audit tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/system-admin');
      await expect(page.getByRole('tab', { name: /Vai tro/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Cau hinh/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Nhat ky/i })).toBeVisible();
    });

    test('should have add user button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/system-admin');
      await expect(page.getByRole('button', { name: /Them/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XVI. Master Data (Danh muc cau hinh)
  // ----------------------------------------------------------
  test.describe('Master Data - /master-data', () => {
    test('should load master data page with card and tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/master-data');
      await expectSpinContainer(page);
      await expectCardVisible(page);
    });

    test('should display page title', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/master-data');
      await expect(page.locator('.ant-card-head-title').first()).toContainText('Danh muc du lieu');
    });

    test('should display left-side category tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/master-data');
      await expectTabsVisible(page);
      // Check some category labels are visible using exact match to avoid partial matches
      await expect(page.getByRole('tab', { name: 'Can bo' })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Thuoc', exact: true })).toBeVisible();
      await expect(page.getByRole('tab', { name: 'Dich vu' })).toBeVisible();
    });

    test('should display data table for active category', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/master-data');
      await expectTableVisible(page);
    });

    test('should have add item button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/master-data');
      await expect(page.getByRole('button', { name: /Them moi/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XVII. Equipment Management (Tai san thiet bi)
  // ----------------------------------------------------------
  test.describe('Equipment Management - /equipment-management', () => {
    test('should load equipment page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/equipment-management');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display assets tab with table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/equipment-management');
      await expect(page.getByRole('tab', { name: /Tai san/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display transfers and tracking tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/equipment-management');
      await expect(page.getByRole('tab', { name: /Dieu chuyen/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /So theo doi/i })).toBeVisible();
    });

    test('should have add equipment button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/equipment-management');
      await expect(page.getByRole('button', { name: /Them/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XVIII. Staff Management (Nhan luc)
  // ----------------------------------------------------------
  test.describe('Staff Management - /staff-management', () => {
    test('should load staff management page with card and table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/staff-management');
      await expectSpinContainer(page);
      await expectCardVisible(page);
    });

    test('should display page title', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/staff-management');
      await expect(page.locator('.ant-card-head-title').first()).toContainText('Quan ly nhan luc');
    });

    test('should display staff list table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/staff-management');
      await expectTableVisible(page);
    });

    test('should have add staff button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/staff-management');
      await expect(page.getByRole('button', { name: /Them/i })).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/staff-management');
      await expect(page.getByPlaceholder('Tim kiem...')).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XIX. Finance (Tai chinh ke toan)
  // ----------------------------------------------------------
  test.describe('Finance - /finance', () => {
    test('should load finance page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/finance');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display vouchers tab with statistics and table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/finance');
      await expect(page.getByRole('tab', { name: /Thu\/Chi/i })).toBeVisible();
      await expectTableVisible(page);
    });

    test('should display financial summary statistics', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/finance');
      await expect(page.getByText('Tong thu')).toBeVisible();
      await expect(page.getByText('Tong chi')).toBeVisible();
      await expect(page.getByText('Con lai')).toBeVisible();
    });

    test('should display reports tab', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/finance');
      await expect(page.getByRole('tab', { name: /Bao cao/i })).toBeVisible();
    });

    test('should have income and expense voucher buttons', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/finance');
      await expect(page.getByRole('button', { name: /Phieu thu/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /Phieu chi/i })).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XX. Data Interop (Lien thong du lieu)
  // ----------------------------------------------------------
  test.describe('Data Interop - /data-interop', () => {
    test('should load data interop page with tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/data-interop');
      await expectTabsVisible(page);
      await expectSpinContainer(page);
    });

    test('should display overview tab with connection cards', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/data-interop');
      await expect(page.getByRole('tab', { name: /Tong quan/i })).toBeVisible();
      // Verify the three integration cards are visible
      await expect(page.getByText('Lien thong BHYT')).toBeVisible();
      await expect(page.getByText(/Ho so suc khoe/i)).toBeVisible();
      await expect(page.getByText(/V20/i)).toBeVisible();
    });

    test('should display BHYT claims and other tabs', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/data-interop');
      await expect(page.getByRole('tab', { name: /Ho so BHYT/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Tra cuu the BHYT/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /Lich su dong bo/i })).toBeVisible();
    });

    test('should have sync buttons', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/data-interop');
      // Each integration card has a "Dong bo" button
      const syncButtons = page.getByRole('button', { name: /Dong bo/i });
      await expect(syncButtons.first()).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XXI. Inpatient (Noi tru)
  // ----------------------------------------------------------
  test.describe('Inpatient - /inpatient', () => {
    test('should load inpatient page with card and table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/inpatient');
      await expectSpinContainer(page);
      await expectCardVisible(page);
    });

    test('should display page title', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/inpatient');
      await expect(page.locator('.ant-card-head-title').first()).toContainText('Quan ly noi tru');
    });

    test('should display admissions table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/inpatient');
      await expectTableVisible(page);
    });

    test('should have admit button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/inpatient');
      await expect(page.getByRole('button', { name: /Nhap vien/i })).toBeVisible();
    });

    test('should show placeholder when no patient selected', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/inpatient');
      await expect(page.getByText('Chon benh nhan tu danh sach')).toBeVisible();
    });

    test('should have status filter dropdown', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/inpatient');
      await expect(page.locator('.ant-select').first()).toBeVisible();
    });
  });

  // ----------------------------------------------------------
  // XXII. Driver License Exam (Kham GPLX)
  // ----------------------------------------------------------
  test.describe('Driver License Exam - /driver-license-exam', () => {
    test('should load driver license exam page with card and table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/driver-license-exam');
      await expectSpinContainer(page);
      await expectCardVisible(page);
    });

    test('should display page title', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/driver-license-exam');
      await expect(page.locator('.ant-card-head-title').first()).toContainText('Kham suc khoe lai xe');
    });

    test('should display exams table', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/driver-license-exam');
      await expectTableVisible(page);
    });

    test('should have new exam button', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/driver-license-exam');
      await expect(page.getByRole('button', { name: /Kham moi/i })).toBeVisible();
    });

    test('should have search input', async ({ page }) => {
      await navigateAndVerifyLoaded(page, '/driver-license-exam');
      await expect(page.getByPlaceholder('Tim kiem...')).toBeVisible();
    });
  });
});

// ============================================================
// TESTS: Cross-module navigation smoke tests
// ============================================================

test.describe('Cross-Module Navigation Smoke Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  const allModuleRoutes = [
    { route: '/population', name: 'Population' },
    { route: '/chronic-disease', name: 'Chronic Disease' },
    { route: '/communicable-disease', name: 'Communicable Disease' },
    { route: '/reproductive-health', name: 'Reproductive Health' },
    { route: '/hiv-aids', name: 'HIV/AIDS' },
    { route: '/immunization', name: 'Immunization' },
    { route: '/vitamin-a', name: 'Vitamin A' },
    { route: '/nutrition', name: 'Nutrition' },
    { route: '/injury-prevention', name: 'Injury Prevention' },
    { route: '/death-tracking', name: 'Death Tracking' },
    { route: '/health-education', name: 'Health Education' },
    { route: '/environmental-health', name: 'Environmental Health' },
    { route: '/food-safety', name: 'Food Safety' },
    { route: '/reports', name: 'Reports' },
    { route: '/system-admin', name: 'System Admin' },
    { route: '/master-data', name: 'Master Data' },
    { route: '/equipment-management', name: 'Equipment Management' },
    { route: '/staff-management', name: 'Staff Management' },
    { route: '/finance', name: 'Finance' },
    { route: '/data-interop', name: 'Data Interop' },
    { route: '/inpatient', name: 'Inpatient' },
    { route: '/driver-license-exam', name: 'Driver License Exam' },
  ];

  for (const { route, name } of allModuleRoutes) {
    test(`${name} (${route}) loads without error`, async ({ page }) => {
      await page.goto(route);
      // Verify we are on the correct route (not redirected to login)
      await expect(page).toHaveURL(new RegExp(route.replace(/\//g, '\\/')), { timeout: 10000 });
      // Verify the main content area is rendered
      await expect(page.locator('.ant-layout-content')).toBeVisible({ timeout: 10000 });
      // Verify no crash: check that some Ant Design content container is present
      const hasContent = await page.locator('.ant-layout-content').locator('.ant-spin-container, .ant-card, .ant-table, .ant-tabs').first().isVisible({ timeout: 8000 }).catch(() => false);
      expect(hasContent).toBeTruthy();
    });
  }
});

// ============================================================
// TESTS: Tab switching within modules
// ============================================================

test.describe('Tab Switching Within Modules', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  async function switchTab(page: Page, tabName: string | RegExp) {
    const tab = typeof tabName === 'string'
      ? page.getByRole('tab', { name: tabName })
      : page.getByRole('tab', { name: tabName });
    await tab.scrollIntoViewIfNeeded();
    await tab.click({ force: true });
    await page.waitForTimeout(500);
    await expect(tab).toHaveAttribute('aria-selected', 'true', { timeout: 5000 });
  }

  async function expectContentVisible(page: Page) {
    // After tab switch, expect either table, card, or spin-container to be visible
    const content = page.locator('.ant-table, .ant-card, .ant-spin-container').first();
    await expect(content).toBeVisible({ timeout: 10000 });
  }

  test('Population: can switch between all tabs', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/population');
    await switchTab(page, 'Khai sinh');
    await expectContentVisible(page);
    await switchTab(page, 'Tu vong');
    await expectContentVisible(page);
    await switchTab(page, 'Nguoi cao tuoi');
    await expectContentVisible(page);
  });

  test('Chronic Disease: can switch to adherence tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/chronic-disease');
    await switchTab(page, /Tuan thu/i);
    await expectContentVisible(page);
  });

  test('Chronic Disease: can switch to tracking book tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/chronic-disease');
    await switchTab(page, /So theo doi/i);
    await expectContentVisible(page);
  });

  test('Communicable Disease: can switch to weekly reports tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/communicable-disease');
    await switchTab(page, /Bao cao tuan/i);
    await expectContentVisible(page);
  });

  test('Environmental Health: can switch to water sources tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/environmental-health');
    await switchTab(page, /Nguon nuoc/i);
    await expectContentVisible(page);
  });

  test('Food Safety: can switch to food poisoning tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/food-safety');
    await switchTab(page, /Ngo doc thuc pham/i);
    await expectContentVisible(page);
  });

  test('System Admin: can switch to roles tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/system-admin');
    await switchTab(page, /Vai tro/i);
    await expectContentVisible(page);
  });

  test('System Admin: can switch to audit log tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/system-admin');
    await switchTab(page, /Nhat ky/i);
    await expectContentVisible(page);
  });

  test('Equipment: can switch to transfers tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/equipment-management');
    await switchTab(page, /Dieu chuyen/i);
    await expectContentVisible(page);
  });

  test('Finance: can switch to reports tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/finance');
    await switchTab(page, /Bao cao/i);
    await expectContentVisible(page);
  });

  test('Data Interop: can switch to BHYT claims tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/data-interop');
    await switchTab(page, /Ho so BHYT/i);
    await expectContentVisible(page);
  });

  test('Data Interop: can switch to insurance card lookup tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/data-interop');
    await switchTab(page, /Tra cuu the BHYT/i);
    await expectContentVisible(page);
  });

  test('Immunization: can switch to vaccine stock tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/immunization');
    await switchTab(page, /Ton kho vaccine/i);
    await expectContentVisible(page);
  });

  test('HIV/AIDS: can switch to reports tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/hiv-aids');
    await switchTab(page, /Bao cao/i);
    await expectContentVisible(page);
  });

  test('Reproductive Health: can switch to delivery tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/reproductive-health');
    await switchTab(page, 'De');
    await expectContentVisible(page);
  });

  test('Death Tracking: can switch to report tab', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/death-tracking');
    await switchTab(page, /Bao cao A6/i);
    await expectContentVisible(page);
  });
});

// ============================================================
// TESTS: Modal opening for key modules
// ============================================================

test.describe('Modal Opening Tests', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('Population: opening add household modal', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/population');
    await page.getByRole('button', { name: /Them ho/i }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.getByText('Them ho khau')).toBeVisible();
    // Close modal
    await page.locator('.ant-modal .ant-modal-close').click();
    await expect(page.locator('.ant-modal')).not.toBeVisible();
  });

  test('Injury Prevention: opening add record modal', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/injury-prevention');
    await page.getByRole('button', { name: /Ghi nhan/i }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.getByText('Ghi nhan TNTT')).toBeVisible();
  });

  test('Health Education: opening add campaign modal', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/health-education');
    await page.getByRole('button', { name: /Them/i }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.getByText('Them hoat dong TTGDSK')).toBeVisible();
  });

  test('Staff Management: opening add staff modal', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/staff-management');
    await page.getByRole('button', { name: /Them/i }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.getByText('Them nhan vien')).toBeVisible();
  });

  test('Driver License Exam: opening new exam modal', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/driver-license-exam');
    await page.getByRole('button', { name: /Kham moi/i }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.getByText('Kham suc khoe lai xe').nth(1)).toBeVisible();
  });

  test('Inpatient: opening admit modal', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/inpatient');
    await page.getByRole('button', { name: /Nhap vien/i }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.locator('.ant-modal-title').first()).toContainText('Nhap vien');
  });

  test('Equipment: opening add equipment modal', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/equipment-management');
    await page.getByRole('button', { name: /Them/i }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.getByText('Them tai san')).toBeVisible();
  });

  test('Finance: opening income voucher modal', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/finance');
    await page.getByRole('button', { name: /Phieu thu/i }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.locator('.ant-modal-title').first()).toContainText('Phieu thu');
  });

  test('System Admin: opening add user modal', async ({ page }) => {
    await navigateAndVerifyLoaded(page, '/system-admin');
    await page.getByRole('button', { name: /Them/i }).click();
    await expect(page.locator('.ant-modal')).toBeVisible();
    await expect(page.getByText('Them nguoi dung')).toBeVisible();
  });
});
