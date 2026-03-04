namespace CHIS.Application.DTOs;

public class DiseaseCaseDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? DiseaseName { get; set; }
    public string? IcdCode { get; set; }
    public DateTime OnsetDate { get; set; }
    public DateTime? ReportDate { get; set; }
    public string? EpidemiologicalHistory { get; set; }
    public string? TreatmentInfo { get; set; }
    public string? Outcome { get; set; }
    public int Status { get; set; }
}

public class CreateDiseaseCaseDto
{
    public Guid PatientId { get; set; }
    public string? DiseaseName { get; set; }
    public string? IcdCode { get; set; }
    public DateTime OnsetDate { get; set; }
    public string? EpidemiologicalHistory { get; set; }
    public string? TreatmentInfo { get; set; }
}

public class DiseaseCaseSearchDto
{
    public string? Keyword { get; set; }
    public string? DiseaseName { get; set; }
    public int? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class WeeklyReportDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public int WeekNumber { get; set; }
    public Guid FacilityId { get; set; }
    public string? ReportData { get; set; }
    public int Status { get; set; }
    public DateTime? SentDate { get; set; }
}

public class MonthlyReportDto
{
    public Guid Id { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public Guid FacilityId { get; set; }
    public string? ReportData { get; set; }
    public int Status { get; set; }
    public DateTime? SentDate { get; set; }
}
