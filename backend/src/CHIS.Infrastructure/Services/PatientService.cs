using CHIS.Application.DTOs;
using CHIS.Application.Services;
using CHIS.Core.Entities;
using CHIS.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace CHIS.Infrastructure.Services;

public class PatientService : IPatientService
{
    private readonly CHISDbContext _db;
    private readonly IUnitOfWork _uow;

    public PatientService(CHISDbContext db, IUnitOfWork uow) { _db = db; _uow = uow; }

    public async Task<PatientDto> GetByIdAsync(Guid id)
    {
        var p = await _db.Patients.FindAsync(id) ?? throw new KeyNotFoundException("Patient not found");
        return MapDto(p);
    }

    public async Task<PagedResult<PatientDto>> SearchAsync(PatientSearchDto dto)
    {
        var q = _db.Patients.AsQueryable();
        if (!string.IsNullOrEmpty(dto.Keyword))
            q = q.Where(p => p.FullName.Contains(dto.Keyword) || p.PatientCode.Contains(dto.Keyword) || (p.Phone != null && p.Phone.Contains(dto.Keyword)));
        if (!string.IsNullOrEmpty(dto.PatientCode)) q = q.Where(p => p.PatientCode == dto.PatientCode);
        if (!string.IsNullOrEmpty(dto.InsuranceNumber)) q = q.Where(p => p.InsuranceNumber == dto.InsuranceNumber);
        if (!string.IsNullOrEmpty(dto.IdentityNumber)) q = q.Where(p => p.IdentityNumber == dto.IdentityNumber);
        if (dto.PatientType.HasValue) q = q.Where(p => p.PatientType == dto.PatientType);

        var total = await q.CountAsync();
        var items = await q.OrderByDescending(p => p.CreatedAt).Skip(dto.PageIndex * dto.PageSize).Take(dto.PageSize).ToListAsync();
        return new PagedResult<PatientDto> { Items = items.Select(MapDto).ToList(), TotalCount = total, PageIndex = dto.PageIndex, PageSize = dto.PageSize };
    }

    public async Task<PatientDto> CreateAsync(CreatePatientDto dto)
    {
        var code = $"BN{DateTime.Now:yyMMdd}{(await _db.Patients.CountAsync() + 1):D4}";
        var patient = new Patient
        {
            PatientCode = code, FullName = dto.FullName, DateOfBirth = dto.DateOfBirth, Gender = dto.Gender,
            IdentityNumber = dto.IdentityNumber, Phone = dto.Phone, Address = dto.Address,
            WardCode = dto.WardCode, DistrictCode = dto.DistrictCode, ProvinceCode = dto.ProvinceCode,
            Ethnicity = dto.Ethnicity, Occupation = dto.Occupation, InsuranceNumber = dto.InsuranceNumber,
            InsuranceExpiry = dto.InsuranceExpiry, InsuranceFacilityCode = dto.InsuranceFacilityCode,
            PatientType = dto.PatientType, Nationality = dto.Nationality, Email = dto.Email, HouseholdId = dto.HouseholdId
        };
        await _db.Patients.AddAsync(patient);
        await _uow.SaveChangesAsync();
        return MapDto(patient);
    }

    public async Task<PatientDto> UpdateAsync(Guid id, UpdatePatientDto dto)
    {
        var p = await _db.Patients.FindAsync(id) ?? throw new KeyNotFoundException("Patient not found");
        p.FullName = dto.FullName; p.DateOfBirth = dto.DateOfBirth; p.Gender = dto.Gender;
        p.IdentityNumber = dto.IdentityNumber; p.Phone = dto.Phone; p.Address = dto.Address;
        p.WardCode = dto.WardCode; p.DistrictCode = dto.DistrictCode; p.ProvinceCode = dto.ProvinceCode;
        p.Ethnicity = dto.Ethnicity; p.Occupation = dto.Occupation; p.InsuranceNumber = dto.InsuranceNumber;
        p.InsuranceExpiry = dto.InsuranceExpiry; p.InsuranceFacilityCode = dto.InsuranceFacilityCode;
        p.PatientType = dto.PatientType; p.Nationality = dto.Nationality; p.Email = dto.Email; p.HouseholdId = dto.HouseholdId;
        await _uow.SaveChangesAsync();
        return MapDto(p);
    }

    public async Task DeleteAsync(Guid id)
    {
        var p = await _db.Patients.FindAsync(id) ?? throw new KeyNotFoundException("Patient not found");
        p.IsDeleted = true;
        await _uow.SaveChangesAsync();
    }

    public async Task<PatientDto?> GetByInsuranceNumberAsync(string insuranceNumber)
    {
        var p = await _db.Patients.FirstOrDefaultAsync(x => x.InsuranceNumber == insuranceNumber);
        return p == null ? null : MapDto(p);
    }

    public async Task<PatientDto?> GetByIdentityNumberAsync(string identityNumber)
    {
        var p = await _db.Patients.FirstOrDefaultAsync(x => x.IdentityNumber == identityNumber);
        return p == null ? null : MapDto(p);
    }

    public async Task<List<MedicalRecordDto>> GetMedicalRecordsAsync(Guid patientId)
    {
        return await _db.MedicalRecords
            .Include(m => m.Department)
            .Where(m => m.PatientId == patientId)
            .OrderByDescending(m => m.RecordDate)
            .Select(m => new MedicalRecordDto
            {
                Id = m.Id, RecordNumber = m.RecordNumber, PatientId = m.PatientId,
                RecordDate = m.RecordDate, DepartmentId = m.DepartmentId,
                DepartmentName = m.Department != null ? m.Department.Name : null,
                RecordType = m.RecordType, Status = m.Status
            }).ToListAsync();
    }

    public async Task<MedicalRecordDto> CreateMedicalRecordAsync(Guid patientId, string? recordType, Guid? departmentId)
    {
        var patient = await _db.Patients.FindAsync(patientId) ?? throw new KeyNotFoundException("Patient not found");
        var count = await _db.MedicalRecords.CountAsync(m => m.PatientId == patientId) + 1;
        var record = new MedicalRecord
        {
            RecordNumber = $"BA{DateTime.Now:yyMMdd}{count:D4}",
            PatientId = patientId, RecordDate = DateTime.UtcNow,
            RecordType = recordType ?? "NgoaiTru", DepartmentId = departmentId, Status = 0
        };
        await _db.MedicalRecords.AddAsync(record);
        await _uow.SaveChangesAsync();
        return new MedicalRecordDto
        {
            Id = record.Id, RecordNumber = record.RecordNumber, PatientId = record.PatientId,
            PatientName = patient.FullName, RecordDate = record.RecordDate,
            RecordType = record.RecordType, Status = record.Status
        };
    }

    private static PatientDto MapDto(Patient p) => new()
    {
        Id = p.Id, PatientCode = p.PatientCode, FullName = p.FullName, DateOfBirth = p.DateOfBirth,
        Gender = p.Gender, IdentityNumber = p.IdentityNumber, Phone = p.Phone, Address = p.Address,
        WardCode = p.WardCode, DistrictCode = p.DistrictCode, ProvinceCode = p.ProvinceCode,
        Ethnicity = p.Ethnicity, Occupation = p.Occupation, InsuranceNumber = p.InsuranceNumber,
        InsuranceExpiry = p.InsuranceExpiry, InsuranceFacilityCode = p.InsuranceFacilityCode,
        PatientType = p.PatientType, Nationality = p.Nationality, Email = p.Email, HouseholdId = p.HouseholdId
    };
}
