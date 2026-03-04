namespace CHIS.Core.Entities;

public class MedicalSupply : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Unit { get; set; }
    public string? Specification { get; set; }
    public string? SupplyGroup { get; set; }
    public string? BhytCode { get; set; }
    public decimal? BhytPrice { get; set; }
    public decimal? SellPrice { get; set; }
    public bool IsApproved { get; set; } = true;
    public bool IsActive { get; set; } = true;
}
