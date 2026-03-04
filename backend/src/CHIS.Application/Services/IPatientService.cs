using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface IPatientService
{
    Task<PatientDto> GetByIdAsync(Guid id);
    Task<PagedResult<PatientDto>> SearchAsync(PatientSearchDto dto);
    Task<PatientDto> CreateAsync(CreatePatientDto dto);
    Task<PatientDto> UpdateAsync(Guid id, UpdatePatientDto dto);
    Task DeleteAsync(Guid id);
    Task<PatientDto?> GetByInsuranceNumberAsync(string insuranceNumber);
    Task<PatientDto?> GetByIdentityNumberAsync(string identityNumber);
    Task<List<MedicalRecordDto>> GetMedicalRecordsAsync(Guid patientId);
    Task<MedicalRecordDto> CreateMedicalRecordAsync(Guid patientId, string? recordType, Guid? departmentId);
}
