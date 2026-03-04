namespace CHIS.Application.DTOs;

public class StaffDto
{
    public Guid Id { get; set; }
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
    public string? DepartmentName { get; set; }
    public bool IsActive { get; set; }
}

public class CreateStaffDto
{
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
}

public class StaffSearchDto
{
    public string? Keyword { get; set; }
    public string? Position { get; set; }
    public Guid? DepartmentId { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class CollaboratorDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public bool IsActive { get; set; }
}
