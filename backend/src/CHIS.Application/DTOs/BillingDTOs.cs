namespace CHIS.Application.DTOs;

public class ReceiptDto
{
    public Guid Id { get; set; }
    public string ReceiptNumber { get; set; } = string.Empty;
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public Guid MedicalRecordId { get; set; }
    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal BhytAmount { get; set; }
    public decimal PatientAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string? PaymentMethod { get; set; }
    public int Status { get; set; }
    public string? ReceiptType { get; set; }
    public List<ReceiptDetailDto> Details { get; set; } = new();
}

public class ReceiptDetailDto
{
    public Guid Id { get; set; }
    public string? ItemType { get; set; }
    public string? ItemName { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal? BhytPercent { get; set; }
    public decimal? BhytAmount { get; set; }
    public decimal? PatientAmount { get; set; }
}

public class CreateReceiptDto
{
    public Guid PatientId { get; set; }
    public Guid MedicalRecordId { get; set; }
    public string? PaymentMethod { get; set; }
    public string? ReceiptType { get; set; }
    public decimal? DiscountAmount { get; set; }
    public List<CreateReceiptDetailDto> Details { get; set; } = new();
}

public class CreateReceiptDetailDto
{
    public string? ItemType { get; set; }
    public string? ItemName { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal? BhytPercent { get; set; }
}

public class ReceiptSearchDto
{
    public string? Keyword { get; set; }
    public int? Status { get; set; }
    public string? ReceiptType { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class RevenueReportDto
{
    public decimal TotalRevenue { get; set; }
    public decimal BhytRevenue { get; set; }
    public decimal FeeRevenue { get; set; }
    public int TotalReceipts { get; set; }
    public List<RevenueByDayDto> DailyBreakdown { get; set; } = new();
}

public class RevenueByDayDto
{
    public DateTime Date { get; set; }
    public decimal Amount { get; set; }
    public int Count { get; set; }
}
