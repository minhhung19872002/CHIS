namespace CHIS.Application.DTOs;

public class PrenatalRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public DateTime ExamDate { get; set; }
    public int? GestationalWeek { get; set; }
    public decimal? Weight { get; set; }
    public int? SystolicBP { get; set; }
    public int? DiastolicBP { get; set; }
    public decimal? FundalHeight { get; set; }
    public string? FetalHeartRate { get; set; }
    public string? FetalPosition { get; set; }
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
}

public class CreatePrenatalRecordDto
{
    public Guid PatientId { get; set; }
    public int? GestationalWeek { get; set; }
    public decimal? Weight { get; set; }
    public int? SystolicBP { get; set; }
    public int? DiastolicBP { get; set; }
    public decimal? FundalHeight { get; set; }
    public string? FetalHeartRate { get; set; }
    public string? FetalPosition { get; set; }
    public string? Edema { get; set; }
    public string? UltrasoundResult { get; set; }
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
}

public class DeliveryRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public DateTime DeliveryDate { get; set; }
    public int? GestationalWeek { get; set; }
    public string? DeliveryType { get; set; }
    public string? Complications { get; set; }
    public string? ChildGender { get; set; }
    public decimal? ChildWeight { get; set; }
    public int? ApgarScore1Min { get; set; }
    public int? ApgarScore5Min { get; set; }
    public string? ChildStatus { get; set; }
    public string? MotherStatus { get; set; }
}

public class CreateDeliveryRecordDto
{
    public Guid PatientId { get; set; }
    public int? GestationalWeek { get; set; }
    public string? DeliveryType { get; set; }
    public string? Complications { get; set; }
    public string? ChildGender { get; set; }
    public decimal? ChildWeight { get; set; }
    public decimal? ChildLength { get; set; }
    public int? ApgarScore1Min { get; set; }
    public int? ApgarScore5Min { get; set; }
    public string? ChildStatus { get; set; }
    public string? MotherStatus { get; set; }
    public string? Notes { get; set; }
}

public class FamilyPlanningRecordDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public DateTime RecordDate { get; set; }
    public string? Method { get; set; }
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Notes { get; set; }
}

public class ReproductiveHealthSearchDto
{
    public string? Keyword { get; set; }
    public Guid? PatientId { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}
