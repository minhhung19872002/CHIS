using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface IInpatientService
{
    Task<AdmissionDto> GetAdmissionByIdAsync(Guid id);
    Task<PagedResult<AdmissionDto>> SearchAdmissionsAsync(AdmissionSearchDto dto);
    Task<AdmissionDto> AdmitAsync(CreateAdmissionDto dto);
    Task<DischargeDto> DischargeAsync(CreateDischargeDto dto);
    Task<List<BedDto>> GetAvailableBedsAsync(Guid departmentId);
    Task AssignBedAsync(Guid admissionId, Guid bedId);
    Task TransferBedAsync(Guid admissionId, Guid newBedId);
    Task<List<TreatmentSheetDto>> GetTreatmentSheetsAsync(Guid admissionId);
    Task<TreatmentSheetDto> CreateTreatmentSheetAsync(CreateTreatmentSheetDto dto);
}
