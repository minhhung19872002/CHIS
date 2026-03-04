-- Create CHIS Database for Community Health Information System
-- Target: Trung tâm Y tế huyện Thường Tín (29 TYT + 1 PKĐK)

USE master;
GO

IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = N'CHIS')
BEGIN
    CREATE DATABASE [CHIS]
    COLLATE Vietnamese_CI_AS;
END
GO

USE [CHIS];
GO

-- =============================================
-- I. SYSTEM & ADMIN TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Users')
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(100) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(500) NOT NULL,
    FullName NVARCHAR(200) NOT NULL,
    Email NVARCHAR(200),
    Phone NVARCHAR(20),
    EmployeeCode NVARCHAR(50),
    DepartmentId UNIQUEIDENTIFIER,
    Position NVARCHAR(100),
    IsActive BIT DEFAULT 1,
    IsTwoFactorEnabled BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Roles')
CREATE TABLE Roles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL UNIQUE,
    Description NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'UserRoles')
CREATE TABLE UserRoles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    RoleId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Permissions')
CREATE TABLE Permissions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(100) NOT NULL UNIQUE,
    Name NVARCHAR(200) NOT NULL,
    Module NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RolePermissions')
CREATE TABLE RolePermissions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RoleId UNIQUEIDENTIFIER NOT NULL,
    PermissionId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    FOREIGN KEY (PermissionId) REFERENCES Permissions(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TwoFactorOtps')
CREATE TABLE TwoFactorOtps (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    OtpHash NVARCHAR(500) NOT NULL,
    ExpiresAt DATETIME2 NOT NULL,
    Attempts INT DEFAULT 0,
    IsUsed BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemConfigs')
CREATE TABLE SystemConfigs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    [Key] NVARCHAR(200) NOT NULL,
    Value NVARCHAR(MAX),
    Description NVARCHAR(500),
    Module NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditLogs')
CREATE TABLE AuditLogs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER,
    Username NVARCHAR(100),
    UserFullName NVARCHAR(200),
    Action NVARCHAR(100),
    EntityType NVARCHAR(200),
    EntityId NVARCHAR(100),
    Details NVARCHAR(MAX),
    Module NVARCHAR(100),
    RequestPath NVARCHAR(500),
    RequestMethod NVARCHAR(10),
    ResponseStatusCode INT,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);
CREATE INDEX IX_AuditLogs_CreatedAt ON AuditLogs(CreatedAt DESC);
CREATE INDEX IX_AuditLogs_UserId ON AuditLogs(UserId, CreatedAt DESC);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Notifications')
CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(500) NOT NULL,
    Content NVARCHAR(MAX),
    Type NVARCHAR(50),
    Module NVARCHAR(50),
    ActionUrl NVARCHAR(500),
    IsRead BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (UserId) REFERENCES Users(Id)
);

-- =============================================
-- II. FACILITY & DEPARTMENT TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Facilities')
CREATE TABLE Facilities (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(300) NOT NULL,
    Address NVARCHAR(500),
    Phone NVARCHAR(20),
    FacilityType NVARCHAR(10), -- TYT, PKD, TTYT
    MaBHXH NVARCHAR(20),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Departments')
CREATE TABLE Departments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(300) NOT NULL,
    DepartmentType NVARCHAR(50),
    FacilityId UNIQUEIDENTIFIER,
    IsActive BIT DEFAULT 1,
    SortOrder INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (FacilityId) REFERENCES Facilities(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Rooms')
CREATE TABLE Rooms (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    DepartmentId UNIQUEIDENTIFIER NOT NULL,
    RoomType NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    SortOrder INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Beds')
CREATE TABLE Beds (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    RoomId UNIQUEIDENTIFIER NOT NULL,
    DepartmentId UNIQUEIDENTIFIER NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Available',
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (RoomId) REFERENCES Rooms(Id),
    FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
);

-- =============================================
-- III. PATIENT & MEDICAL RECORD TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Patients')
CREATE TABLE Patients (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientCode NVARCHAR(50) NOT NULL,
    FullName NVARCHAR(200) NOT NULL,
    DateOfBirth DATETIME2,
    Gender INT,
    IdentityNumber NVARCHAR(20),
    Phone NVARCHAR(20),
    Address NVARCHAR(500),
    WardCode NVARCHAR(10),
    DistrictCode NVARCHAR(10),
    ProvinceCode NVARCHAR(10),
    Ethnicity NVARCHAR(50),
    Occupation NVARCHAR(100),
    InsuranceNumber NVARCHAR(20),
    InsuranceExpiry DATETIME2,
    InsuranceFacilityCode NVARCHAR(20),
    PatientType INT DEFAULT 1,
    Nationality NVARCHAR(50),
    Email NVARCHAR(200),
    HouseholdId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);
CREATE INDEX IX_Patients_PatientCode ON Patients(PatientCode);
CREATE INDEX IX_Patients_FullName ON Patients(FullName);
CREATE INDEX IX_Patients_InsuranceNumber ON Patients(InsuranceNumber);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MedicalRecords')
CREATE TABLE MedicalRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RecordNumber NVARCHAR(50) NOT NULL,
    PatientId UNIQUEIDENTIFIER NOT NULL,
    RecordDate DATETIME2 NOT NULL,
    DepartmentId UNIQUEIDENTIFIER,
    FacilityId UNIQUEIDENTIFIER,
    RecordType NVARCHAR(20),
    Status INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'IcdCodes')
CREATE TABLE IcdCodes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(20) NOT NULL,
    Name NVARCHAR(500) NOT NULL,
    NameEnglish NVARCHAR(500),
    Chapter NVARCHAR(50),
    [Group] NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

-- =============================================
-- EXAMINATION / OPD TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Examinations')
CREATE TABLE Examinations (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    MedicalRecordId UNIQUEIDENTIFIER NOT NULL,
    RoomId UNIQUEIDENTIFIER,
    DoctorId UNIQUEIDENTIFIER,
    ExamDate DATETIME2 NOT NULL,
    ChiefComplaint NVARCHAR(MAX),
    PresentIllness NVARCHAR(MAX),
    PastHistory NVARCHAR(MAX),
    FamilyHistory NVARCHAR(MAX),
    PhysicalExam NVARCHAR(MAX),
    GeneralExam NVARCHAR(MAX),
    CardiovascularExam NVARCHAR(MAX),
    RespiratoryExam NVARCHAR(MAX),
    GIExam NVARCHAR(MAX),
    NeurologicalExam NVARCHAR(MAX),
    MainDiagnosis NVARCHAR(500),
    MainIcdCode NVARCHAR(20),
    SecondaryDiagnoses NVARCHAR(MAX),
    TreatmentPlan NVARCHAR(MAX),
    Conclusion NVARCHAR(MAX),
    Status INT DEFAULT 0,
    Temperature DECIMAL(5,2),
    SystolicBP INT,
    DiastolicBP INT,
    HeartRate INT,
    RespiratoryRate INT,
    Weight DECIMAL(5,2),
    Height DECIMAL(5,2),
    SpO2 DECIMAL(5,2),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id),
    FOREIGN KEY (MedicalRecordId) REFERENCES MedicalRecords(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'QueueTickets')
CREATE TABLE QueueTickets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    ExaminationId UNIQUEIDENTIFIER,
    RoomId UNIQUEIDENTIFIER NOT NULL,
    TicketCode NVARCHAR(20) NOT NULL,
    QueueNumber INT NOT NULL,
    QueueType INT DEFAULT 1,
    Status INT DEFAULT 0,
    CalledAt DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id),
    FOREIGN KEY (RoomId) REFERENCES Rooms(Id)
);

