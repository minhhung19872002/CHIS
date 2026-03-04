namespace CHIS.Application.DTOs;

public class HivPatientDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? HivCode { get; set; }
    public DateTime? DiagnosisDate { get; set; }
    public DateTime? ArvStartDate { get; set; }
    public string? CurrentRegimen { get; set; }
    public string? ClinicalStage { get; set; }
    public decimal? LatestCd4 { get; set; }
    public decimal? LatestViralLoad { get; set; }
    public int Status { get; set; }
    public int TreatmentCourseCount { get; set; }
}

public class CreateHivPatientDto
{
    public Guid PatientId { get; set; }
    public string? HivCode { get; set; }
    public DateTime? DiagnosisDate { get; set; }
    public string? ClinicalStage { get; set; }
    public string? FamilyHistory { get; set; }
}

public class ArvTreatmentCourseDto
{
    public Guid Id { get; set; }
    public Guid HivPatientId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Regimen { get; set; }
    public string? ChangeReason { get; set; }
    public string? Notes { get; set; }
}

public class CreateArvTreatmentCourseDto
{
    public Guid HivPatientId { get; set; }
    public string? Regimen { get; set; }
    public string? Notes { get; set; }
}

public class HivSearchDto
{
    public string? Keyword { get; set; }
    public int? Status { get; set; }
    public string? ClinicalStage { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}
