namespace CHIS.Core.Entities;

public class DataSyncLog : BaseEntity
{
    public string SyncType { get; set; } = string.Empty;
    public string? Direction { get; set; }
    public DateTime SyncDate { get; set; }
    public int? RecordCount { get; set; }
    public int? SuccessCount { get; set; }
    public int? ErrorCount { get; set; }
    public string? ErrorDetails { get; set; }
    public int Status { get; set; }
    public Guid? FacilityId { get; set; }
}

public class BhytSyncConfig : BaseEntity
{
    public string? ApiUrl { get; set; }
    public string? Username { get; set; }
    public string? Password { get; set; }
    public string? MaBenhVien { get; set; }
    public Guid? FacilityId { get; set; }
    public bool IsActive { get; set; }
}

public class ServicePriceConfig : BaseEntity
{
    public Guid ServiceId { get; set; }
    public decimal Price { get; set; }
    public string? PriceType { get; set; }
    public DateTime EffectiveFrom { get; set; }
    public DateTime? EffectiveTo { get; set; }
    public bool IsActive { get; set; } = true;
    public Service Service { get; set; } = null!;
}

public class DepartmentServiceConfig : BaseEntity
{
    public Guid DepartmentId { get; set; }
    public Guid ServiceId { get; set; }
    public Department Department { get; set; } = null!;
    public Service Service { get; set; } = null!;
}
