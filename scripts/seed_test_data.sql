-- ========================================================
-- CHIS Test Data Seed Script
-- Du lieu test mo phong benh nhan, kham benh, thuoc, vien phi
-- ========================================================
USE CHIS;
GO

-- =============================================
-- 1. DEPARTMENTS & ROOMS
-- =============================================
-- Check if departments exist
IF NOT EXISTS (SELECT 1 FROM Departments WHERE Name = N'Khoa Khám bệnh')
BEGIN
    INSERT INTO Departments (Id, Name, Code, FacilityId, IsActive, CreatedAt, IsDeleted)
    VALUES
        ('A0000001-0000-0000-0000-000000000001', N'Khoa Khám bệnh', 'KKB', NULL, 1, GETDATE(), 0),
        ('A0000001-0000-0000-0000-000000000002', N'Khoa Nội', 'KN', NULL, 1, GETDATE(), 0),
        ('A0000001-0000-0000-0000-000000000003', N'Khoa Ngoại', 'KNG', NULL, 1, GETDATE(), 0),
        ('A0000001-0000-0000-0000-000000000004', N'Khoa Sản', 'KS', NULL, 1, GETDATE(), 0),
        ('A0000001-0000-0000-0000-000000000005', N'Khoa Xét nghiệm', 'KXN', NULL, 1, GETDATE(), 0),
        ('A0000001-0000-0000-0000-000000000006', N'Khoa Dược', 'KD', NULL, 1, GETDATE(), 0);
END

-- Rooms
IF NOT EXISTS (SELECT 1 FROM Rooms WHERE Code = 'PK01')
BEGIN
    INSERT INTO Rooms (Id, Name, Code, RoomType, DepartmentId, IsActive, CreatedAt, IsDeleted)
    VALUES
        ('B0000001-0000-0000-0000-000000000001', N'Phòng khám 1', 'PK01', 'Kham', 'A0000001-0000-0000-0000-000000000001', 1, GETDATE(), 0),
        ('B0000001-0000-0000-0000-000000000002', N'Phòng khám 2', 'PK02', 'Kham', 'A0000001-0000-0000-0000-000000000001', 1, GETDATE(), 0),
        ('B0000001-0000-0000-0000-000000000003', N'Phòng xét nghiệm', 'PXN01', 'XetNghiem', 'A0000001-0000-0000-0000-000000000005', 1, GETDATE(), 0),
        ('B0000001-0000-0000-0000-000000000004', N'Phòng nội trú 1', 'PNT01', 'NoiTru', 'A0000001-0000-0000-0000-000000000002', 1, GETDATE(), 0),
        ('B0000001-0000-0000-0000-000000000005', N'Phòng nội trú 2', 'PNT02', 'NoiTru', 'A0000001-0000-0000-0000-000000000003', 1, GETDATE(), 0);
END

-- Beds
IF NOT EXISTS (SELECT 1 FROM Beds WHERE Code = 'G01')
BEGIN
    INSERT INTO Beds (Id, Code, Name, RoomId, DepartmentId, Status, CreatedAt, IsDeleted)
    VALUES
        ('C0000001-0000-0000-0000-000000000001', 'G01', N'Giường 01', 'B0000001-0000-0000-0000-000000000004', 'A0000001-0000-0000-0000-000000000002', 'Available', GETDATE(), 0),
        ('C0000001-0000-0000-0000-000000000002', 'G02', N'Giường 02', 'B0000001-0000-0000-0000-000000000004', 'A0000001-0000-0000-0000-000000000002', 'Available', GETDATE(), 0),
        ('C0000001-0000-0000-0000-000000000003', 'G03', N'Giường 03', 'B0000001-0000-0000-0000-000000000005', 'A0000001-0000-0000-0000-000000000003', 'Available', GETDATE(), 0),
        ('C0000001-0000-0000-0000-000000000004', 'G04', N'Giường 04', 'B0000001-0000-0000-0000-000000000005', 'A0000001-0000-0000-0000-000000000003', 'Available', GETDATE(), 0);
END

