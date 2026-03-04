namespace CHIS.Application.DTOs;

public class ImmunizationSubjectDto
{
    public Guid Id { get; set; }
    public string SubjectCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Gender { get; set; }
    public string? MotherName { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public string? Phone { get; set; }
    public int VaccinationCount { get; set; }
}

public class CreateImmunizationSubjectDto
{
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Gender { get; set; }
    public string? MotherName { get; set; }
    public string? FatherName { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public string? Phone { get; set; }
}

public class VaccinationRecordDto
{
    public Guid Id { get; set; }
    public Guid SubjectId { get; set; }
    public string? SubjectName { get; set; }
    public Guid VaccineId { get; set; }
    public string? VaccineName { get; set; }
    public DateTime VaccinationDate { get; set; }
    public int DoseNumber { get; set; }
    public string? BatchNumber { get; set; }
    public string? InjectionSite { get; set; }
    public string? Route { get; set; }
    public string? Reaction { get; set; }
    public string? ReactionDetail { get; set; }
}

public class CreateVaccinationRecordDto
{
    public Guid SubjectId { get; set; }
    public Guid VaccineId { get; set; }
    public int DoseNumber { get; set; }
    public string? BatchNumber { get; set; }
    public string? InjectionSite { get; set; }
    public string? Route { get; set; }
}

public class VaccineDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public string? AntigenList { get; set; }
    public string? StorageCondition { get; set; }
    public int? DosesPerVial { get; set; }
    public bool IsActive { get; set; }
}

public class VaccineStockDto
{
    public Guid Id { get; set; }
    public string StockCode { get; set; } = string.Empty;
    public Guid VaccineId { get; set; }
    public string? VaccineName { get; set; }
    public string? StockType { get; set; }
    public DateTime StockDate { get; set; }
    public decimal Quantity { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
}

public class ImmunizationSearchDto
{
    public string? Keyword { get; set; }
    public string? Village { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class NutritionMeasurementDto
{
    public Guid Id { get; set; }
    public Guid SubjectId { get; set; }
    public string? SubjectName { get; set; }
    public DateTime MeasurementDate { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? HeadCircumference { get; set; }
    public string? NutritionStatus { get; set; }
}

// ---- Vaccine stock issues (xuat tra, huy, kiem dinh, su dung) ----
public class VaccineStockIssueDto
{
    public Guid Id { get; set; }
    public string? IssueCode { get; set; }
    public string IssueType { get; set; } = string.Empty; // Return, Destroy, Inspection, Usage
    public Guid VaccineId { get; set; }
    public string? VaccineName { get; set; }
    public decimal Quantity { get; set; }
    public DateTime IssueDate { get; set; }
    public string? Reason { get; set; }
    public string? BatchNumber { get; set; }
    public string? Notes { get; set; }
    public int Status { get; set; }
}

public class CreateVaccineStockIssueDto
{
    public string IssueType { get; set; } = string.Empty;
    public Guid VaccineId { get; set; }
    public decimal Quantity { get; set; }
    public string? Reason { get; set; }
    public string? BatchNumber { get; set; }
    public string? Notes { get; set; }
}

// ---- Immunization reports ----
public class ImmunReportDto
{
    public Guid Id { get; set; }
    public string ReportCode { get; set; } = string.Empty;
    public int Year { get; set; }
    public int? Month { get; set; }
    public int? Quarter { get; set; }
    public Guid? FacilityId { get; set; }
    public string? FacilityName { get; set; }
    public string? Data { get; set; }
    public int Status { get; set; }
    public DateTime? SentDate { get; set; }
}

// ---- Child age stats ----
public class ChildAgeStatsDto
{
    public int Under1Year { get; set; }
    public int From1To2Years { get; set; }
    public int From2To5Years { get; set; }
    public int Above5Years { get; set; }
    public int TotalSubjects { get; set; }
    public int FullyVaccinated { get; set; }
    public int PartiallyVaccinated { get; set; }
}
