namespace CHIS.Core.Entities;

public class Warehouse : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? WarehouseType { get; set; }
    public Guid? FacilityId { get; set; }
    public bool IsActive { get; set; } = true;
}

public class StockReceipt : BaseEntity
{
    public string ReceiptCode { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public Guid? SupplierId { get; set; }
    public DateTime ReceiptDate { get; set; }
    public string? ReceiptType { get; set; }
    public decimal TotalAmount { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public Supplier? Supplier { get; set; }
    public ICollection<StockReceiptItem> Items { get; set; } = new List<StockReceiptItem>();
}

public class StockReceiptItem : BaseEntity
{
    public Guid StockReceiptId { get; set; }
    public Guid MedicineId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public StockReceipt StockReceipt { get; set; } = null!;
    public Medicine Medicine { get; set; } = null!;
}

public class StockIssue : BaseEntity
{
    public string IssueCode { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public DateTime IssueDate { get; set; }
    public string? IssueType { get; set; }
    public Guid? TargetWarehouseId { get; set; }
    public decimal TotalAmount { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public ICollection<StockIssueItem> Items { get; set; } = new List<StockIssueItem>();
}

public class StockIssueItem : BaseEntity
{
    public Guid StockIssueId { get; set; }
    public Guid MedicineId { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public string? BatchNumber { get; set; }
    public StockIssue StockIssue { get; set; } = null!;
    public Medicine Medicine { get; set; } = null!;
}

public class StockBalance : BaseEntity
{
    public Guid WarehouseId { get; set; }
    public Guid MedicineId { get; set; }
    public decimal Quantity { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public decimal? UnitPrice { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public Medicine Medicine { get; set; } = null!;
}

public class StockTake : BaseEntity
{
    public string StockTakeCode { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public DateTime StockTakeDate { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
    public ICollection<StockTakeItem> Items { get; set; } = new List<StockTakeItem>();
}

public class StockTakeItem : BaseEntity
{
    public Guid StockTakeId { get; set; }
    public Guid MedicineId { get; set; }
    public decimal SystemQuantity { get; set; }
    public decimal ActualQuantity { get; set; }
    public decimal Difference { get; set; }
    public string? Notes { get; set; }
    public StockTake StockTake { get; set; } = null!;
    public Medicine Medicine { get; set; } = null!;
}

public class Supplier : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? TaxCode { get; set; }
    public string? ContactPerson { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ProcurementRequest : BaseEntity
{
    public string RequestCode { get; set; } = string.Empty;
    public Guid WarehouseId { get; set; }
    public DateTime RequestDate { get; set; }
    public int Status { get; set; }
    public string? Notes { get; set; }
    public string? ItemsJson { get; set; }
    public Warehouse Warehouse { get; set; } = null!;
}
