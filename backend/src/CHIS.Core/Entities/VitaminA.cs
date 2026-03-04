namespace CHIS.Core.Entities;

public class VitaminAPlan : BaseEntity
{
    public int Year { get; set; }
    public int Campaign { get; set; }
    public Guid FacilityId { get; set; }
    public string? PlanData { get; set; }
    public int Status { get; set; }
}

public class VitaminARecord : BaseEntity
{
    public Guid SubjectId { get; set; }
    public DateTime GivenDate { get; set; }
    public string? DoseType { get; set; }
    public string? Campaign { get; set; }
    public string? Notes { get; set; }
    public Guid? FacilityId { get; set; }
    public ImmunizationSubject Subject { get; set; } = null!;
}
