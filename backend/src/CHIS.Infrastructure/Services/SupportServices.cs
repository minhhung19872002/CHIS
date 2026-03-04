using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CHIS.Infrastructure.Services;

public class EquipmentService : IEquipmentService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public EquipmentService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<EquipmentDto>> SearchAsync(EquipmentSearchDto dto)
    {
        var q = _db.Equipments.Include(e => e.Department).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(e => e.Name.Contains(dto.Keyword) || e.Code.Contains(dto.Keyword));
        if (dto.DepartmentId.HasValue) q = q.Where(e => e.DepartmentId == dto.DepartmentId);
        if (!string.IsNullOrEmpty(dto.Status)) q = q.Where(e => e.Status == dto.Status);
        if (!string.IsNullOrEmpty(dto.AssetType)) q = q.Where(e => e.AssetType == dto.AssetType);
        var total = await q.CountAsync();
        var items = await q.OrderBy(e => e.Name).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(e => new EquipmentDto { Id = e.Id, Code = e.Code, Name = e.Name, Model = e.Model, SerialNumber = e.SerialNumber, DepartmentId = e.DepartmentId, DepartmentName = e.Department != null ? e.Department.Name : null, PurchaseDate = e.PurchaseDate, PurchasePrice = e.PurchasePrice, CurrentValue = e.CurrentValue, Status = e.Status, AssetType = e.AssetType }).ToListAsync();
        return new PagedResult<EquipmentDto> { Items = items, TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<EquipmentDto> GetByIdAsync(Guid id)
    {
        var e = await _db.Equipments.Include(x => x.Department).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException();
        return new EquipmentDto { Id = e.Id, Code = e.Code, Name = e.Name, Model = e.Model, SerialNumber = e.SerialNumber, DepartmentId = e.DepartmentId, DepartmentName = e.Department?.Name, PurchaseDate = e.PurchaseDate, PurchasePrice = e.PurchasePrice, CurrentValue = e.CurrentValue, Status = e.Status, AssetType = e.AssetType };
    }

    public async Task<EquipmentDto> CreateAsync(CreateEquipmentDto dto)
    {
        var e = new Equipment { Code = dto.Code, Name = dto.Name, Model = dto.Model, SerialNumber = dto.SerialNumber, DepartmentId = dto.DepartmentId, PurchaseDate = dto.PurchaseDate, PurchasePrice = dto.PurchasePrice, CurrentValue = dto.PurchasePrice, Status = "Active", AssetType = dto.AssetType };
        await _db.Equipments.AddAsync(e); await _uow.SaveChangesAsync();
        return await GetByIdAsync(e.Id);
    }

    public async Task<EquipmentDto> UpdateAsync(Guid id, CreateEquipmentDto dto)
    {
        var e = await _db.Equipments.FindAsync(id) ?? throw new KeyNotFoundException();
        e.Name = dto.Name; e.Model = dto.Model; e.SerialNumber = dto.SerialNumber; e.DepartmentId = dto.DepartmentId; e.PurchaseDate = dto.PurchaseDate; e.PurchasePrice = dto.PurchasePrice; e.AssetType = dto.AssetType;
        await _uow.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id) { var e = await _db.Equipments.FindAsync(id) ?? throw new KeyNotFoundException(); e.IsDeleted = true; await _uow.SaveChangesAsync(); }

    public async Task<EquipmentTransferDto> TransferAsync(Guid equipmentId, Guid toDepartmentId, string? notes)
    {
        var e = await _db.Equipments.FindAsync(equipmentId) ?? throw new KeyNotFoundException();
        var fromDeptId = e.DepartmentId ?? Guid.Empty;
        e.DepartmentId = toDepartmentId;
        var transfer = new EquipmentTransfer { EquipmentId = equipmentId, FromDepartmentId = fromDeptId, ToDepartmentId = toDepartmentId, TransferDate = DateTime.UtcNow, Notes = notes };
        await _db.EquipmentTransfers.AddAsync(transfer); await _uow.SaveChangesAsync();
        return new EquipmentTransferDto { Id = transfer.Id, EquipmentId = equipmentId, FromDepartmentId = fromDeptId, ToDepartmentId = toDepartmentId, TransferDate = transfer.TransferDate, Notes = notes };
    }

    public async Task<List<EquipmentTransferDto>> GetTransferHistoryAsync(Guid equipmentId)
        => await _db.EquipmentTransfers.Where(t => t.EquipmentId == equipmentId).OrderByDescending(t => t.TransferDate)
            .Select(t => new EquipmentTransferDto { Id = t.Id, EquipmentId = t.EquipmentId, FromDepartmentId = t.FromDepartmentId, ToDepartmentId = t.ToDepartmentId, TransferDate = t.TransferDate, Notes = t.Notes }).ToListAsync();
}

public class StaffService : IStaffService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public StaffService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<StaffDto>> SearchAsync(StaffSearchDto dto)
    {
        var q = _db.Staffs.Include(s => s.Department).Where(s => s.IsActive).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(s => s.FullName.Contains(dto.Keyword) || s.StaffCode.Contains(dto.Keyword));
        if (!string.IsNullOrEmpty(dto.Position)) q = q.Where(s => s.Position == dto.Position);
        if (dto.DepartmentId.HasValue) q = q.Where(s => s.DepartmentId == dto.DepartmentId);
        var total = await q.CountAsync();
        var items = await q.OrderBy(s => s.FullName).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(s => new StaffDto { Id = s.Id, StaffCode = s.StaffCode, FullName = s.FullName, DateOfBirth = s.DateOfBirth, Gender = s.Gender, Position = s.Position, Qualification = s.Qualification, Specialty = s.Specialty, PracticeLicenseNumber = s.PracticeLicenseNumber, PracticeLicenseExpiry = s.PracticeLicenseExpiry, Phone = s.Phone, Email = s.Email, DepartmentId = s.DepartmentId, DepartmentName = s.Department != null ? s.Department.Name : null, IsActive = s.IsActive }).ToListAsync();
        return new PagedResult<StaffDto> { Items = items, TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<StaffDto> GetByIdAsync(Guid id) { var s = await _db.Staffs.Include(x => x.Department).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException(); return new StaffDto { Id = s.Id, StaffCode = s.StaffCode, FullName = s.FullName, Position = s.Position, Qualification = s.Qualification, Specialty = s.Specialty, DepartmentName = s.Department?.Name, IsActive = s.IsActive }; }

    public async Task<StaffDto> CreateAsync(CreateStaffDto dto)
    {
        var count = await _db.Staffs.CountAsync() + 1;
        var s = new Staff { StaffCode = $"NV{count:D6}", FullName = dto.FullName, DateOfBirth = dto.DateOfBirth, Gender = dto.Gender, Position = dto.Position, Qualification = dto.Qualification, Specialty = dto.Specialty, PracticeLicenseNumber = dto.PracticeLicenseNumber, PracticeLicenseExpiry = dto.PracticeLicenseExpiry, Phone = dto.Phone, Email = dto.Email, DepartmentId = dto.DepartmentId, IsActive = true };
        await _db.Staffs.AddAsync(s); await _uow.SaveChangesAsync();
        return await GetByIdAsync(s.Id);
    }

    public async Task<StaffDto> UpdateAsync(Guid id, CreateStaffDto dto)
    {
        var s = await _db.Staffs.FindAsync(id) ?? throw new KeyNotFoundException();
        s.FullName = dto.FullName; s.DateOfBirth = dto.DateOfBirth; s.Gender = dto.Gender; s.Position = dto.Position; s.Qualification = dto.Qualification; s.Specialty = dto.Specialty; s.Phone = dto.Phone; s.Email = dto.Email; s.DepartmentId = dto.DepartmentId;
        await _uow.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task DeleteAsync(Guid id) { var s = await _db.Staffs.FindAsync(id) ?? throw new KeyNotFoundException(); s.IsDeleted = true; await _uow.SaveChangesAsync(); }

    public async Task<List<CollaboratorDto>> GetCollaboratorsAsync(Guid? facilityId = null)
    {
        var q = _db.Collaborators.Where(c => c.IsActive).AsQueryable();
        if (facilityId.HasValue) q = q.Where(c => c.FacilityId == facilityId);
        return await q.OrderBy(c => c.FullName).Select(c => new CollaboratorDto { Id = c.Id, Code = c.Code, FullName = c.FullName, Phone = c.Phone, Address = c.Address, Village = c.Village, IsActive = c.IsActive }).ToListAsync();
    }

    public async Task<CollaboratorDto> CreateCollaboratorAsync(CollaboratorDto dto)
    {
        var count = await _db.Collaborators.CountAsync() + 1;
        var c = new Collaborator { Code = $"CTV{count:D4}", FullName = dto.FullName, Phone = dto.Phone, Address = dto.Address, Village = dto.Village, IsActive = true };
        await _db.Collaborators.AddAsync(c); await _uow.SaveChangesAsync();
        dto.Id = c.Id; dto.Code = c.Code; return dto;
    }
}

public class FoodSafetyService : IFoodSafetyService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public FoodSafetyService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<FoodBusinessDto>> SearchBusinessesAsync(FoodSafetySearchDto dto)
    {
        var q = _db.FoodBusinesses.AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(f => f.BusinessName.Contains(dto.Keyword));
        if (!string.IsNullOrEmpty(dto.BusinessType)) q = q.Where(f => f.BusinessType == dto.BusinessType);
        var total = await q.CountAsync();
        var items = await q.OrderBy(f => f.BusinessName).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(f => new FoodBusinessDto { Id = f.Id, BusinessName = f.BusinessName, Address = f.Address, OwnerName = f.OwnerName, Phone = f.Phone, BusinessType = f.BusinessType, LicenseNumber = f.LicenseNumber, LicenseExpiry = f.LicenseExpiry, Status = f.Status }).ToListAsync();
        return new PagedResult<FoodBusinessDto> { Items = items, TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<FoodBusinessDto> CreateBusinessAsync(CreateFoodBusinessDto dto)
    {
        var f = new FoodBusiness { BusinessName = dto.BusinessName, Address = dto.Address, OwnerName = dto.OwnerName, Phone = dto.Phone, BusinessType = dto.BusinessType, LicenseNumber = dto.LicenseNumber, LicenseExpiry = dto.LicenseExpiry, Status = "Active" };
        await _db.FoodBusinesses.AddAsync(f); await _uow.SaveChangesAsync();
        return new FoodBusinessDto { Id = f.Id, BusinessName = f.BusinessName, Address = f.Address };
    }

    public async Task<FoodBusinessDto> UpdateBusinessAsync(Guid id, CreateFoodBusinessDto dto)
    {
        var f = await _db.FoodBusinesses.FindAsync(id) ?? throw new KeyNotFoundException();
        f.BusinessName = dto.BusinessName; f.Address = dto.Address; f.OwnerName = dto.OwnerName; f.Phone = dto.Phone; f.BusinessType = dto.BusinessType; f.LicenseNumber = dto.LicenseNumber; f.LicenseExpiry = dto.LicenseExpiry;
        await _uow.SaveChangesAsync();
        return new FoodBusinessDto { Id = f.Id, BusinessName = f.BusinessName };
    }

    public async Task<List<FoodViolationDto>> GetViolationsAsync(Guid? businessId = null)
    {
        var q = _db.FoodViolations.Include(v => v.FoodBusiness).AsQueryable();
        if (businessId.HasValue) q = q.Where(v => v.FoodBusinessId == businessId);
        return await q.OrderByDescending(v => v.ViolationDate).Select(v => new FoodViolationDto { Id = v.Id, FoodBusinessId = v.FoodBusinessId, BusinessName = v.FoodBusiness.BusinessName, ViolationDate = v.ViolationDate, ViolationType = v.ViolationType, Description = v.Description, Penalty = v.Penalty }).ToListAsync();
    }

    public async Task<FoodViolationDto> CreateViolationAsync(Guid businessId, FoodViolationDto dto)
    {
        var v = new FoodViolation { FoodBusinessId = businessId, ViolationDate = DateTime.UtcNow, ViolationType = dto.ViolationType, Description = dto.Description, Penalty = dto.Penalty };
        await _db.FoodViolations.AddAsync(v); await _uow.SaveChangesAsync();
        dto.Id = v.Id; return dto;
    }

    public async Task<List<FoodPoisoningDto>> GetPoisoningCasesAsync(DateTime? fromDate = null, DateTime? toDate = null)
    {
        var q = _db.FoodPoisonings.AsQueryable();
        if (fromDate.HasValue) q = q.Where(f => f.IncidentDate >= fromDate);
        if (toDate.HasValue) q = q.Where(f => f.IncidentDate <= toDate);
        return await q.OrderByDescending(f => f.IncidentDate).Select(f => new FoodPoisoningDto { Id = f.Id, IncidentDate = f.IncidentDate, Location = f.Location, AffectedCount = f.AffectedCount, HospitalizedCount = f.HospitalizedCount, DeathCount = f.DeathCount, SuspectedFood = f.SuspectedFood, CauseAgent = f.CauseAgent, Description = f.Description }).ToListAsync();
    }

    public async Task<FoodPoisoningDto> ReportPoisoningAsync(FoodPoisoningDto dto)
    {
        var f = new FoodPoisoning { IncidentDate = dto.IncidentDate, Location = dto.Location, AffectedCount = dto.AffectedCount, HospitalizedCount = dto.HospitalizedCount, DeathCount = dto.DeathCount, SuspectedFood = dto.SuspectedFood, CauseAgent = dto.CauseAgent, Description = dto.Description };
        await _db.FoodPoisonings.AddAsync(f); await _uow.SaveChangesAsync();
        dto.Id = f.Id; return dto;
    }
}

public class EnvironmentalHealthService : IEnvironmentalHealthService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public EnvironmentalHealthService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<List<SanitationFacilityDto>> GetSanitationFacilitiesAsync(string? village = null)
    {
        var q = _db.SanitationFacilities.AsQueryable();
        if (!string.IsNullOrEmpty(village)) q = q.Where(s => s.Village == village);
        return await q.Select(s => new SanitationFacilityDto { Id = s.Id, FacilityType = s.FacilityType, Address = s.Address, Village = s.Village, Status = s.Status, Notes = s.Notes }).ToListAsync();
    }

    public async Task<SanitationFacilityDto> CreateAsync(SanitationFacilityDto dto)
    {
        var s = new SanitationFacility { FacilityType = dto.FacilityType, Address = dto.Address, Village = dto.Village, Status = dto.Status, Notes = dto.Notes };
        await _db.SanitationFacilities.AddAsync(s); await _uow.SaveChangesAsync();
        dto.Id = s.Id; return dto;
    }

    public async Task<SanitationFacilityDto> UpdateAsync(Guid id, SanitationFacilityDto dto)
    {
        var s = await _db.SanitationFacilities.FindAsync(id) ?? throw new KeyNotFoundException();
        s.FacilityType = dto.FacilityType; s.Address = dto.Address; s.Village = dto.Village; s.Status = dto.Status; s.Notes = dto.Notes;
        await _uow.SaveChangesAsync();
        dto.Id = id; return dto;
    }

    public async Task DeleteAsync(Guid id) { var s = await _db.SanitationFacilities.FindAsync(id) ?? throw new KeyNotFoundException(); s.IsDeleted = true; await _uow.SaveChangesAsync(); }
}

public class FinanceService : IFinanceService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public FinanceService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<FinanceVoucherDto>> SearchVouchersAsync(FinanceSearchDto dto)
    {
        var q = _db.FinanceVouchers.AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(v => v.VoucherCode.Contains(dto.Keyword) || (v.Description != null && v.Description.Contains(dto.Keyword)));
        if (!string.IsNullOrEmpty(dto.VoucherType)) q = q.Where(v => v.VoucherType == dto.VoucherType);
        if (dto.FromDate.HasValue) q = q.Where(v => v.VoucherDate >= dto.FromDate);
        if (dto.ToDate.HasValue) q = q.Where(v => v.VoucherDate <= dto.ToDate);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(v => v.VoucherDate).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(v => new FinanceVoucherDto { Id = v.Id, VoucherCode = v.VoucherCode, VoucherType = v.VoucherType, VoucherDate = v.VoucherDate, Amount = v.Amount, Description = v.Description, Category = v.Category, Status = v.Status }).ToListAsync();
        return new PagedResult<FinanceVoucherDto> { Items = items, TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<FinanceVoucherDto> CreateVoucherAsync(CreateFinanceVoucherDto dto)
    {
        var count = await _db.FinanceVouchers.CountAsync() + 1;
        var prefix = dto.VoucherType == "PhieuThu" ? "PT" : "PC";
        var v = new FinanceVoucher { VoucherCode = $"{prefix}{DateTime.Now:yyMMdd}{count:D4}", VoucherType = dto.VoucherType, VoucherDate = DateTime.UtcNow, Amount = dto.Amount, Description = dto.Description, Category = dto.Category, Status = 0 };
        await _db.FinanceVouchers.AddAsync(v); await _uow.SaveChangesAsync();
        return new FinanceVoucherDto { Id = v.Id, VoucherCode = v.VoucherCode, VoucherType = v.VoucherType, VoucherDate = v.VoucherDate, Amount = v.Amount, Description = v.Description, Status = v.Status };
    }

    public async Task ApproveVoucherAsync(Guid id) { var v = await _db.FinanceVouchers.FindAsync(id) ?? throw new KeyNotFoundException(); v.Status = 1; await _uow.SaveChangesAsync(); }
    public async Task CancelVoucherAsync(Guid id) { var v = await _db.FinanceVouchers.FindAsync(id) ?? throw new KeyNotFoundException(); v.Status = 2; await _uow.SaveChangesAsync(); }

    public async Task<FinanceVoucherDto> GetBalanceAsync(int year, int month, Guid? facilityId = null)
    {
        var receipts = await _db.FinanceVouchers.Where(v => v.VoucherDate.Year == year && v.VoucherDate.Month == month && v.Status == 1 && v.VoucherType == "PhieuThu").SumAsync(v => v.Amount);
        var payments = await _db.FinanceVouchers.Where(v => v.VoucherDate.Year == year && v.VoucherDate.Month == month && v.Status == 1 && v.VoucherType == "PhieuChi").SumAsync(v => v.Amount);
        return new FinanceVoucherDto { VoucherType = "Balance", Amount = receipts - payments, Description = $"Balance for {month}/{year}" };
    }
}

public class ReportService : IReportService
{
    private readonly CHISDbContext _db;
    public ReportService(CHISDbContext db) { _db = db; }

    // ---- Helper: resolve year/month from filter ----
    private static int GetYear(ReportFilterDto f) => f.Year ?? DateTime.UtcNow.Year;
    private static int GetMonth(ReportFilterDto f) => f.Month ?? DateTime.UtcNow.Month;
    private static int GetQuarter(ReportFilterDto f) => f.Quarter ?? ((DateTime.UtcNow.Month - 1) / 3 + 1);
    private static (DateTime from, DateTime to) QuarterRange(int year, int quarter)
    {
        var m = (quarter - 1) * 3 + 1;
        return (new DateTime(year, m, 1), new DateTime(year, m, 1).AddMonths(3).AddDays(-1));
    }

    // ================================================================
    // Dashboard & basic statistics (existing)
    // ================================================================

    public async Task<DashboardDto> GetDashboardAsync(Guid? facilityId = null)
    {
        var today = DateTime.UtcNow.Date;
        return new DashboardDto
        {
            TodayPatients = await _db.Patients.CountAsync(p => p.CreatedAt.Date == today),
            TodayExaminations = await _db.Examinations.CountAsync(e => e.ExamDate.Date == today),
            ActiveAdmissions = await _db.Admissions.CountAsync(a => a.Status == 0),
            TodayRevenue = await _db.Receipts.Where(r => r.ReceiptDate.Date == today && r.Status == 1).SumAsync(r => r.TotalAmount),
            PendingPrescriptions = await _db.Prescriptions.CountAsync(p => p.Status == 1 && !p.IsDispensed),
            PendingLabRequests = await _db.ServiceRequests.CountAsync(s => s.ServiceType == "XetNghiem" && s.Status == 0)
        };
    }

    public async Task<MonthlyStatisticsDto> GetMonthlyStatisticsAsync(int year, int month, Guid? facilityId = null)
    {
        return new MonthlyStatisticsDto
        {
            Year = year, Month = month,
            TotalExaminations = await _db.Examinations.CountAsync(e => e.ExamDate.Year == year && e.ExamDate.Month == month),
            TotalAdmissions = await _db.Admissions.CountAsync(a => a.AdmissionDate.Year == year && a.AdmissionDate.Month == month),
            TotalDischarges = await _db.Discharges.CountAsync(d => d.DischargeDate.Year == year && d.DischargeDate.Month == month),
            TotalBirths = await _db.BirthCertificates.CountAsync(b => b.DateOfBirth.Year == year && b.DateOfBirth.Month == month),
            TotalDeaths = await _db.DeathCertificates.CountAsync(d => d.DateOfDeath.Year == year && d.DateOfDeath.Month == month),
            TotalRevenue = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month && r.Status == 1).SumAsync(r => r.TotalAmount),
            BhytRevenue = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month && r.Status == 1).SumAsync(r => r.BhytAmount),
            FeeRevenue = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month && r.Status == 1).SumAsync(r => r.PatientAmount)
        };
    }

    public async Task<List<DiseaseStatisticsDto>> GetDiseaseStatisticsAsync(DateTime fromDate, DateTime toDate, Guid? facilityId = null)
    {
        return await _db.Examinations.Where(e => e.ExamDate >= fromDate && e.ExamDate <= toDate && e.MainIcdCode != null)
            .GroupBy(e => new { e.MainIcdCode, e.MainDiagnosis })
            .Select(g => new DiseaseStatisticsDto { IcdCode = g.Key.MainIcdCode, DiseaseName = g.Key.MainDiagnosis, CaseCount = g.Count() })
            .OrderByDescending(d => d.CaseCount).Take(20).ToListAsync();
    }

    public async Task<List<ImmunizationCoverageDto>> GetImmunizationCoverageAsync(int year, Guid? facilityId = null)
    {
        var vaccines = await _db.Vaccines.Where(v => v.IsActive).ToListAsync();
        var result = new List<ImmunizationCoverageDto>();
        foreach (var vaccine in vaccines)
        {
            var vaccinated = await _db.VaccinationRecords.CountAsync(v => v.VaccineId == vaccine.Id && v.VaccinationDate.Year == year);
            result.Add(new ImmunizationCoverageDto { VaccineName = vaccine.Name, VaccinatedCount = vaccinated });
        }
        return result;
    }

    // ================================================================
    // BCX Reports (tuyen xa, Bieu 1-10)
    // ================================================================

    public async Task<object> GetBcxReportAsync(int reportNumber, ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var facility = filter.FacilityId.HasValue
            ? await _db.Facilities.FindAsync(filter.FacilityId)
            : await _db.Facilities.FirstOrDefaultAsync();
        var facilityName = facility?.Name ?? "Tram Y te xa";

        switch (reportNumber)
        {
            case 1: return await BuildBcxReport1(year, facilityName, filter.FacilityId);
            case 2: return await BuildBcxReport2(year, facilityName, filter.FacilityId);
            case 3: return await BuildBcxReport3(year, facilityName, filter.FacilityId);
            case 4: return await BuildBcxReport4(year, facilityName, filter.FacilityId);
            case 5: return await BuildBcxReport5(year, facilityName, filter.FacilityId);
            case 6: return await BuildBcxReport6(year, facilityName, filter.FacilityId);
            case 7: return await BuildBcxReport7(year, facilityName, filter.FacilityId);
            case 8: return await BuildBcxReport8(year, facilityName, filter.FacilityId);
            case 9: return await BuildBcxReport9(year, facilityName, filter.FacilityId);
            case 10: return await BuildBcxReport10(year, facilityName, filter.FacilityId);
            default: return new { Error = $"BCX report number {reportNumber} not found (valid: 1-10)" };
        }
    }

    private async Task<BcxReport1Dto> BuildBcxReport1(int year, string facilityName, Guid? facilityId)
    {
        var totalPop = await _db.Patients.CountAsync();
        var male = await _db.Patients.CountAsync(p => p.Gender == 1);
        var female = await _db.Patients.CountAsync(p => p.Gender == 2);
        var households = await _db.Households.CountAsync();
        var births = await _db.BirthCertificates.CountAsync(b => b.DateOfBirth.Year == year);
        var deaths = await _db.DeathCertificates.CountAsync(d => d.DateOfDeath.Year == year);
        var infantDeaths = await _db.DeathCertificates.CountAsync(d => d.DateOfDeath.Year == year && d.Age.HasValue && d.Age < 1);
        var under5Deaths = await _db.DeathCertificates.CountAsync(d => d.DateOfDeath.Year == year && d.Age.HasValue && d.Age < 5);
        var maternalDeaths = await _db.DeathCertificates.CountAsync(d => d.DateOfDeath.Year == year && d.Gender == 2 && d.Age >= 15 && d.Age <= 49);

        var villages = await _db.Households.Where(h => h.Village != null)
            .GroupBy(h => h.Village)
            .Select(g => new BcxReport1VillageDto
            {
                VillageName = g.Key, Households = g.Count(),
                Population = g.Sum(h => h.Members.Count)
            }).ToListAsync();

        return new BcxReport1Dto
        {
            Year = year, FacilityName = facilityName,
            TotalPopulation = totalPop, MalePopulation = male, FemalePopulation = female,
            TotalHouseholds = households,
            TotalBirths = births, LiveBirths = births, TotalDeaths = deaths,
            InfantDeaths = infantDeaths, Under5Deaths = under5Deaths, MaternalDeaths = maternalDeaths,
            BirthRate = totalPop > 0 ? Math.Round((decimal)births / totalPop * 1000, 2) : 0,
            DeathRate = totalPop > 0 ? Math.Round((decimal)deaths / totalPop * 1000, 2) : 0,
            InfantMortalityRate = births > 0 ? Math.Round((decimal)infantDeaths / births * 1000, 2) : 0,
            Villages = villages
        };
    }

    private async Task<BcxReport2Dto> BuildBcxReport2(int year, string facilityName, Guid? facilityId)
    {
        var receipts = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.Status == 1).ToListAsync();
        var bhytRev = receipts.Sum(r => r.BhytAmount);
        var feeRev = receipts.Sum(r => r.PatientAmount);
        var totalRev = receipts.Sum(r => r.TotalAmount);

        var expenses = await _db.FinanceVouchers.Where(v => v.VoucherDate.Year == year && v.VoucherType == "PhieuChi" && v.Status == 1).ToListAsync();
        var medExpense = expenses.Where(e => e.Category == "Thuoc").Sum(e => e.Amount);
        var equipExpense = expenses.Where(e => e.Category == "ThietBi").Sum(e => e.Amount);
        var opExpense = expenses.Where(e => e.Category == "HoatDong").Sum(e => e.Amount);
        var personnelExpense = expenses.Where(e => e.Category == "NhanSu").Sum(e => e.Amount);
        var otherExpense = expenses.Where(e => e.Category != "Thuoc" && e.Category != "ThietBi" && e.Category != "HoatDong" && e.Category != "NhanSu").Sum(e => e.Amount);

        return new BcxReport2Dto
        {
            Year = year, FacilityName = facilityName,
            TotalBudget = totalRev, InsuranceBudget = bhytRev, FeeRevenue = feeRev,
            MedicineExpense = medExpense, EquipmentExpense = equipExpense,
            OperatingExpense = opExpense, PersonnelExpense = personnelExpense, OtherExpense = otherExpense,
            Balance = totalRev - expenses.Sum(e => e.Amount)
        };
    }

    private async Task<BcxReport3Dto> BuildBcxReport3(int year, string facilityName, Guid? facilityId)
    {
        var staff = await _db.Staffs.Where(s => s.IsActive).ToListAsync();
        var collabs = await _db.Collaborators.CountAsync(c => c.IsActive);

        var staffDetails = staff.GroupBy(s => new { s.Position, s.Qualification })
            .Select(g => new BcxReport3StaffDto { Position = g.Key.Position, Qualification = g.Key.Qualification, Count = g.Count() }).ToList();

        return new BcxReport3Dto
        {
            Year = year, FacilityName = facilityName,
            TotalStaff = staff.Count,
            Doctors = staff.Count(s => s.Position == "BacSi"),
            Pharmacists = staff.Count(s => s.Position == "DuocSi"),
            Nurses = staff.Count(s => s.Position == "DieuDuong"),
            Midwives = staff.Count(s => s.Position == "HoSinh"),
            Technicians = staff.Count(s => s.Position == "KyThuatVien"),
            TraditionalMedicine = staff.Count(s => s.Position == "YHCT"),
            Collaborators = collabs,
            StaffDetails = staffDetails
        };
    }

    private async Task<BcxReport4Dto> BuildBcxReport4(int year, string facilityName, Guid? facilityId)
    {
        var rooms = await _db.Rooms.CountAsync(r => r.IsActive);
        var examRooms = await _db.Rooms.CountAsync(r => r.IsActive && r.RoomType == "Kham");
        var beds = await _db.Beds.CountAsync();
        var totalEquip = await _db.Equipments.CountAsync();
        var functional = await _db.Equipments.CountAsync(e => e.Status == "Active");
        var broken = await _db.Equipments.CountAsync(e => e.Status == "Broken");

        var equipList = await _db.Equipments.GroupBy(e => new { e.Name, e.Status })
            .Select(g => new BcxReport4EquipmentDto { Name = g.Key.Name, Quantity = g.Count(), Status = g.Key.Status })
            .Take(50).ToListAsync();

        return new BcxReport4Dto
        {
            Year = year, FacilityName = facilityName,
            TotalRooms = rooms, ExamRooms = examRooms, InpatientBeds = beds,
            TotalEquipment = totalEquip, FunctionalEquipment = functional, BrokenEquipment = broken,
            HasWater = true, HasElectricity = true, HasPhone = true, HasInternet = true,
            EquipmentList = equipList
        };
    }

    private async Task<BcxReport5Dto> BuildBcxReport5(int year, string facilityName, Guid? facilityId)
    {
        var exams = _db.Examinations.Where(e => e.ExamDate.Year == year);
        var total = await exams.CountAsync();
        var admissions = await _db.Admissions.CountAsync(a => a.AdmissionDate.Year == year);
        var referrals = await _db.Referrals.CountAsync(r => r.ReferralDate.Year == year);
        var surgeries = await _db.SurgeryRecords.CountAsync(s => s.ProcedureDate.Year == year);
        var rxCount = await _db.Prescriptions.CountAsync(p => p.PrescriptionDate.Year == year);
        var insVisits = await _db.Examinations.CountAsync(e => e.ExamDate.Year == year && e.Patient.InsuranceNumber != null);

        var monthlyData = new List<BcxReport5MonthDto>();
        for (int m = 1; m <= 12; m++)
        {
            var mv = await _db.Examinations.CountAsync(e => e.ExamDate.Year == year && e.ExamDate.Month == m);
            var ma = await _db.Admissions.CountAsync(a => a.AdmissionDate.Year == year && a.AdmissionDate.Month == m);
            monthlyData.Add(new BcxReport5MonthDto { Month = m, Visits = mv, Outpatient = mv, Inpatient = ma });
        }

        return new BcxReport5Dto
        {
            Year = year, FacilityName = facilityName,
            TotalVisits = total, OutpatientVisits = total - admissions, InpatientAdmissions = admissions,
            InsuranceVisits = insVisits, ReferralUp = referrals,
            SurgeryMinor = surgeries, TotalPrescriptions = rxCount,
            MonthlyData = monthlyData
        };
    }

    private async Task<BcxReport6Dto> BuildBcxReport6(int year, string facilityName, Guid? facilityId)
    {
        var prenatal = await _db.PrenatalRecords.CountAsync(p => p.ExamDate.Year == year);
        var deliveries = await _db.DeliveryRecords.CountAsync(d => d.DeliveryDate.Year == year);
        var caesarean = await _db.DeliveryRecords.CountAsync(d => d.DeliveryDate.Year == year && d.DeliveryType == "CaesareanSection");
        var abortions = await _db.AbortionRecords.CountAsync(a => a.ProcedureDate.Year == year);
        var familyPlanning = await _db.FamilyPlanningRecords.CountAsync(f => f.RecordDate.Year == year);
        var gyno = await _db.GynecologyExams.CountAsync(g => g.ExamDate.Year == year);
        var iud = await _db.FamilyPlanningRecords.CountAsync(f => f.RecordDate.Year == year && f.Method == "IUD");
        var pill = await _db.FamilyPlanningRecords.CountAsync(f => f.RecordDate.Year == year && f.Method == "Pill");
        var injection = await _db.FamilyPlanningRecords.CountAsync(f => f.RecordDate.Year == year && f.Method == "Injection");
        var condom = await _db.FamilyPlanningRecords.CountAsync(f => f.RecordDate.Year == year && f.Method == "Condom");

        return new BcxReport6Dto
        {
            Year = year, FacilityName = facilityName,
            PrenatalVisits = prenatal, HospitalDeliveries = deliveries,
            CaesareanDeliveries = caesarean, Abortions = abortions,
            IUDInsertion = iud, ContraceptivePills = pill, ContraceptiveInjections = injection,
            Condoms = condom, GynecologyExams = gyno
        };
    }

    private async Task<BcxReport7Dto> BuildBcxReport7(int year, string facilityName, Guid? facilityId)
    {
        var vaccines = await _db.Vaccines.Where(v => v.IsActive).ToListAsync();
        var vaccineData = new List<BcxReport7VaccineDto>();
        foreach (var v in vaccines)
        {
            var records = await _db.VaccinationRecords.Where(r => r.VaccineId == v.Id && r.VaccinationDate.Year == year).ToListAsync();
            vaccineData.Add(new BcxReport7VaccineDto
            {
                VaccineName = v.Name, AntigenName = v.AntigenList,
                Dose1 = records.Count(r => r.DoseNumber == 1),
                Dose2 = records.Count(r => r.DoseNumber == 2),
                Dose3 = records.Count(r => r.DoseNumber == 3),
                Dose4 = records.Count(r => r.DoseNumber == 4),
                Booster = records.Count(r => r.DoseNumber >= 5)
            });
        }
        var vitA1 = await _db.VitaminARecords.CountAsync(v => v.GivenDate.Year == year && v.DoseType == "Under1");
        var vitA5 = await _db.VitaminARecords.CountAsync(v => v.GivenDate.Year == year && v.DoseType == "1To5");
        var adverse = await _db.VaccinationRecords.CountAsync(v => v.VaccinationDate.Year == year && v.Reaction != null);

        return new BcxReport7Dto
        {
            Year = year, FacilityName = facilityName,
            VaccineData = vaccineData, VitaminAUnder1 = vitA1, VitaminA1To5 = vitA5,
            VaccineAdverseReactions = adverse
        };
    }

    private async Task<BcxReport8Dto> BuildBcxReport8(int year, string facilityName, Guid? facilityId)
    {
        var diseases = await _db.DiseaseCases.Where(d => d.OnsetDate.Year == year)
            .GroupBy(d => new { d.DiseaseName, d.IcdCode })
            .Select(g => new BcxReport8DiseaseDto
            {
                DiseaseName = g.Key.DiseaseName, IcdCode = g.Key.IcdCode,
                Cases = g.Count(), Deaths = g.Count(x => x.Outcome == "TuVong")
            }).OrderByDescending(d => d.Cases).ToListAsync();

        return new BcxReport8Dto
        {
            Year = year, FacilityName = facilityName, Diseases = diseases,
            TotalCases = diseases.Sum(d => d.Cases), TotalDeaths = diseases.Sum(d => d.Deaths)
        };
    }

    private async Task<BcxReport9Dto> BuildBcxReport9(int year, string facilityName, Guid? facilityId)
    {
        var chronic = await _db.ChronicDiseaseRegisters.Where(c => c.RegisterDate.Year <= year).ToListAsync();
        var hypertension = chronic.Where(c => c.DiseaseType == "TangHuyetAp").ToList();
        var diabetes = chronic.Where(c => c.DiseaseType == "DaiThaoDuong").ToList();
        var asthma = chronic.Where(c => c.DiseaseType == "HenPheQuan").ToList();
        var copd = chronic.Where(c => c.DiseaseType == "COPD").ToList();
        var mental = chronic.Where(c => c.DiseaseType == "TamThan").ToList();
        var epilepsy = chronic.Where(c => c.DiseaseType == "DongKinh").ToList();
        var cancer = chronic.Where(c => c.DiseaseType == "UngThu").ToList();
        var newCases = chronic.Count(c => c.RegisterDate.Year == year);

        var details = chronic.GroupBy(c => c.DiseaseType).Select(g => new BcxReport9DetailDto
        {
            DiseaseType = g.Key,
            TotalRegistered = g.Count(),
            NewCases = g.Count(x => x.RegisterDate.Year == year),
            Managed = g.Count(x => x.Status == "DangQuanLy"),
            Controlled = g.Count(x => x.Status == "KiemSoatTot")
        }).ToList();

        return new BcxReport9Dto
        {
            Year = year, FacilityName = facilityName,
            TotalHypertension = hypertension.Count, TotalDiabetes = diabetes.Count,
            TotalAsthma = asthma.Count, TotalCOPD = copd.Count,
            TotalMentalHealth = mental.Count, TotalEpilepsy = epilepsy.Count,
            TotalCancer = cancer.Count, NewChronicCases = newCases,
            ManagedHypertension = hypertension.Count(h => h.Status == "DangQuanLy"),
            ManagedDiabetes = diabetes.Count(d => d.Status == "DangQuanLy"),
            ManagedMentalHealth = mental.Count(m => m.Status == "DangQuanLy"),
            Details = details
        };
    }

    private async Task<BcxReport10Dto> BuildBcxReport10(int year, string facilityName, Guid? facilityId)
    {
        var campaigns = await _db.HealthCampaigns.Where(c => c.StartDate.Year == year).ToListAsync();
        var households = await _db.Households.CountAsync();
        var sanitation = await _db.SanitationFacilities.ToListAsync();
        var foodBiz = await _db.FoodBusinesses.CountAsync();
        var violations = await _db.FoodViolations.CountAsync(v => v.ViolationDate.Year == year);
        var poisoning = await _db.FoodPoisonings.Where(f => f.IncidentDate.Year == year).ToListAsync();
        var latrines = sanitation.Count(s => s.FacilityType == "NhaTieu" && s.Status == "HopVeSinh");

        return new BcxReport10Dto
        {
            Year = year, FacilityName = facilityName,
            HealthCampaigns = campaigns.Count,
            CampaignParticipants = campaigns.Sum(c => c.Participants ?? 0),
            TotalHouseholds = households,
            HouseholdsWithLatrine = latrines,
            FoodBusinesses = foodBiz, FoodViolations = violations,
            FoodPoisoningCases = poisoning.Count,
            FoodPoisoningVictims = poisoning.Sum(p => p.AffectedCount ?? 0)
        };
    }

    // ================================================================
    // BCH Reports (tuyen huyen, Bieu 1-16)
    // ================================================================

    public async Task<object> GetBchReportAsync(int reportNumber, ReportFilterDto filter)
    {
        var year = GetYear(filter);

        switch (reportNumber)
        {
            case 1:
                var pop = await _db.Patients.CountAsync();
                var births = await _db.BirthCertificates.CountAsync(b => b.DateOfBirth.Year == year);
                var deaths = await _db.DeathCertificates.CountAsync(d => d.DateOfDeath.Year == year);
                var facilities = await _db.Facilities.Select(f => new BchReport1FacilityDto
                {
                    FacilityId = f.Id, FacilityName = f.Name,
                    Population = f.Departments.SelectMany(d => d.Rooms).Count()
                }).ToListAsync();
                return new BchReport1Dto { Year = year, TotalPopulation = pop, TotalBirths = births, TotalDeaths = deaths, Facilities = facilities };

            case 2:
                var staff = await _db.Staffs.Where(s => s.IsActive).ToListAsync();
                var facilityStaff = await _db.Facilities.Select(f => new BchReport2FacilityDto
                {
                    FacilityName = f.Name,
                    Staff = _db.Staffs.Count(s => s.FacilityId == f.Id && s.IsActive),
                    Doctors = _db.Staffs.Count(s => s.FacilityId == f.Id && s.Position == "BacSi"),
                    Nurses = _db.Staffs.Count(s => s.FacilityId == f.Id && s.Position == "DieuDuong")
                }).ToListAsync();
                return new BchReport2Dto
                {
                    Year = year, TotalStaff = staff.Count,
                    Doctors = staff.Count(s => s.Position == "BacSi"),
                    Nurses = staff.Count(s => s.Position == "DieuDuong"),
                    Pharmacists = staff.Count(s => s.Position == "DuocSi"),
                    Midwives = staff.Count(s => s.Position == "HoSinh"),
                    FacilityBreakdown = facilityStaff
                };

            case 3:
                var totalVisits = await _db.Examinations.CountAsync(e => e.ExamDate.Year == year);
                var totalAdm = await _db.Admissions.CountAsync(a => a.AdmissionDate.Year == year);
                var totalRef = await _db.Referrals.CountAsync(r => r.ReferralDate.Year == year);
                var totalSurg = await _db.SurgeryRecords.CountAsync(s => s.ProcedureDate.Year == year);
                return new BchReport3Dto
                {
                    Year = year, TotalVisits = totalVisits, OutpatientVisits = totalVisits - totalAdm,
                    InpatientAdmissions = totalAdm, ReferralUp = totalRef, SurgeryMinor = totalSurg
                };

            case 4:
                var topDiseases = await _db.Examinations.Where(e => e.ExamDate.Year == year && e.MainIcdCode != null)
                    .GroupBy(e => new { e.MainIcdCode, e.MainDiagnosis })
                    .Select(g => new DiseaseStatisticsDto { IcdCode = g.Key.MainIcdCode, DiseaseName = g.Key.MainDiagnosis, CaseCount = g.Count() })
                    .OrderByDescending(d => d.CaseCount).Take(20).ToListAsync();
                return new BchReport4Dto { Year = year, TopDiseases = topDiseases, TotalDiseaseGroups = topDiseases.Count };

            case 5:
                var receipts5 = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.Status == 1).ToListAsync();
                var expenses5 = await _db.FinanceVouchers.Where(v => v.VoucherDate.Year == year && v.VoucherType == "PhieuChi" && v.Status == 1).ToListAsync();
                return new BchReport5Dto
                {
                    Year = year,
                    InsuranceRevenue = receipts5.Sum(r => r.BhytAmount),
                    FeeRevenue = receipts5.Sum(r => r.PatientAmount),
                    TotalExpense = expenses5.Sum(e => e.Amount),
                    MedicineExpense = expenses5.Where(e => e.Category == "Thuoc").Sum(e => e.Amount)
                };

            case 6:
                return new BchReport6Dto
                {
                    Year = year,
                    TotalPregnant = await _db.PrenatalRecords.Where(p => p.ExamDate.Year == year).Select(p => p.PatientId).Distinct().CountAsync(),
                    HospitalDeliveries = await _db.DeliveryRecords.CountAsync(d => d.DeliveryDate.Year == year),
                    CaesareanDeliveries = await _db.DeliveryRecords.CountAsync(d => d.DeliveryDate.Year == year && d.DeliveryType == "CaesareanSection"),
                    Abortions = await _db.AbortionRecords.CountAsync(a => a.ProcedureDate.Year == year),
                    CervicalScreening = await _db.GynecologyExams.CountAsync(g => g.ExamDate.Year == year)
                };

            case 7:
                var vaxCoverage = await GetImmunizationCoverageAsync(year);
                return new BchReport7Dto { Year = year, VaccineData = vaxCoverage.Select(v => new BcxReport7VaccineDto { VaccineName = v.VaccineName, Dose1 = v.VaccinatedCount }).ToList() };

            case 8:
                var dCases = await _db.DiseaseCases.Where(d => d.OnsetDate.Year == year)
                    .GroupBy(d => new { d.DiseaseName, d.IcdCode })
                    .Select(g => new BcxReport8DiseaseDto { DiseaseName = g.Key.DiseaseName, IcdCode = g.Key.IcdCode, Cases = g.Count(), Deaths = g.Count(x => x.Outcome == "TuVong") })
                    .OrderByDescending(d => d.Cases).ToListAsync();
                return new BchReport8Dto { Year = year, Diseases = dCases, TotalCases = dCases.Sum(d => d.Cases), TotalDeaths = dCases.Sum(d => d.Deaths) };

            case 9:
                var chronic9 = await _db.ChronicDiseaseRegisters.ToListAsync();
                return new BchReport9Dto
                {
                    Year = year,
                    TotalHypertension = chronic9.Count(c => c.DiseaseType == "TangHuyetAp"),
                    TotalDiabetes = chronic9.Count(c => c.DiseaseType == "DaiThaoDuong"),
                    TotalMentalHealth = chronic9.Count(c => c.DiseaseType == "TamThan"),
                    TotalEpilepsy = chronic9.Count(c => c.DiseaseType == "DongKinh")
                };

            case 10:
                var camp10 = await _db.HealthCampaigns.Where(c => c.StartDate.Year == year).ToListAsync();
                return new BchReport10Dto
                {
                    Year = year,
                    TotalCampaigns = camp10.Count,
                    TotalParticipants = camp10.Sum(c => c.Participants ?? 0),
                    FoodBusinesses = await _db.FoodBusinesses.CountAsync(),
                    FoodViolations = await _db.FoodViolations.CountAsync(v => v.ViolationDate.Year == year)
                };

            case 11:
                var hiv = await _db.HivPatients.ToListAsync();
                var hivComm = await _db.HivCommunications.Where(h => h.ActivityDate.Year == year).ToListAsync();
                return new BchReport11Dto
                {
                    Year = year,
                    TotalHivPatients = hiv.Count,
                    NewHivCases = hiv.Count(h => h.DiagnosisDate.HasValue && h.DiagnosisDate.Value.Year == year),
                    OnArv = hiv.Count(h => h.ArvStartDate.HasValue),
                    HivCommunications = hivComm.Count,
                    CommunicationParticipants = hivComm.Sum(h => h.Participants ?? 0)
                };

            case 12:
                var measurements = await _db.NutritionMeasurements.Where(n => n.MeasurementDate.Year == year).ToListAsync();
                return new BchReport12Dto
                {
                    Year = year,
                    Measured = measurements.Count,
                    Underweight = measurements.Count(m => m.NutritionStatus == "SuyDinhDuong"),
                    Stunted = measurements.Count(m => m.NutritionStatus == "ThapCoi"),
                    Wasted = measurements.Count(m => m.NutritionStatus == "GayCom"),
                    Overweight = measurements.Count(m => m.NutritionStatus == "ThuaCan"),
                    VitaminAUnder1 = await _db.VitaminARecords.CountAsync(v => v.GivenDate.Year == year && v.DoseType == "Under1"),
                    VitaminA1To5 = await _db.VitaminARecords.CountAsync(v => v.GivenDate.Year == year && v.DoseType == "1To5")
                };

            case 13:
                var injuries = await _db.InjuryRecords.Where(i => i.InjuryDate.Year == year).ToListAsync();
                return new BchReport13Dto
                {
                    Year = year,
                    TotalInjuries = injuries.Count,
                    TrafficAccidents = injuries.Count(i => i.InjuryType == "TNGT"),
                    Drowning = injuries.Count(i => i.InjuryType == "DuoiNuoc"),
                    Falls = injuries.Count(i => i.InjuryType == "Nga"),
                    Burns = injuries.Count(i => i.InjuryType == "Bong"),
                    Violence = injuries.Count(i => i.InjuryType == "BaoLuc"),
                    InjuryDeaths = injuries.Count(i => i.Outcome == "TuVong")
                };

            case 14:
                var elderly = await _db.ElderlyInfos.Include(e => e.Patient).ToListAsync();
                return new BchReport14Dto
                {
                    Year = year,
                    TotalElderly = elderly.Count,
                    ElderlyMale = elderly.Count(e => e.Patient.Gender == 1),
                    ElderlyFemale = elderly.Count(e => e.Patient.Gender == 2),
                    WithChronicDisease = elderly.Count(e => !string.IsNullOrEmpty(e.ChronicDiseases))
                };

            case 15:
                return new BchReport15Dto { Year = year };

            case 16:
                return new BchReport16Dto
                {
                    Year = year,
                    Indicators = new List<BchReport16IndicatorDto>
                    {
                        new() { IndicatorCode = "KCB01", IndicatorName = "Tong luot kham", Unit = "Luot", Achieved = await _db.Examinations.CountAsync(e => e.ExamDate.Year == year) },
                        new() { IndicatorCode = "KCB02", IndicatorName = "Noi tru", Unit = "Luot", Achieved = await _db.Admissions.CountAsync(a => a.AdmissionDate.Year == year) },
                        new() { IndicatorCode = "TC01", IndicatorName = "Ty le tiem chung day du", Unit = "%", Target = 95 },
                        new() { IndicatorCode = "CSSKSS01", IndicatorName = "Ty le de tai CSYT", Unit = "%", Target = 98 },
                        new() { IndicatorCode = "KLN01", IndicatorName = "Quan ly tang huyet ap", Unit = "Nguoi", Achieved = await _db.ChronicDiseaseRegisters.CountAsync(c => c.DiseaseType == "TangHuyetAp" && c.Status == "DangQuanLy") }
                    }
                };

            default: return new { Error = $"BCH report number {reportNumber} not found (valid: 1-16)" };
        }
    }

    // ================================================================
    // BCX TT37 Reports (tuyen xa TT37, Bieu 1-8)
    // ================================================================

    public async Task<object> GetBcxTT37ReportAsync(int reportNumber, ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var quarter = GetQuarter(filter);
        var (from, to) = QuarterRange(year, quarter);

        switch (reportNumber)
        {
            case 1:
                var exams = await _db.Examinations.CountAsync(e => e.ExamDate >= from && e.ExamDate <= to);
                var adm = await _db.Admissions.CountAsync(a => a.AdmissionDate >= from && a.AdmissionDate <= to);
                var refs = await _db.Referrals.CountAsync(r => r.ReferralDate >= from && r.ReferralDate <= to);
                var monthly = new List<BcxTT37MonthDto>();
                for (int m = (quarter - 1) * 3 + 1; m <= quarter * 3; m++)
                {
                    monthly.Add(new BcxTT37MonthDto
                    {
                        Month = m,
                        Visits = await _db.Examinations.CountAsync(e => e.ExamDate.Year == year && e.ExamDate.Month == m),
                        Inpatient = await _db.Admissions.CountAsync(a => a.AdmissionDate.Year == year && a.AdmissionDate.Month == m)
                    });
                }
                return new BcxTT37Report1Dto { Year = year, Quarter = quarter, TotalVisits = exams, OutpatientVisits = exams - adm, Referrals = refs, MonthlyData = monthly };

            case 2:
                var topD = await _db.Examinations.Where(e => e.ExamDate >= from && e.ExamDate <= to && e.MainIcdCode != null)
                    .GroupBy(e => new { e.MainIcdCode, e.MainDiagnosis })
                    .Select(g => new DiseaseStatisticsDto { IcdCode = g.Key.MainIcdCode, DiseaseName = g.Key.MainDiagnosis, CaseCount = g.Count() })
                    .OrderByDescending(d => d.CaseCount).Take(10).ToListAsync();
                return new BcxTT37Report2Dto { Year = year, Quarter = quarter, TopDiseases = topD };

            case 3:
                var procs = await _db.SurgeryRecords.Where(s => s.ProcedureDate >= from && s.ProcedureDate <= to)
                    .GroupBy(s => s.ProcedureName)
                    .Select(g => new BcxTT37ProcedureDto { ProcedureName = g.Key, Count = g.Count() })
                    .OrderByDescending(p => p.Count).ToListAsync();
                return new BcxTT37Report3Dto { Year = year, Quarter = quarter, TotalProcedures = procs.Sum(p => p.Count), Procedures = procs };

            case 4:
                var stockBal = await _db.StockBalances.Include(s => s.Medicine).ToListAsync();
                return new BcxTT37Report4Dto
                {
                    Year = year, Quarter = quarter,
                    TotalMedicineTypes = stockBal.Select(s => s.MedicineId).Distinct().Count(),
                    TotalMedicineValue = stockBal.Sum(s => s.Quantity * (s.UnitPrice ?? 0)),
                    ExpiredMedicines = stockBal.Count(s => s.ExpiryDate.HasValue && s.ExpiryDate < DateTime.UtcNow)
                };

            case 5:
                return new BcxTT37Report5Dto
                {
                    Year = year, Quarter = quarter,
                    PrenatalVisits = await _db.PrenatalRecords.CountAsync(p => p.ExamDate >= from && p.ExamDate <= to),
                    Deliveries = await _db.DeliveryRecords.CountAsync(d => d.DeliveryDate >= from && d.DeliveryDate <= to),
                    FamilyPlanning = await _db.FamilyPlanningRecords.CountAsync(f => f.RecordDate >= from && f.RecordDate <= to),
                    GynecologyExams = await _db.GynecologyExams.CountAsync(g => g.ExamDate >= from && g.ExamDate <= to)
                };

            case 6:
                var vaccines = await _db.Vaccines.Where(v => v.IsActive).ToListAsync();
                var vaxData = new List<BcxReport7VaccineDto>();
                foreach (var v in vaccines)
                {
                    var count = await _db.VaccinationRecords.CountAsync(r => r.VaccineId == v.Id && r.VaccinationDate >= from && r.VaccinationDate <= to);
                    vaxData.Add(new BcxReport7VaccineDto { VaccineName = v.Name, Dose1 = count });
                }
                return new BcxTT37Report6Dto { Year = year, Quarter = quarter, VaccineData = vaxData };

            case 7:
                var diseases = await _db.DiseaseCases.Where(d => d.OnsetDate >= from && d.OnsetDate <= to)
                    .GroupBy(d => new { d.DiseaseName, d.IcdCode })
                    .Select(g => new BcxReport8DiseaseDto { DiseaseName = g.Key.DiseaseName, IcdCode = g.Key.IcdCode, Cases = g.Count(), Deaths = g.Count(x => x.Outcome == "TuVong") })
                    .ToListAsync();
                return new BcxTT37Report7Dto { Year = year, Quarter = quarter, Diseases = diseases };

            case 8:
                var ncdDetails = await _db.ChronicDiseaseRegisters
                    .GroupBy(c => c.DiseaseType)
                    .Select(g => new BcxReport9DetailDto
                    {
                        DiseaseType = g.Key,
                        TotalRegistered = g.Count(),
                        NewCases = g.Count(x => x.RegisterDate >= from && x.RegisterDate <= to),
                        Managed = g.Count(x => x.Status == "DangQuanLy")
                    }).ToListAsync();
                return new BcxTT37Report8Dto { Year = year, Quarter = quarter, Details = ncdDetails };

            default: return new { Error = $"BCX TT37 report number {reportNumber} not found (valid: 1-8)" };
        }
    }

    // ================================================================
    // BCH TT37 Reports (tuyen huyen TT37, Bieu 1-14)
    // ================================================================

    public async Task<object> GetBchTT37ReportAsync(int reportNumber, ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var quarter = GetQuarter(filter);

        // BCH TT37 mirrors BCH reports but for quarter period
        // Delegate to the same logic as BCH with quarter filter applied
        if (reportNumber < 1 || reportNumber > 14)
            return new { Error = $"BCH TT37 report number {reportNumber} not found (valid: 1-14)" };

        // For BCH TT37, we reuse BCH logic mapped to quarter
        var bchNumber = reportNumber <= 10 ? reportNumber : reportNumber;
        var bchData = reportNumber <= 16 ? await GetBchReportAsync(bchNumber, filter) : new object();

        return new BchTT37ReportDto
        {
            Year = year, Quarter = quarter,
            ReportNumber = reportNumber,
            ReportTitle = $"Bao cao TT37 huyen - Bieu {reportNumber}",
            Data = bchData
        };
    }

    // ================================================================
    // BHYT Reports
    // ================================================================

    public async Task<object> GetBhytReportAsync(string mau, ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var month = GetMonth(filter);
        var facility = await _db.Facilities.FirstOrDefaultAsync();
        var facilityCode = facility?.MaBHXH ?? "";
        var facilityName = facility?.Name ?? "";

        switch (mau.ToLower())
        {
            case "mau19":
                var outpatientExams = await _db.Examinations
                    .Include(e => e.Patient)
                    .Where(e => e.ExamDate.Year == year && e.ExamDate.Month == month && e.Patient.InsuranceNumber != null)
                    .OrderBy(e => e.ExamDate)
                    .Take(500).ToListAsync();

                var receiptsForExam = await _db.Receipts
                    .Include(r => r.Details)
                    .Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month && r.Status == 1 && r.BhytAmount > 0)
                    .ToListAsync();

                var items19 = new List<BhytMau19ItemDto>();
                int stt19 = 0;
                foreach (var exam in outpatientExams)
                {
                    stt19++;
                    var receipt = receiptsForExam.FirstOrDefault(r => r.PatientId == exam.PatientId);
                    var details = receipt?.Details?.ToList() ?? new List<ReceiptDetail>();
                    items19.Add(new BhytMau19ItemDto
                    {
                        Stt = stt19,
                        PatientName = exam.Patient.FullName,
                        InsuranceNumber = exam.Patient.InsuranceNumber,
                        MainDiagnosis = exam.MainDiagnosis,
                        IcdCode = exam.MainIcdCode,
                        ExamDate = exam.ExamDate,
                        ExamFee = details.Where(d => d.ItemType == "Kham").Sum(d => d.TotalAmount),
                        MedicineFee = details.Where(d => d.ItemType == "Thuoc").Sum(d => d.TotalAmount),
                        LabFee = details.Where(d => d.ItemType == "XetNghiem").Sum(d => d.TotalAmount),
                        ImagingFee = details.Where(d => d.ItemType == "CDHA").Sum(d => d.TotalAmount),
                        ProcedureFee = details.Where(d => d.ItemType == "ThuThuat").Sum(d => d.TotalAmount),
                        TotalFee = receipt?.TotalAmount ?? 0,
                        BhytPay = receipt?.BhytAmount ?? 0,
                        PatientPay = receipt?.PatientAmount ?? 0
                    });
                }
                return new BhytMau19Dto
                {
                    FacilityCode = facilityCode, FacilityName = facilityName, Year = year, Month = month,
                    TotalPatients = items19.Count, TotalAmount = items19.Sum(i => i.TotalFee),
                    BhytAmount = items19.Sum(i => i.BhytPay), PatientAmount = items19.Sum(i => i.PatientPay),
                    Items = items19
                };

            case "mau20":
                var admissions20 = await _db.Admissions
                    .Include(a => a.Patient).Include(a => a.Department)
                    .Where(a => a.AdmissionDate.Year == year && a.AdmissionDate.Month == month && a.Patient.InsuranceNumber != null)
                    .Take(500).ToListAsync();
                var discharges20 = await _db.Discharges.Where(d => d.DischargeDate.Year == year && d.DischargeDate.Month == month).ToListAsync();

                var items20 = new List<BhytMau20ItemDto>();
                int stt20 = 0;
                foreach (var adm20 in admissions20)
                {
                    stt20++;
                    var disc = discharges20.FirstOrDefault(d => d.AdmissionId == adm20.Id);
                    items20.Add(new BhytMau20ItemDto
                    {
                        Stt = stt20,
                        PatientName = adm20.Patient.FullName,
                        InsuranceNumber = adm20.Patient.InsuranceNumber,
                        MainDiagnosis = adm20.AdmissionDiagnosis,
                        AdmissionDate = adm20.AdmissionDate,
                        DischargeDate = disc?.DischargeDate,
                        LengthOfStay = disc != null ? (disc.DischargeDate - adm20.AdmissionDate).Days : 0
                    });
                }
                return new BhytMau20Dto
                {
                    FacilityCode = facilityCode, FacilityName = facilityName, Year = year, Month = month,
                    TotalPatients = items20.Count, Items = items20
                };

            case "mau21":
                var outRec = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month && r.Status == 1 && r.BhytAmount > 0 && r.ReceiptType != "NoiTru").ToListAsync();
                var inRec = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month && r.Status == 1 && r.BhytAmount > 0 && r.ReceiptType == "NoiTru").ToListAsync();
                return new BhytMau21Dto
                {
                    FacilityCode = facilityCode, FacilityName = facilityName, Year = year, Month = month,
                    OutpatientVisits = outRec.Count, OutpatientTotal = outRec.Sum(r => r.TotalAmount),
                    OutpatientBhyt = outRec.Sum(r => r.BhytAmount), OutpatientPatient = outRec.Sum(r => r.PatientAmount),
                    InpatientVisits = inRec.Count, InpatientTotal = inRec.Sum(r => r.TotalAmount),
                    InpatientBhyt = inRec.Sum(r => r.BhytAmount), InpatientPatient = inRec.Sum(r => r.PatientAmount),
                    TotalVisits = outRec.Count + inRec.Count,
                    GrandTotal = outRec.Sum(r => r.TotalAmount) + inRec.Sum(r => r.TotalAmount),
                    GrandBhyt = outRec.Sum(r => r.BhytAmount) + inRec.Sum(r => r.BhytAmount),
                    GrandPatient = outRec.Sum(r => r.PatientAmount) + inRec.Sum(r => r.PatientAmount)
                };

            case "mau79":
                var quarter79 = GetQuarter(filter);
                var allRec79 = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.Status == 1 && r.BhytAmount > 0).ToListAsync();
                var qData = new List<BhytMau79QuarterDto>();
                for (int m = (quarter79 - 1) * 3 + 1; m <= quarter79 * 3; m++)
                {
                    var mRec = allRec79.Where(r => r.ReceiptDate.Month == m).ToList();
                    qData.Add(new BhytMau79QuarterDto { Month = m, Records = mRec.Count, Proposed = mRec.Sum(r => r.BhytAmount), Approved = mRec.Sum(r => r.BhytAmount), Paid = mRec.Sum(r => r.BhytAmount) });
                }
                return new BhytMau79Dto
                {
                    FacilityCode = facilityCode, FacilityName = facilityName, Year = year, Quarter = quarter79,
                    TotalRecords = allRec79.Count(r => r.ReceiptDate.Month >= (quarter79 - 1) * 3 + 1 && r.ReceiptDate.Month <= quarter79 * 3),
                    TotalProposed = qData.Sum(q => q.Proposed), TotalApproved = qData.Sum(q => q.Approved),
                    TotalPaid = qData.Sum(q => q.Paid), QuarterlyData = qData
                };

            case "mau80":
                var rec80 = await _db.Receipts.Include(r => r.Details).Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month && r.Status == 1).ToListAsync();
                var allDetails = rec80.SelectMany(r => r.Details).ToList();
                var categories = new[] { "Kham", "Thuoc", "XetNghiem", "CDHA", "ThuThuat", "Giuong", "Khac" };
                var items80 = categories.Select(cat => new BhytMau80ItemDto
                {
                    Category = cat,
                    BhytAmount = allDetails.Where(d => d.ItemType == cat).Sum(d => d.BhytAmount ?? 0),
                    PatientAmount = allDetails.Where(d => d.ItemType == cat).Sum(d => d.PatientAmount ?? 0),
                    Total = allDetails.Where(d => d.ItemType == cat).Sum(d => d.TotalAmount)
                }).ToList();
                return new BhytMau80Dto
                {
                    FacilityCode = facilityCode, FacilityName = facilityName, Year = year, Month = month,
                    Items = items80,
                    TotalBhyt = items80.Sum(i => i.BhytAmount), TotalPatient = items80.Sum(i => i.PatientAmount),
                    GrandTotal = items80.Sum(i => i.Total)
                };

            case "mau14a":
                var exams14 = await _db.Examinations.Include(e => e.Patient)
                    .Where(e => e.ExamDate.Year == year && e.ExamDate.Month == month && e.Patient.InsuranceNumber != null)
                    .OrderBy(e => e.ExamDate).Take(500).ToListAsync();
                var items14 = exams14.Select((e, i) => new BhytMau14AItemDto
                {
                    Stt = i + 1, PatientName = e.Patient.FullName, Gender = e.Patient.Gender,
                    DateOfBirth = e.Patient.DateOfBirth, Address = e.Patient.Address,
                    InsuranceNumber = e.Patient.InsuranceNumber, ExamDate = e.ExamDate,
                    MainDiagnosis = e.MainDiagnosis, IcdCode = e.MainIcdCode
                }).ToList();
                return new BhytMau14ADto { FacilityCode = facilityCode, FacilityName = facilityName, Year = year, Month = month, TotalPatients = items14.Count, Items = items14 };

            case "tk371":
                var monthlyBhyt = new List<BhytTK371MonthDto>();
                for (int m = 1; m <= 12; m++)
                {
                    var mRec = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == m && r.Status == 1 && r.BhytAmount > 0).ToListAsync();
                    monthlyBhyt.Add(new BhytTK371MonthDto { Month = m, Visits = mRec.Count, TotalAmount = mRec.Sum(r => r.TotalAmount), BhytAmount = mRec.Sum(r => r.BhytAmount), PatientAmount = mRec.Sum(r => r.PatientAmount) });
                }
                return new BhytTK371Dto
                {
                    FacilityCode = facilityCode, FacilityName = facilityName, Year = year,
                    MonthlyData = monthlyBhyt,
                    YearlyTotal = monthlyBhyt.Sum(m => m.TotalAmount),
                    YearlyBhyt = monthlyBhyt.Sum(m => m.BhytAmount),
                    YearlyPatient = monthlyBhyt.Sum(m => m.PatientAmount)
                };

            default: return new { Error = $"BHYT report mau '{mau}' not found (valid: mau19, mau20, mau21, mau79, mau80, mau14a, tk371)" };
        }
    }

    // ================================================================
    // So YTCS (A1-A12)
    // ================================================================

    public async Task<SoYtcsDto> GetSoYtcsAsync(string soType, ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var soNames = new Dictionary<string, string>
        {
            {"A1", "So kham benh"}, {"A2", "So KHHGD"}, {"A3", "So phong chong sot ret"},
            {"A4", "So theo doi benh nhan tam than"}, {"A5", "So quan ly benh lao"},
            {"A6", "So theo doi HIV/AIDS"}, {"A7", "So quan ly benh khong lay nhiem"},
            {"A8", "So thu thuat"}, {"A9", "So chan doan hinh anh"},
            {"A10", "So xet nghiem"}, {"A11", "So tiem chung"}, {"A12", "So tu vong"}
        };

        var soName = soNames.GetValueOrDefault(soType.ToUpper(), $"So YTCS {soType}");
        var records = new List<SoYtcsRecordDto>();

        switch (soType.ToUpper())
        {
            case "A1": // So kham benh
                var exams = await _db.Examinations.Include(e => e.Patient).Where(e => e.ExamDate.Year == year).OrderBy(e => e.ExamDate).Take(500).ToListAsync();
                records = exams.Select((e, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = e.ExamDate, PatientName = e.Patient.FullName,
                    Gender = e.Patient.Gender, Address = e.Patient.Address,
                    Diagnosis = e.MainDiagnosis, Treatment = e.TreatmentPlan
                }).ToList();
                break;

            case "A2": // So KHHGD
                var fp = await _db.FamilyPlanningRecords.Include(f => f.Patient).Where(f => f.RecordDate.Year == year).OrderBy(f => f.RecordDate).Take(500).ToListAsync();
                records = fp.Select((f, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = f.RecordDate, PatientName = f.Patient.FullName,
                    Gender = f.Patient.Gender, Address = f.Patient.Address,
                    Result = f.Method, Notes = f.Notes
                }).ToList();
                break;

            case "A3": // So sot ret
                var malaria = await _db.DiseaseCases.Include(d => d.Patient).Where(d => d.OnsetDate.Year == year && d.IcdCode != null && d.IcdCode.StartsWith("B5")).OrderBy(d => d.OnsetDate).Take(500).ToListAsync();
                records = malaria.Select((d, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = d.OnsetDate, PatientName = d.Patient.FullName,
                    Diagnosis = d.DiseaseName, Treatment = d.TreatmentInfo, Result = d.Outcome
                }).ToList();
                break;

            case "A4": // So tam than
                var mental = await _db.ChronicDiseaseRegisters.Include(c => c.Patient).Where(c => c.DiseaseType == "TamThan").OrderBy(c => c.RegisterDate).Take(500).ToListAsync();
                records = mental.Select((m, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = m.RegisterDate, PatientName = m.Patient.FullName,
                    Diagnosis = m.DiseaseType, Result = m.Status, Notes = m.Notes
                }).ToList();
                break;

            case "A5": // So lao
                var tb = await _db.DiseaseCases.Include(d => d.Patient).Where(d => d.IcdCode != null && (d.IcdCode.StartsWith("A15") || d.IcdCode.StartsWith("A16"))).OrderBy(d => d.OnsetDate).Take(500).ToListAsync();
                records = tb.Select((d, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = d.OnsetDate, PatientName = d.Patient.FullName,
                    Diagnosis = d.DiseaseName, Treatment = d.TreatmentInfo, Result = d.Outcome
                }).ToList();
                break;

            case "A6": // So HIV
                var hiv = await _db.HivPatients.Include(h => h.Patient).OrderBy(h => h.DiagnosisDate).Take(500).ToListAsync();
                records = hiv.Select((h, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = h.DiagnosisDate, PatientName = h.Patient.FullName,
                    Diagnosis = h.ClinicalStage, Treatment = h.CurrentRegimen,
                    Result = h.Status == 1 ? "DangDieuTri" : "NgungDieuTri"
                }).ToList();
                break;

            case "A7": // So KLN
                var ncd = await _db.ChronicDiseaseRegisters.Include(c => c.Patient).Where(c => c.RegisterDate.Year <= year).OrderBy(c => c.RegisterDate).Take(500).ToListAsync();
                records = ncd.Select((c, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = c.RegisterDate, PatientName = c.Patient.FullName,
                    Diagnosis = c.DiseaseType, Result = c.Status, Notes = c.Notes
                }).ToList();
                break;

            case "A8": // So thu thuat
                var surg = await _db.SurgeryRecords.Include(s => s.Patient).Where(s => s.ProcedureDate.Year == year).OrderBy(s => s.ProcedureDate).Take(500).ToListAsync();
                records = surg.Select((s, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = s.ProcedureDate, PatientName = s.Patient.FullName,
                    Diagnosis = s.ProcedureName, Treatment = s.Anesthesia, Result = s.Findings, Notes = s.Notes
                }).ToList();
                break;

            case "A9": // So CDHA
                var imaging = await _db.ServiceRequests.Include(s => s.Patient).Where(s => s.ServiceType == "CDHA" && s.CreatedAt.Year == year).OrderBy(s => s.CreatedAt).Take(500).ToListAsync();
                records = imaging.Select((s, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = s.CreatedAt, PatientName = s.Patient.FullName,
                    Diagnosis = s.ServiceName, Result = s.Result, Notes = s.ResultDescription
                }).ToList();
                break;

            case "A10": // So xet nghiem
                var lab = await _db.ServiceRequests.Include(s => s.Patient).Where(s => s.ServiceType == "XetNghiem" && s.CreatedAt.Year == year).OrderBy(s => s.CreatedAt).Take(500).ToListAsync();
                records = lab.Select((s, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = s.CreatedAt, PatientName = s.Patient.FullName,
                    Diagnosis = s.ServiceName, Result = s.Result, Notes = s.Notes
                }).ToList();
                break;

            case "A11": // So tiem chung
                var vax = await _db.VaccinationRecords.Include(v => v.Subject).Include(v => v.Vaccine).Where(v => v.VaccinationDate.Year == year).OrderBy(v => v.VaccinationDate).Take(500).ToListAsync();
                records = vax.Select((v, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = v.VaccinationDate, PatientName = v.Subject.FullName,
                    Diagnosis = v.Vaccine.Name, Result = $"Mui {v.DoseNumber}", Notes = v.Reaction
                }).ToList();
                break;

            case "A12": // So tu vong
                var deathCerts = await _db.DeathCertificates.Where(d => d.DateOfDeath.Year == year).OrderBy(d => d.DateOfDeath).Take(500).ToListAsync();
                records = deathCerts.Select((d, i) => new SoYtcsRecordDto
                {
                    Stt = i + 1, RecordDate = d.DateOfDeath, PatientName = d.DeceasedName,
                    Gender = d.Gender, Age = d.Age, Address = d.Address,
                    Diagnosis = d.CauseOfDeath, Notes = d.IcdCode
                }).ToList();
                break;
        }

        return new SoYtcsDto { SoType = soType.ToUpper(), SoName = soName, Year = year, TotalRecords = records.Count, Records = records };
    }

    // ================================================================
    // BHYT Summary
    // ================================================================

    public async Task<BhytSummaryDto> GetBhytSummaryAsync(ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var month = GetMonth(filter);
        var facility = await _db.Facilities.FirstOrDefaultAsync();

        var receipts = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month && r.Status == 1 && r.BhytAmount > 0).ToListAsync();

        return new BhytSummaryDto
        {
            Year = year, Month = month, FacilityName = facility?.Name,
            TotalInsuredPatients = receipts.Count,
            TotalBhytCost = receipts.Sum(r => r.TotalAmount),
            TotalBhytPaid = receipts.Sum(r => r.BhytAmount),
            TotalPatientCopay = receipts.Sum(r => r.PatientAmount),
            AvgCostPerVisit = receipts.Count > 0 ? receipts.Sum(r => r.TotalAmount) / receipts.Count : 0
        };
    }

    // ================================================================
    // Additional Statistics
    // ================================================================

    public async Task<NcdStatisticsDto> GetNcdStatisticsAsync(ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var chronic = await _db.ChronicDiseaseRegisters.ToListAsync();
        var groups = chronic.GroupBy(c => c.DiseaseType).Select(g => new NcdDiseaseGroupDto
        {
            DiseaseType = g.Key, Registered = g.Count(),
            NewCases = g.Count(x => x.RegisterDate.Year == year),
            Managed = g.Count(x => x.Status == "DangQuanLy"),
            Controlled = g.Count(x => x.Status == "KiemSoatTot")
        }).ToList();

        return new NcdStatisticsDto
        {
            Year = year, TotalRegistered = chronic.Count,
            NewCases = chronic.Count(c => c.RegisterDate.Year == year),
            ActivelyManaged = chronic.Count(c => c.Status == "DangQuanLy"),
            ControlledWell = chronic.Count(c => c.Status == "KiemSoatTot"),
            DiseaseGroups = groups
        };
    }

    public async Task<BillingSummaryDto> GetBillingSummaryAsync(ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var month = GetMonth(filter);
        var receipts = await _db.Receipts.Include(r => r.Details).Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month && r.Status == 1).ToListAsync();
        var allDetails = receipts.SelectMany(r => r.Details).ToList();

        var categories = new[] { "Kham", "Thuoc", "XetNghiem", "CDHA", "ThuThuat", "Giuong", "Khac" };
        var breakdown = categories.Select(cat => new BillingSummaryItemDto
        {
            Category = cat,
            Amount = allDetails.Where(d => d.ItemType == cat).Sum(d => d.TotalAmount),
            BhytAmount = allDetails.Where(d => d.ItemType == cat).Sum(d => d.BhytAmount ?? 0),
            PatientAmount = allDetails.Where(d => d.ItemType == cat).Sum(d => d.PatientAmount ?? 0)
        }).ToList();

        var trend = new List<BillingSummaryMonthDto>();
        for (int m = 1; m <= 12; m++)
        {
            var mRec = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == m && r.Status == 1).ToListAsync();
            trend.Add(new BillingSummaryMonthDto { Month = m, Revenue = mRec.Sum(r => r.TotalAmount), BhytRevenue = mRec.Sum(r => r.BhytAmount), FeeRevenue = mRec.Sum(r => r.PatientAmount) });
        }

        return new BillingSummaryDto
        {
            Year = year, Month = month,
            TotalRevenue = receipts.Sum(r => r.TotalAmount),
            BhytRevenue = receipts.Sum(r => r.BhytAmount),
            FeeRevenue = receipts.Sum(r => r.PatientAmount),
            TotalReceipts = receipts.Count,
            AvgReceiptAmount = receipts.Count > 0 ? receipts.Sum(r => r.TotalAmount) / receipts.Count : 0,
            CategoryBreakdown = breakdown, MonthlyTrend = trend
        };
    }

    public async Task<GeneralSummaryDto> GetGeneralSummaryAsync(ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var facility = await _db.Facilities.FirstOrDefaultAsync();

        return new GeneralSummaryDto
        {
            Year = year, FacilityName = facility?.Name,
            TotalPopulation = await _db.Patients.CountAsync(),
            TotalHouseholds = await _db.Households.CountAsync(),
            TotalExaminations = await _db.Examinations.CountAsync(e => e.ExamDate.Year == year),
            OutpatientVisits = await _db.Examinations.CountAsync(e => e.ExamDate.Year == year),
            InpatientAdmissions = await _db.Admissions.CountAsync(a => a.AdmissionDate.Year == year),
            TotalRevenue = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.Status == 1).SumAsync(r => r.TotalAmount),
            BhytRevenue = await _db.Receipts.Where(r => r.ReceiptDate.Year == year && r.Status == 1).SumAsync(r => r.BhytAmount),
            ChronicDiseaseManaged = await _db.ChronicDiseaseRegisters.CountAsync(c => c.Status == "DangQuanLy"),
            CommunicableCases = await _db.DiseaseCases.CountAsync(d => d.OnsetDate.Year == year),
            PrenatalVisits = await _db.PrenatalRecords.CountAsync(p => p.ExamDate.Year == year),
            Deliveries = await _db.DeliveryRecords.CountAsync(d => d.DeliveryDate.Year == year),
            TotalStaff = await _db.Staffs.CountAsync(s => s.IsActive),
            TotalDoctors = await _db.Staffs.CountAsync(s => s.IsActive && s.Position == "BacSi")
        };
    }

    public async Task<PatientByLevelDto> GetPatientByLevelAsync(ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var patients = await _db.Patients.ToListAsync();
        var bhyt = patients.Count(p => !string.IsNullOrEmpty(p.InsuranceNumber));
        var referrals = await _db.Referrals.CountAsync(r => r.ReferralDate.Year == year);

        return new PatientByLevelDto
        {
            Year = year, TotalPatients = patients.Count,
            BhytPatients = bhyt, FeePatients = patients.Count - bhyt,
            ReferralPatients = referrals,
            Levels = new List<PatientLevelDto>
            {
                new() { Level = "Tuyen xa", Count = patients.Count, Percentage = 100 }
            }
        };
    }

    public async Task<UtilityReportDto> GetUtilityReportAsync(ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var totalBeds = await _db.Beds.CountAsync();
        var totalRooms = await _db.Rooms.CountAsync(r => r.IsActive);
        var activeAdm = await _db.Admissions.CountAsync(a => a.Status == 0);
        var discharges = await _db.Discharges.Where(d => d.DischargeDate.Year == year).Include(d => d.Admission).ToListAsync();
        var avgLos = discharges.Count > 0 ? (decimal)discharges.Average(d => (d.DischargeDate - d.Admission.AdmissionDate).Days) : 0;

        return new UtilityReportDto
        {
            Year = year,
            TotalBeds = totalBeds, OccupiedBeds = activeAdm,
            BedOccupancyRate = totalBeds > 0 ? Math.Round((decimal)activeAdm / totalBeds * 100, 1) : 0,
            AvgLengthOfStay = Math.Round(avgLos, 1),
            TotalRooms = totalRooms, ActiveRooms = totalRooms
        };
    }

    public async Task<PharmacyReportDto> GetPharmacyReportAsync(ReportFilterDto filter)
    {
        var year = GetYear(filter);
        var month = GetMonth(filter);
        var stockBal = await _db.StockBalances.Include(s => s.Medicine).ToListAsync();
        var receipts = await _db.StockReceipts.Where(r => r.ReceiptDate.Year == year && r.ReceiptDate.Month == month).Include(r => r.Items).ToListAsync();
        var issues = await _db.StockIssues.Where(i => i.IssueDate.Year == year && i.IssueDate.Month == month).Include(i => i.Items).ToListAsync();

        var topUsed = issues.SelectMany(i => i.Items).GroupBy(i => new { i.MedicineId, i.Medicine.Name, i.Medicine.Unit })
            .Select(g => new PharmacyTopMedicineDto { MedicineName = g.Key.Name, Unit = g.Key.Unit, Quantity = g.Sum(x => x.Quantity), Value = g.Sum(x => x.TotalAmount) })
            .OrderByDescending(t => t.Quantity).Take(20).ToList();

        var topValue = stockBal.GroupBy(s => new { s.MedicineId, s.Medicine.Name, s.Medicine.Unit })
            .Select(g => new PharmacyTopMedicineDto { MedicineName = g.Key.Name, Unit = g.Key.Unit, Quantity = g.Sum(x => x.Quantity), Value = g.Sum(x => x.Quantity * (x.UnitPrice ?? 0)) })
            .OrderByDescending(t => t.Value).Take(20).ToList();

        return new PharmacyReportDto
        {
            Year = year, Month = month,
            TotalMedicineTypes = stockBal.Select(s => s.MedicineId).Distinct().Count(),
            TotalMedicineValue = stockBal.Sum(s => s.Quantity * (s.UnitPrice ?? 0)),
            TotalReceiptValue = receipts.Sum(r => r.TotalAmount),
            TotalIssueValue = issues.Sum(i => i.TotalAmount),
            ExpiredItems = stockBal.Count(s => s.ExpiryDate.HasValue && s.ExpiryDate < DateTime.UtcNow),
            NearExpiryItems = stockBal.Count(s => s.ExpiryDate.HasValue && s.ExpiryDate >= DateTime.UtcNow && s.ExpiryDate < DateTime.UtcNow.AddMonths(3)),
            OutOfStockItems = stockBal.Count(s => s.Quantity <= 0),
            TopUsed = topUsed, TopValue = topValue
        };
    }

    // ================================================================
    // Export
    // ================================================================

    public Task<byte[]> ExportReportAsync(string reportType, string format, ReportFilterDto filter)
    {
        // Stub: return empty bytes. Real implementation would use a library like ClosedXML or iText7.
        return Task.FromResult(Array.Empty<byte>());
    }
}

