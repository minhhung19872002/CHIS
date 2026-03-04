namespace CHIS.Core.Entities;

public class Collaborator : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public Guid? FacilityId { get; set; }
    public bool IsActive { get; set; } = true;
}
