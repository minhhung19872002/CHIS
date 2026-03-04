namespace CHIS.Core.Entities;

public class Patient : BaseEntity
{
    public string PatientCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime? DateOfBirth { get; set; }
    public int? Gender { get; set; }
    public string? IdentityNumber { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? WardCode { get; set; }
    public string? DistrictCode { get; set; }
    public string? ProvinceCode { get; set; }
    public string? Ethnicity { get; set; }
    public string? Occupation { get; set; }
    public string? InsuranceNumber { get; set; }
    public DateTime? InsuranceExpiry { get; set; }
    public string? InsuranceFacilityCode { get; set; }
    public int? PatientType { get; set; }
    public string? Nationality { get; set; }
    public string? Email { get; set; }
    public Guid? HouseholdId { get; set; }
    public Household? Household { get; set; }
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = new List<MedicalRecord>();
    public ICollection<Examination> Examinations { get; set; } = new List<Examination>();
}

public class MedicalRecord : BaseEntity
{
    public string RecordNumber { get; set; } = string.Empty;
    public Guid PatientId { get; set; }
    public DateTime RecordDate { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? FacilityId { get; set; }
    public string? RecordType { get; set; }
    public int Status { get; set; }
    public Patient Patient { get; set; } = null!;
    public Department? Department { get; set; }
}
