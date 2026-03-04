-- ============================================================
-- CHIS: Add Specialized Records, Tracking Books, Oxytocin, Online Bookings tables
-- Idempotent script (IF NOT EXISTS)
-- Run against CHIS database on localhost:1434
-- ============================================================

USE CHIS;
GO

-- ============================================================
-- 1. Add PrintedAt column to SpecializedMedicalRecords
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SpecializedMedicalRecords') AND name = 'PrintedAt')
BEGIN
    ALTER TABLE SpecializedMedicalRecords ADD PrintedAt DATETIME2 NULL;
    PRINT 'Added PrintedAt to SpecializedMedicalRecords';
END
GO

-- Add DoctorId FK column if not exists
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('SpecializedMedicalRecords') AND name = 'DoctorId')
BEGIN
    ALTER TABLE SpecializedMedicalRecords ADD DoctorId UNIQUEIDENTIFIER NULL;
    PRINT 'Added DoctorId to SpecializedMedicalRecords';
END
GO

-- ============================================================
-- 2. TrackingBookEntries table
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'TrackingBookEntries')
BEGIN
    CREATE TABLE TrackingBookEntries (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        PatientId UNIQUEIDENTIFIER NOT NULL,
        BookType NVARCHAR(50) NOT NULL,
        EntryDate DATETIME2 NOT NULL,
        Notes NVARCHAR(MAX) NULL,
        EntryData NVARCHAR(MAX) NULL,
        Status INT NOT NULL DEFAULT 0,
        DoctorId UNIQUEIDENTIFIER NULL,
        ExaminationId UNIQUEIDENTIFIER NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CreatedBy NVARCHAR(450) NULL,
        UpdatedAt DATETIME2 NULL,
        UpdatedBy NVARCHAR(450) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_TrackingBookEntries_Patient FOREIGN KEY (PatientId) REFERENCES Patients(Id),
        CONSTRAINT FK_TrackingBookEntries_Doctor FOREIGN KEY (DoctorId) REFERENCES Users(Id)
    );
    CREATE INDEX IX_TrackingBookEntries_PatientId ON TrackingBookEntries(PatientId);
    CREATE INDEX IX_TrackingBookEntries_BookType ON TrackingBookEntries(BookType);
    CREATE INDEX IX_TrackingBookEntries_EntryDate ON TrackingBookEntries(EntryDate);
    PRINT 'Created TrackingBookEntries table';
END
GO

-- ============================================================
-- 3. OxytocinRecords table
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OxytocinRecords')
BEGIN
    CREATE TABLE OxytocinRecords (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        PatientId UNIQUEIDENTIFIER NOT NULL,
        ExaminationId UNIQUEIDENTIFIER NULL,
        StartTime DATETIME2 NOT NULL,
        EndTime DATETIME2 NULL,
        InitialDose DECIMAL(18,2) NULL,
        CurrentDose DECIMAL(18,2) NULL,
        MaxDose DECIMAL(18,2) NULL,
        DilutionInfo NVARCHAR(500) NULL,
        FetalHeartRate INT NULL,
        ContractionPattern NVARCHAR(200) NULL,
        SystolicBP INT NULL,
        DiastolicBP INT NULL,
        Notes NVARCHAR(MAX) NULL,
        Status INT NOT NULL DEFAULT 0,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CreatedBy NVARCHAR(450) NULL,
        UpdatedAt DATETIME2 NULL,
        UpdatedBy NVARCHAR(450) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_OxytocinRecords_Patient FOREIGN KEY (PatientId) REFERENCES Patients(Id)
    );
    CREATE INDEX IX_OxytocinRecords_PatientId ON OxytocinRecords(PatientId);
    CREATE INDEX IX_OxytocinRecords_StartTime ON OxytocinRecords(StartTime);
    PRINT 'Created OxytocinRecords table';
END
GO

-- ============================================================
-- 4. OnlineBookings table
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'OnlineBookings')
BEGIN
    CREATE TABLE OnlineBookings (
        Id UNIQUEIDENTIFIER NOT NULL PRIMARY KEY DEFAULT NEWID(),
        PatientId UNIQUEIDENTIFIER NOT NULL,
        BookingDate DATETIME2 NOT NULL,
        BookingTime NVARCHAR(10) NULL,
        RoomId UNIQUEIDENTIFIER NULL,
        Status INT NOT NULL DEFAULT 0,
        Notes NVARCHAR(MAX) NULL,
        Source NVARCHAR(50) NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
        CreatedBy NVARCHAR(450) NULL,
        UpdatedAt DATETIME2 NULL,
        UpdatedBy NVARCHAR(450) NULL,
        IsDeleted BIT NOT NULL DEFAULT 0,
        CONSTRAINT FK_OnlineBookings_Patient FOREIGN KEY (PatientId) REFERENCES Patients(Id),
        CONSTRAINT FK_OnlineBookings_Room FOREIGN KEY (RoomId) REFERENCES Rooms(Id)
    );
    CREATE INDEX IX_OnlineBookings_PatientId ON OnlineBookings(PatientId);
    CREATE INDEX IX_OnlineBookings_BookingDate ON OnlineBookings(BookingDate);
    CREATE INDEX IX_OnlineBookings_Status ON OnlineBookings(Status);
    PRINT 'Created OnlineBookings table';
END
GO

-- ============================================================
-- 5. Verify all tables exist
-- ============================================================
SELECT
    t.name AS TableName,
    SUM(p.rows) AS RowCount
FROM sys.tables t
INNER JOIN sys.partitions p ON t.object_id = p.object_id AND p.index_id IN (0,1)
WHERE t.name IN (
    'SpecializedMedicalRecords',
    'TrackingBookEntries',
    'OxytocinRecords',
    'OnlineBookings',
    'SurgeryRecords',
    'InfusionRecords'
)
GROUP BY t.name
ORDER BY t.name;
GO

PRINT 'All specialized record tables ready.';
GO
