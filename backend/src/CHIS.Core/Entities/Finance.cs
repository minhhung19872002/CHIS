namespace CHIS.Core.Entities;

public class FinanceVoucher : BaseEntity
{
    public string VoucherCode { get; set; } = string.Empty;
    public string VoucherType { get; set; } = string.Empty;
    public DateTime VoucherDate { get; set; }
    public decimal Amount { get; set; }
    public string? Description { get; set; }
    public string? Category { get; set; }
    public int Status { get; set; }
    public Guid? FacilityId { get; set; }
}

public class FinanceBalance : BaseEntity
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal OpeningBalance { get; set; }
    public decimal TotalReceipts { get; set; }
    public decimal TotalPayments { get; set; }
    public decimal ClosingBalance { get; set; }
    public Guid? FacilityId { get; set; }
}
