namespace CHIS.Core.Entities;

public class Department : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? DepartmentType { get; set; }
    public Guid? FacilityId { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public Facility? Facility { get; set; }
    public ICollection<Room> Rooms { get; set; } = new List<Room>();
}

public class Room : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid DepartmentId { get; set; }
    public string? RoomType { get; set; }
    public bool IsActive { get; set; } = true;
    public int SortOrder { get; set; }
    public Department Department { get; set; } = null!;
}

public class Facility : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? FacilityType { get; set; }
    public string? MaBHXH { get; set; }
    public bool IsActive { get; set; } = true;
    public ICollection<Department> Departments { get; set; } = new List<Department>();
}

public class Bed : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public Guid RoomId { get; set; }
    public Guid DepartmentId { get; set; }
    public string? Status { get; set; }
    public bool IsActive { get; set; } = true;
    public Room Room { get; set; } = null!;
    public Department Department { get; set; } = null!;
}
