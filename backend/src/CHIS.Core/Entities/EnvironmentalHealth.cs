namespace CHIS.Core.Entities;

public class SanitationFacility : BaseEntity
{
    public string? FacilityType { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public Guid? HealthFacilityId { get; set; }
}