-- =============================================
-- PRESCRIPTION TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Medicines')
CREATE TABLE Medicines (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(500) NOT NULL,
    ActiveIngredient NVARCHAR(500),
    Dosage NVARCHAR(200),
    Unit NVARCHAR(50),
    Packaging NVARCHAR(200),
    Route NVARCHAR(50),
    Manufacturer NVARCHAR(300),
    Country NVARCHAR(100),
    BhytCode NVARCHAR(50),
    BhytPrice DECIMAL(18,2),
    SellPrice DECIMAL(18,2),
    DrugGroup NVARCHAR(200),
    IsApproved BIT DEFAULT 1,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MedicalSupplies')
CREATE TABLE MedicalSupplies (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(500) NOT NULL,
    Unit NVARCHAR(50),
    Specification NVARCHAR(300),
    SupplyGroup NVARCHAR(200),
    BhytCode NVARCHAR(50),
    BhytPrice DECIMAL(18,2),
    SellPrice DECIMAL(18,2),
    IsApproved BIT DEFAULT 1,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Prescriptions')
CREATE TABLE Prescriptions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ExaminationId UNIQUEIDENTIFIER NOT NULL,
    PatientId UNIQUEIDENTIFIER NOT NULL,
    DoctorId UNIQUEIDENTIFIER,
    PrescriptionDate DATETIME2 NOT NULL,
    Diagnosis NVARCHAR(500),
    Notes NVARCHAR(MAX),
    Status INT DEFAULT 0,
    IsDispensed BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (ExaminationId) REFERENCES Examinations(Id),
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PrescriptionItems')
CREATE TABLE PrescriptionItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PrescriptionId UNIQUEIDENTIFIER NOT NULL,
    MedicineId UNIQUEIDENTIFIER NOT NULL,
    Quantity DECIMAL(18,2) NOT NULL,
    Dosage NVARCHAR(200),
    Usage NVARCHAR(500),
    DaysSupply INT,
    MorningDose NVARCHAR(50),
    NoonDose NVARCHAR(50),
    AfternoonDose NVARCHAR(50),
    EveningDose NVARCHAR(50),
    UnitPrice DECIMAL(18,2),
    TotalAmount DECIMAL(18,2),
    Notes NVARCHAR(500),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PrescriptionId) REFERENCES Prescriptions(Id),
    FOREIGN KEY (MedicineId) REFERENCES Medicines(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PrescriptionTemplates')
CREATE TABLE PrescriptionTemplates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    Diagnosis NVARCHAR(500),
    DoctorId UNIQUEIDENTIFIER,
    ItemsJson NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

-- =============================================
-- SERVICE REQUEST (LAB, RADIOLOGY) TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Services')
CREATE TABLE Services (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(500) NOT NULL,
    ServiceType NVARCHAR(50),
    ServiceGroup NVARCHAR(200),
    BhytPrice DECIMAL(18,2),
    FeePrice DECIMAL(18,2),
    DepartmentId UNIQUEIDENTIFIER,
    IsApproved BIT DEFAULT 1,
    IsActive BIT DEFAULT 1,
    SortOrder INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceRequests')
CREATE TABLE ServiceRequests (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ExaminationId UNIQUEIDENTIFIER NOT NULL,
    PatientId UNIQUEIDENTIFIER NOT NULL,
    ServiceId UNIQUEIDENTIFIER,
    ServiceName NVARCHAR(500),
    ServiceType NVARCHAR(50),
    RequestDoctorId UNIQUEIDENTIFIER,
    Status INT DEFAULT 0,
    UnitPrice DECIMAL(18,2),
    TotalAmount DECIMAL(18,2),
    Result NVARCHAR(MAX),
    ResultDescription NVARCHAR(MAX),
    ResultDate DATETIME2,
    ResultDoctorId UNIQUEIDENTIFIER,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (ExaminationId) REFERENCES Examinations(Id),
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServiceRequestDetails')
CREATE TABLE ServiceRequestDetails (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ServiceRequestId UNIQUEIDENTIFIER NOT NULL,
    TestName NVARCHAR(300),
    Result NVARCHAR(500),
    Unit NVARCHAR(50),
    ReferenceRange NVARCHAR(200),
    AbnormalFlag NVARCHAR(10),
    Status INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (ServiceRequestId) REFERENCES ServiceRequests(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LabReferenceValues')
CREATE TABLE LabReferenceValues (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ServiceId UNIQUEIDENTIFIER,
    TestName NVARCHAR(300),
    Unit NVARCHAR(50),
    NormalRange NVARCHAR(200),
    Gender NVARCHAR(10),
    AgeGroup NVARCHAR(50),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ImagingTemplates')
CREATE TABLE ImagingTemplates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    ServiceType NVARCHAR(50),
    TemplateContent NVARCHAR(MAX),
    DoctorId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ExamDictionaries')
CREATE TABLE ExamDictionaries (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(200) NOT NULL,
    Category NVARCHAR(100),
    Content NVARCHAR(MAX),
    DoctorId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

-- =============================================
-- INPATIENT TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Admissions')
CREATE TABLE Admissions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    MedicalRecordId UNIQUEIDENTIFIER NOT NULL,
    DepartmentId UNIQUEIDENTIFIER NOT NULL,
    BedId UNIQUEIDENTIFIER,
    AdmittingDoctorId UNIQUEIDENTIFIER,
    AdmissionDate DATETIME2 NOT NULL,
    AdmissionDiagnosis NVARCHAR(500),
    AdmissionReason NVARCHAR(MAX),
    AdmissionType NVARCHAR(20),
    Status INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id),
    FOREIGN KEY (MedicalRecordId) REFERENCES MedicalRecords(Id),
    FOREIGN KEY (DepartmentId) REFERENCES Departments(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Discharges')
CREATE TABLE Discharges (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AdmissionId UNIQUEIDENTIFIER NOT NULL,
    PatientId UNIQUEIDENTIFIER NOT NULL,
    DischargeDate DATETIME2 NOT NULL,
    DischargeDiagnosis NVARCHAR(500),
    DischargeCondition NVARCHAR(500),
    DischargeType NVARCHAR(20),
    FollowUpPlan NVARCHAR(MAX),
    DischargedBy UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (AdmissionId) REFERENCES Admissions(Id),
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'TreatmentSheets')
CREATE TABLE TreatmentSheets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AdmissionId UNIQUEIDENTIFIER NOT NULL,
    PatientId UNIQUEIDENTIFIER NOT NULL,
    TreatmentDate DATETIME2 NOT NULL,
    DayNumber INT,
    Progress NVARCHAR(MAX),
    Orders NVARCHAR(MAX),
    Notes NVARCHAR(MAX),
    DoctorId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (AdmissionId) REFERENCES Admissions(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NursingCareSheets')
CREATE TABLE NursingCareSheets (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AdmissionId UNIQUEIDENTIFIER NOT NULL,
    PatientId UNIQUEIDENTIFIER NOT NULL,
    CareDate DATETIME2 NOT NULL,
    Shift NVARCHAR(20),
    PatientCondition NVARCHAR(MAX),
    NursingAssessment NVARCHAR(MAX),
    Interventions NVARCHAR(MAX),
    Response NVARCHAR(MAX),
    NurseId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (AdmissionId) REFERENCES Admissions(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InfusionRecords')
CREATE TABLE InfusionRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    AdmissionId UNIQUEIDENTIFIER NOT NULL,
    PatientId UNIQUEIDENTIFIER NOT NULL,
    StartTime DATETIME2 NOT NULL,
    EndTime DATETIME2,
    SolutionName NVARCHAR(300),
    Volume DECIMAL(10,2),
    FlowRate DECIMAL(10,2),
    Notes NVARCHAR(MAX),
    Status INT DEFAULT 0,
    NurseId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (AdmissionId) REFERENCES Admissions(Id)
);

-- =============================================
-- BILLING TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReceiptBooks')
CREATE TABLE ReceiptBooks (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    BookCode NVARCHAR(50) NOT NULL,
    BookName NVARCHAR(200),
    SeriesPrefix NVARCHAR(20),
    FromNumber INT NOT NULL,
    ToNumber INT NOT NULL,
    CurrentNumber INT DEFAULT 0,
    IsActive BIT DEFAULT 1,
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Receipts')
CREATE TABLE Receipts (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReceiptNumber NVARCHAR(50) NOT NULL,
    PatientId UNIQUEIDENTIFIER NOT NULL,
    MedicalRecordId UNIQUEIDENTIFIER NOT NULL,
    ReceiptDate DATETIME2 NOT NULL,
    TotalAmount DECIMAL(18,2),
    BhytAmount DECIMAL(18,2),
    PatientAmount DECIMAL(18,2),
    DiscountAmount DECIMAL(18,2),
    PaymentMethod NVARCHAR(50),
    Status INT DEFAULT 0,
    ReceiptType NVARCHAR(20),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id),
    FOREIGN KEY (MedicalRecordId) REFERENCES MedicalRecords(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ReceiptDetails')
CREATE TABLE ReceiptDetails (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReceiptId UNIQUEIDENTIFIER NOT NULL,
    ItemType NVARCHAR(20),
    ItemName NVARCHAR(500),
    Quantity DECIMAL(18,2),
    UnitPrice DECIMAL(18,2),
    TotalAmount DECIMAL(18,2),
    BhytPercent DECIMAL(5,2),
    BhytAmount DECIMAL(18,2),
    PatientAmount DECIMAL(18,2),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (ReceiptId) REFERENCES Receipts(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ElectronicInvoices')
CREATE TABLE ElectronicInvoices (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    InvoiceNumber NVARCHAR(50) NOT NULL,
    ReceiptId UNIQUEIDENTIFIER NOT NULL,
    InvoiceTemplate NVARCHAR(50),
    InvoiceSeries NVARCHAR(20),
    Provider NVARCHAR(50),
    Status INT DEFAULT 0,
    IssuedDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (ReceiptId) REFERENCES Receipts(Id)
);

-- =============================================
-- PHARMACY / WAREHOUSE TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Suppliers')
CREATE TABLE Suppliers (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(300) NOT NULL,
    Address NVARCHAR(500),
    Phone NVARCHAR(20),
    TaxCode NVARCHAR(20),
    ContactPerson NVARCHAR(200),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Warehouses')
CREATE TABLE Warehouses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    WarehouseType NVARCHAR(20),
    FacilityId UNIQUEIDENTIFIER,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockReceipts')
CREATE TABLE StockReceipts (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ReceiptCode NVARCHAR(50) NOT NULL,
    WarehouseId UNIQUEIDENTIFIER NOT NULL,
    SupplierId UNIQUEIDENTIFIER,
    ReceiptDate DATETIME2 NOT NULL,
    ReceiptType NVARCHAR(20),
    TotalAmount DECIMAL(18,2),
    Status INT DEFAULT 0,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockReceiptItems')
CREATE TABLE StockReceiptItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StockReceiptId UNIQUEIDENTIFIER NOT NULL,
    MedicineId UNIQUEIDENTIFIER NOT NULL,
    Quantity DECIMAL(18,2),
    UnitPrice DECIMAL(18,2),
    TotalAmount DECIMAL(18,2),
    BatchNumber NVARCHAR(50),
    ExpiryDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (StockReceiptId) REFERENCES StockReceipts(Id),
    FOREIGN KEY (MedicineId) REFERENCES Medicines(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockIssues')
CREATE TABLE StockIssues (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    IssueCode NVARCHAR(50) NOT NULL,
    WarehouseId UNIQUEIDENTIFIER NOT NULL,
    IssueDate DATETIME2 NOT NULL,
    IssueType NVARCHAR(20),
    TargetWarehouseId UNIQUEIDENTIFIER,
    TotalAmount DECIMAL(18,2),
    Status INT DEFAULT 0,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockIssueItems')
CREATE TABLE StockIssueItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StockIssueId UNIQUEIDENTIFIER NOT NULL,
    MedicineId UNIQUEIDENTIFIER NOT NULL,
    Quantity DECIMAL(18,2),
    UnitPrice DECIMAL(18,2),
    TotalAmount DECIMAL(18,2),
    BatchNumber NVARCHAR(50),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (StockIssueId) REFERENCES StockIssues(Id),
    FOREIGN KEY (MedicineId) REFERENCES Medicines(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockBalances')
CREATE TABLE StockBalances (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    WarehouseId UNIQUEIDENTIFIER NOT NULL,
    MedicineId UNIQUEIDENTIFIER NOT NULL,
    Quantity DECIMAL(18,2),
    BatchNumber NVARCHAR(50),
    ExpiryDate DATETIME2,
    UnitPrice DECIMAL(18,2),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id),
    FOREIGN KEY (MedicineId) REFERENCES Medicines(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockTakes')
CREATE TABLE StockTakes (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StockTakeCode NVARCHAR(50) NOT NULL,
    WarehouseId UNIQUEIDENTIFIER NOT NULL,
    StockTakeDate DATETIME2 NOT NULL,
    Status INT DEFAULT 0,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'StockTakeItems')
CREATE TABLE StockTakeItems (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StockTakeId UNIQUEIDENTIFIER NOT NULL,
    MedicineId UNIQUEIDENTIFIER NOT NULL,
    SystemQuantity DECIMAL(18,2),
    ActualQuantity DECIMAL(18,2),
    Difference DECIMAL(18,2),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (StockTakeId) REFERENCES StockTakes(Id),
    FOREIGN KEY (MedicineId) REFERENCES Medicines(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ProcurementRequests')
CREATE TABLE ProcurementRequests (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RequestCode NVARCHAR(50) NOT NULL,
    WarehouseId UNIQUEIDENTIFIER NOT NULL,
    RequestDate DATETIME2 NOT NULL,
    Status INT DEFAULT 0,
    Notes NVARCHAR(MAX),
    ItemsJson NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (WarehouseId) REFERENCES Warehouses(Id)
);

-- =============================================
-- POPULATION MANAGEMENT TABLES (Module VII)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Households')
CREATE TABLE Households (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    HouseholdCode NVARCHAR(50) NOT NULL,
    HeadOfHousehold NVARCHAR(200),
    Address NVARCHAR(500),
    Village NVARCHAR(200),
    WardCode NVARCHAR(10),
    Phone NVARCHAR(20),
    AssignedDoctorId UNIQUEIDENTIFIER,
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BirthCertificates')
CREATE TABLE BirthCertificates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CertificateNumber NVARCHAR(50) NOT NULL,
    ChildName NVARCHAR(200) NOT NULL,
    DateOfBirth DATETIME2 NOT NULL,
    Gender INT,
    PlaceOfBirth NVARCHAR(300),
    MotherName NVARCHAR(200),
    FatherName NVARCHAR(200),
    MotherIdNumber NVARCHAR(20),
    BirthWeight DECIMAL(5,2),
    BirthLength DECIMAL(5,2),
    GestationalAge INT,
    FacilityId UNIQUEIDENTIFIER,
    IssuedDate DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeathCertificates')
CREATE TABLE DeathCertificates (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CertificateNumber NVARCHAR(50) NOT NULL,
    DeceasedName NVARCHAR(200) NOT NULL,
    DateOfDeath DATETIME2 NOT NULL,
    PlaceOfDeath NVARCHAR(300),
    CauseOfDeath NVARCHAR(500),
    IcdCode NVARCHAR(20),
    Age INT,
    Gender INT,
    Address NVARCHAR(500),
    FacilityId UNIQUEIDENTIFIER,
    IssuedDate DATETIME2 NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ElderlyInfos')
CREATE TABLE ElderlyInfos (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    HealthStatus NVARCHAR(200),
    ChronicDiseases NVARCHAR(500),
    CareLevel NVARCHAR(50),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

-- =============================================
-- COMMUNICABLE DISEASE TABLES (Module VIII)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DiseaseCases')
CREATE TABLE DiseaseCases (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    DiseaseName NVARCHAR(300),
    IcdCode NVARCHAR(20),
    OnsetDate DATETIME2 NOT NULL,
    ReportDate DATETIME2,
    EpidemiologicalHistory NVARCHAR(MAX),
    TreatmentInfo NVARCHAR(MAX),
    Outcome NVARCHAR(50),
    Status INT DEFAULT 0,
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WeeklyReports')
CREATE TABLE WeeklyReports (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Year INT NOT NULL,
    WeekNumber INT NOT NULL,
    FacilityId UNIQUEIDENTIFIER NOT NULL,
    ReportData NVARCHAR(MAX),
    Status INT DEFAULT 0,
    SentDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'MonthlyReports')
CREATE TABLE MonthlyReports (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Year INT NOT NULL,
    Month INT NOT NULL,
    FacilityId UNIQUEIDENTIFIER NOT NULL,
    ReportData NVARCHAR(MAX),
    Status INT DEFAULT 0,
    SentDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

-- =============================================
-- REPRODUCTIVE HEALTH TABLES (Module IX)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'PrenatalRecords')
CREATE TABLE PrenatalRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    ExamDate DATETIME2 NOT NULL,
    GestationalWeek INT,
    Weight DECIMAL(5,2),
    SystolicBP INT,
    DiastolicBP INT,
    FundalHeight DECIMAL(5,2),
    FetalHeartRate NVARCHAR(50),
    FetalPosition NVARCHAR(50),
    Edema NVARCHAR(50),
    UltrasoundResult NVARCHAR(MAX),
    Diagnosis NVARCHAR(500),
    Notes NVARCHAR(MAX),
    DoctorId UNIQUEIDENTIFIER,
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DeliveryRecords')
CREATE TABLE DeliveryRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    DeliveryDate DATETIME2 NOT NULL,
    GestationalWeek INT,
    DeliveryType NVARCHAR(20),
    Complications NVARCHAR(MAX),
    ChildGender NVARCHAR(10),
    ChildWeight DECIMAL(5,2),
    ChildLength DECIMAL(5,2),
    ApgarScore1Min INT,
    ApgarScore5Min INT,
    ChildStatus NVARCHAR(200),
    MotherStatus NVARCHAR(200),
    Notes NVARCHAR(MAX),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AbortionRecords')
CREATE TABLE AbortionRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    ProcedureDate DATETIME2 NOT NULL,
    GestationalWeek INT,
    ProcedureType NVARCHAR(50),
    Reason NVARCHAR(500),
    Complications NVARCHAR(MAX),
    Notes NVARCHAR(MAX),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FamilyPlanningRecords')
CREATE TABLE FamilyPlanningRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    RecordDate DATETIME2 NOT NULL,
    Method NVARCHAR(50),
    StartDate DATETIME2,
    EndDate DATETIME2,
    Notes NVARCHAR(MAX),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'GynecologyExams')
CREATE TABLE GynecologyExams (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    ExamDate DATETIME2 NOT NULL,
    ExamResult NVARCHAR(MAX),
    Diagnosis NVARCHAR(500),
    Treatment NVARCHAR(MAX),
    Notes NVARCHAR(MAX),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

-- =============================================
-- HIV/AIDS TABLES (Module X)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HivPatients')
CREATE TABLE HivPatients (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    HivCode NVARCHAR(50),
    DiagnosisDate DATETIME2,
    ArvStartDate DATETIME2,
    CurrentRegimen NVARCHAR(200),
    ClinicalStage NVARCHAR(10),
    LatestCd4 DECIMAL(10,2),
    LatestViralLoad DECIMAL(10,2),
    FamilyHistory NVARCHAR(MAX),
    Status INT DEFAULT 0,
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ArvTreatmentCourses')
CREATE TABLE ArvTreatmentCourses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    HivPatientId UNIQUEIDENTIFIER NOT NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2,
    Regimen NVARCHAR(200),
    ChangeReason NVARCHAR(500),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (HivPatientId) REFERENCES HivPatients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HivCommunications')
CREATE TABLE HivCommunications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ActivityDate DATETIME2 NOT NULL,
    ActivityType NVARCHAR(100),
    Location NVARCHAR(300),
    Participants INT,
    Content NVARCHAR(MAX),
    Notes NVARCHAR(MAX),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

-- =============================================
-- IMMUNIZATION TABLES (Module XI)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Antigens')
CREATE TABLE Antigens (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(20) NOT NULL,
    Name NVARCHAR(200) NOT NULL,
    Description NVARCHAR(500),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Vaccines')
CREATE TABLE Vaccines (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(20) NOT NULL,
    Name NVARCHAR(300) NOT NULL,
    Manufacturer NVARCHAR(300),
    AntigenList NVARCHAR(500),
    StorageCondition NVARCHAR(200),
    DosesPerVial INT,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ImmunizationSubjects')
CREATE TABLE ImmunizationSubjects (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SubjectCode NVARCHAR(50) NOT NULL,
    FullName NVARCHAR(200) NOT NULL,
    DateOfBirth DATETIME2 NOT NULL,
    Gender INT,
    MotherName NVARCHAR(200),
    FatherName NVARCHAR(200),
    Address NVARCHAR(500),
    Village NVARCHAR(200),
    Phone NVARCHAR(20),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VaccinationRecords')
CREATE TABLE VaccinationRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SubjectId UNIQUEIDENTIFIER NOT NULL,
    VaccineId UNIQUEIDENTIFIER NOT NULL,
    VaccinationDate DATETIME2 NOT NULL,
    DoseNumber INT NOT NULL,
    BatchNumber NVARCHAR(50),
    InjectionSite NVARCHAR(50),
    Route NVARCHAR(20),
    Reaction NVARCHAR(200),
    ReactionDetail NVARCHAR(MAX),
    VaccinatorId UNIQUEIDENTIFIER,
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (SubjectId) REFERENCES ImmunizationSubjects(Id),
    FOREIGN KEY (VaccineId) REFERENCES Vaccines(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ImmunizationPlans')
CREATE TABLE ImmunizationPlans (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PlanCode NVARCHAR(50) NOT NULL,
    Year INT NOT NULL,
    Month INT NOT NULL,
    FacilityId UNIQUEIDENTIFIER NOT NULL,
    PlanData NVARCHAR(MAX),
    Status INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VaccineStocks')
CREATE TABLE VaccineStocks (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StockCode NVARCHAR(50) NOT NULL,
    VaccineId UNIQUEIDENTIFIER NOT NULL,
    StockType NVARCHAR(20),
    StockDate DATETIME2 NOT NULL,
    Quantity DECIMAL(18,2),
    BatchNumber NVARCHAR(50),
    ExpiryDate DATETIME2,
    Notes NVARCHAR(MAX),
    Status INT DEFAULT 0,
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (VaccineId) REFERENCES Vaccines(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NutritionMeasurements')
CREATE TABLE NutritionMeasurements (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SubjectId UNIQUEIDENTIFIER NOT NULL,
    MeasurementDate DATETIME2 NOT NULL,
    Weight DECIMAL(5,2),
    Height DECIMAL(5,2),
    HeadCircumference DECIMAL(5,2),
    NutritionStatus NVARCHAR(50),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (SubjectId) REFERENCES ImmunizationSubjects(Id)
);

-- =============================================
-- VITAMIN A, NUTRITION, OTHER MODULE TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VitaminAPlans')
CREATE TABLE VitaminAPlans (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Year INT NOT NULL,
    Campaign INT NOT NULL,
    FacilityId UNIQUEIDENTIFIER NOT NULL,
    PlanData NVARCHAR(MAX),
    Status INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'VitaminARecords')
CREATE TABLE VitaminARecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SubjectId UNIQUEIDENTIFIER NOT NULL,
    GivenDate DATETIME2 NOT NULL,
    DoseType NVARCHAR(20),
    Campaign NVARCHAR(50),
    Notes NVARCHAR(MAX),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (SubjectId) REFERENCES ImmunizationSubjects(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'NutritionReports')
CREATE TABLE NutritionReports (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Year INT NOT NULL,
    Period INT NOT NULL,
    FacilityId UNIQUEIDENTIFIER NOT NULL,
    ReportData NVARCHAR(MAX),
    Status INT DEFAULT 0,
    SentDate DATETIME2,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'InjuryRecords')
CREATE TABLE InjuryRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    InjuryDate DATETIME2 NOT NULL,
    InjuryType NVARCHAR(100),
    Location NVARCHAR(300),
    Cause NVARCHAR(500),
    Severity NVARCHAR(50),
    Treatment NVARCHAR(MAX),
    Outcome NVARCHAR(200),
    IcdCode NVARCHAR(20),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

-- =============================================
-- CHRONIC DISEASE / NCD TABLES (Module IV)
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChronicDiseaseRegisters')
CREATE TABLE ChronicDiseaseRegisters (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    DiseaseType NVARCHAR(50) NOT NULL,
    RegisterDate DATETIME2 NOT NULL,
    Status NVARCHAR(20) DEFAULT 'Active',
    Notes NVARCHAR(MAX),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ChronicDiseaseTreatments')
CREATE TABLE ChronicDiseaseTreatments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    RegisterId UNIQUEIDENTIFIER NOT NULL,
    TreatmentDate DATETIME2 NOT NULL,
    Progress NVARCHAR(MAX),
    Orders NVARCHAR(MAX),
    VitalSigns NVARCHAR(MAX),
    Notes NVARCHAR(MAX),
    DoctorId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (RegisterId) REFERENCES ChronicDiseaseRegisters(Id)
);

-- =============================================
-- SPECIALIZED MEDICAL RECORDS & OTHER
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SpecializedMedicalRecords')
CREATE TABLE SpecializedMedicalRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    MedicalRecordId UNIQUEIDENTIFIER NOT NULL,
    RecordType NVARCHAR(20) NOT NULL,
    RecordData NVARCHAR(MAX),
    Status INT DEFAULT 0,
    DoctorId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id),
    FOREIGN KEY (MedicalRecordId) REFERENCES MedicalRecords(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SurgeryRecords')
CREATE TABLE SurgeryRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    ExaminationId UNIQUEIDENTIFIER,
    ProcedureDate DATETIME2 NOT NULL,
    ProcedureName NVARCHAR(500),
    ProcedureType NVARCHAR(20),
    Surgeon NVARCHAR(200),
    Assistant NVARCHAR(200),
    Anesthesia NVARCHAR(200),
    Findings NVARCHAR(MAX),
    Complications NVARCHAR(MAX),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DriverLicenseExams')
CREATE TABLE DriverLicenseExams (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    ExamDate DATETIME2 NOT NULL,
    LicenseClass NVARCHAR(10),
    GeneralHealth NVARCHAR(MAX),
    InternalMedicine NVARCHAR(MAX),
    Surgery NVARCHAR(MAX),
    Ophthalmology NVARCHAR(MAX),
    ENT NVARCHAR(MAX),
    Psychiatry NVARCHAR(MAX),
    Conclusion NVARCHAR(MAX),
    IsEligible BIT,
    DigitalSignatureId NVARCHAR(100),
    IsSynced BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Referrals')
CREATE TABLE Referrals (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    ExaminationId UNIQUEIDENTIFIER,
    ReferralDate DATETIME2 NOT NULL,
    FromFacility NVARCHAR(300),
    ToFacility NVARCHAR(300),
    Diagnosis NVARCHAR(500),
    Reason NVARCHAR(MAX),
    Summary NVARCHAR(MAX),
    TransportMethod NVARCHAR(100),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SickLeaves')
CREATE TABLE SickLeaves (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    PatientId UNIQUEIDENTIFIER NOT NULL,
    ExaminationId UNIQUEIDENTIFIER,
    FromDate DATETIME2 NOT NULL,
    ToDate DATETIME2 NOT NULL,
    Diagnosis NVARCHAR(500),
    Notes NVARCHAR(MAX),
    DoctorId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (PatientId) REFERENCES Patients(Id)
);

-- =============================================
-- OTHER MODULE TABLES
-- =============================================

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Collaborators')
CREATE TABLE Collaborators (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    FullName NVARCHAR(200) NOT NULL,
    Phone NVARCHAR(20),
    Address NVARCHAR(500),
    Village NVARCHAR(200),
    FacilityId UNIQUEIDENTIFIER,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Equipments')
CREATE TABLE Equipments (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Code NVARCHAR(50) NOT NULL,
    Name NVARCHAR(300) NOT NULL,
    Model NVARCHAR(200),
    SerialNumber NVARCHAR(100),
    DepartmentId UNIQUEIDENTIFIER,
    FacilityId UNIQUEIDENTIFIER,
    PurchaseDate DATETIME2,
    PurchasePrice DECIMAL(18,2),
    CurrentValue DECIMAL(18,2),
    Status NVARCHAR(20),
    AssetType NVARCHAR(20),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EquipmentTransfers')
CREATE TABLE EquipmentTransfers (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    EquipmentId UNIQUEIDENTIFIER NOT NULL,
    FromDepartmentId UNIQUEIDENTIFIER NOT NULL,
    ToDepartmentId UNIQUEIDENTIFIER NOT NULL,
    TransferDate DATETIME2 NOT NULL,
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (EquipmentId) REFERENCES Equipments(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'EquipmentDisposals')
CREATE TABLE EquipmentDisposals (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    DisposalCode NVARCHAR(50) NOT NULL,
    DisposalDate DATETIME2 NOT NULL,
    Notes NVARCHAR(MAX),
    ItemsJson NVARCHAR(MAX),
    Status INT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'HealthCampaigns')
CREATE TABLE HealthCampaigns (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CampaignName NVARCHAR(300) NOT NULL,
    StartDate DATETIME2 NOT NULL,
    EndDate DATETIME2,
    Location NVARCHAR(300),
    Topic NVARCHAR(300),
    Participants INT,
    Content NVARCHAR(MAX),
    Notes NVARCHAR(MAX),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SanitationFacilities')
CREATE TABLE SanitationFacilities (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FacilityType NVARCHAR(50),
    Address NVARCHAR(500),
    Village NVARCHAR(200),
    Status NVARCHAR(20),
    Notes NVARCHAR(MAX),
    HealthFacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FoodBusinesses')
CREATE TABLE FoodBusinesses (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    BusinessName NVARCHAR(300) NOT NULL,
    Address NVARCHAR(500),
    OwnerName NVARCHAR(200),
    Phone NVARCHAR(20),
    BusinessType NVARCHAR(100),
    LicenseNumber NVARCHAR(50),
    LicenseExpiry DATETIME2,
    Status NVARCHAR(20),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FoodViolations')
CREATE TABLE FoodViolations (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FoodBusinessId UNIQUEIDENTIFIER NOT NULL,
    ViolationDate DATETIME2 NOT NULL,
    ViolationType NVARCHAR(100),
    Description NVARCHAR(MAX),
    Penalty NVARCHAR(500),
    Notes NVARCHAR(MAX),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (FoodBusinessId) REFERENCES FoodBusinesses(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FoodPoisonings')
CREATE TABLE FoodPoisonings (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    IncidentDate DATETIME2 NOT NULL,
    Location NVARCHAR(300),
    AffectedCount INT,
    HospitalizedCount INT,
    DeathCount INT,
    SuspectedFood NVARCHAR(500),
    CauseAgent NVARCHAR(300),
    Description NVARCHAR(MAX),
    Actions NVARCHAR(MAX),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FinanceVouchers')
CREATE TABLE FinanceVouchers (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VoucherCode NVARCHAR(50) NOT NULL,
    VoucherType NVARCHAR(20) NOT NULL,
    VoucherDate DATETIME2 NOT NULL,
    Amount DECIMAL(18,2) NOT NULL,
    Description NVARCHAR(500),
    Category NVARCHAR(100),
    Status INT DEFAULT 0,
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'FinanceBalances')
CREATE TABLE FinanceBalances (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Year INT NOT NULL,
    Month INT NOT NULL,
    OpeningBalance DECIMAL(18,2),
    TotalReceipts DECIMAL(18,2),
    TotalPayments DECIMAL(18,2),
    ClosingBalance DECIMAL(18,2),
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Staffs')
CREATE TABLE Staffs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    StaffCode NVARCHAR(50) NOT NULL,
    FullName NVARCHAR(200) NOT NULL,
    DateOfBirth DATETIME2,
    Gender INT,
    Position NVARCHAR(100),
    Qualification NVARCHAR(100),
    Specialty NVARCHAR(100),
    PracticeLicenseNumber NVARCHAR(50),
    PracticeLicenseExpiry DATETIME2,
    Phone NVARCHAR(20),
    Email NVARCHAR(200),
    DepartmentId UNIQUEIDENTIFIER,
    FacilityId UNIQUEIDENTIFIER,
    IsActive BIT DEFAULT 1,
    ElectronicPrescriptionMapping NVARCHAR(200),
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

-- DATA INTEROP TABLES
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DataSyncLogs')
CREATE TABLE DataSyncLogs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    SyncType NVARCHAR(20) NOT NULL,
    Direction NVARCHAR(20),
    SyncDate DATETIME2 NOT NULL,
    RecordCount INT,
    SuccessCount INT,
    ErrorCount INT,
    ErrorDetails NVARCHAR(MAX),
    Status INT DEFAULT 0,
    FacilityId UNIQUEIDENTIFIER,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'BhytSyncConfigs')
CREATE TABLE BhytSyncConfigs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ApiUrl NVARCHAR(500),
    Username NVARCHAR(100),
    Password NVARCHAR(200),
    MaBenhVien NVARCHAR(20),
    FacilityId UNIQUEIDENTIFIER,
    IsActive BIT DEFAULT 0,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ServicePriceConfigs')
CREATE TABLE ServicePriceConfigs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    ServiceId UNIQUEIDENTIFIER NOT NULL,
    Price DECIMAL(18,2) NOT NULL,
    PriceType NVARCHAR(20),
    EffectiveFrom DATETIME2 NOT NULL,
    EffectiveTo DATETIME2,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (ServiceId) REFERENCES Services(Id)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'DepartmentServiceConfigs')
CREATE TABLE DepartmentServiceConfigs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    DepartmentId UNIQUEIDENTIFIER NOT NULL,
    ServiceId UNIQUEIDENTIFIER NOT NULL,
    CreatedAt DATETIME2 DEFAULT GETDATE(),
    CreatedBy NVARCHAR(100),
    UpdatedAt DATETIME2,
    UpdatedBy NVARCHAR(100),
    IsDeleted BIT DEFAULT 0,
    FOREIGN KEY (DepartmentId) REFERENCES Departments(Id),
    FOREIGN KEY (ServiceId) REFERENCES Services(Id)
);

-- =============================================
-- SEED DATA
-- =============================================

-- Default admin user (password: Admin@123)
IF NOT EXISTS (SELECT 1 FROM Users WHERE Username = 'admin')
INSERT INTO Users (Id, Username, PasswordHash, FullName, Email, IsActive, CreatedAt)
VALUES (NEWID(), 'admin', '$2a$11$kjUBzKTjCK665u94OUFCqOd.081wK/o4jvuplG2miHA7dqgu9dh8K', N'Quản trị viên', 'admin@chis.vn', 1, GETDATE());

-- Default roles
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'Admin')
INSERT INTO Roles (Id, Name, Description, CreatedAt) VALUES (NEWID(), 'Admin', N'Quản trị hệ thống', GETDATE());
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'Doctor')
INSERT INTO Roles (Id, Name, Description, CreatedAt) VALUES (NEWID(), 'Doctor', N'Bác sĩ', GETDATE());
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'Nurse')
INSERT INTO Roles (Id, Name, Description, CreatedAt) VALUES (NEWID(), 'Nurse', N'Điều dưỡng', GETDATE());
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'Pharmacist')
INSERT INTO Roles (Id, Name, Description, CreatedAt) VALUES (NEWID(), 'Pharmacist', N'Dược sĩ', GETDATE());
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'Receptionist')
INSERT INTO Roles (Id, Name, Description, CreatedAt) VALUES (NEWID(), 'Receptionist', N'Tiếp đón', GETDATE());
IF NOT EXISTS (SELECT 1 FROM Roles WHERE Name = 'Cashier')
INSERT INTO Roles (Id, Name, Description, CreatedAt) VALUES (NEWID(), 'Cashier', N'Thu ngân', GETDATE());

-- Assign admin role
INSERT INTO UserRoles (Id, UserId, RoleId, CreatedAt)
SELECT NEWID(), u.Id, r.Id, GETDATE()
FROM Users u, Roles r
WHERE u.Username = 'admin' AND r.Name = 'Admin'
AND NOT EXISTS (SELECT 1 FROM UserRoles ur WHERE ur.UserId = u.Id AND ur.RoleId = r.Id);

-- Default facilities (29 TYT + 1 PKDK)
IF NOT EXISTS (SELECT 1 FROM Facilities WHERE Code = 'TTYT')
BEGIN
    INSERT INTO Facilities (Id, Code, Name, FacilityType, Address, IsActive, CreatedAt) VALUES
    (NEWID(), 'TTYT', N'Trung tâm Y tế huyện Thường Tín', 'TTYT', N'Thị trấn Thường Tín, Huyện Thường Tín, TP. Hà Nội', 1, GETDATE()),
    (NEWID(), 'PKD01', N'Phòng khám Đa khoa Thường Tín', 'PKD', N'Thị trấn Thường Tín', 1, GETDATE()),
    (NEWID(), 'TYT01', N'Trạm Y tế thị trấn Thường Tín', 'TYT', N'Thị trấn Thường Tín', 1, GETDATE()),
    (NEWID(), 'TYT02', N'Trạm Y tế xã Ninh Sở', 'TYT', N'Xã Ninh Sở', 1, GETDATE()),
    (NEWID(), 'TYT03', N'Trạm Y tế xã Nhị Khê', 'TYT', N'Xã Nhị Khê', 1, GETDATE()),
    (NEWID(), 'TYT04', N'Trạm Y tế xã Duyên Thái', 'TYT', N'Xã Duyên Thái', 1, GETDATE()),
    (NEWID(), 'TYT05', N'Trạm Y tế xã Khánh Hà', 'TYT', N'Xã Khánh Hà', 1, GETDATE()),
    (NEWID(), 'TYT06', N'Trạm Y tế xã Hà Hồi', 'TYT', N'Xã Hà Hồi', 1, GETDATE()),
    (NEWID(), 'TYT07', N'Trạm Y tế xã Hiền Giang', 'TYT', N'Xã Hiền Giang', 1, GETDATE()),
    (NEWID(), 'TYT08', N'Trạm Y tế xã Hồng Dương', 'TYT', N'Xã Hồng Dương', 1, GETDATE()),
    (NEWID(), 'TYT09', N'Trạm Y tế xã Liên Phương', 'TYT', N'Xã Liên Phương', 1, GETDATE()),
    (NEWID(), 'TYT10', N'Trạm Y tế xã Lê Lợi', 'TYT', N'Xã Lê Lợi', 1, GETDATE()),
    (NEWID(), 'TYT11', N'Trạm Y tế xã Minh Cường', 'TYT', N'Xã Minh Cường', 1, GETDATE()),
    (NEWID(), 'TYT12', N'Trạm Y tế xã Nghiêm Xuyên', 'TYT', N'Xã Nghiêm Xuyên', 1, GETDATE()),
    (NEWID(), 'TYT13', N'Trạm Y tế xã Nguyễn Trãi', 'TYT', N'Xã Nguyễn Trãi', 1, GETDATE()),
    (NEWID(), 'TYT14', N'Trạm Y tế xã Quất Động', 'TYT', N'Xã Quất Động', 1, GETDATE()),
    (NEWID(), 'TYT15', N'Trạm Y tế xã Tân Minh', 'TYT', N'Xã Tân Minh', 1, GETDATE()),
    (NEWID(), 'TYT16', N'Trạm Y tế xã Thắng Lợi', 'TYT', N'Xã Thắng Lợi', 1, GETDATE()),
    (NEWID(), 'TYT17', N'Trạm Y tế xã Thống Nhất', 'TYT', N'Xã Thống Nhất', 1, GETDATE()),
    (NEWID(), 'TYT18', N'Trạm Y tế xã Tô Hiệu', 'TYT', N'Xã Tô Hiệu', 1, GETDATE()),
    (NEWID(), 'TYT19', N'Trạm Y tế xã Tiền Phong', 'TYT', N'Xã Tiền Phong', 1, GETDATE()),
    (NEWID(), 'TYT20', N'Trạm Y tế xã Tự Nhiên', 'TYT', N'Xã Tự Nhiên', 1, GETDATE()),
    (NEWID(), 'TYT21', N'Trạm Y tế xã Văn Bình', 'TYT', N'Xã Văn Bình', 1, GETDATE()),
    (NEWID(), 'TYT22', N'Trạm Y tế xã Văn Phú', 'TYT', N'Xã Văn Phú', 1, GETDATE()),
    (NEWID(), 'TYT23', N'Trạm Y tế xã Văn Tự', 'TYT', N'Xã Văn Tự', 1, GETDATE()),
    (NEWID(), 'TYT24', N'Trạm Y tế xã Vạn Điểm', 'TYT', N'Xã Vạn Điểm', 1, GETDATE()),
    (NEWID(), 'TYT25', N'Trạm Y tế xã Vân Tảo', 'TYT', N'Xã Vân Tảo', 1, GETDATE()),
    (NEWID(), 'TYT26', N'Trạm Y tế xã Chương Dương', 'TYT', N'Xã Chương Dương', 1, GETDATE()),
    (NEWID(), 'TYT27', N'Trạm Y tế xã Dũng Tiến', 'TYT', N'Xã Dũng Tiến', 1, GETDATE()),
    (NEWID(), 'TYT28', N'Trạm Y tế xã Hòa Bình', 'TYT', N'Xã Hòa Bình', 1, GETDATE()),
    (NEWID(), 'TYT29', N'Trạm Y tế xã Thư Phú', 'TYT', N'Xã Thư Phú', 1, GETDATE());
END;

PRINT N'=== CHIS Database created successfully with all tables and seed data ===';
GO
