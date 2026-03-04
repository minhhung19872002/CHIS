using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface IPrescriptionService
{
    Task<PrescriptionDto> GetByIdAsync(Guid id);
    Task<List<PrescriptionDto>> GetByExaminationAsync(Guid examinationId);
    Task<PagedResult<PrescriptionDto>> SearchAsync(int pageIndex, int pageSize, string? keyword = null, int? status = null);
    Task<PrescriptionDto> CreateAsync(CreatePrescriptionDto dto);
    Task<PrescriptionDto> UpdateAsync(Guid id, CreatePrescriptionDto dto);
    Task ConfirmAsync(Guid id);
    Task CancelAsync(Guid id);
    Task DeleteAsync(Guid id);
    Task<PagedResult<MedicineDto>> SearchMedicinesAsync(MedicineSearchDto dto);
    Task<MedicineDto> GetMedicineByIdAsync(Guid id);
    Task<MedicineDto> CreateMedicineAsync(MedicineDto dto);
    Task<MedicineDto> UpdateMedicineAsync(Guid id, MedicineDto dto);
}
