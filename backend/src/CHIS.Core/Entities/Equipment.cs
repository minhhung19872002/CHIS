namespace CHIS.Core.Entities;

public class Equipment : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? SerialNumber { get; set; }
    public Guid? DepartmentId { get; set; }
    public Guid? FacilityId { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public decimal? CurrentValue { get; set; }
    public string? Status { get; set; }
    public string? AssetType { get; set; }
    public Department? Department { get; set; }
}

public class EquipmentTransfer : BaseEntity
{
    public Guid EquipmentId { get; set; }
    public Guid FromDepartmentId { get; set; }
    public Guid ToDepartmentId { get; set; }
    public DateTime TransferDate { get; set; }
    public string? Notes { get; set; }
    public Equipment Equipment { get; set; } = null!;
}

public class EquipmentDisposal : BaseEntity
{
    public string DisposalCode { get; set; } = string.Empty;
    public DateTime DisposalDate { get; set; }
    public string? Notes { get; set; }
    public string? ItemsJson { get; set; }
    public int Status { get; set; }
}