-- =============================================
-- 2. PATIENTS (10 benh nhan mau)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Patients WHERE PatientCode = 'BN240301')
BEGIN
    INSERT INTO Patients (Id, PatientCode, FullName, DateOfBirth, Gender, Phone, Address, IdentityNumber, InsuranceNumber, InsuranceExpiry, Ethnicity, Occupation, CreatedAt, IsDeleted)
    VALUES
        ('D0000001-0000-0000-0000-000000000001', 'BN240301', N'Nguyễn Văn An', '1985-03-15', 1, '0901234567', N'Số 10, Thôn Hà Hồi, Xã Hà Hồi, Huyện Thường Tín', '001085012345', 'HS4010012345001', '2026-12-31', N'Kinh', N'Công nhân', GETDATE(), 0),
        ('D0000001-0000-0000-0000-000000000002', 'BN240302', N'Trần Thị Bình', '1990-07-20', 2, '0912345678', N'Số 5, Thôn Ninh Sở, Xã Ninh Sở, Huyện Thường Tín', '001090054321', 'HS4010012345002', '2026-12-31', N'Kinh', N'Giáo viên', GETDATE(), 0),
        ('D0000001-0000-0000-0000-000000000003', 'BN240303', N'Lê Hoàng Cường', '1978-11-08', 1, '0923456789', N'Số 20, Thôn Văn Tự, Xã Văn Tự, Huyện Thường Tín', '001078098765', NULL, NULL, N'Kinh', N'Nông dân', GETDATE(), 0),
        ('D0000001-0000-0000-0000-000000000004', 'BN240304', N'Phạm Thị Dung', '1995-04-12', 2, '0934567890', N'Số 8, Thôn Thư Phú, Xã Thư Phú, Huyện Thường Tín', '001095567890', 'HS4010012345004', '2026-06-30', N'Kinh', N'Nhân viên văn phòng', GETDATE(), 0),
        ('D0000001-0000-0000-0000-000000000005', 'BN240305', N'Hoàng Văn Em', '1960-02-28', 1, '0945678901', N'Số 15, Thôn Khánh Hà, Xã Khánh Hà, Huyện Thường Tín', '001060345678', 'HS4010012345005', '2026-12-31', N'Kinh', N'Hưu trí', GETDATE(), 0),
        ('D0000001-0000-0000-0000-000000000006', 'BN240306', N'Vũ Thị Phượng', '2000-09-05', 2, '0956789012', N'Số 3, Thôn Tô Hiệu, Xã Tô Hiệu, Huyện Thường Tín', '001000234567', NULL, NULL, N'Kinh', N'Sinh viên', GETDATE(), 0),
        ('D0000001-0000-0000-0000-000000000007', 'BN240307', N'Đỗ Minh Quân', '1972-06-18', 1, '0967890123', N'Số 12, TT Thường Tín, Huyện Thường Tín', '001072678901', 'HS4010012345007', '2026-12-31', N'Kinh', N'Buôn bán', GETDATE(), 0),
        ('D0000001-0000-0000-0000-000000000008', 'BN240308', N'Ngô Thị Hương', '1988-12-25', 2, '0978901234', N'Số 7, Thôn Quất Động, Xã Quất Động, Huyện Thường Tín', '001088789012', 'HS4010012345008', '2026-12-31', N'Kinh', N'Thợ may', GETDATE(), 0),
        ('D0000001-0000-0000-0000-000000000009', 'BN240309', N'Bùi Đức Tài', '2015-08-10', 1, '0989012345', N'Số 22, Thôn Dũng Tiến, Xã Dũng Tiến, Huyện Thường Tín', '001015890123', 'HS4010012345009', '2026-12-31', N'Kinh', N'Học sinh', GETDATE(), 0),
        ('D0000001-0000-0000-0000-000000000010', 'BN240310', N'Đinh Thị Lan', '1955-01-03', 2, '0990123456', N'Số 18, Thôn Hiền Giang, Xã Hiền Giang, Huyện Thường Tín', '001055901234', 'HS4010012345010', '2026-12-31', N'Kinh', N'Hưu trí', GETDATE(), 0);
