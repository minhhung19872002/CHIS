namespace CHIS.Core.Entities;

public class Household : BaseEntity
{
    public string HouseholdCode { get; set; } = string.Empty;
    public string? HeadOfHousehold { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public string? WardCode { get; set; }
    public string? Phone { get; set; }
    public Guid? AssignedDoctorId { get; set; }
    public Guid? FacilityId { get; set; }
    public ICollection<Patient> Members { get; set; } = new List<Patient>();
}

public class BirthCertificate : BaseEntity
{
    public string CertificateNumber { get; set; } = string.Empty;
    public string ChildName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Gender { get; set; }
    public string? PlaceOfBirth { get; set; }
    public string? MotherName { get; set; }
    public string? FatherName { get; set; }
    public string? MotherIdNumber { get; set; }
    public decimal? BirthWeight { get; set; }
    public decimal? BirthLength { get; set; }
    public int? GestationalAge { get; set; }
    public Guid? FacilityId { get; set; }
    public DateTime IssuedDate { get; set; }
}

public class DeathCertificate : BaseEntity
{
    public string CertificateNumber { get; set; } = string.Empty;
    public string DeceasedName { get; set; } = string.Empty;
    public DateTime DateOfDeath { get; set; }
    public string? PlaceOfDeath { get; set; }
    public string? CauseOfDeath { get; set; }
    public string? IcdCode { get; set; }
    public int? Age { get; set; }
    public int? Gender { get; set; }
    public string? Address { get; set; }
    public Guid? FacilityId { get; set; }
    public DateTime IssuedDate { get; set; }
}

public class ElderlyInfo : BaseEntity
{
    public Guid PatientId { get; set; }
    public string? HealthStatus { get; set; }
    public string? ChronicDiseases { get; set; }
    public string? CareLevel { get; set; }
    public string? Notes { get; set; }
    public Patient Patient { get; set; } = null!;
}
