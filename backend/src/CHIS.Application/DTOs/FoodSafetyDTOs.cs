namespace CHIS.Application.DTOs;

public class FoodBusinessDto
{
    public Guid Id { get; set; }
    public string BusinessName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? OwnerName { get; set; }
    public string? Phone { get; set; }
    public string? BusinessType { get; set; }
    public string? LicenseNumber { get; set; }
    public DateTime? LicenseExpiry { get; set; }
    public string? Status { get; set; }
    public int ViolationCount { get; set; }
}

public class CreateFoodBusinessDto
{
    public string BusinessName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? OwnerName { get; set; }
    public string? Phone { get; set; }
    public string? BusinessType { get; set; }
    public string? LicenseNumber { get; set; }
    public DateTime? LicenseExpiry { get; set; }
}

public class FoodViolationDto
{
    public Guid Id { get; set; }
    public Guid FoodBusinessId { get; set; }
    public string? BusinessName { get; set; }
    public DateTime ViolationDate { get; set; }
    public string? ViolationType { get; set; }
    public string? Description { get; set; }
    public string? Penalty { get; set; }
}

public class FoodPoisoningDto
{
    public Guid Id { get; set; }
    public DateTime IncidentDate { get; set; }
    public string? Location { get; set; }
    public int? AffectedCount { get; set; }
    public int? HospitalizedCount { get; set; }
    public int? DeathCount { get; set; }
    public string? SuspectedFood { get; set; }
    public string? CauseAgent { get; set; }
    public string? Description { get; set; }
}

public class FoodSafetySearchDto
{
    public string? Keyword { get; set; }
    public string? BusinessType { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class SanitationFacilityDto
{
    public Guid Id { get; set; }
    public string? FacilityType { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
}

public class HealthCampaignDto
{
    public Guid Id { get; set; }
    public string CampaignName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Location { get; set; }
    public string? Topic { get; set; }
    public int? Participants { get; set; }
    public string? Content { get; set; }
}

public class FinanceVoucherDto
{
    public Guid Id { get; set; }
    public string VoucherCode { get; set; } = string.Empty;
    public string VoucherType { get; set; } = string.Empty;
    public DateTime VoucherDate { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public int Status { get; set; }
}

public class CreateFinanceVoucherDto
{
    public string VoucherType { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
}

public class FinanceSearchDto
{
    public string? Keyword { get; set; }
    public string? VoucherType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class DataSyncLogDto
{
    public Guid Id { get; set; }
    public string SyncType { get; set; } = string.Empty;
    public string? Direction { get; set; }
    public DateTime SyncDate { get; set; }
    public int? RecordCount { get; set; }
    public int? SuccessCount { get; set; }
    public int? ErrorCount { get; set; }
    public string? ErrorDetails { get; set; }
    public int Status { get; set; }
}
