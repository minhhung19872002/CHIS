using CHIS.Core.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace CHIS.Infrastructure.Data;

public class CHISDbContext : DbContext
{
    public CHISDbContext(DbContextOptions<CHISDbContext> options) : base(options) { }

    // Auth & System
    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<TwoFactorOtp> TwoFactorOtps => Set<TwoFactorOtp>();
    public DbSet<SystemConfig> SystemConfigs => Set<SystemConfig>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<AuditLog> AuditLogs => Set<AuditLog>();

    // Organization
    public DbSet<Facility> Facilities => Set<Facility>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Room> Rooms => Set<Room>();
    public DbSet<Bed> Beds => Set<Bed>();

    // Patient & Medical Records
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<Examination> Examinations => Set<Examination>();
    public DbSet<QueueTicket> QueueTickets => Set<QueueTicket>();

    // Prescription & Medicine
    public DbSet<Medicine> Medicines => Set<Medicine>();
    public DbSet<Prescription> Prescriptions => Set<Prescription>();
    public DbSet<PrescriptionItem> PrescriptionItems => Set<PrescriptionItem>();
    public DbSet<PrescriptionTemplate> PrescriptionTemplates => Set<PrescriptionTemplate>();

    // Services (Lab, Imaging)
    public DbSet<Service> Services => Set<Service>();
    public DbSet<ServiceRequest> ServiceRequests => Set<ServiceRequest>();
    public DbSet<ServiceRequestDetail> ServiceRequestDetails => Set<ServiceRequestDetail>();
    public DbSet<LabReferenceValue> LabReferenceValues => Set<LabReferenceValue>();
    public DbSet<ImagingTemplate> ImagingTemplates => Set<ImagingTemplate>();

    // Inpatient
    public DbSet<Admission> Admissions => Set<Admission>();
    public DbSet<Discharge> Discharges => Set<Discharge>();
    public DbSet<TreatmentSheet> TreatmentSheets => Set<TreatmentSheet>();
    public DbSet<NursingCareSheet> NursingCareSheets => Set<NursingCareSheet>();
    public DbSet<InfusionRecord> InfusionRecords => Set<InfusionRecord>();

    // Billing
    public DbSet<Receipt> Receipts => Set<Receipt>();
    public DbSet<ReceiptDetail> ReceiptDetails => Set<ReceiptDetail>();
    public DbSet<ReceiptBook> ReceiptBooks => Set<ReceiptBook>();
    public DbSet<ElectronicInvoice> ElectronicInvoices => Set<ElectronicInvoice>();

    // Pharmacy & Warehouse
    public DbSet<Warehouse> Warehouses => Set<Warehouse>();
    public DbSet<StockReceipt> StockReceipts => Set<StockReceipt>();
    public DbSet<StockReceiptItem> StockReceiptItems => Set<StockReceiptItem>();
    public DbSet<StockIssue> StockIssues => Set<StockIssue>();
    public DbSet<StockIssueItem> StockIssueItems => Set<StockIssueItem>();
    public DbSet<StockBalance> StockBalances => Set<StockBalance>();
    public DbSet<StockTake> StockTakes => Set<StockTake>();
    public DbSet<StockTakeItem> StockTakeItems => Set<StockTakeItem>();
    public DbSet<Supplier> Suppliers => Set<Supplier>();
    public DbSet<ProcurementRequest> ProcurementRequests => Set<ProcurementRequest>();
    public DbSet<MedicalSupply> MedicalSupplies => Set<MedicalSupply>();

    // Catalog
    public DbSet<IcdCode> IcdCodes => Set<IcdCode>();
    public DbSet<ExamDictionary> ExamDictionaries => Set<ExamDictionary>();

    // Population
    public DbSet<Household> Households => Set<Household>();
    public DbSet<BirthCertificate> BirthCertificates => Set<BirthCertificate>();
    public DbSet<DeathCertificate> DeathCertificates => Set<DeathCertificate>();
    public DbSet<ElderlyInfo> ElderlyInfos => Set<ElderlyInfo>();