END

-- =============================================
-- 3. MEDICAL RECORDS
-- =============================================
IF NOT EXISTS (SELECT 1 FROM MedicalRecords WHERE RecordNumber = 'BA240001')
BEGIN
    INSERT INTO MedicalRecords (Id, RecordNumber, PatientId, RecordDate, Status, CreatedAt, IsDeleted)
    VALUES
        ('E0000001-0000-0000-0000-000000000001', 'BA240001', 'D0000001-0000-0000-0000-000000000001', GETDATE(), 0, GETDATE(), 0),
        ('E0000001-0000-0000-0000-000000000002', 'BA240002', 'D0000001-0000-0000-0000-000000000002', GETDATE(), 0, GETDATE(), 0),
        ('E0000001-0000-0000-0000-000000000003', 'BA240003', 'D0000001-0000-0000-0000-000000000005', GETDATE(), 0, GETDATE(), 0),
        ('E0000001-0000-0000-0000-000000000004', 'BA240004', 'D0000001-0000-0000-0000-000000000007', GETDATE(), 0, GETDATE(), 0),
        ('E0000001-0000-0000-0000-000000000005', 'BA240005', 'D0000001-0000-0000-0000-000000000010', GETDATE(), 0, GETDATE(), 0);
END

-- =============================================
-- 4. MEDICINES (15 thuoc pho bien)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Medicines WHERE Code = 'T001')
BEGIN
    INSERT INTO Medicines (Id, Code, Name, ActiveIngredient, Dosage, Unit, Packaging, [Route], Manufacturer, Country, BhytCode, BhytPrice, SellPrice, DrugGroup, IsActive, IsApproved, CreatedAt, IsDeleted)
    VALUES
        ('F0000001-0000-0000-0000-000000000001', 'T001', N'Paracetamol 500mg', N'Paracetamol', N'500mg', N'Viên', N'Hộp 10 vỉ x 10 viên', N'Uống', N'Công ty CP Dược Hậu Giang', N'Việt Nam', 'TC01001', 500, 800, N'Giảm đau hạ sốt', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000002', 'T002', N'Amoxicillin 500mg', N'Amoxicillin', N'500mg', N'Viên', N'Hộp 2 vỉ x 10 viên', N'Uống', N'Công ty CP Pymepharco', N'Việt Nam', 'TC01002', 1200, 1500, N'Kháng sinh', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000003', 'T003', N'Omeprazol 20mg', N'Omeprazol', N'20mg', N'Viên', N'Hộp 3 vỉ x 10 viên', N'Uống', N'Công ty CP Traphaco', N'Việt Nam', 'TC01003', 800, 1200, N'Tiêu hóa', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000004', 'T004', N'Amlodipine 5mg', N'Amlodipine', N'5mg', N'Viên', N'Hộp 3 vỉ x 10 viên', N'Uống', N'Servier', N'Pháp', 'TC01004', 2000, 2500, N'Tim mạch', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000005', 'T005', N'Metformin 500mg', N'Metformin', N'500mg', N'Viên', N'Hộp 5 vỉ x 10 viên', N'Uống', N'Merck', N'Đức', 'TC01005', 600, 1000, N'Tiểu đường', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000006', 'T006', N'Losartan 50mg', N'Losartan', N'50mg', N'Viên', N'Hộp 3 vỉ x 10 viên', N'Uống', N'Công ty CP Stada', N'Việt Nam', 'TC01006', 1500, 2000, N'Tim mạch', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000007', 'T007', N'Cetirizine 10mg', N'Cetirizine', N'10mg', N'Viên', N'Hộp 1 vỉ x 10 viên', N'Uống', N'UCB', N'Bỉ', 'TC01007', 1000, 1500, N'Dị ứng', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000008', 'T008', N'Vitamin C 500mg', N'Acid Ascorbic', N'500mg', N'Viên', N'Lọ 100 viên', N'Uống', N'Công ty CP OPC', N'Việt Nam', 'TC01008', 200, 500, N'Vitamin', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000009', 'T009', N'Ibuprofen 400mg', N'Ibuprofen', N'400mg', N'Viên', N'Hộp 2 vỉ x 10 viên', N'Uống', N'Abbott', N'Mỹ', 'TC01009', 800, 1200, N'Giảm đau hạ sốt', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000010', 'T010', N'Dexamethasone 0.5mg', N'Dexamethasone', N'0.5mg', N'Viên', N'Hộp 2 vỉ x 10 viên', N'Uống', N'Công ty CP Domesco', N'Việt Nam', 'TC01010', 300, 500, N'Corticoid', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000011', 'T011', N'Ciprofloxacin 500mg', N'Ciprofloxacin', N'500mg', N'Viên', N'Hộp 1 vỉ x 10 viên', N'Uống', N'Bayer', N'Đức', 'TC01011', 2500, 3000, N'Kháng sinh', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000012', 'T012', N'Salbutamol 2mg', N'Salbutamol', N'2mg', N'Viên', N'Hộp 2 vỉ x 10 viên', N'Uống', N'GSK', N'Anh', 'TC01012', 400, 700, N'Hô hấp', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000013', 'T013', N'Natri Clorid 0.9%', N'NaCl', N'0.9%', N'Chai', N'Chai 500ml', N'Tiêm truyền', N'Công ty CP Dược Bình Định', N'Việt Nam', 'TC01013', 15000, 18000, N'Dịch truyền', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000014', 'T014', N'Cefuroxime 250mg', N'Cefuroxime', N'250mg', N'Viên', N'Hộp 1 vỉ x 10 viên', N'Uống', N'Zinnat', N'Anh', 'TC01014', 5000, 6000, N'Kháng sinh', 1, 1, GETDATE(), 0),
        ('F0000001-0000-0000-0000-000000000015', 'T015', N'Diclofenac 50mg', N'Diclofenac', N'50mg', N'Viên', N'Hộp 3 vỉ x 10 viên', N'Uống', N'Novartis', N'Thụy Sỹ', 'TC01015', 600, 900, N'Giảm đau chống viêm', 1, 1, GETDATE(), 0);
END

-- =============================================
-- 5. WAREHOUSE & STOCK
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Warehouses WHERE Code = 'KHO-CHINH')
BEGIN
    INSERT INTO Warehouses (Id, Code, Name, WarehouseType, IsActive, CreatedAt, IsDeleted)
    VALUES
        ('AA000001-0000-0000-0000-000000000001', 'KHO-CHINH', N'Kho thuốc chính', 'KhoThuoc', 1, GETDATE(), 0),
        ('AA000001-0000-0000-0000-000000000002', 'KHO-VTYT', N'Kho vật tư y tế', 'KhoVTYT', 1, GETDATE(), 0);
