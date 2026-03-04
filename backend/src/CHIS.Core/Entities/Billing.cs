namespace CHIS.Core.Entities;

public class Receipt : BaseEntity
{
    public string ReceiptNumber { get; set; } = string.Empty;
    public Guid PatientId { get; set; }
    public Guid MedicalRecordId { get; set; }
    public DateTime ReceiptDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal BhytAmount { get; set; }
    public decimal PatientAmount { get; set; }
    public decimal? DiscountAmount { get; set; }
    public string? PaymentMethod { get; set; }
    public int Status { get; set; }
    public string? ReceiptType { get; set; }
    public Patient Patient { get; set; } = null!;
    public MedicalRecord MedicalRecord { get; set; } = null!;
    public ICollection<ReceiptDetail> Details { get; set; } = new List<ReceiptDetail>();
}

public class ReceiptDetail : BaseEntity
{
    public Guid ReceiptId { get; set; }
    public string? ItemType { get; set; }
    public string? ItemName { get; set; }
    public decimal Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal? BhytPercent { get; set; }
    public decimal? BhytAmount { get; set; }
    public decimal? PatientAmount { get; set; }
    public Receipt Receipt { get; set; } = null!;
}

public class ReceiptBook : BaseEntity
{
    public string BookCode { get; set; } = string.Empty;
    public string? BookName { get; set; }
    public string? SeriesPrefix { get; set; }
    public int FromNumber { get; set; }
    public int ToNumber { get; set; }
    public int CurrentNumber { get; set; }
    public bool IsActive { get; set; } = true;
    public Guid? FacilityId { get; set; }
}

public class ElectronicInvoice : BaseEntity
{
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid ReceiptId { get; set; }
    public string? InvoiceTemplate { get; set; }
    public string? InvoiceSeries { get; set; }
    public string? Provider { get; set; }
    public int Status { get; set; }
    public DateTime? IssuedDate { get; set; }
    public Receipt Receipt { get; set; } = null!;
}
