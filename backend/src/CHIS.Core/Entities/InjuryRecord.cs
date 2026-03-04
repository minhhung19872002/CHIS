namespace CHIS.Core.Entities;

public class InjuryRecord : BaseEntity
{
    public Guid PatientId { get; set; }
    public DateTime InjuryDate { get; set; }
    public string? InjuryType { get; set; }
    public string? Location { get; set; }
    public string? Cause { get; set; }
    public string? Severity { get; set; }
    public string? Treatment { get; set; }
    public string? Outcome { get; set; }
    public string? IcdCode { get; set; }
    public Guid? FacilityId { get; set; }
    public Patient Patient { get; set; } = null!;
}