END

-- Stock balances
IF NOT EXISTS (SELECT 1 FROM StockBalances WHERE WarehouseId = 'AA000001-0000-0000-0000-000000000001' AND MedicineId = 'F0000001-0000-0000-0000-000000000001')
BEGIN
    INSERT INTO StockBalances (Id, WarehouseId, MedicineId, Quantity, BatchNumber, ExpiryDate, CreatedAt, IsDeleted)
    VALUES
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000001', 5000, 'LOT-PAR-2024', '2026-06-30', GETDATE(), 0),
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000002', 2000, 'LOT-AMO-2024', '2026-09-30', GETDATE(), 0),
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000003', 3000, 'LOT-OME-2024', '2027-01-31', GETDATE(), 0),
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000004', 1500, 'LOT-AML-2024', '2027-03-31', GETDATE(), 0),
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000005', 4000, 'LOT-MET-2024', '2026-12-31', GETDATE(), 0),
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000006', 2000, 'LOT-LOS-2024', '2027-06-30', GETDATE(), 0),
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000007', 1000, 'LOT-CET-2024', '2027-02-28', GETDATE(), 0),
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000008', 10000, 'LOT-VIT-2024', '2027-12-31', GETDATE(), 0),
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000013', 200, 'LOT-NAC-2024', '2026-08-31', GETDATE(), 0),
        (NEWID(), 'AA000001-0000-0000-0000-000000000001', 'F0000001-0000-0000-0000-000000000014', 800, 'LOT-CEF-2024', '2027-04-30', GETDATE(), 0);
