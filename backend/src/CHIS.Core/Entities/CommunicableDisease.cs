namespace CHIS.Core.Entities;

public class DiseaseCase : BaseEntity
{
    public Guid PatientId { get; set; }
    public string? DiseaseName { get; set; }
    public string? IcdCode { get; set; }
    public DateTime OnsetDate { get; set; }
    public DateTime? ReportDate { get; set; }
    public string? EpidemiologicalHistory { get; set; }
    public string? TreatmentInfo { get; set; }
    public string? Outcome { get; set; }
    public int Status { get; set; }
    public Guid? FacilityId { get; set; }
    public Patient Patient { get; set; } = null!;
}

public class WeeklyReport : BaseEntity
{
    public int Year { get; set; }
    public int WeekNumber { get; set; }
    public Guid FacilityId { get; set; }
    public string? ReportData { get; set; }
    public int Status { get; set; }
    public DateTime? SentDate { get; set; }
}

public class MonthlyReport : BaseEntity
{
    public int Year { get; set; }
    public int Month { get; set; }
    public Guid FacilityId { get; set; }
    public string? ReportData { get; set; }
    public int Status { get; set; }
    public DateTime? SentDate { get; set; }
}
