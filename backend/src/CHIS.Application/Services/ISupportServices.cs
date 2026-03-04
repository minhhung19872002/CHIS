using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface IEquipmentService
{
    Task<PagedResult<EquipmentDto>> SearchAsync(EquipmentSearchDto dto);
    Task<EquipmentDto> GetByIdAsync(Guid id);
    Task<EquipmentDto> CreateAsync(CreateEquipmentDto dto);
    Task<EquipmentDto> UpdateAsync(Guid id, CreateEquipmentDto dto);
    Task DeleteAsync(Guid id);
    Task<EquipmentTransferDto> TransferAsync(Guid equipmentId, Guid toDepartmentId, string? notes);
    Task<List<EquipmentTransferDto>> GetTransferHistoryAsync(Guid equipmentId);
}

public interface IStaffService
{
    Task<PagedResult<StaffDto>> SearchAsync(StaffSearchDto dto);
    Task<StaffDto> GetByIdAsync(Guid id);
    Task<StaffDto> CreateAsync(CreateStaffDto dto);
    Task<StaffDto> UpdateAsync(Guid id, CreateStaffDto dto);
    Task DeleteAsync(Guid id);
    Task<List<CollaboratorDto>> GetCollaboratorsAsync(Guid? facilityId = null);
    Task<CollaboratorDto> CreateCollaboratorAsync(CollaboratorDto dto);
}

public interface IFoodSafetyService
{
    Task<PagedResult<FoodBusinessDto>> SearchBusinessesAsync(FoodSafetySearchDto dto);
    Task<FoodBusinessDto> CreateBusinessAsync(CreateFoodBusinessDto dto);
    Task<FoodBusinessDto> UpdateBusinessAsync(Guid id, CreateFoodBusinessDto dto);
    Task<List<FoodViolationDto>> GetViolationsAsync(Guid? businessId = null);
    Task<FoodViolationDto> CreateViolationAsync(Guid businessId, FoodViolationDto dto);
    Task<List<FoodPoisoningDto>> GetPoisoningCasesAsync(DateTime? fromDate = null, DateTime? toDate = null);
    Task<FoodPoisoningDto> ReportPoisoningAsync(FoodPoisoningDto dto);
}

public interface IEnvironmentalHealthService
{
    Task<List<SanitationFacilityDto>> GetSanitationFacilitiesAsync(string? village = null);
    Task<SanitationFacilityDto> CreateAsync(SanitationFacilityDto dto);
    Task<SanitationFacilityDto> UpdateAsync(Guid id, SanitationFacilityDto dto);
    Task DeleteAsync(Guid id);
}

public interface IFinanceService
{
    Task<PagedResult<FinanceVoucherDto>> SearchVouchersAsync(FinanceSearchDto dto);
    Task<FinanceVoucherDto> CreateVoucherAsync(CreateFinanceVoucherDto dto);
    Task ApproveVoucherAsync(Guid id);
    Task CancelVoucherAsync(Guid id);
    Task<FinanceVoucherDto> GetBalanceAsync(int year, int month, Guid? facilityId = null);
}

public interface IReportService
{
    // Dashboard & basic statistics
    Task<DashboardDto> GetDashboardAsync(Guid? facilityId = null);
    Task<MonthlyStatisticsDto> GetMonthlyStatisticsAsync(int year, int month, Guid? facilityId = null);
    Task<List<DiseaseStatisticsDto>> GetDiseaseStatisticsAsync(DateTime fromDate, DateTime toDate, Guid? facilityId = null);
    Task<List<ImmunizationCoverageDto>> GetImmunizationCoverageAsync(int year, Guid? facilityId = null);

    // BCX Reports (tuyen xa, Bieu 1-10)
    Task<object> GetBcxReportAsync(int reportNumber, ReportFilterDto filter);

    // BCH Reports (tuyen huyen, Bieu 1-16)
    Task<object> GetBchReportAsync(int reportNumber, ReportFilterDto filter);

    // BCX TT37 Reports (tuyen xa TT37, Bieu 1-8)
    Task<object> GetBcxTT37ReportAsync(int reportNumber, ReportFilterDto filter);

    // BCH TT37 Reports (tuyen huyen TT37, Bieu 1-14)
    Task<object> GetBchTT37ReportAsync(int reportNumber, ReportFilterDto filter);

    // BHYT Reports (mau19, mau20, mau21, mau79, mau80, mau14a, tk371)
    Task<object> GetBhytReportAsync(string mau, ReportFilterDto filter);

    // So YTCS (A1-A12)
    Task<SoYtcsDto> GetSoYtcsAsync(string soType, ReportFilterDto filter);

    // BHYT Summary
    Task<BhytSummaryDto> GetBhytSummaryAsync(ReportFilterDto filter);

    // Additional statistics
    Task<NcdStatisticsDto> GetNcdStatisticsAsync(ReportFilterDto filter);
    Task<BillingSummaryDto> GetBillingSummaryAsync(ReportFilterDto filter);
    Task<GeneralSummaryDto> GetGeneralSummaryAsync(ReportFilterDto filter);
    Task<PatientByLevelDto> GetPatientByLevelAsync(ReportFilterDto filter);
    Task<UtilityReportDto> GetUtilityReportAsync(ReportFilterDto filter);
    Task<PharmacyReportDto> GetPharmacyReportAsync(ReportFilterDto filter);

    // Export
    Task<byte[]> ExportReportAsync(string reportType, string format, ReportFilterDto filter);
}

public interface ISystemService
{
    Task<List<SystemConfigDto>> GetConfigsAsync(string? module = null);
    Task<SystemConfigDto> SaveConfigAsync(SystemConfigDto dto);
    Task<List<FacilityDto>> GetFacilitiesAsync();
    Task<FacilityDto> CreateFacilityAsync(CreateFacilityDto dto);
    Task<FacilityDto> UpdateFacilityAsync(Guid id, CreateFacilityDto dto);
    Task<List<DepartmentDto>> GetDepartmentsAsync(Guid? facilityId = null);
    Task<DepartmentDto> CreateDepartmentAsync(CreateDepartmentDto dto);
    Task<DepartmentDto> UpdateDepartmentAsync(Guid id, CreateDepartmentDto dto);
    Task<List<RoomDto>> GetRoomsAsync(Guid? departmentId = null);
    Task<RoomDto> CreateRoomAsync(CreateRoomDto dto);
    Task<PagedResult<IcdCodeDto>> SearchIcdCodesAsync(IcdSearchDto dto);
    Task<PagedResult<AuditLogDto>> GetAuditLogsAsync(AuditLogSearchDto dto);
}

public interface IDataInteropService
{
    Task<List<DataSyncLogDto>> GetSyncLogsAsync(string? syncType = null, int pageIndex = 0, int pageSize = 20);
    Task<DataSyncLogDto> SyncBhytAsync(Guid facilityId);
    Task<DataSyncLogDto> SyncHsskAsync(Guid facilityId);
}

public interface INotificationService
{
    Task<List<NotificationDto>> GetUserNotificationsAsync(Guid userId, bool unreadOnly = false);
    Task<int> GetUnreadCountAsync(Guid userId);
    Task MarkAsReadAsync(Guid notificationId);
    Task MarkAllAsReadAsync(Guid userId);
    Task CreateNotificationAsync(Guid userId, string title, string? content = null, string? type = null, string? module = null);
}