public class SystemService : ISystemService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public SystemService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<List<SystemConfigDto>> GetConfigsAsync(string? module = null)
    {
        var q = _db.SystemConfigs.AsQueryable();
        if (!string.IsNullOrEmpty(module)) q = q.Where(c => c.Module == module);
        return await q.Select(c => new SystemConfigDto { Id = c.Id, Key = c.Key, Value = c.Value, Description = c.Description, Module = c.Module }).ToListAsync();
    }

    public async Task<SystemConfigDto> SaveConfigAsync(SystemConfigDto dto)
    {
        var existing = await _db.SystemConfigs.FirstOrDefaultAsync(c => c.Key == dto.Key);
        if (existing == null) { existing = new SystemConfig { Key = dto.Key }; await _db.SystemConfigs.AddAsync(existing); }
        existing.Value = dto.Value; existing.Description = dto.Description; existing.Module = dto.Module;
        await _uow.SaveChangesAsync();
        dto.Id = existing.Id; return dto;
    }

    public async Task<List<FacilityDto>> GetFacilitiesAsync()
        => await _db.Facilities.Include(f => f.Departments).Select(f => new FacilityDto { Id = f.Id, Code = f.Code, Name = f.Name, Address = f.Address, Phone = f.Phone, FacilityType = f.FacilityType, MaBHXH = f.MaBHXH, IsActive = f.IsActive, DepartmentCount = f.Departments.Count }).ToListAsync();

    public async Task<FacilityDto> CreateFacilityAsync(CreateFacilityDto dto)
    {
        var f = new Facility { Code = dto.Code, Name = dto.Name, Address = dto.Address, Phone = dto.Phone, FacilityType = dto.FacilityType, MaBHXH = dto.MaBHXH, IsActive = true };
        await _db.Facilities.AddAsync(f); await _uow.SaveChangesAsync();
        return new FacilityDto { Id = f.Id, Code = f.Code, Name = f.Name, Address = f.Address, Phone = f.Phone, FacilityType = f.FacilityType, MaBHXH = f.MaBHXH, IsActive = true };
    }

    public async Task<FacilityDto> UpdateFacilityAsync(Guid id, CreateFacilityDto dto)
    {
        var f = await _db.Facilities.FindAsync(id) ?? throw new KeyNotFoundException();
        f.Name = dto.Name; f.Address = dto.Address; f.Phone = dto.Phone; f.FacilityType = dto.FacilityType; f.MaBHXH = dto.MaBHXH;
        await _uow.SaveChangesAsync();
        return (await GetFacilitiesAsync()).First(x => x.Id == id);
    }

    public async Task<List<DepartmentDto>> GetDepartmentsAsync(Guid? facilityId = null)
    {
        var q = _db.Departments.Include(d => d.Facility).Include(d => d.Rooms).Where(d => d.IsActive);
        if (facilityId.HasValue) q = q.Where(d => d.FacilityId == facilityId);
        return await q.OrderBy(d => d.SortOrder).Select(d => new DepartmentDto { Id = d.Id, Code = d.Code, Name = d.Name, DepartmentType = d.DepartmentType, FacilityId = d.FacilityId, FacilityName = d.Facility != null ? d.Facility.Name : null, IsActive = d.IsActive, SortOrder = d.SortOrder, RoomCount = d.Rooms.Count }).ToListAsync();
    }

    public async Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto)
    {
        var d = new Department { Code = dto.Code, Name = dto.Name, DepartmentType = dto.DepartmentType, FacilityId = dto.FacilityId, IsActive = true, SortOrder = dto.SortOrder };
        await _db.Departments.AddAsync(d); await _uow.SaveChangesAsync();
        return new DepartmentDto { Id = d.Id, Code = d.Code, Name = d.Name, DepartmentType = d.DepartmentType, FacilityId = d.FacilityId, IsActive = true, SortOrder = d.SortOrder };
    }

    public async Task<DepartmentDto> UpdateDepartmentAsync(Guid id, CreateDepartmentDto dto)
    {
        var d = await _db.Departments.FindAsync(id) ?? throw new KeyNotFoundException();
        d.Name = dto.Name; d.DepartmentType = dto.DepartmentType; d.FacilityId = dto.FacilityId; d.SortOrder = dto.SortOrder;
        await _uow.SaveChangesAsync();
        return (await GetDepartmentsAsync()).First(x => x.Id == id);
    }

    public async Task<List<RoomDto>> GetRoomsAsync(Guid? departmentId = null)
    {
        var q = _db.Rooms.Include(r => r.Department).Where(r => r.IsActive);
        if (departmentId.HasValue) q = q.Where(r => r.DepartmentId == departmentId);
        return await q.OrderBy(r => r.SortOrder).Select(r => new RoomDto { Id = r.Id, Code = r.Code, Name = r.Name, DepartmentId = r.DepartmentId, DepartmentName = r.Department.Name, RoomType = r.RoomType, IsActive = r.IsActive, SortOrder = r.SortOrder }).ToListAsync();
    }

    public async Task<RoomDto> CreateRoomAsync(CreateRoomDto dto)
    {
        var r = new Room { Code = dto.Code, Name = dto.Name, DepartmentId = dto.DepartmentId, RoomType = dto.RoomType, IsActive = true, SortOrder = dto.SortOrder };
        await _db.Rooms.AddAsync(r); await _uow.SaveChangesAsync();
        return new RoomDto { Id = r.Id, Code = r.Code, Name = r.Name, DepartmentId = r.DepartmentId, RoomType = r.RoomType, IsActive = true, SortOrder = r.SortOrder };
    }

    public async Task<PagedResult<IcdCodeDto>> SearchIcdCodesAsync(IcdSearchDto dto)
    {
        var q = _db.IcdCodes.Where(i => i.IsActive).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(i => i.Code.Contains(dto.Keyword) || i.Name.Contains(dto.Keyword));
        if (!string.IsNullOrEmpty(dto.Chapter)) q = q.Where(i => i.Chapter == dto.Chapter);
        var total = await q.CountAsync();
        var items = await q.OrderBy(i => i.Code).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(i => new IcdCodeDto { Id = i.Id, Code = i.Code, Name = i.Name, NameEnglish = i.NameEnglish, Chapter = i.Chapter, Group = i.Group }).ToListAsync();
        return new PagedResult<IcdCodeDto> { Items = items, TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogSearchDto dto)
    {
        var q = _db.AuditLogs.IgnoreQueryFilters().AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(a => (a.Details != null && a.Details.Contains(dto.Keyword)) || (a.Username != null && a.Username.Contains(dto.Keyword)));
        if (!string.IsNullOrEmpty(dto.Module)) q = q.Where(a => a.Module == dto.Module);
        if (!string.IsNullOrEmpty(dto.Action)) q = q.Where(a => a.Action == dto.Action);
        if (dto.UserId.HasValue) q = q.Where(a => a.UserId == dto.UserId);
        if (dto.FromDate.HasValue) q = q.Where(a => a.CreatedAt >= dto.FromDate);
        if (dto.ToDate.HasValue) q = q.Where(a => a.CreatedAt <= dto.ToDate);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(a => a.CreatedAt).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(a => new AuditLogDto { Id = a.Id, UserId = a.UserId, Username = a.Username, UserFullName = a.UserFullName, Action = a.Action, EntityType = a.EntityType, EntityId = a.EntityId, Details = a.Details, Module = a.Module, RequestPath = a.RequestPath, RequestMethod = a.RequestMethod, ResponseStatusCode = a.ResponseStatusCode, CreatedAt = a.CreatedAt }).ToListAsync();
        return new PagedResult<AuditLogDto> { Items = items, TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }
}

public class DataInteropService : IDataInteropService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public DataInteropService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<List<DataSyncLogDto>> GetSyncLogsAsync(string? syncType = null, int pageIndex = 0, int pageSize = 20)
    {
        var q = _db.DataSyncLogs.AsQueryable();
        if (!string.IsNullOrEmpty(syncType)) q = q.Where(d => d.SyncType == syncType);
        return await q.OrderByDescending(d => d.SyncDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(d => new DataSyncLogDto { Id = d.Id, SyncType = d.SyncType, Direction = d.Direction, SyncDate = d.SyncDate, RecordCount = d.RecordCount, SuccessCount = d.SuccessCount, ErrorCount = d.ErrorCount, ErrorDetails = d.ErrorDetails, Status = d.Status }).ToListAsync();
    }

    public async Task<DataSyncLogDto> SyncBhytAsync(Guid facilityId)
    {
        var log = new DataSyncLog { SyncType = "BHYT", Direction = "Upload", SyncDate = DateTime.UtcNow, Status = 1, RecordCount = 0, SuccessCount = 0, FacilityId = facilityId };
        await _db.DataSyncLogs.AddAsync(log); await _uow.SaveChangesAsync();
        return new DataSyncLogDto { Id = log.Id, SyncType = log.SyncType, Direction = log.Direction, SyncDate = log.SyncDate, Status = log.Status };
    }

    public async Task<DataSyncLogDto> SyncHsskAsync(Guid facilityId)
    {
        var log = new DataSyncLog { SyncType = "HSSK", Direction = "Upload", SyncDate = DateTime.UtcNow, Status = 1, RecordCount = 0, SuccessCount = 0, FacilityId = facilityId };
        await _db.DataSyncLogs.AddAsync(log); await _uow.SaveChangesAsync();
        return new DataSyncLogDto { Id = log.Id, SyncType = log.SyncType, Direction = log.Direction, SyncDate = log.SyncDate, Status = log.Status };
    }
}

public class NotificationService : INotificationService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public NotificationService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, bool unreadOnly = false)
    {
        var q = _db.Notifications.Where(n => n.UserId == userId);
        if (unreadOnly) q = q.Where(n => !n.IsRead);
        return await q.OrderByDescending(n => n.CreatedAt).Take(50)
            .Select(n => new NotificationDto { Id = n.Id, Title = n.Title, Content = n.Content, Type = n.Type, Module = n.Module, ActionUrl = n.ActionUrl, IsRead = n.IsRead, CreatedAt = n.CreatedAt }).ToListAsync();
    }

    public async Task<int> GetUnreadCountAsync(Guid userId)
        => await _db.Notifications.CountAsync(n => n.UserId == userId && !n.IsRead);

    public async Task MarkAsReadAsync(Guid notificationId)
    {
        var n = await _db.Notifications.FindAsync(notificationId);
        if (n != null) { n.IsRead = true; await _uow.SaveChangesAsync(); }
    }

    public async Task MarkAllAsReadAsync(Guid userId)
    {
        var unread = await _db.Notifications.Where(n => n.UserId == userId && !n.IsRead).ToListAsync();
        foreach (var n in unread) n.IsRead = true;
        await _uow.SaveChangesAsync();
    }

    public async Task CreateNotificationAsync(Guid userId, string title, string? content = null, string? type = null, string? module = null)
    {
        var n = new Notification { UserId = userId, Title = title, Content = content, Type = type, Module = module };
        await _db.Notifications.AddAsync(n);
        await _uow.SaveChangesAsync();
    }
}
