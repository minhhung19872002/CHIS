using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CHIS.Infrastructure.Services;

public class InpatientService : IInpatientService
{
    private readonly CHISDbContext _db;
    private readonly IUnitOfWork _uow;
    public InpatientService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<AdmissionDto> GetAdmissionByIdAsync(Guid id)
    {
        var a = await _db.Admissions.Include(x => x.Patient).Include(x => x.Department).Include(x => x.Bed)
            .FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException();
        return MapDto(a);
    }

    public async Task<PagedResult<AdmissionDto>> SearchAdmissionsAsync(AdmissionSearchDto dto)
    {
        var q = _db.Admissions.Include(a => a.Patient).Include(a => a.Department).Include(a => a.Bed).AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword)) q = q.Where(a => a.Patient.FullName.Contains(dto.Keyword));
        if (dto.DepartmentId.HasValue) q = q.Where(a => a.DepartmentId == dto.DepartmentId);
        if (dto.Status.HasValue) q = q.Where(a => a.Status == dto.Status);
        if (dto.FromDate.HasValue) q = q.Where(a => a.AdmissionDate >= dto.FromDate);
        if (dto.ToDate.HasValue) q = q.Where(a => a.AdmissionDate <= dto.ToDate);
        var total = await q.CountAsync();
        var items = await q.OrderByDescending(a => a.AdmissionDate).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<AdmissionDto> { Items = items.Select(MapDto).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<AdmissionDto> AdmitAsync(CreateAdmissionDto dto)
    {
        var admission = new Admission
        {
            PatientId = dto.PatientId, MedicalRecordId = dto.MedicalRecordId,
            DepartmentId = dto.DepartmentId, BedId = dto.BedId,
            AdmittingDoctorId = dto.AdmittingDoctorId, AdmissionDate = DateTime.UtcNow,
            AdmissionDiagnosis = dto.AdmissionDiagnosis, AdmissionReason = dto.AdmissionReason,
            AdmissionType = dto.AdmissionType, Status = 0
        };
        if (dto.BedId.HasValue)
        {
            var bed = await _db.Beds.FindAsync(dto.BedId);
            if (bed != null) bed.Status = "Occupied";
        }
        await _db.Admissions.AddAsync(admission);
        await _uow.SaveChangesAsync();
        return await GetAdmissionByIdAsync(admission.Id);
    }

    public async Task<DischargeDto> DischargeAsync(CreateDischargeDto dto)
    {
        var admission = await _db.Admissions.FindAsync(dto.AdmissionId) ?? throw new KeyNotFoundException();
        admission.Status = 1;
        if (admission.BedId.HasValue)
        {
            var bed = await _db.Beds.FindAsync(admission.BedId);
            if (bed != null) bed.Status = "Available";
        }
        var discharge = new Discharge
        {
            AdmissionId = dto.AdmissionId, PatientId = admission.PatientId,
            DischargeDate = DateTime.UtcNow, DischargeDiagnosis = dto.DischargeDiagnosis,
            DischargeCondition = dto.DischargeCondition, DischargeType = dto.DischargeType,
            FollowUpPlan = dto.FollowUpPlan
        };
        await _db.Discharges.AddAsync(discharge);
        await _uow.SaveChangesAsync();
        return new DischargeDto
        {
            Id = discharge.Id, AdmissionId = discharge.AdmissionId, PatientId = discharge.PatientId,
            DischargeDate = discharge.DischargeDate, DischargeDiagnosis = discharge.DischargeDiagnosis,
            DischargeCondition = discharge.DischargeCondition, DischargeType = discharge.DischargeType,
            FollowUpPlan = discharge.FollowUpPlan
        };
    }

    public async Task<List<BedDto>> GetAvailableBedsAsync(Guid departmentId)
    {
        return await _db.Beds.Include(b => b.Room).Include(b => b.Department)
            .Where(b => b.DepartmentId == departmentId && b.IsActive && b.Status == "Available")
            .Select(b => new BedDto { Id = b.Id, Code = b.Code, Name = b.Name, RoomId = b.RoomId, RoomName = b.Room.Name, DepartmentId = b.DepartmentId, DepartmentName = b.Department.Name, Status = b.Status, IsActive = b.IsActive }).ToListAsync();
    }

    public async Task AssignBedAsync(Guid admissionId, Guid bedId)
    {
        var admission = await _db.Admissions.FindAsync(admissionId) ?? throw new KeyNotFoundException();
        if (admission.BedId.HasValue)
        {
            var oldBed = await _db.Beds.FindAsync(admission.BedId);
            if (oldBed != null) oldBed.Status = "Available";
        }
        admission.BedId = bedId;
        var newBed = await _db.Beds.FindAsync(bedId);
        if (newBed != null) newBed.Status = "Occupied";
        await _uow.SaveChangesAsync();
    }

    public async Task TransferBedAsync(Guid admissionId, Guid newBedId)
        => await AssignBedAsync(admissionId, newBedId);

    public async Task<List<TreatmentSheetDto>> GetTreatmentSheetsAsync(Guid admissionId)
    {
        return await _db.TreatmentSheets.Where(t => t.AdmissionId == admissionId)
            .OrderByDescending(t => t.TreatmentDate)
            .Select(t => new TreatmentSheetDto { Id = t.Id, AdmissionId = t.AdmissionId, PatientId = t.PatientId, TreatmentDate = t.TreatmentDate, DayNumber = t.DayNumber, Progress = t.Progress, Orders = t.Orders, Notes = t.Notes, DoctorId = t.DoctorId }).ToListAsync();
    }

    public async Task<TreatmentSheetDto> CreateTreatmentSheetAsync(CreateTreatmentSheetDto dto)
    {
        var ts = new TreatmentSheet
        {
            AdmissionId = dto.AdmissionId, PatientId = dto.PatientId,
            TreatmentDate = DateTime.UtcNow, DayNumber = dto.DayNumber,
            Progress = dto.Progress, Orders = dto.Orders, Notes = dto.Notes
        };
        await _db.TreatmentSheets.AddAsync(ts);
        await _uow.SaveChangesAsync();
        return new TreatmentSheetDto { Id = ts.Id, AdmissionId = ts.AdmissionId, PatientId = ts.PatientId, TreatmentDate = ts.TreatmentDate, DayNumber = ts.DayNumber, Progress = ts.Progress, Orders = ts.Orders, Notes = ts.Notes };
    }

    private static AdmissionDto MapDto(Admission a) => new()
    {
        Id = a.Id, PatientId = a.PatientId, PatientName = a.Patient?.FullName,
        PatientCode = a.Patient?.PatientCode, MedicalRecordId = a.MedicalRecordId,
        DepartmentId = a.DepartmentId, DepartmentName = a.Department?.Name,
        BedId = a.BedId, BedName = a.Bed?.Name,
        AdmittingDoctorId = a.AdmittingDoctorId, AdmissionDate = a.AdmissionDate,
        AdmissionDiagnosis = a.AdmissionDiagnosis, AdmissionReason = a.AdmissionReason,
        AdmissionType = a.AdmissionType, Status = a.Status
    };
}