END

-- =============================================
-- 6. SERVICES (Lab + Imaging)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Services WHERE Code = 'XN001')
BEGIN
    INSERT INTO Services (Id, Code, Name, ServiceType, ServiceGroup, BhytPrice, FeePrice, IsActive, SortOrder, CreatedAt, IsDeleted)
    VALUES
        ('BB000001-0000-0000-0000-000000000001', 'XN001', N'Công thức máu toàn phần (CBC)', 'XetNghiem', N'Huyết học', 50000, 80000, 1, 1, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000002', 'XN002', N'Sinh hóa máu 10 chỉ số', 'XetNghiem', N'Sinh hóa', 120000, 180000, 1, 2, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000003', 'XN003', N'Tổng phân tích nước tiểu', 'XetNghiem', N'Nước tiểu', 30000, 50000, 1, 3, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000004', 'XN004', N'Đường huyết (Glucose)', 'XetNghiem', N'Sinh hóa', 25000, 40000, 1, 4, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000005', 'XN005', N'HbA1c', 'XetNghiem', N'Sinh hóa', 80000, 120000, 1, 5, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000006', 'XN006', N'Lipid máu (Cholesterol, Triglyceride)', 'XetNghiem', N'Sinh hóa', 60000, 100000, 1, 6, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000007', 'XN007', N'Chức năng gan (AST, ALT)', 'XetNghiem', N'Sinh hóa', 40000, 70000, 1, 7, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000008', 'XN008', N'Chức năng thận (Ure, Creatinin)', 'XetNghiem', N'Sinh hóa', 40000, 70000, 1, 8, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000009', 'CDHA001', N'X-Quang ngực thẳng', 'CDHA', N'X-Quang', 80000, 120000, 1, 1, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000010', 'CDHA002', N'Siêu âm ổ bụng', 'CDHA', N'Siêu âm', 150000, 200000, 1, 2, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000011', 'CDHA003', N'Điện tim (ECG)', 'CDHA', N'Thăm dò chức năng', 50000, 80000, 1, 3, GETDATE(), 0),
        ('BB000001-0000-0000-0000-000000000012', 'CDHA004', N'Siêu âm thai', 'CDHA', N'Siêu âm', 100000, 150000, 1, 4, GETDATE(), 0);
END

-- =============================================
-- 7. STAFF
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Staffs WHERE StaffCode = 'BS001')
BEGIN
    INSERT INTO Staffs (Id, StaffCode, FullName, DateOfBirth, Gender, Position, Qualification, Specialty, Phone, Email, DepartmentId, IsActive, CreatedAt, IsDeleted)
    VALUES
        ('CC000001-0000-0000-0000-000000000001', 'BS001', N'BS. Nguyễn Thanh Tùng', '1980-05-20', 1, 'BacSi', N'Bác sĩ CKI', N'Nội tổng quát', '0901000001', 'tung.bs@chis.vn', 'A0000001-0000-0000-0000-000000000001', 1, GETDATE(), 0),
        ('CC000001-0000-0000-0000-000000000002', 'BS002', N'BS. Trần Thị Mai', '1985-08-12', 2, 'BacSi', N'Bác sĩ CKII', N'Sản phụ khoa', '0901000002', 'mai.bs@chis.vn', 'A0000001-0000-0000-0000-000000000004', 1, GETDATE(), 0),
        ('CC000001-0000-0000-0000-000000000003', 'DD001', N'ĐD. Lê Thu Hà', '1992-03-15', 2, 'DieuDuong', N'Cử nhân điều dưỡng', N'Điều dưỡng', '0901000003', 'ha.dd@chis.vn', 'A0000001-0000-0000-0000-000000000002', 1, GETDATE(), 0),
        ('CC000001-0000-0000-0000-000000000004', 'DS001', N'DS. Phạm Văn Đức', '1988-11-25', 1, 'DuocSi', N'Dược sĩ đại học', N'Dược lâm sàng', '0901000004', 'duc.ds@chis.vn', 'A0000001-0000-0000-0000-000000000006', 1, GETDATE(), 0),
        ('CC000001-0000-0000-0000-000000000005', 'KTV001', N'KTV. Hoàng Minh', '1990-07-08', 1, 'KyThuatVien', N'Cử nhân xét nghiệm', N'Xét nghiệm', '0901000005', 'minh.ktv@chis.vn', 'A0000001-0000-0000-0000-000000000005', 1, GETDATE(), 0);
