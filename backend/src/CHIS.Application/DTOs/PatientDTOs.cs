namespace CHIS.Application.DTOs;

public class PatientDto
{
    public Guid Id { get; set; }
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
}

public class PatientSearchDto
{
    public string? Keyword { get; set; }
    public string? PatientCode { get; set; }
    public string? InsuranceNumber { get; set; }
    public string? IdentityNumber { get; set; }
    public int? PatientType { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class CreatePatientDto
{
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
}

public class UpdatePatientDto : CreatePatientDto
{
}

public class MedicalRecordDto
{
    public Guid Id { get; set; }
    public string RecordNumber { get; set; } = string.Empty;
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public DateTime RecordDate { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? RecordType { get; set; }
    public int Status { get; set; }
}

public class PagedResult<T>
{
    public List<T> Items { get; set; } = new();
    public int TotalCount { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public int TotalPages => PageSize > 0 ? (int)Math.Ceiling((double)TotalCount / PageSize) : 0;
}
