using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface IExaminationService
{
    // ---- Existing ----
    Task<ExaminationDto> GetByIdAsync(Guid id);
    Task<PagedResult<ExaminationDto>> SearchAsync(ExaminationSearchDto dto);
    Task<ExaminationDto> CreateAsync(CreateExaminationDto dto);
    Task<ExaminationDto> UpdateAsync(Guid id, UpdateExaminationDto dto);
    Task CompleteExaminationAsync(Guid id);
    Task<List<QueueTicketDto>> GetQueueByRoomAsync(Guid roomId);
    Task<QueueTicketDto> CallNextAsync(Guid roomId);
    Task CancelQueueTicketAsync(Guid ticketId);

    // ---- Specialized Medical Records (14 types) ----
    Task<List<SpecializedMedicalRecordDto>> GetSpecializedRecordsAsync(Guid patientId, string? recordType);
    Task<SpecializedMedicalRecordDto> CreateSpecializedRecordAsync(CreateSpecializedRecordDto dto);
    Task<SpecializedMedicalRecordDto> UpdateSpecializedRecordAsync(Guid id, CreateSpecializedRecordDto dto);
    Task DeleteSpecializedRecordAsync(Guid id);
    Task<byte[]> PrintSpecializedRecordAsync(Guid id);

    // ---- Tracking Books (8 types) ----
    Task<List<TrackingBookEntryDto>> GetTrackingBookEntriesAsync(Guid patientId, string bookType);
    Task<TrackingBookEntryDto> CreateTrackingBookEntryAsync(CreateTrackingBookEntryDto dto);
    Task<TrackingBookEntryDto> UpdateTrackingBookEntryAsync(Guid id, CreateTrackingBookEntryDto dto);
    Task DeleteTrackingBookEntryAsync(Guid id);

    // ---- Vital Sign Charts ----
    Task<VitalSignChartDto> GetVitalSignChartAsync(Guid patientId, string chartType, DateTime from, DateTime to);

    // ---- Infusion / Oxytocin / Surgery Records ----
    Task<InfusionRecordDto> CreateInfusionRecordAsync(CreateInfusionRecordDto dto);
    Task<OxytocinRecordDto> CreateOxytocinRecordAsync(CreateOxytocinRecordDto dto);
    Task<SurgeryRecordDto> CreateSurgeryRecordAsync(CreateSurgeryRecordDto dto);

    // ---- Patient Type Change ----
    Task ChangePatientTypeAsync(Guid examinationId, string newType);

    // ---- Online Bookings ----
    Task<PagedResult<OnlineBookingDto>> GetOnlineBookingsAsync(OnlineBookingSearchDto dto);

    // ---- Patients by Level ----
    Task<List<ExamPatientByLevelDto>> GetPatientsByLevelAsync(string level);
}
