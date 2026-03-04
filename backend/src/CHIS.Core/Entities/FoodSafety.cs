namespace CHIS.Core.Entities;

public class FoodBusiness : BaseEntity
{
    public string BusinessName { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? OwnerName { get; set; }
    public string? Phone { get; set; }
    public string? BusinessType { get; set; }
    public string? LicenseNumber { get; set; }
    public DateTime? LicenseExpiry { get; set; }
    public string? Status { get; set; }
    public Guid? FacilityId { get; set; }
}

public class FoodViolation : BaseEntity
{
    public Guid FoodBusinessId { get; set; }
    public DateTime ViolationDate { get; set; }
    public string? ViolationType { get; set; }
    public string? Description { get; set; }
    public string? Penalty { get; set; }
    public string? Notes { get; set; }
    public FoodBusiness FoodBusiness { get; set; } = null!;
}

public class FoodPoisoning : BaseEntity
{
    public DateTime IncidentDate { get; set; }
    public string? Location { get; set; }
    public int? AffectedCount { get; set; }
    public int? HospitalizedCount { get; set; }
    public int? DeathCount { get; set; }
    public string? SuspectedFood { get; set; }
    public string? CauseAgent { get; set; }
    public string? Description { get; set; }
    public string? Actions { get; set; }
    public Guid? FacilityId { get; set; }
}
