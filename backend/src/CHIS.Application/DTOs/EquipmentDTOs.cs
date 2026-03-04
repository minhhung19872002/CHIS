namespace CHIS.Application.DTOs;

public class EquipmentDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? SerialNumber { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public decimal? CurrentValue { get; set; }
    public string? Status { get; set; }
    public string? AssetType { get; set; }
}

public class CreateEquipmentDto
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Model { get; set; }
    public string? SerialNumber { get; set; }
    public Guid? DepartmentId { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public decimal? PurchasePrice { get; set; }
    public string? AssetType { get; set; }
}

public class EquipmentSearchDto
{
    public string? Keyword { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? Status { get; set; }
    public string? AssetType { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class EquipmentTransferDto
{
    public Guid Id { get; set; }
    public Guid EquipmentId { get; set; }
    public string? EquipmentName { get; set; }
    public Guid FromDepartmentId { get; set; }
    public string? FromDepartmentName { get; set; }
    public Guid ToDepartmentId { get; set; }
    public string? ToDepartmentName { get; set; }
    public DateTime TransferDate { get; set; }
    public string? Notes { get; set; }
}