    // Chronic Disease
    public DbSet<ChronicDiseaseRegister> ChronicDiseaseRegisters => Set<ChronicDiseaseRegister>();
    public DbSet<ChronicDiseaseTreatment> ChronicDiseaseTreatments => Set<ChronicDiseaseTreatment>();

    // Communicable Disease
    public DbSet<DiseaseCase> DiseaseCases => Set<DiseaseCase>();
    public DbSet<WeeklyReport> WeeklyReports => Set<WeeklyReport>();
    public DbSet<MonthlyReport> MonthlyReports => Set<MonthlyReport>();

    // Reproductive Health
    public DbSet<PrenatalRecord> PrenatalRecords => Set<PrenatalRecord>();
    public DbSet<DeliveryRecord> DeliveryRecords => Set<DeliveryRecord>();
    public DbSet<AbortionRecord> AbortionRecords => Set<AbortionRecord>();
    public DbSet<FamilyPlanningRecord> FamilyPlanningRecords => Set<FamilyPlanningRecord>();
    public DbSet<GynecologyExam> GynecologyExams => Set<GynecologyExam>();

    // HIV/AIDS
    public DbSet<HivPatient> HivPatients => Set<HivPatient>();
    public DbSet<ArvTreatmentCourse> ArvTreatmentCourses => Set<ArvTreatmentCourse>();
    public DbSet<HivCommunication> HivCommunications => Set<HivCommunication>();

    // Immunization
    public DbSet<Antigen> Antigens => Set<Antigen>();
    public DbSet<Vaccine> Vaccines => Set<Vaccine>();
    public DbSet<ImmunizationSubject> ImmunizationSubjects => Set<ImmunizationSubject>();
    public DbSet<VaccinationRecord> VaccinationRecords => Set<VaccinationRecord>();
    public DbSet<ImmunizationPlan> ImmunizationPlans => Set<ImmunizationPlan>();
    public DbSet<VaccineStock> VaccineStocks => Set<VaccineStock>();
    public DbSet<NutritionMeasurement> NutritionMeasurements => Set<NutritionMeasurement>();

    // Vitamin A & Nutrition
    public DbSet<VitaminAPlan> VitaminAPlans => Set<VitaminAPlan>();
    public DbSet<VitaminARecord> VitaminARecords => Set<VitaminARecord>();
    public DbSet<NutritionReport> NutritionReports => Set<NutritionReport>();

    // Special records
    public DbSet<SpecializedMedicalRecord> SpecializedMedicalRecords => Set<SpecializedMedicalRecord>();
    public DbSet<SurgeryRecord> SurgeryRecords => Set<SurgeryRecord>();
    public DbSet<DriverLicenseExam> DriverLicenseExams => Set<DriverLicenseExam>();
    public DbSet<Referral> Referrals => Set<Referral>();
    public DbSet<SickLeave> SickLeaves => Set<SickLeave>();
    public DbSet<InjuryRecord> InjuryRecords => Set<InjuryRecord>();
    public DbSet<TrackingBookEntry> TrackingBookEntries => Set<TrackingBookEntry>();
    public DbSet<OxytocinRecord> OxytocinRecords => Set<OxytocinRecord>();
    public DbSet<OnlineBooking> OnlineBookings => Set<OnlineBooking>();

    // Equipment
    public DbSet<Equipment> Equipments => Set<Equipment>();
    public DbSet<EquipmentTransfer> EquipmentTransfers => Set<EquipmentTransfer>();
    public DbSet<EquipmentDisposal> EquipmentDisposals => Set<EquipmentDisposal>();

    // Staff
    public DbSet<Staff> Staffs => Set<Staff>();
    public DbSet<Collaborator> Collaborators => Set<Collaborator>();

    // Public Health
    public DbSet<HealthCampaign> HealthCampaigns => Set<HealthCampaign>();
    public DbSet<SanitationFacility> SanitationFacilities => Set<SanitationFacility>();
    public DbSet<FoodBusiness> FoodBusinesses => Set<FoodBusiness>();
    public DbSet<FoodViolation> FoodViolations => Set<FoodViolation>();
    public DbSet<FoodPoisoning> FoodPoisonings => Set<FoodPoisoning>();

