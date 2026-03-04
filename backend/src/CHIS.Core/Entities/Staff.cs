namespace CHIS.Core.Entities;

public class Staff : BaseEntity
{
    public string StaffCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    public int? Gender { get; set; }
    public string? Position { get; set; }
    public string? Qualification { get; set; }
    public string? Specialty { get; set; }
    public string? PracticeLicenseNumber { get; set; }
    public DateTime? PracticeLicenseExpiry { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? FacilityId { get; set; }
    public bool IsActive { get; set; } = true;
    public string? ElectronicPrescriptionMapping { get; set; }
    public Department? Department { get; set; }
}
