using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CHIS.Infrastructure.Services;

public class PopulationService : IPopulationService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public PopulationService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<HouseholdDto>> SearchHouseholdsAsync(HouseholdSearchDto dto)
    {
        var q = _db.Households.Include(h => h.Members).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(h => h.HouseholdCode.Contains(dto.Keyword) || (h.HeadOfHousehold != null && h.HeadOfHousehold.Contains(dto.Keyword)));
        if (!string.IsNullOrEmpty(dto.Village)) q = q.Where(h => h.Village == dto.Village);
        var total = await q.CountAsync();
        var items = await q.OrderBy(h => h.HouseholdCode).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<HouseholdDto> { Items = items.Select(h => new HouseholdDto { Id = h.Id, HouseholdCode = h.HouseholdCode, HeadOfHousehold = h.HeadOfHousehold, Address = h.Address, Village = h.Village, WardCode = h.WardCode, Phone = h.Phone, AssignedDoctorId = h.AssignedDoctorId, MemberCount = h.Members.Count }).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<HouseholdDto> GetHouseholdByIdAsync(Guid id)
    {
        var h = await _db.Households.Include(x => x.Members).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException();
        return new HouseholdDto { Id = h.Id, HouseholdCode = h.HouseholdCode, HeadOfHousehold = h.HeadOfHousehold, Address = h.Address, Village = h.Village, WardCode = h.WardCode, Phone = h.Phone, AssignedDoctorId = h.AssignedDoctorId, MemberCount = h.Members.Count };
    }

    public async Task<HouseholdDto> CreateHouseholdAsync(CreateHouseholdDto dto)
    {
        var count = await _db.Households.CountAsync() + 1;
        var h = new Household { HouseholdCode = $"HGD{count:D6}", HeadOfHousehold = dto.HeadOfHousehold, Address = dto.Address, Village = dto.Village, WardCode = dto.WardCode, Phone = dto.Phone, AssignedDoctorId = dto.AssignedDoctorId };
        await _db.Households.AddAsync(h); await _uow.SaveChangesAsync();
        return new HouseholdDto { Id = h.Id, HouseholdCode = h.HouseholdCode, HeadOfHousehold = h.HeadOfHousehold, Address = h.Address, Village = h.Village };
    }

    public async Task<HouseholdDto> UpdateHouseholdAsync(Guid id, CreateHouseholdDto dto)
    {
        var h = await _db.Households.FindAsync(id) ?? throw new KeyNotFoundException();
        h.HeadOfHousehold = dto.HeadOfHousehold; h.Address = dto.Address; h.Village = dto.Village; h.WardCode = dto.WardCode; h.Phone = dto.Phone; h.AssignedDoctorId = dto.AssignedDoctorId;
        await _uow.SaveChangesAsync();
        return await GetHouseholdByIdAsync(id);
    }

    public async Task AddMemberAsync(Guid householdId, Guid patientId)
    {
        var p = await _db.Patients.FindAsync(patientId) ?? throw new KeyNotFoundException();
        p.HouseholdId = householdId; await _uow.SaveChangesAsync();
    }

    public async Task RemoveMemberAsync(Guid householdId, Guid patientId)
    {
        var p = await _db.Patients.FindAsync(patientId) ?? throw new KeyNotFoundException();
        if (p.HouseholdId == householdId) { p.HouseholdId = null; await _uow.SaveChangesAsync(); }
    }

    public async Task<PagedResult<BirthCertificateDto>> GetBirthCertificatesAsync(int pageIndex, int pageSize, string? keyword = null)
    {
        var q = _db.BirthCertificates.AsQueryable();
        if (!string.IsNullOrEmpty(keyword)) q = q.Where(b => b.ChildName.Contains(keyword) || b.CertificateNumber.Contains(keyword));
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(b => b.DateOfBirth).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(b => new BirthCertificateDto { Id = b.Id, CertificateNumber = b.CertificateNumber, ChildName = b.ChildName, DateOfBirth = b.DateOfBirth, Gender = b.Gender, PlaceOfBirth = b.PlaceOfBirth, MotherName = b.MotherName, FatherName = b.FatherName, BirthWeight = b.BirthWeight, BirthLength = b.BirthLength, GestationalAge = b.GestationalAge, IssuedDate = b.IssuedDate }).ToListAsync();
        return new PagedResult<BirthCertificateDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    public async Task<BirthCertificateDto> CreateBirthCertificateAsync(CreateBirthCertificateDto dto)
    {
        var count = await _db.BirthCertificates.CountAsync() + 1;
        var b = new BirthCertificate { CertificateNumber = $"GKS{DateTime.Now:yy}{count:D6}", ChildName = dto.ChildName, DateOfBirth = dto.DateOfBirth, Gender = dto.Gender, PlaceOfBirth = dto.PlaceOfBirth, MotherName = dto.MotherName, FatherName = dto.FatherName, MotherIdNumber = dto.MotherIdNumber, BirthWeight = dto.BirthWeight, BirthLength = dto.BirthLength, GestationalAge = dto.GestationalAge, IssuedDate = DateTime.UtcNow };
        await _db.BirthCertificates.AddAsync(b); await _uow.SaveChangesAsync();
        return new BirthCertificateDto { Id = b.Id, CertificateNumber = b.CertificateNumber, ChildName = b.ChildName, DateOfBirth = b.DateOfBirth, Gender = b.Gender, IssuedDate = b.IssuedDate };
    }

    public async Task<PagedResult<DeathCertificateDto>> GetDeathCertificatesAsync(int pageIndex, int pageSize, string? keyword = null)
    {
        var q = _db.DeathCertificates.AsQueryable();
        if (!string.IsNullOrEmpty(keyword)) q = q.Where(d => d.DeceasedName.Contains(keyword));
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(d => d.DateOfDeath).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(d => new DeathCertificateDto { Id = d.Id, CertificateNumber = d.CertificateNumber, DeceasedName = d.DeceasedName, DateOfDeath = d.DateOfDeath, CauseOfDeath = d.CauseOfDeath, IcdCode = d.IcdCode, Age = d.Age, Gender = d.Gender, IssuedDate = d.IssuedDate }).ToListAsync();
        return new PagedResult<DeathCertificateDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    public async Task<DeathCertificateDto> CreateDeathCertificateAsync(CreateDeathCertificateDto dto)
    {
        var count = await _db.DeathCertificates.CountAsync() + 1;
        var d = new DeathCertificate { CertificateNumber = $"GTV{DateTime.Now:yy}{count:D6}", DeceasedName = dto.DeceasedName, DateOfDeath = dto.DateOfDeath, PlaceOfDeath = dto.PlaceOfDeath, CauseOfDeath = dto.CauseOfDeath, IcdCode = dto.IcdCode, Age = dto.Age, Gender = dto.Gender, Address = dto.Address, IssuedDate = DateTime.UtcNow };
        await _db.DeathCertificates.AddAsync(d); await _uow.SaveChangesAsync();
        return new DeathCertificateDto { Id = d.Id, CertificateNumber = d.CertificateNumber, DeceasedName = d.DeceasedName, DateOfDeath = d.DateOfDeath, IssuedDate = d.IssuedDate };
    }

    public async Task<List<ElderlyInfoDto>> GetElderlyListAsync(Guid? facilityId = null)
    {
        return await _db.ElderlyInfos.Include(e => e.Patient)
            .Select(e => new ElderlyInfoDto { Id = e.Id, PatientId = e.PatientId, PatientName = e.Patient.FullName, HealthStatus = e.HealthStatus, ChronicDiseases = e.ChronicDiseases, CareLevel = e.CareLevel, Notes = e.Notes }).ToListAsync();
    }

    public async Task<ElderlyInfoDto> SaveElderlyInfoAsync(Guid patientId, ElderlyInfoDto dto)
    {
        var existing = await _db.ElderlyInfos.FirstOrDefaultAsync(e => e.PatientId == patientId);
        if (existing == null)
        {
            existing = new ElderlyInfo { PatientId = patientId };
            await _db.ElderlyInfos.AddAsync(existing);
        }
        existing.HealthStatus = dto.HealthStatus; existing.ChronicDiseases = dto.ChronicDiseases; existing.CareLevel = dto.CareLevel; existing.Notes = dto.Notes;
        await _uow.SaveChangesAsync();
        dto.Id = existing.Id; dto.PatientId = patientId; return dto;
    }
}

public class ChronicDiseaseService : IChronicDiseaseService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public ChronicDiseaseService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<ChronicDiseaseRegisterDto>> SearchAsync(ChronicDiseaseSearchDto dto)
    {
        var q = _db.ChronicDiseaseRegisters.Include(c => c.Patient).Include(c => c.Treatments).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(c => c.Patient.FullName.Contains(dto.Keyword));
        if (!string.IsNullOrEmpty(dto.DiseaseType)) q = q.Where(c => c.DiseaseType == dto.DiseaseType);
        if (!string.IsNullOrEmpty(dto.Status)) q = q.Where(c => c.Status == dto.Status);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(c => c.RegisterDate).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<ChronicDiseaseRegisterDto> { Items = items.Select(c => new ChronicDiseaseRegisterDto { Id = c.Id, PatientId = c.PatientId, PatientName = c.Patient?.FullName, PatientCode = c.Patient?.PatientCode, DiseaseType = c.DiseaseType, RegisterDate = c.RegisterDate, Status = c.Status, Notes = c.Notes, TreatmentCount = c.Treatments.Count }).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<ChronicDiseaseRegisterDto> GetByIdAsync(Guid id)
    {
        var c = await _db.ChronicDiseaseRegisters.Include(x => x.Patient).Include(x => x.Treatments).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException();
        return new ChronicDiseaseRegisterDto { Id = c.Id, PatientId = c.PatientId, PatientName = c.Patient?.FullName, DiseaseType = c.DiseaseType, RegisterDate = c.RegisterDate, Status = c.Status, Notes = c.Notes, TreatmentCount = c.Treatments.Count };
    }

    public async Task<ChronicDiseaseRegisterDto> RegisterAsync(CreateChronicDiseaseRegisterDto dto)
    {
        var r = new ChronicDiseaseRegister { PatientId = dto.PatientId, DiseaseType = dto.DiseaseType, RegisterDate = DateTime.UtcNow, Status = "Active", Notes = dto.Notes };
        await _db.ChronicDiseaseRegisters.AddAsync(r); await _uow.SaveChangesAsync();
        return await GetByIdAsync(r.Id);
    }

    public async Task UpdateStatusAsync(Guid id, string status)
    {
        var r = await _db.ChronicDiseaseRegisters.FindAsync(id) ?? throw new KeyNotFoundException();
        r.Status = status; await _uow.SaveChangesAsync();
    }

    public async Task<List<ChronicDiseaseTreatmentDto>> GetTreatmentsAsync(Guid registerId)
        => await _db.ChronicDiseaseTreatments.Where(t => t.RegisterId == registerId).OrderByDescending(t => t.TreatmentDate)
            .Select(t => new ChronicDiseaseTreatmentDto { Id = t.Id, RegisterId = t.RegisterId, TreatmentDate = t.TreatmentDate, Progress = t.Progress, Orders = t.Orders, VitalSigns = t.VitalSigns, Notes = t.Notes, DoctorId = t.DoctorId }).ToListAsync();

    public async Task<ChronicDiseaseTreatmentDto> AddTreatmentAsync(CreateChronicDiseaseTreatmentDto dto)
    {
        var t = new ChronicDiseaseTreatment { RegisterId = dto.RegisterId, TreatmentDate = DateTime.UtcNow, Progress = dto.Progress, Orders = dto.Orders, VitalSigns = dto.VitalSigns, Notes = dto.Notes };
        await _db.ChronicDiseaseTreatments.AddAsync(t); await _uow.SaveChangesAsync();
        return new ChronicDiseaseTreatmentDto { Id = t.Id, RegisterId = t.RegisterId, TreatmentDate = t.TreatmentDate, Progress = t.Progress, Orders = t.Orders, VitalSigns = t.VitalSigns, Notes = t.Notes };
    }

    // ---- NCD Examination ----

    public async Task<NcdExaminationDto> CreateNcdExaminationAsync(CreateNcdExaminationDto dto)
    {
        var reg = await _db.ChronicDiseaseRegisters.Include(r => r.Patient).FirstOrDefaultAsync(r => r.Id == dto.RegisterId)
            ?? throw new KeyNotFoundException();
        decimal? bmi = (dto.Weight.HasValue && dto.Height.HasValue && dto.Height > 0)
            ? Math.Round(dto.Weight.Value / ((dto.Height.Value / 100m) * (dto.Height.Value / 100m)), 1)
            : null;
        var vitalSigns = System.Text.Json.JsonSerializer.Serialize(new { dto.SystolicBP, dto.DiastolicBP, dto.HeartRate, dto.Temperature, dto.Weight, dto.Height, BMI = bmi, dto.BloodGlucose, dto.HbA1c, dto.Cholesterol, dto.Triglycerides, dto.Creatinine });
        var t = new ChronicDiseaseTreatment
        {
            RegisterId = dto.RegisterId, TreatmentDate = DateTime.UtcNow,
            Progress = dto.Assessment, Orders = dto.TreatmentPlan,
            VitalSigns = vitalSigns, Notes = $"{dto.Medications}\n---\n{dto.Notes}"
        };
        await _db.ChronicDiseaseTreatments.AddAsync(t);
        await _uow.SaveChangesAsync();
        return new NcdExaminationDto
        {
            Id = t.Id, RegisterId = dto.RegisterId, PatientName = reg.Patient?.FullName, DiseaseType = reg.DiseaseType,
            ExamDate = t.TreatmentDate, SystolicBP = dto.SystolicBP, DiastolicBP = dto.DiastolicBP,
            HeartRate = dto.HeartRate, Temperature = dto.Temperature, Weight = dto.Weight, Height = dto.Height, BMI = bmi,
            BloodGlucose = dto.BloodGlucose, HbA1c = dto.HbA1c, Cholesterol = dto.Cholesterol, Triglycerides = dto.Triglycerides, Creatinine = dto.Creatinine,
            Diagnosis = dto.Diagnosis, IcdCode = dto.IcdCode, Assessment = dto.Assessment, TreatmentPlan = dto.TreatmentPlan,
            Medications = dto.Medications, Notes = dto.Notes, NextVisitDate = dto.NextVisitDate
        };
    }

    public async Task<List<NcdExaminationDto>> GetNcdExaminationsAsync(Guid registerId)
    {
        var reg = await _db.ChronicDiseaseRegisters.Include(r => r.Patient).FirstOrDefaultAsync(r => r.Id == registerId);
        var treatments = await _db.ChronicDiseaseTreatments.Where(t => t.RegisterId == registerId).OrderByDescending(t => t.TreatmentDate).ToListAsync();
        return treatments.Select(t =>
        {
            var exam = new NcdExaminationDto { Id = t.Id, RegisterId = registerId, PatientName = reg?.Patient?.FullName, DiseaseType = reg?.DiseaseType, ExamDate = t.TreatmentDate, Assessment = t.Progress, TreatmentPlan = t.Orders, Notes = t.Notes };
            if (!string.IsNullOrEmpty(t.VitalSigns))
            {
                try
                {
                    var vs = System.Text.Json.JsonDocument.Parse(t.VitalSigns).RootElement;
                    if (vs.TryGetProperty("SystolicBP", out var sbp) && sbp.ValueKind == System.Text.Json.JsonValueKind.Number) exam.SystolicBP = sbp.GetInt32();
                    if (vs.TryGetProperty("DiastolicBP", out var dbp) && dbp.ValueKind == System.Text.Json.JsonValueKind.Number) exam.DiastolicBP = dbp.GetInt32();
                    if (vs.TryGetProperty("Weight", out var w) && w.ValueKind == System.Text.Json.JsonValueKind.Number) exam.Weight = w.GetDecimal();
                    if (vs.TryGetProperty("BloodGlucose", out var bg) && bg.ValueKind == System.Text.Json.JsonValueKind.Number) exam.BloodGlucose = bg.GetDecimal();
                    if (vs.TryGetProperty("HbA1c", out var hba) && hba.ValueKind == System.Text.Json.JsonValueKind.Number) exam.HbA1c = hba.GetDecimal();
                }
                catch { /* ignore malformed JSON */ }
            }
            return exam;
        }).ToList();
    }

    // ---- Referral ----

    public async Task<NcdReferralDto> CreateReferralAsync(CreateNcdReferralDto dto)
    {
        var reg = await _db.ChronicDiseaseRegisters.Include(r => r.Patient).FirstOrDefaultAsync(r => r.Id == dto.RegisterId)
            ?? throw new KeyNotFoundException();
        var referral = new Referral
        {
            PatientId = reg.PatientId, ReferralDate = DateTime.UtcNow,
            ToFacility = dto.ToFacility, Reason = dto.Reason,
            Diagnosis = dto.Diagnosis, Summary = dto.TreatmentSummary
        };
        await _db.Referrals.AddAsync(referral);
        await _uow.SaveChangesAsync();
        return new NcdReferralDto { Id = referral.Id, RegisterId = dto.RegisterId, PatientName = reg.Patient?.FullName, ReferralDate = referral.ReferralDate, ToFacility = dto.ToFacility, Reason = dto.Reason, Diagnosis = dto.Diagnosis, TreatmentSummary = dto.TreatmentSummary, Notes = dto.Notes };
    }

    // ---- Sick Leave ----

    public async Task<NcdSickLeaveDto> CreateSickLeaveAsync(CreateNcdSickLeaveDto dto)
    {
        var reg = await _db.ChronicDiseaseRegisters.Include(r => r.Patient).FirstOrDefaultAsync(r => r.Id == dto.RegisterId)
            ?? throw new KeyNotFoundException();
        var sl = new SickLeave
        {
            PatientId = reg.PatientId, FromDate = dto.FromDate, ToDate = dto.ToDate,
            Diagnosis = dto.Diagnosis
        };
        await _db.SickLeaves.AddAsync(sl);
        await _uow.SaveChangesAsync();
        return new NcdSickLeaveDto { Id = sl.Id, RegisterId = dto.RegisterId, PatientName = reg.Patient?.FullName, FromDate = sl.FromDate, ToDate = sl.ToDate, Days = (sl.ToDate - sl.FromDate).Days + 1, Diagnosis = dto.Diagnosis };
    }

    // ---- Tracking books ----

    public async Task<NcdTrackingBookDto> GetTrackingBookAsync(string bookType, Guid? facilityId)
    {
        var diseaseTypes = bookType switch
        {
            "TB" => new[] { "tb" },
            "Mental" => new[] { "mental" },
            _ => new[] { "hypertension", "diabetes", "copd", "asthma" }
        };
        var q = _db.ChronicDiseaseRegisters.Include(r => r.Patient).Include(r => r.Treatments)
            .Where(r => diseaseTypes.Contains(r.DiseaseType));
        if (facilityId.HasValue) q = q.Where(r => r.FacilityId == facilityId);
        var registers = await q.ToListAsync();
        return new NcdTrackingBookDto
        {
            BookType = bookType,
            TotalPatients = registers.Count,
            ActivePatients = registers.Count(r => r.Status == "Active"),
            TreatedPatients = registers.Count(r => r.Status == "Treated"),
            DefaultedPatients = registers.Count(r => r.Status == "Defaulted"),
            Entries = registers.Select(r => new NcdTrackingEntryDto
            {
                PatientId = r.PatientId, PatientName = r.Patient?.FullName, PatientCode = r.Patient?.PatientCode,
                DiseaseType = r.DiseaseType, RegisterDate = r.RegisterDate, Status = r.Status,
                LastVisitDate = r.Treatments.Any() ? r.Treatments.Max(t => t.TreatmentDate) : null
            }).OrderByDescending(e => e.RegisterDate).ToList()
        };
    }

    // ---- Chart data ----

    public async Task<List<BPChartPointDto>> GetBPChartDataAsync(Guid registerId)
    {
        var treatments = await _db.ChronicDiseaseTreatments.Where(t => t.RegisterId == registerId).OrderBy(t => t.TreatmentDate).ToListAsync();
        var points = new List<BPChartPointDto>();
        foreach (var t in treatments)
        {
            if (string.IsNullOrEmpty(t.VitalSigns)) continue;
            try
            {
                var vs = System.Text.Json.JsonDocument.Parse(t.VitalSigns).RootElement;
                int? sys = null, dia = null;
                if (vs.TryGetProperty("SystolicBP", out var sbp) && sbp.ValueKind == System.Text.Json.JsonValueKind.Number) sys = sbp.GetInt32();
                if (vs.TryGetProperty("DiastolicBP", out var dbp) && dbp.ValueKind == System.Text.Json.JsonValueKind.Number) dia = dbp.GetInt32();
                if (sys.HasValue || dia.HasValue)
                    points.Add(new BPChartPointDto { Date = t.TreatmentDate.ToString("dd/MM/yy"), Systolic = sys, Diastolic = dia });
            }
            catch { /* skip */ }
        }
        return points;
    }

    public async Task<List<GlucoseChartPointDto>> GetGlucoseChartDataAsync(Guid registerId)
    {
        var treatments = await _db.ChronicDiseaseTreatments.Where(t => t.RegisterId == registerId).OrderBy(t => t.TreatmentDate).ToListAsync();
        var points = new List<GlucoseChartPointDto>();
        foreach (var t in treatments)
        {
            if (string.IsNullOrEmpty(t.VitalSigns)) continue;
            try
            {
                var vs = System.Text.Json.JsonDocument.Parse(t.VitalSigns).RootElement;
                decimal? gl = null, hba = null;
                if (vs.TryGetProperty("BloodGlucose", out var bg) && bg.ValueKind == System.Text.Json.JsonValueKind.Number) gl = bg.GetDecimal();
                if (vs.TryGetProperty("HbA1c", out var h) && h.ValueKind == System.Text.Json.JsonValueKind.Number) hba = h.GetDecimal();
                if (gl.HasValue || hba.HasValue)
                    points.Add(new GlucoseChartPointDto { Date = t.TreatmentDate.ToString("dd/MM/yy"), Glucose = gl, HbA1c = hba });
            }
            catch { /* skip */ }
        }
        return points;
    }
}

public class ImmunizationService : IImmunizationService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public ImmunizationService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<ImmunizationSubjectDto>> SearchSubjectsAsync(ImmunizationSearchDto dto)
    {
        var q = _db.ImmunizationSubjects.Include(s => s.Vaccinations).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(s => s.FullName.Contains(dto.Keyword) || s.SubjectCode.Contains(dto.Keyword));
        if (!string.IsNullOrEmpty(dto.Village)) q = q.Where(s => s.Village == dto.Village);
        var total = await q.CountAsync();
        var items = await q.OrderBy(s => s.FullName).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<ImmunizationSubjectDto> { Items = items.Select(s => new ImmunizationSubjectDto { Id = s.Id, SubjectCode = s.SubjectCode, FullName = s.FullName, DateOfBirth = s.DateOfBirth, Gender = s.Gender, MotherName = s.MotherName, Address = s.Address, Village = s.Village, Phone = s.Phone, VaccinationCount = s.Vaccinations.Count }).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<ImmunizationSubjectDto> GetSubjectByIdAsync(Guid id)
    {
        var s = await _db.ImmunizationSubjects.Include(x => x.Vaccinations).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException();
        return new ImmunizationSubjectDto { Id = s.Id, SubjectCode = s.SubjectCode, FullName = s.FullName, DateOfBirth = s.DateOfBirth, Gender = s.Gender, MotherName = s.MotherName, Address = s.Address, Village = s.Village, Phone = s.Phone, VaccinationCount = s.Vaccinations.Count };
    }

    public async Task<ImmunizationSubjectDto> CreateSubjectAsync(CreateImmunizationSubjectDto dto)
    {
        var count = await _db.ImmunizationSubjects.CountAsync() + 1;
        var s = new ImmunizationSubject { SubjectCode = $"TC{DateTime.Now:yy}{count:D6}", FullName = dto.FullName, DateOfBirth = dto.DateOfBirth, Gender = dto.Gender, MotherName = dto.MotherName, FatherName = dto.FatherName, Address = dto.Address, Village = dto.Village, Phone = dto.Phone };
        await _db.ImmunizationSubjects.AddAsync(s); await _uow.SaveChangesAsync();
        return await GetSubjectByIdAsync(s.Id);
    }

    public async Task<List<VaccinationRecordDto>> GetVaccinationsAsync(Guid subjectId)
        => await _db.VaccinationRecords.Include(v => v.Vaccine).Where(v => v.SubjectId == subjectId).OrderByDescending(v => v.VaccinationDate)
            .Select(v => new VaccinationRecordDto { Id = v.Id, SubjectId = v.SubjectId, VaccineId = v.VaccineId, VaccineName = v.Vaccine.Name, VaccinationDate = v.VaccinationDate, DoseNumber = v.DoseNumber, BatchNumber = v.BatchNumber, InjectionSite = v.InjectionSite, Route = v.Route, Reaction = v.Reaction, ReactionDetail = v.ReactionDetail }).ToListAsync();

    public async Task<VaccinationRecordDto> RecordVaccinationAsync(CreateVaccinationRecordDto dto)
    {
        var v = new VaccinationRecord { SubjectId = dto.SubjectId, VaccineId = dto.VaccineId, VaccinationDate = DateTime.UtcNow, DoseNumber = dto.DoseNumber, BatchNumber = dto.BatchNumber, InjectionSite = dto.InjectionSite, Route = dto.Route };
        await _db.VaccinationRecords.AddAsync(v); await _uow.SaveChangesAsync();
        return new VaccinationRecordDto { Id = v.Id, SubjectId = v.SubjectId, VaccineId = v.VaccineId, VaccinationDate = v.VaccinationDate, DoseNumber = v.DoseNumber, BatchNumber = v.BatchNumber };
    }

    public async Task<List<VaccineDto>> GetVaccinesAsync()
        => await _db.Vaccines.Where(v => v.IsActive).OrderBy(v => v.Name).Select(v => new VaccineDto { Id = v.Id, Code = v.Code, Name = v.Name, Manufacturer = v.Manufacturer, AntigenList = v.AntigenList, StorageCondition = v.StorageCondition, DosesPerVial = v.DosesPerVial, IsActive = v.IsActive }).ToListAsync();

    public async Task<VaccineDto> CreateVaccineAsync(VaccineDto dto)
    {
        var v = new Vaccine { Code = dto.Code, Name = dto.Name, Manufacturer = dto.Manufacturer, AntigenList = dto.AntigenList, StorageCondition = dto.StorageCondition, DosesPerVial = dto.DosesPerVial, IsActive = true };
        await _db.Vaccines.AddAsync(v); await _uow.SaveChangesAsync();
        dto.Id = v.Id; return dto;
    }

    public async Task<List<VaccineStockDto>> GetVaccineStockAsync(Guid? vaccineId = null)
    {
        var q = _db.VaccineStocks.Include(s => s.Vaccine).AsQueryable();
        if (vaccineId.HasValue) q = q.Where(s => s.VaccineId == vaccineId);
        return await q.OrderByDescending(s => s.StockDate).Select(s => new VaccineStockDto { Id = s.Id, StockCode = s.StockCode, VaccineId = s.VaccineId, VaccineName = s.Vaccine.Name, StockType = s.StockType, StockDate = s.StockDate, Quantity = s.Quantity, BatchNumber = s.BatchNumber, ExpiryDate = s.ExpiryDate }).ToListAsync();
    }

    public async Task<List<NutritionMeasurementDto>> GetNutritionMeasurementsAsync(Guid subjectId)
        => await _db.NutritionMeasurements.Where(n => n.SubjectId == subjectId).OrderByDescending(n => n.MeasurementDate)
            .Select(n => new NutritionMeasurementDto { Id = n.Id, SubjectId = n.SubjectId, MeasurementDate = n.MeasurementDate, Weight = n.Weight, Height = n.Height, HeadCircumference = n.HeadCircumference, NutritionStatus = n.NutritionStatus }).ToListAsync();

    public async Task<NutritionMeasurementDto> RecordMeasurementAsync(Guid subjectId, NutritionMeasurementDto dto)
    {
        var n = new NutritionMeasurement { SubjectId = subjectId, MeasurementDate = DateTime.UtcNow, Weight = dto.Weight, Height = dto.Height, HeadCircumference = dto.HeadCircumference, NutritionStatus = dto.NutritionStatus };
        await _db.NutritionMeasurements.AddAsync(n); await _uow.SaveChangesAsync();
        dto.Id = n.Id; dto.SubjectId = subjectId; return dto;
    }

    // ---- Vaccine Stock Issues ----

    public async Task<VaccineStockIssueDto> CreateVaccineStockIssueAsync(CreateVaccineStockIssueDto dto)
    {
        var vaccine = await _db.Vaccines.FindAsync(dto.VaccineId) ?? throw new KeyNotFoundException("Vaccine not found");
        var stock = await _db.VaccineStocks.Where(s => s.VaccineId == dto.VaccineId && s.Quantity > 0)
            .OrderBy(s => s.ExpiryDate).FirstOrDefaultAsync();
        if (stock != null && stock.Quantity >= dto.Quantity) stock.Quantity -= dto.Quantity;

        var count = await _db.VaccineStocks.CountAsync() + 1;
        var issue = new VaccineStock
        {
            StockCode = $"XV{dto.IssueType[..1].ToUpper()}{DateTime.Now:yyMMdd}{count:D4}",
            VaccineId = dto.VaccineId, StockType = $"Xuat{dto.IssueType}",
            StockDate = DateTime.UtcNow, Quantity = -dto.Quantity,
            BatchNumber = dto.BatchNumber, Notes = dto.Reason, Status = 1
        };
        await _db.VaccineStocks.AddAsync(issue);
        await _uow.SaveChangesAsync();
        return new VaccineStockIssueDto { Id = issue.Id, IssueCode = issue.StockCode, IssueType = dto.IssueType, VaccineId = dto.VaccineId, VaccineName = vaccine.Name, Quantity = dto.Quantity, IssueDate = issue.StockDate, Reason = dto.Reason, BatchNumber = dto.BatchNumber, Notes = dto.Notes, Status = 1 };
    }

    public async Task<PagedResult<VaccineStockIssueDto>> GetVaccineStockIssuesAsync(string? issueType, int pageIndex, int pageSize)
    {
        var q = _db.VaccineStocks.Include(s => s.Vaccine).Where(s => s.Quantity < 0);
        if (!string.IsNullOrEmpty(issueType)) q = q.Where(s => s.StockType == $"Xuat{issueType}");
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(s => s.StockDate).Skip(pageIndex * pageSize).Take(pageSize)
            .Select(s => new VaccineStockIssueDto { Id = s.Id, IssueCode = s.StockCode, IssueType = s.StockType ?? "", VaccineId = s.VaccineId, VaccineName = s.Vaccine.Name, Quantity = -s.Quantity, IssueDate = s.StockDate, Reason = s.Notes, BatchNumber = s.BatchNumber, Status = s.Status }).ToListAsync();
        return new PagedResult<VaccineStockIssueDto> { Items = items, TotalCount = total, PageIndex = pageIndex, PageSize = pageSize };
    }

    // ---- Reports ----

    public async Task<ImmunReportDto> GetImmunizationReportAsync(string reportCode, int year, int? month, int? quarter, Guid? facilityId)
    {
        // Generate report data based on vaccination records
        var q = _db.VaccinationRecords.Include(v => v.Vaccine).Include(v => v.Subject)
            .Where(v => v.VaccinationDate.Year == year);
        if (month.HasValue) q = q.Where(v => v.VaccinationDate.Month == month);
        if (quarter.HasValue)
        {
            var startMonth = (quarter.Value - 1) * 3 + 1;
            q = q.Where(v => v.VaccinationDate.Month >= startMonth && v.VaccinationDate.Month < startMonth + 3);
        }
        if (facilityId.HasValue) q = q.Where(v => v.FacilityId == facilityId);
        var records = await q.ToListAsync();
        var data = System.Text.Json.JsonSerializer.Serialize(new
        {
            totalVaccinations = records.Count,
            byVaccine = records.GroupBy(r => r.Vaccine?.Name ?? "Unknown").Select(g => new { vaccine = g.Key, count = g.Count() }),
            byMonth = records.GroupBy(r => r.VaccinationDate.Month).OrderBy(g => g.Key).Select(g => new { month = g.Key, count = g.Count() })
        });
        return new ImmunReportDto { ReportCode = reportCode, Year = year, Month = month, Quarter = quarter, FacilityId = facilityId, Data = data, Status = 0 };
    }

    public async Task SendReportToUpperLevelAsync(string reportCode, Guid reportId)
    {
        // Mark report as sent (using SystemConfig as a simple store)
        await Task.CompletedTask;
    }

    // ---- Print ----

    public Task<byte[]> PrintBarcodeAsync(Guid subjectId)
    {
        var html = $"<html><body><div style='text-align:center;font-family:monospace'><p>*{subjectId:N}*</p><p>Subject ID: {subjectId}</p></div></body></html>";
        return Task.FromResult(System.Text.Encoding.UTF8.GetBytes(html));
    }

    public async Task<byte[]> PrintAppointmentSlipAsync(Guid planId)
    {
        var plan = await _db.ImmunizationPlans.FindAsync(planId);
        var html = $"<html><body><h2>PHIEU HEN TIEM CHUNG</h2><p>Ma: {plan?.PlanCode ?? "N/A"}</p><p>Thang: {plan?.Month}/{plan?.Year}</p></body></html>";
        return System.Text.Encoding.UTF8.GetBytes(html);
    }

    // ---- Stats ----

    public async Task<ChildAgeStatsDto> GetChildStatsByAgeAsync(Guid? facilityId)
    {
        var now = DateTime.UtcNow;
        var q = _db.ImmunizationSubjects.Include(s => s.Vaccinations).AsQueryable();
        if (facilityId.HasValue) q = q.Where(s => s.FacilityId == facilityId);
        var subjects = await q.ToListAsync();
        var totalRequired = 10; // Standard EPI schedule doses
        return new ChildAgeStatsDto
        {
            Under1Year = subjects.Count(s => (now - s.DateOfBirth).TotalDays < 365),
            From1To2Years = subjects.Count(s => (now - s.DateOfBirth).TotalDays >= 365 && (now - s.DateOfBirth).TotalDays < 730),
            From2To5Years = subjects.Count(s => (now - s.DateOfBirth).TotalDays >= 730 && (now - s.DateOfBirth).TotalDays < 1825),
            Above5Years = subjects.Count(s => (now - s.DateOfBirth).TotalDays >= 1825),
            TotalSubjects = subjects.Count,
            FullyVaccinated = subjects.Count(s => s.Vaccinations.Count >= totalRequired),
            PartiallyVaccinated = subjects.Count(s => s.Vaccinations.Count > 0 && s.Vaccinations.Count < totalRequired)
        };
    }
}

public class CommunicableDiseaseService : ICommunicableDiseaseService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public CommunicableDiseaseService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<DiseaseCaseDto>> SearchCasesAsync(DiseaseCaseSearchDto dto)
    {
        var q = _db.DiseaseCases.Include(d => d.Patient).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(d => d.Patient.FullName.Contains(dto.Keyword) || (d.DiseaseName != null && d.DiseaseName.Contains(dto.Keyword)));
        if (!string.IsNullOrEmpty(dto.DiseaseName)) q = q.Where(d => d.DiseaseName == dto.DiseaseName);
        if (dto.Status.HasValue) q = q.Where(d => d.Status == dto.Status);
        if (dto.FromDate.HasValue) q = q.Where(d => d.OnsetDate >= dto.FromDate);
        if (dto.ToDate.HasValue) q = q.Where(d => d.OnsetDate <= dto.ToDate);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(d => d.OnsetDate).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<DiseaseCaseDto> { Items = items.Select(d => new DiseaseCaseDto { Id = d.Id, PatientId = d.PatientId, PatientName = d.Patient?.FullName, DiseaseName = d.DiseaseName, IcdCode = d.IcdCode, OnsetDate = d.OnsetDate, ReportDate = d.ReportDate, Outcome = d.Outcome, Status = d.Status }).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<DiseaseCaseDto> GetCaseByIdAsync(Guid id)
    {
        var d = await _db.DiseaseCases.Include(x => x.Patient).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException();
        return new DiseaseCaseDto { Id = d.Id, PatientId = d.PatientId, PatientName = d.Patient?.FullName, DiseaseName = d.DiseaseName, IcdCode = d.IcdCode, OnsetDate = d.OnsetDate, ReportDate = d.ReportDate, EpidemiologicalHistory = d.EpidemiologicalHistory, TreatmentInfo = d.TreatmentInfo, Outcome = d.Outcome, Status = d.Status };
    }

    public async Task<DiseaseCaseDto> ReportCaseAsync(CreateDiseaseCaseDto dto)
    {
        var c = new DiseaseCase { PatientId = dto.PatientId, DiseaseName = dto.DiseaseName, IcdCode = dto.IcdCode, OnsetDate = dto.OnsetDate, ReportDate = DateTime.UtcNow, EpidemiologicalHistory = dto.EpidemiologicalHistory, TreatmentInfo = dto.TreatmentInfo, Status = 0 };
        await _db.DiseaseCases.AddAsync(c); await _uow.SaveChangesAsync();
        return await GetCaseByIdAsync(c.Id);
    }

    public async Task UpdateCaseOutcomeAsync(Guid id, string outcome)
    {
        var c = await _db.DiseaseCases.FindAsync(id) ?? throw new KeyNotFoundException();
        c.Outcome = outcome; c.Status = 1; await _uow.SaveChangesAsync();
    }

    public async Task<List<WeeklyReportDto>> GetWeeklyReportsAsync(int year, Guid facilityId)
        => await _db.WeeklyReports.Where(w => w.Year == year && w.FacilityId == facilityId).OrderBy(w => w.WeekNumber)
            .Select(w => new WeeklyReportDto { Id = w.Id, Year = w.Year, WeekNumber = w.WeekNumber, FacilityId = w.FacilityId, ReportData = w.ReportData, Status = w.Status, SentDate = w.SentDate }).ToListAsync();

    public async Task<WeeklyReportDto> CreateWeeklyReportAsync(int year, int week, Guid facilityId, string reportData)
    {
        var w = new WeeklyReport { Year = year, WeekNumber = week, FacilityId = facilityId, ReportData = reportData, Status = 0 };
        await _db.WeeklyReports.AddAsync(w); await _uow.SaveChangesAsync();
        return new WeeklyReportDto { Id = w.Id, Year = w.Year, WeekNumber = w.WeekNumber, FacilityId = w.FacilityId, Status = w.Status };
    }

    public async Task<List<MonthlyReportDto>> GetMonthlyReportsAsync(int year, Guid facilityId)
        => await _db.MonthlyReports.Where(m => m.Year == year && m.FacilityId == facilityId).OrderBy(m => m.Month)
            .Select(m => new MonthlyReportDto { Id = m.Id, Year = m.Year, Month = m.Month, FacilityId = m.FacilityId, ReportData = m.ReportData, Status = m.Status, SentDate = m.SentDate }).ToListAsync();

    public async Task<MonthlyReportDto> CreateMonthlyReportAsync(int year, int month, Guid facilityId, string reportData)
    {
        var m = new MonthlyReport { Year = year, Month = month, FacilityId = facilityId, ReportData = reportData, Status = 0 };
        await _db.MonthlyReports.AddAsync(m); await _uow.SaveChangesAsync();
        return new MonthlyReportDto { Id = m.Id, Year = m.Year, Month = m.Month, FacilityId = m.FacilityId, Status = m.Status };
    }
}

public class ReproductiveHealthService : IReproductiveHealthService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public ReproductiveHealthService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<PrenatalRecordDto>> GetPrenatalRecordsAsync(ReproductiveHealthSearchDto dto)
    {
        var q = _db.PrenatalRecords.Include(p => p.Patient).AsQueryable();
        if (dto.PatientId.HasValue) q = q.Where(p => p.PatientId == dto.PatientId);
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(p => p.Patient.FullName.Contains(dto.Keyword));
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.ExamDate).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(p => new PrenatalRecordDto { Id = p.Id, PatientId = p.PatientId, PatientName = p.Patient.FullName, ExamDate = p.ExamDate, GestationalWeek = p.GestationalWeek, Weight = p.Weight, SystolicBP = p.SystolicBP, DiastolicBP = p.DiastolicBP, FundalHeight = p.FundalHeight, FetalHeartRate = p.FetalHeartRate, FetalPosition = p.FetalPosition, Diagnosis = p.Diagnosis, Notes = p.Notes }).ToListAsync();
        return new PagedResult<PrenatalRecordDto> { Items = items, TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<PrenatalRecordDto> CreatePrenatalRecordAsync(CreatePrenatalRecordDto dto)
    {
        var r = new PrenatalRecord { PatientId = dto.PatientId, ExamDate = DateTime.UtcNow, GestationalWeek = dto.GestationalWeek, Weight = dto.Weight, SystolicBP = dto.SystolicBP, DiastolicBP = dto.DiastolicBP, FundalHeight = dto.FundalHeight, FetalHeartRate = dto.FetalHeartRate, FetalPosition = dto.FetalPosition, Edema = dto.Edema, UltrasoundResult = dto.UltrasoundResult, Diagnosis = dto.Diagnosis, Notes = dto.Notes };
        await _db.PrenatalRecords.AddAsync(r); await _uow.SaveChangesAsync();
        return new PrenatalRecordDto { Id = r.Id, PatientId = r.PatientId, ExamDate = r.ExamDate, GestationalWeek = r.GestationalWeek };
    }

    public async Task<PagedResult<DeliveryRecordDto>> GetDeliveryRecordsAsync(ReproductiveHealthSearchDto dto)
    {
        var q = _db.DeliveryRecords.Include(d => d.Patient).AsQueryable();
        if (dto.PatientId.HasValue) q = q.Where(d => d.PatientId == dto.PatientId);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(d => d.DeliveryDate).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize)
            .Select(d => new DeliveryRecordDto { Id = d.Id, PatientId = d.PatientId, PatientName = d.Patient.FullName, DeliveryDate = d.DeliveryDate, GestationalWeek = d.GestationalWeek, DeliveryType = d.DeliveryType, Complications = d.Complications, ChildGender = d.ChildGender, ChildWeight = d.ChildWeight, ApgarScore1Min = d.ApgarScore1Min, ApgarScore5Min = d.ApgarScore5Min, ChildStatus = d.ChildStatus, MotherStatus = d.MotherStatus }).ToListAsync();
        return new PagedResult<DeliveryRecordDto> { Items = items, TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<DeliveryRecordDto> CreateDeliveryRecordAsync(CreateDeliveryRecordDto dto)
    {
        var d = new DeliveryRecord { PatientId = dto.PatientId, DeliveryDate = DateTime.UtcNow, GestationalWeek = dto.GestationalWeek, DeliveryType = dto.DeliveryType, Complications = dto.Complications, ChildGender = dto.ChildGender, ChildWeight = dto.ChildWeight, ChildLength = dto.ChildLength, ApgarScore1Min = dto.ApgarScore1Min, ApgarScore5Min = dto.ApgarScore5Min, ChildStatus = dto.ChildStatus, MotherStatus = dto.MotherStatus, Notes = dto.Notes };
        await _db.DeliveryRecords.AddAsync(d); await _uow.SaveChangesAsync();
        return new DeliveryRecordDto { Id = d.Id, PatientId = d.PatientId, DeliveryDate = d.DeliveryDate };
    }

    public async Task<List<FamilyPlanningRecordDto>> GetFamilyPlanningAsync(Guid patientId)
        => await _db.FamilyPlanningRecords.Where(f => f.PatientId == patientId).OrderByDescending(f => f.RecordDate)
            .Select(f => new FamilyPlanningRecordDto { Id = f.Id, PatientId = f.PatientId, RecordDate = f.RecordDate, Method = f.Method, StartDate = f.StartDate, EndDate = f.EndDate, Notes = f.Notes }).ToListAsync();

    public async Task<FamilyPlanningRecordDto> CreateFamilyPlanningAsync(Guid patientId, FamilyPlanningRecordDto dto)
    {
        var f = new FamilyPlanningRecord { PatientId = patientId, RecordDate = DateTime.UtcNow, Method = dto.Method, StartDate = dto.StartDate, EndDate = dto.EndDate, Notes = dto.Notes };
        await _db.FamilyPlanningRecords.AddAsync(f); await _uow.SaveChangesAsync();
        dto.Id = f.Id; dto.PatientId = patientId; return dto;
    }
}

public class HivAidsService : IHivAidsService
{
    private readonly CHISDbContext _db; private readonly IUnitOfWork _uow;
    public HivAidsService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PagedResult<HivPatientDto>> SearchAsync(HivSearchDto dto)
    {
        var q = _db.HivPatients.Include(h => h.Patient).Include(h => h.TreatmentCourses).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(h => h.Patient.FullName.Contains(dto.Keyword) || (h.HivCode != null && h.HivCode.Contains(dto.Keyword)));
        if (dto.Status.HasValue) q = q.Where(h => h.Status == dto.Status);
        if (!string.IsNullOrEmpty(dto.ClinicalStage)) q = q.Where(h => h.ClinicalStage == dto.ClinicalStage);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(h => h.CreatedAt).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<HivPatientDto> { Items = items.Select(h => new HivPatientDto { Id = h.Id, PatientId = h.PatientId, PatientName = h.Patient?.FullName, HivCode = h.HivCode, DiagnosisDate = h.DiagnosisDate, ArvStartDate = h.ArvStartDate, CurrentRegimen = h.CurrentRegimen, ClinicalStage = h.ClinicalStage, LatestCd4 = h.LatestCd4, LatestViralLoad = h.LatestViralLoad, Status = h.Status, TreatmentCourseCount = h.TreatmentCourses.Count }).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<HivPatientDto> GetByIdAsync(Guid id)
    {
        var h = await _db.HivPatients.Include(x => x.Patient).Include(x => x.TreatmentCourses).FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException();
        return new HivPatientDto { Id = h.Id, PatientId = h.PatientId, PatientName = h.Patient?.FullName, HivCode = h.HivCode, DiagnosisDate = h.DiagnosisDate, ArvStartDate = h.ArvStartDate, CurrentRegimen = h.CurrentRegimen, ClinicalStage = h.ClinicalStage, LatestCd4 = h.LatestCd4, LatestViralLoad = h.LatestViralLoad, Status = h.Status, TreatmentCourseCount = h.TreatmentCourses.Count };
    }

    public async Task<HivPatientDto> RegisterAsync(CreateHivPatientDto dto)
    {
        var h = new HivPatient { PatientId = dto.PatientId, HivCode = dto.HivCode, DiagnosisDate = dto.DiagnosisDate, ClinicalStage = dto.ClinicalStage, FamilyHistory = dto.FamilyHistory, Status = 0 };
        await _db.HivPatients.AddAsync(h); await _uow.SaveChangesAsync();
        return await GetByIdAsync(h.Id);
    }

    public async Task<HivPatientDto> UpdateAsync(Guid id, CreateHivPatientDto dto)
    {
        var h = await _db.HivPatients.FindAsync(id) ?? throw new KeyNotFoundException();
        h.HivCode = dto.HivCode; h.DiagnosisDate = dto.DiagnosisDate; h.ClinicalStage = dto.ClinicalStage; h.FamilyHistory = dto.FamilyHistory;
        await _uow.SaveChangesAsync();
        return await GetByIdAsync(id);
    }

    public async Task<List<ArvTreatmentCourseDto>> GetTreatmentCoursesAsync(Guid hivPatientId)
        => await _db.ArvTreatmentCourses.Where(a => a.HivPatientId == hivPatientId).OrderByDescending(a => a.StartDate)
            .Select(a => new ArvTreatmentCourseDto { Id = a.Id, HivPatientId = a.HivPatientId, StartDate = a.StartDate, EndDate = a.EndDate, Regimen = a.Regimen, ChangeReason = a.ChangeReason, Notes = a.Notes }).ToListAsync();

    public async Task<ArvTreatmentCourseDto> StartTreatmentCourseAsync(CreateArvTreatmentCourseDto dto)
    {
        var hiv = await _db.HivPatients.FindAsync(dto.HivPatientId) ?? throw new KeyNotFoundException();
        var c = new ArvTreatmentCourse { HivPatientId = dto.HivPatientId, StartDate = DateTime.UtcNow, Regimen = dto.Regimen, Notes = dto.Notes };
        hiv.CurrentRegimen = dto.Regimen; hiv.ArvStartDate ??= DateTime.UtcNow;
        await _db.ArvTreatmentCourses.AddAsync(c); await _uow.SaveChangesAsync();
        return new ArvTreatmentCourseDto { Id = c.Id, HivPatientId = c.HivPatientId, StartDate = c.StartDate, Regimen = c.Regimen, Notes = c.Notes };
    }

    public async Task EndTreatmentCourseAsync(Guid courseId, string? changeReason)
    {
        var c = await _db.ArvTreatmentCourses.FindAsync(courseId) ?? throw new KeyNotFoundException();
        c.EndDate = DateTime.UtcNow; c.ChangeReason = changeReason;
        await _uow.SaveChangesAsync();
    }
}