END

-- =============================================
-- 8. HOUSEHOLDS (Dan so)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Households WHERE HouseholdCode = 'HGD001')
BEGIN
    INSERT INTO Households (Id, HouseholdCode, HeadOfHousehold, Address, Village, WardCode, Phone, CreatedAt, IsDeleted)
    VALUES
        ('DD000001-0000-0000-0000-000000000001', 'HGD001', N'Nguyễn Văn An', N'Số 10, Thôn Hà Hồi', N'Hà Hồi', 'X001', '0901234567', GETDATE(), 0),
        ('DD000001-0000-0000-0000-000000000002', 'HGD002', N'Trần Văn Bình', N'Số 5, Thôn Ninh Sở', N'Ninh Sở', 'X002', '0912345678', GETDATE(), 0),
        ('DD000001-0000-0000-0000-000000000003', 'HGD003', N'Lê Hoàng Cường', N'Số 20, Thôn Văn Tự', N'Văn Tự', 'X003', '0923456789', GETDATE(), 0);
END

-- =============================================
-- 9. VACCINES (Tiem chung)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Vaccines WHERE Code = 'BCG')
BEGIN
    INSERT INTO Vaccines (Id, Code, Name, Manufacturer, IsActive, CreatedAt, IsDeleted)
    VALUES
        ('EE000001-0000-0000-0000-000000000001', 'BCG', N'BCG - Phòng lao', N'VABIOTECH', 1, GETDATE(), 0),
        ('EE000001-0000-0000-0000-000000000002', 'DPT-VGB-Hib', N'ComBE Five - 5 trong 1', N'Biological E', 1, GETDATE(), 0),
        ('EE000001-0000-0000-0000-000000000003', 'OPV', N'Vắc xin bại liệt uống', N'VABIOTECH', 1, GETDATE(), 0),
        ('EE000001-0000-0000-0000-000000000004', 'IPV', N'Vắc xin bại liệt tiêm', N'Sanofi', 1, GETDATE(), 0),
        ('EE000001-0000-0000-0000-000000000005', 'MR', N'Sởi - Rubella', N'POLYVAC', 1, GETDATE(), 0),
        ('EE000001-0000-0000-0000-000000000006', 'JE', N'Viêm não Nhật Bản', N'VABIOTECH', 1, GETDATE(), 0);
END

-- =============================================
-- 10. ICD CODES (Ma benh)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM IcdCodes WHERE Code = 'J06')
BEGIN
    INSERT INTO IcdCodes (Id, Code, Name, [Group], Chapter, CreatedAt, IsDeleted)
    VALUES
        (NEWID(), 'J06', N'Nhiễm trùng đường hô hấp trên cấp, nhiều vị trí', N'J00-J06', N'X', GETDATE(), 0),
        (NEWID(), 'J18', N'Viêm phổi, không xác định tác nhân', N'J12-J18', N'X', GETDATE(), 0),
        (NEWID(), 'I10', N'Tăng huyết áp vô căn (nguyên phát)', N'I10-I15', N'IX', GETDATE(), 0),
        (NEWID(), 'E11', N'Đái tháo đường type 2', N'E10-E14', N'IV', GETDATE(), 0),
        (NEWID(), 'K29', N'Viêm dạ dày và viêm tá tràng', N'K20-K31', N'XI', GETDATE(), 0),
        (NEWID(), 'M54', N'Đau lưng', N'M50-M54', N'XIII', GETDATE(), 0),
        (NEWID(), 'A09', N'Tiêu chảy và viêm dạ dày-ruột nhiễm trùng', N'A00-A09', N'I', GETDATE(), 0),
        (NEWID(), 'N39', N'Nhiễm trùng đường tiết niệu', N'N30-N39', N'XIV', GETDATE(), 0),
        (NEWID(), 'L30', N'Viêm da, không xác định', N'L20-L30', N'XII', GETDATE(), 0),
        (NEWID(), 'R50', N'Sốt không rõ nguyên nhân', N'R50-R69', N'XVIII', GETDATE(), 0);
