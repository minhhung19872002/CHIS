namespace CHIS.Application.DTOs;

public class HouseholdDto
{
    public Guid Id { get; set; }
    public string HouseholdCode { get; set; } = string.Empty;
    public string? HeadOfHousehold { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public string? WardCode { get; set; }
    public string? Phone { get; set; }
    public Guid? AssignedDoctorId { get; set; }
    public string? DoctorName { get; set; }
    public int MemberCount { get; set; }
    public List<PatientDto> Members { get; set; } = new();
}

public class CreateHouseholdDto
{
    public string? HeadOfHousehold { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public string? WardCode { get; set; }
    public string? Phone { get; set; }
    public Guid? AssignedDoctorId { get; set; }
}

public class HouseholdSearchDto
{
    public string? Keyword { get; set; }
    public string? Village { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class BirthCertificateDto
{
    public Guid Id { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string ChildName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Gender { get; set; }
    public string? PlaceOfBirth { get; set; }
    public string? MotherName { get; set; }
    public string? FatherName { get; set; }
    public decimal? BirthWeight { get; set; }
    public decimal? BirthLength { get; set; }
    public int? GestationalAge { get; set; }
    public DateTime IssuedDate { get; set; }
}

public class CreateBirthCertificateDto
{
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
}

public class DeathCertificateDto
{
    public Guid Id { get; set; }
    public string CertificateNumber { get; set; } = string.Empty;
    public string DeceasedName { get; set; } = string.Empty;
    public DateTime DateOfDeath { get; set; }
    public string? CauseOfDeath { get; set; }
    public string? IcdCode { get; set; }
    public int? Age { get; set; }
    public int? Gender { get; set; }
    public DateTime IssuedDate { get; set; }
}

public class CreateDeathCertificateDto
{
    public string DeceasedName { get; set; } = string.Empty;
    public DateTime DateOfDeath { get; set; }
    public string? PlaceOfDeath { get; set; }
    public string? CauseOfDeath { get; set; }
    public string? IcdCode { get; set; }
    public int? Age { get; set; }
    public int? Gender { get; set; }
    public string? Address { get; set; }
}

public class ElderlyInfoDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? HealthStatus { get; set; }
    public string? ChronicDiseases { get; set; }
    public string? CareLevel { get; set; }
    public string? Notes { get; set; }
}