    // Finance
    public DbSet<FinanceVoucher> FinanceVouchers => Set<FinanceVoucher>();
    public DbSet<FinanceBalance> FinanceBalances => Set<FinanceBalance>();

    // Interoperability
    public DbSet<DataSyncLog> DataSyncLogs => Set<DataSyncLog>();
    public DbSet<BhytSyncConfig> BhytSyncConfigs => Set<BhytSyncConfig>();
    public DbSet<ServicePriceConfig> ServicePriceConfigs => Set<ServicePriceConfig>();
    public DbSet<DepartmentServiceConfig> DepartmentServiceConfigs => Set<DepartmentServiceConfig>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Global soft-delete filter for all BaseEntity types
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                var method = typeof(CHISDbContext)
                    .GetMethod(nameof(ApplySoftDeleteFilter), System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static)!
                    .MakeGenericMethod(entityType.ClrType);
                method.Invoke(null, new object[] { modelBuilder });
            }
        }

        // ---- FK Relationships ----

        // User -> Department
        modelBuilder.Entity<User>()
            .HasOne(u => u.Department)
            .WithMany()
            .HasForeignKey(u => u.DepartmentId)
            .OnDelete(DeleteBehavior.SetNull);

        // UserRole
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.User).WithMany(u => u.UserRoles).HasForeignKey(ur => ur.UserId);
        modelBuilder.Entity<UserRole>()
            .HasOne(ur => ur.Role).WithMany(r => r.UserRoles).HasForeignKey(ur => ur.RoleId);

        // RolePermission
        modelBuilder.Entity<RolePermission>()
            .HasOne(rp => rp.Role).WithMany(r => r.RolePermissions).HasForeignKey(rp => rp.RoleId);

        // Notification
        modelBuilder.Entity<Notification>()
            .HasOne(n => n.User).WithMany().HasForeignKey(n => n.UserId);

        // Facility -> Departments
        modelBuilder.Entity<Department>()
            .HasOne(d => d.Facility).WithMany(f => f.Departments).HasForeignKey(d => d.FacilityId).OnDelete(DeleteBehavior.SetNull);

        // Room -> Department
        modelBuilder.Entity<Room>()
            .HasOne(r => r.Department).WithMany(d => d.Rooms).HasForeignKey(r => r.DepartmentId);

        // Bed -> Room, Department
        modelBuilder.Entity<Bed>()
            .HasOne(b => b.Room).WithMany().HasForeignKey(b => b.RoomId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Bed>()
            .HasOne(b => b.Department).WithMany().HasForeignKey(b => b.DepartmentId).OnDelete(DeleteBehavior.NoAction);

        // Patient -> Household
        modelBuilder.Entity<Patient>()
            .HasOne(p => p.Household).WithMany(h => h.Members).HasForeignKey(p => p.HouseholdId).OnDelete(DeleteBehavior.SetNull);

        // MedicalRecord -> Patient, Department
        modelBuilder.Entity<MedicalRecord>()
            .HasOne(mr => mr.Patient).WithMany(p => p.MedicalRecords).HasForeignKey(mr => mr.PatientId);
        modelBuilder.Entity<MedicalRecord>()
            .HasOne(mr => mr.Department).WithMany().HasForeignKey(mr => mr.DepartmentId).OnDelete(DeleteBehavior.SetNull);

        // Examination
        modelBuilder.Entity<Examination>()
            .HasOne(e => e.Patient).WithMany(p => p.Examinations).HasForeignKey(e => e.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Examination>()
            .HasOne(e => e.MedicalRecord).WithMany().HasForeignKey(e => e.MedicalRecordId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Examination>()
            .HasOne(e => e.Room).WithMany().HasForeignKey(e => e.RoomId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<Examination>()
            .HasOne(e => e.Doctor).WithMany().HasForeignKey(e => e.DoctorId).OnDelete(DeleteBehavior.SetNull);

        // QueueTicket
        modelBuilder.Entity<QueueTicket>()
            .HasOne(q => q.Patient).WithMany().HasForeignKey(q => q.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<QueueTicket>()
            .HasOne(q => q.Room).WithMany().HasForeignKey(q => q.RoomId).OnDelete(DeleteBehavior.NoAction);

        // Prescription
        modelBuilder.Entity<Prescription>()
            .HasOne(p => p.Examination).WithMany(e => e.Prescriptions).HasForeignKey(p => p.ExaminationId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Prescription>()
            .HasOne(p => p.Patient).WithMany().HasForeignKey(p => p.PatientId).OnDelete(DeleteBehavior.NoAction);

        // PrescriptionItem
        modelBuilder.Entity<PrescriptionItem>()
            .HasOne(pi => pi.Prescription).WithMany(p => p.Items).HasForeignKey(pi => pi.PrescriptionId);
        modelBuilder.Entity<PrescriptionItem>()
            .HasOne(pi => pi.Medicine).WithMany().HasForeignKey(pi => pi.MedicineId).OnDelete(DeleteBehavior.NoAction);

        // ServiceRequest
        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Examination).WithMany(e => e.ServiceRequests).HasForeignKey(sr => sr.ExaminationId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Patient).WithMany().HasForeignKey(sr => sr.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ServiceRequest>()
            .HasOne(sr => sr.Service).WithMany().HasForeignKey(sr => sr.ServiceId).OnDelete(DeleteBehavior.SetNull);

        // ServiceRequestDetail
        modelBuilder.Entity<ServiceRequestDetail>()
            .HasOne(d => d.ServiceRequest).WithMany(sr => sr.Details).HasForeignKey(d => d.ServiceRequestId);

        // Admission
        modelBuilder.Entity<Admission>()
            .HasOne(a => a.Patient).WithMany().HasForeignKey(a => a.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Admission>()
            .HasOne(a => a.MedicalRecord).WithMany().HasForeignKey(a => a.MedicalRecordId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Admission>()
            .HasOne(a => a.Department).WithMany().HasForeignKey(a => a.DepartmentId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Admission>()
            .HasOne(a => a.Bed).WithMany().HasForeignKey(a => a.BedId).OnDelete(DeleteBehavior.SetNull);

        // Discharge
        modelBuilder.Entity<Discharge>()
            .HasOne(d => d.Admission).WithMany().HasForeignKey(d => d.AdmissionId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Discharge>()
            .HasOne(d => d.Patient).WithMany().HasForeignKey(d => d.PatientId).OnDelete(DeleteBehavior.NoAction);

        // TreatmentSheet, NursingCareSheet, InfusionRecord -> Admission
        modelBuilder.Entity<TreatmentSheet>()
            .HasOne(t => t.Admission).WithMany().HasForeignKey(t => t.AdmissionId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<NursingCareSheet>()
            .HasOne(n => n.Admission).WithMany().HasForeignKey(n => n.AdmissionId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<InfusionRecord>()
            .HasOne(i => i.Admission).WithMany().HasForeignKey(i => i.AdmissionId).OnDelete(DeleteBehavior.NoAction);

        // Receipt
        modelBuilder.Entity<Receipt>()
            .HasOne(r => r.Patient).WithMany().HasForeignKey(r => r.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Receipt>()
            .HasOne(r => r.MedicalRecord).WithMany().HasForeignKey(r => r.MedicalRecordId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ReceiptDetail>()
            .HasOne(rd => rd.Receipt).WithMany(r => r.Details).HasForeignKey(rd => rd.ReceiptId);

        // ElectronicInvoice
        modelBuilder.Entity<ElectronicInvoice>()
            .HasOne(ei => ei.Receipt).WithMany().HasForeignKey(ei => ei.ReceiptId).OnDelete(DeleteBehavior.NoAction);

        // Pharmacy
        modelBuilder.Entity<StockReceipt>()
            .HasOne(sr => sr.Warehouse).WithMany().HasForeignKey(sr => sr.WarehouseId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<StockReceipt>()
            .HasOne(sr => sr.Supplier).WithMany().HasForeignKey(sr => sr.SupplierId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<StockReceiptItem>()
            .HasOne(i => i.StockReceipt).WithMany(sr => sr.Items).HasForeignKey(i => i.StockReceiptId);
        modelBuilder.Entity<StockReceiptItem>()
            .HasOne(i => i.Medicine).WithMany().HasForeignKey(i => i.MedicineId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<StockIssue>()
            .HasOne(si => si.Warehouse).WithMany().HasForeignKey(si => si.WarehouseId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<StockIssueItem>()
            .HasOne(i => i.StockIssue).WithMany(si => si.Items).HasForeignKey(i => i.StockIssueId);
        modelBuilder.Entity<StockIssueItem>()
            .HasOne(i => i.Medicine).WithMany().HasForeignKey(i => i.MedicineId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<StockBalance>()
            .HasOne(sb => sb.Warehouse).WithMany().HasForeignKey(sb => sb.WarehouseId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<StockBalance>()
            .HasOne(sb => sb.Medicine).WithMany().HasForeignKey(sb => sb.MedicineId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<StockTake>()
            .HasOne(st => st.Warehouse).WithMany().HasForeignKey(st => st.WarehouseId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<StockTakeItem>()
            .HasOne(i => i.StockTake).WithMany(st => st.Items).HasForeignKey(i => i.StockTakeId);
        modelBuilder.Entity<StockTakeItem>()
            .HasOne(i => i.Medicine).WithMany().HasForeignKey(i => i.MedicineId).OnDelete(DeleteBehavior.NoAction);

        modelBuilder.Entity<ProcurementRequest>()
            .HasOne(pr => pr.Warehouse).WithMany().HasForeignKey(pr => pr.WarehouseId).OnDelete(DeleteBehavior.NoAction);

        // Chronic Disease
        modelBuilder.Entity<ChronicDiseaseRegister>()
            .HasOne(c => c.Patient).WithMany().HasForeignKey(c => c.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ChronicDiseaseTreatment>()
            .HasOne(t => t.Register).WithMany(r => r.Treatments).HasForeignKey(t => t.RegisterId);

        // Communicable Disease
        modelBuilder.Entity<DiseaseCase>()
            .HasOne(d => d.Patient).WithMany().HasForeignKey(d => d.PatientId).OnDelete(DeleteBehavior.NoAction);

        // Reproductive Health
        modelBuilder.Entity<PrenatalRecord>()
            .HasOne(p => p.Patient).WithMany().HasForeignKey(p => p.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<DeliveryRecord>()
            .HasOne(d => d.Patient).WithMany().HasForeignKey(d => d.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<AbortionRecord>()
            .HasOne(a => a.Patient).WithMany().HasForeignKey(a => a.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<FamilyPlanningRecord>()
            .HasOne(f => f.Patient).WithMany().HasForeignKey(f => f.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<GynecologyExam>()
            .HasOne(g => g.Patient).WithMany().HasForeignKey(g => g.PatientId).OnDelete(DeleteBehavior.NoAction);

        // HIV
        modelBuilder.Entity<HivPatient>()
            .HasOne(h => h.Patient).WithMany().HasForeignKey(h => h.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<ArvTreatmentCourse>()
            .HasOne(a => a.HivPatient).WithMany(h => h.TreatmentCourses).HasForeignKey(a => a.HivPatientId);

        // Immunization
        modelBuilder.Entity<VaccinationRecord>()
            .HasOne(v => v.Subject).WithMany(s => s.Vaccinations).HasForeignKey(v => v.SubjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<VaccinationRecord>()
            .HasOne(v => v.Vaccine).WithMany().HasForeignKey(v => v.VaccineId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<VaccineStock>()
            .HasOne(vs => vs.Vaccine).WithMany().HasForeignKey(vs => vs.VaccineId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<NutritionMeasurement>()
            .HasOne(n => n.Subject).WithMany(s => s.NutritionMeasurements).HasForeignKey(n => n.SubjectId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<VitaminARecord>()
            .HasOne(v => v.Subject).WithMany().HasForeignKey(v => v.SubjectId).OnDelete(DeleteBehavior.NoAction);

        // Elderly
        modelBuilder.Entity<ElderlyInfo>()
            .HasOne(e => e.Patient).WithMany().HasForeignKey(e => e.PatientId).OnDelete(DeleteBehavior.NoAction);

        // Specialized Records
        modelBuilder.Entity<SpecializedMedicalRecord>()
            .HasOne(s => s.Patient).WithMany().HasForeignKey(s => s.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SpecializedMedicalRecord>()
            .HasOne(s => s.MedicalRecord).WithMany().HasForeignKey(s => s.MedicalRecordId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SpecializedMedicalRecord>()
            .HasOne(s => s.Doctor).WithMany().HasForeignKey(s => s.DoctorId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<SurgeryRecord>()
            .HasOne(s => s.Patient).WithMany().HasForeignKey(s => s.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<DriverLicenseExam>()
            .HasOne(d => d.Patient).WithMany().HasForeignKey(d => d.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<Referral>()
            .HasOne(r => r.Patient).WithMany().HasForeignKey(r => r.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<SickLeave>()
            .HasOne(s => s.Patient).WithMany().HasForeignKey(s => s.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<InjuryRecord>()
            .HasOne(i => i.Patient).WithMany().HasForeignKey(i => i.PatientId).OnDelete(DeleteBehavior.NoAction);

        // Tracking Books
        modelBuilder.Entity<TrackingBookEntry>()
            .HasOne(t => t.Patient).WithMany().HasForeignKey(t => t.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<TrackingBookEntry>()
            .HasOne(t => t.Doctor).WithMany().HasForeignKey(t => t.DoctorId).OnDelete(DeleteBehavior.SetNull);

        // Oxytocin Records
        modelBuilder.Entity<OxytocinRecord>()
            .HasOne(o => o.Patient).WithMany().HasForeignKey(o => o.PatientId).OnDelete(DeleteBehavior.NoAction);

        // Online Bookings
        modelBuilder.Entity<OnlineBooking>()
            .HasOne(ob => ob.Patient).WithMany().HasForeignKey(ob => ob.PatientId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<OnlineBooking>()
            .HasOne(ob => ob.Room).WithMany().HasForeignKey(ob => ob.RoomId).OnDelete(DeleteBehavior.SetNull);

        // Equipment
        modelBuilder.Entity<Equipment>()
            .HasOne(e => e.Department).WithMany().HasForeignKey(e => e.DepartmentId).OnDelete(DeleteBehavior.SetNull);
        modelBuilder.Entity<EquipmentTransfer>()
            .HasOne(et => et.Equipment).WithMany().HasForeignKey(et => et.EquipmentId).OnDelete(DeleteBehavior.NoAction);

        // Staff
        modelBuilder.Entity<Staff>()
            .HasOne(s => s.Department).WithMany().HasForeignKey(s => s.DepartmentId).OnDelete(DeleteBehavior.SetNull);

        // Food Safety
        modelBuilder.Entity<FoodViolation>()
            .HasOne(fv => fv.FoodBusiness).WithMany().HasForeignKey(fv => fv.FoodBusinessId).OnDelete(DeleteBehavior.NoAction);

        // Interop
        modelBuilder.Entity<ServicePriceConfig>()
            .HasOne(sp => sp.Service).WithMany().HasForeignKey(sp => sp.ServiceId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<DepartmentServiceConfig>()
            .HasOne(ds => ds.Department).WithMany().HasForeignKey(ds => ds.DepartmentId).OnDelete(DeleteBehavior.NoAction);
        modelBuilder.Entity<DepartmentServiceConfig>()
            .HasOne(ds => ds.Service).WithMany().HasForeignKey(ds => ds.ServiceId).OnDelete(DeleteBehavior.NoAction);

        // ---- Decimal Precision ----
        foreach (var property in modelBuilder.Model.GetEntityTypes()
            .SelectMany(t => t.GetProperties())
            .Where(p => p.ClrType == typeof(decimal) || p.ClrType == typeof(decimal?)))
        {
            property.SetPrecision(18);
            property.SetScale(2);
        }
    }

    private static void ApplySoftDeleteFilter<T>(ModelBuilder modelBuilder) where T : BaseEntity
    {
        modelBuilder.Entity<T>().HasQueryFilter(e => !e.IsDeleted);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    if (entry.Entity.Id == Guid.Empty) entry.Entity.Id = Guid.NewGuid();
                    entry.Entity.CreatedAt = DateTime.UtcNow;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = DateTime.UtcNow;
                    break;
            }
        }
        return base.SaveChangesAsync(cancellationToken);
    }
}
