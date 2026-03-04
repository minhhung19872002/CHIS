using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface IPopulationService
{
    Task<PagedResult<HouseholdDto>> SearchHouseholdsAsync(HouseholdSearchDto dto);
    Task<HouseholdDto> GetHouseholdByIdAsync(Guid id);
    Task<HouseholdDto> CreateHouseholdAsync(CreateHouseholdDto dto);
    Task<HouseholdDto> UpdateHouseholdAsync(Guid id, CreateHouseholdDto dto);
    Task AddMemberAsync(Guid householdId, Guid patientId);
    Task RemoveMemberAsync(Guid householdId, Guid patientId);
    Task<PagedResult<BirthCertificateDto>> GetBirthCertificatesAsync(int pageIndex, int pageSize, string? keyword = null);
    Task<BirthCertificateDto> CreateBirthCertificateAsync(CreateBirthCertificateDto dto);
    Task<PagedResult<DeathCertificateDto>> GetDeathCertificatesAsync(int pageIndex, int pageSize, string? keyword = null);
    Task<DeathCertificateDto> CreateDeathCertificateAsync(CreateDeathCertificateDto dto);
    Task<List<ElderlyInfoDto>> GetElderlyListAsync(Guid? facilityId = null);
    Task<ElderlyInfoDto> SaveElderlyInfoAsync(Guid patientId, ElderlyInfoDto dto);
}

public interface IChronicDiseaseService
{
    Task<PagedResult<ChronicDiseaseRegisterDto>> SearchAsync(ChronicDiseaseSearchDto dto);
    Task<ChronicDiseaseRegisterDto> GetByIdAsync(Guid id);
    Task<ChronicDiseaseRegisterDto> RegisterAsync(CreateChronicDiseaseRegisterDto dto);
    Task UpdateStatusAsync(Guid id, string status);
    Task<List<ChronicDiseaseTreatmentDto>> GetTreatmentsAsync(Guid registerId);
    Task<ChronicDiseaseTreatmentDto> AddTreatmentAsync(CreateChronicDiseaseTreatmentDto dto);

    // NCD Examination
    Task<NcdExaminationDto> CreateNcdExaminationAsync(CreateNcdExaminationDto dto);
    Task<List<NcdExaminationDto>> GetNcdExaminationsAsync(Guid registerId);

    // Referral & Sick Leave
    Task<NcdReferralDto> CreateReferralAsync(CreateNcdReferralDto dto);
    Task<NcdSickLeaveDto> CreateSickLeaveAsync(CreateNcdSickLeaveDto dto);

    // Tracking books
    Task<NcdTrackingBookDto> GetTrackingBookAsync(string bookType, Guid? facilityId);

    // Chart data
    Task<List<BPChartPointDto>> GetBPChartDataAsync(Guid registerId);
    Task<List<GlucoseChartPointDto>> GetGlucoseChartDataAsync(Guid registerId);
}

public interface IImmunizationService
{
    Task<PagedResult<ImmunizationSubjectDto>> SearchSubjectsAsync(ImmunizationSearchDto dto);
    Task<ImmunizationSubjectDto> GetSubjectByIdAsync(Guid id);
    Task<ImmunizationSubjectDto> CreateSubjectAsync(CreateImmunizationSubjectDto dto);
    Task<List<VaccinationRecordDto>> GetVaccinationsAsync(Guid subjectId);
    Task<VaccinationRecordDto> RecordVaccinationAsync(CreateVaccinationRecordDto dto);
    Task<List<VaccineDto>> GetVaccinesAsync();
    Task<VaccineDto> CreateVaccineAsync(VaccineDto dto);
    Task<List<VaccineStockDto>> GetVaccineStockAsync(Guid? vaccineId = null);
    Task<List<NutritionMeasurementDto>> GetNutritionMeasurementsAsync(Guid subjectId);
    Task<NutritionMeasurementDto> RecordMeasurementAsync(Guid subjectId, NutritionMeasurementDto dto);

    // Vaccine stock issues
    Task<VaccineStockIssueDto> CreateVaccineStockIssueAsync(CreateVaccineStockIssueDto dto);
    Task<PagedResult<VaccineStockIssueDto>> GetVaccineStockIssuesAsync(string? issueType, int pageIndex, int pageSize);

    // Reports
    Task<ImmunReportDto> GetImmunizationReportAsync(string reportCode, int year, int? month, int? quarter, Guid? facilityId);
    Task SendReportToUpperLevelAsync(string reportCode, Guid reportId);

    // Print
    Task<byte[]> PrintBarcodeAsync(Guid subjectId);
    Task<byte[]> PrintAppointmentSlipAsync(Guid planId);

    // Stats
    Task<ChildAgeStatsDto> GetChildStatsByAgeAsync(Guid? facilityId);
}

public interface ICommunicableDiseaseService
{
    Task<PagedResult<DiseaseCaseDto>> SearchCasesAsync(DiseaseCaseSearchDto dto);
    Task<DiseaseCaseDto> GetCaseByIdAsync(Guid id);
    Task<DiseaseCaseDto> ReportCaseAsync(CreateDiseaseCaseDto dto);
    Task UpdateCaseOutcomeAsync(Guid id, string outcome);
    Task<List<WeeklyReportDto>> GetWeeklyReportsAsync(int year, Guid facilityId);
    Task<WeeklyReportDto> CreateWeeklyReportAsync(int year, int week, Guid facilityId, string reportData);
    Task<List<MonthlyReportDto>> GetMonthlyReportsAsync(int year, Guid facilityId);
    Task<MonthlyReportDto> CreateMonthlyReportAsync(int year, int month, Guid facilityId, string reportData);
}

public interface IReproductiveHealthService
{
    Task<PagedResult<PrenatalRecordDto>> GetPrenatalRecordsAsync(ReproductiveHealthSearchDto dto);
    Task<PrenatalRecordDto> CreatePrenatalRecordAsync(CreatePrenatalRecordDto dto);
    Task<PagedResult<DeliveryRecordDto>> GetDeliveryRecordsAsync(ReproductiveHealthSearchDto dto);
    Task<DeliveryRecordDto> CreateDeliveryRecordAsync(CreateDeliveryRecordDto dto);
    Task<List<FamilyPlanningRecordDto>> GetFamilyPlanningAsync(Guid patientId);
    Task<FamilyPlanningRecordDto> CreateFamilyPlanningAsync(Guid patientId, FamilyPlanningRecordDto dto);
}

public interface IHivAidsService
{
    Task<PagedResult<HivPatientDto>> SearchAsync(HivSearchDto dto);
    Task<HivPatientDto> GetByIdAsync(Guid id);
    Task<HivPatientDto> RegisterAsync(CreateHivPatientDto dto);
    Task<HivPatientDto> UpdateAsync(Guid id, CreateHivPatientDto dto);
    Task<List<ArvTreatmentCourseDto>> GetTreatmentCoursesAsync(Guid hivPatientId);
    Task<ArvTreatmentCourseDto> StartTreatmentCourseAsync(CreateArvTreatmentCourseDto dto);
    Task EndTreatmentCourseAsync(Guid courseId, string? changeReason);
}