END

-- =============================================
-- 11. EQUIPMENT (Tai san thiet bi)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM Equipments WHERE Code = 'TB001')
BEGIN
    INSERT INTO Equipments (Id, Code, Name, Model, SerialNumber, DepartmentId, PurchaseDate, PurchasePrice, CurrentValue, Status, AssetType, CreatedAt, IsDeleted)
    VALUES
        (NEWID(), 'TB001', N'Máy siêu âm', 'Mindray DC-30', 'SA2024001', 'A0000001-0000-0000-0000-000000000001', '2023-06-15', 350000000, 300000000, 'Active', N'Y tế', GETDATE(), 0),
        (NEWID(), 'TB002', N'Máy X-Quang', 'Shimadzu RADspeed Pro', 'XQ2024001', 'A0000001-0000-0000-0000-000000000001', '2022-01-10', 800000000, 650000000, 'Active', N'Y tế', GETDATE(), 0),
        (NEWID(), 'TB003', N'Máy xét nghiệm huyết học', 'Sysmex XN-330', 'HH2024001', 'A0000001-0000-0000-0000-000000000005', '2023-03-20', 500000000, 420000000, 'Active', N'Y tế', GETDATE(), 0),
        (NEWID(), 'TB004', N'Máy điện tim', 'Nihon Kohden ECG-2150', 'ECG2024001', 'A0000001-0000-0000-0000-000000000001', '2023-08-05', 80000000, 70000000, 'Active', N'Y tế', GETDATE(), 0);
END

-- =============================================
-- 12. FOOD BUSINESSES (ATTP)
-- =============================================
IF NOT EXISTS (SELECT 1 FROM FoodBusinesses WHERE BusinessName = N'Quán cơm Hương Vị')
BEGIN
    INSERT INTO FoodBusinesses (Id, BusinessName, Address, OwnerName, Phone, BusinessType, LicenseNumber, LicenseExpiry, Status, CreatedAt, IsDeleted)
    VALUES
        (NEWID(), N'Quán cơm Hương Vị', N'Số 15, TT Thường Tín', N'Nguyễn Thị Hoa', '0901555001', N'Quán ăn', 'ATTP-2024-001', '2026-12-31', 'Active', GETDATE(), 0),
        (NEWID(), N'Cửa hàng thực phẩm Tâm An', N'Số 8, Xã Ninh Sở', N'Trần Văn Tâm', '0901555002', N'Cửa hàng', 'ATTP-2024-002', '2025-06-30', 'Active', GETDATE(), 0),
        (NEWID(), N'Bếp ăn tập thể Công ty May', N'KCN Thường Tín', N'Lê Thị Lan', '0901555003', N'Bếp ăn tập thể', 'ATTP-2024-003', '2026-03-31', 'Active', GETDATE(), 0);
END

PRINT N'=== CHIS Test Data Seeded Successfully ===';
PRINT N'- 6 Departments, 5 Rooms, 4 Beds';
PRINT N'- 10 Patients, 5 Medical Records';
PRINT N'- 15 Medicines with stock';
PRINT N'- 12 Services (8 Lab + 4 Imaging)';
PRINT N'- 5 Staff members';
PRINT N'- 3 Households';
PRINT N'- 6 Vaccines';
PRINT N'- 10 ICD Codes';
PRINT N'- 4 Equipment';
PRINT N'- 3 Food Businesses';
GO
