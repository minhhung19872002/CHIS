namespace CHIS.Application.DTOs;

public class SystemConfigDto
{
    public Guid Id { get; set; }
    public string Key { get; set; } = string.Empty;
    public string? Value { get; set; }
    public string? Description { get; set; }
    public string? Module { get; set; }
}

public class FacilityDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? FacilityType { get; set; }
    public string? MaBHXH { get; set; }
    public bool IsActive { get; set; }
    public int DepartmentCount { get; set; }
}

public class CreateFacilityDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? FacilityType { get; set; }
    public string? MaBHXH { get; set; }
}

public class DepartmentDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? DepartmentType { get; set; }
    public Guid? FacilityId { get; set; }
    public string? FacilityName { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
    public int RoomCount { get; set; }
}

public class CreateDepartmentDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? DepartmentType { get; set; }
    public Guid? FacilityId { get; set; }
    public int SortOrder { get; set; }
}

public class RoomDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public string? RoomType { get; set; }
    public bool IsActive { get; set; }
    public int SortOrder { get; set; }
}

public class CreateRoomDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string? RoomType { get; set; }
    public int SortOrder { get; set; }
}

public class IcdCodeDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? NameEnglish { get; set; }
    public string? Chapter { get; set; }
    public string? Group { get; set; }
}

public class IcdSearchDto
{
    public string? Keyword { get; set; }
    public string? Chapter { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class NotificationDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public string? Type { get; set; }
    public string? Module { get; set; }
    public string? ActionUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AuditLogDto
{
    public Guid Id { get; set; }
    public Guid? UserId { get; set; }
    public string? Username { get; set; }
    public string? UserFullName { get; set; }
    public string? Action { get; set; }
    public string? EntityType { get; set; }
    public string? EntityId { get; set; }
    public string? Details { get; set; }
    public string? Module { get; set; }
    public string? RequestPath { get; set; }
    public string? RequestMethod { get; set; }
    public int? ResponseStatusCode { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class AuditLogSearchDto
{
    public string? Keyword { get; set; }
    public string? Module { get; set; }
    public string? Action { get; set; }
    public Guid? UserId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}
