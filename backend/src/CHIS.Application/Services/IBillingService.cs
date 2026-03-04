using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface IBillingService
{
    Task<ReceiptDto> GetByIdAsync(Guid id);
    Task<PagedResult<ReceiptDto>> SearchAsync(ReceiptSearchDto dto);
    Task<ReceiptDto> CreateAsync(CreateReceiptDto dto);
    Task<ReceiptDto> PayAsync(Guid id, string? paymentMethod);
    Task CancelAsync(Guid id);
    Task<RevenueReportDto> GetRevenueReportAsync(DateTime fromDate, DateTime toDate, Guid? facilityId = null);
    Task<List<ReceiptDto>> GetByPatientAsync(Guid patientId);
    Task<List<ReceiptDto>> GetByMedicalRecordAsync(Guid medicalRecordId);
}
