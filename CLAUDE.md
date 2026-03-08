# CHIS - Community Health Information System
# Phần mềm Quản lý Y tế Cơ sở

## Project Overview
- **Target**: Trung tâm Y tế huyện Thường Tín (29 trạm y tế + 1 phòng khám đa khoa)
- **Modules**: 22 phân hệ, ~300+ chức năng
- **Contract**: 24 tháng thuê phần mềm

## Project Structure
- **Backend**: ASP.NET Core 9 Clean Architecture (CHIS.Core → CHIS.Application → CHIS.Infrastructure → CHIS.API)
- **Backend Tests**: `backend/tests/CHIS.UnitTests` (xUnit + Moq + FluentAssertions + EF Core InMemory)
- **Frontend**: React 19 + TypeScript + Ant Design v6 + Vite
- **Frontend Tests**: Vitest + React Testing Library + happy-dom
- **Database**: SQL Server (Docker container `chis-sqlserver`)
- **Cache**: Redis (Docker container `chis-redis`)

## Key Ports
- Frontend: `http://localhost:3001` (Vite dev server)
- Backend API: `http://localhost:5107` (ASP.NET Core)
- SQL Server: `localhost:1434` (different from HIS port 1433)
- Redis: `localhost:6380`

## Running
- Frontend: `cd frontend && npm run dev`
- Backend: `cd backend/src/CHIS.API && ASPNETCORE_ENVIRONMENT=Development dotnet run`
- Docker: `docker compose up -d`
- Database: Apply `scripts/create_database.sql` to SQL Server

## Testing (822 total tests)

### Backend Unit Tests (346 tests)
- **Run**: `cd backend && dotnet test`
- **Framework**: xUnit + Moq + FluentAssertions + EF Core InMemory
- **Project**: `backend/tests/CHIS.UnitTests/`
- **Coverage**: 22 service test suites + 19 controller test suites
- Services tested: Auth, Patient, Examination, Pharmacy, Billing, Inpatient, Lab, Radiology, Report, Population, ChronicDisease, CommunicableDisease, Immunization, ReproductiveHealth, Staff, Equipment, DriverLicenseExam, Notification, MasterData, HivAids, HealthEducation, EnvironmentalHealth
- Controllers tested: All 19 API controllers

### Frontend Unit Tests (277 tests)
- **Run**: `cd frontend && npm test`
- **Watch mode**: `cd frontend && npm run test:watch`
- **Framework**: Vitest + React Testing Library + happy-dom
- **Config**: `frontend/vitest.config.ts`
- **Coverage**: 27 test suites (API services + AuthContext)
- API modules tested: auth, patient, examination, pharmacy, billing, inpatient, lab, report, population, chronicDisease, communicableDisease, immunization, reproductiveHealth, staff, equipment, driverLicenseExam, notification, masterData, hivAids, healthEducation, environmentalHealth, foodSafety, injury, deathTracking, nutrition, vitaminA

### Playwright E2E Tests (199 tests)
- **Run**: `cd frontend && npx playwright test`
- **Framework**: Playwright (Chromium)
- **Config**: `frontend/playwright.config.ts`
- **Test data**: `scripts/seed_test_data.sql` (must be loaded into DB first)
- **Test files**:
  - `e2e/login.spec.ts` - Login page (6 tests)
  - `e2e/dashboard.spec.ts` - Dashboard (4 tests)
  - `e2e/navigation.spec.ts` - Sidebar navigation (6 tests)
  - `e2e/reception.spec.ts` - Patient reception (5 tests)
  - `e2e/examination.spec.ts` - Examination module (6 tests)
  - `e2e/pharmacy.spec.ts` - Pharmacy module (20 tests, all 14 tabs)
  - `e2e/billing.spec.ts` - Billing module (5 tests)
  - `e2e/laboratory.spec.ts` - Laboratory module (5 tests)
  - `e2e/modules.spec.ts` - All 22 modules (142 tests: navigation, smoke, tabs, modals)
- **Prerequisites**: Frontend dev server (auto-started) + Backend API + SQL Server with seed data

## Auth
- Login: `POST /api/auth/login` with `{"username":"admin","password":"Admin@123"}`
- JWT stored in `localStorage` keys: `token`, `user`

## 22 Modules (Phân hệ)
| # | Module | Route | Status |
|---|--------|-------|--------|
| I | Quản trị hệ thống | /admin | ✅ |
| II | Danh mục - Cấu hình | /master-data | ✅ |
| III.1 | Tiếp đón | /reception | ✅ |
| III.2 | Khám bệnh | /examination | ✅ |
| III.3 | Nội trú | /inpatient | ✅ |
| III.4 | Viện phí | /billing | ✅ |
| III.5 | Cận lâm sàng | /lab, /radiology | ✅ |
| IV | Bệnh không lây nhiễm | /chronic-disease | ✅ |
| V | Dược phẩm | /pharmacy | ✅ |
| VI | Báo cáo thống kê | /reports | ✅ |
| VII | Quản lý dân số | /population | ✅ |
| VIII | Bệnh truyền nhiễm | /communicable-disease | ✅ |
| IX | CSSKSS | /reproductive-health | ✅ |
| X | Phòng chống HIV/AIDS | /hiv-aids | ✅ |
| XI | Tiêm chủng | /immunization | ✅ |
| XII | Vitamin A | /vitamin-a | ✅ |
| XIII | Phòng chống SDD | /nutrition | ✅ |
| XIV | TNTT | /injury | ✅ |
| XV | Tử vong | /death-tracking | ✅ |
| XVI | Tài sản thiết bị | /equipment | ✅ |
| XVII | Truyền thông GDSK | /health-education | ✅ |
| XVIII | VSMT | /environmental-health | ✅ |
| XIX | ATTP | /food-safety | ✅ |
| XX | Tài chính kế toán | /finance | ✅ |
| XXI | Nhân lực | /staff | ✅ |
| XXII | Liên thông dữ liệu | /data-interop | ✅ |
| - | Khám GPLX | /driver-license | ✅ |

## Backend DI Registration
All services must be registered in `backend/src/CHIS.Infrastructure/DependencyInjection.cs`.

## Database
- DB name: `CHIS`
- SA password: `ChisDocker2024Pass#`
- Collation: Vietnamese_CI_AS
- 75 tables across 22 modules
- Seed data: 30 facilities (29 TYT + 1 PKDK), admin user, 6 roles
- Test data: `scripts/seed_test_data.sql` (10 patients, 15 medicines, 12 services, 5 staff, etc.)
- Load test data: `MSYS_NO_PATHCONV=1 docker exec -i chis-sqlserver /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P 'ChisDocker2024Pass#' -d CHIS -i /dev/stdin < scripts/seed_test_data.sql`
