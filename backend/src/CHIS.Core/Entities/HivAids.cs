namespace CHIS.Core.Entities;

public class HivPatient : BaseEntity
{
    public Guid PatientId { get; set; }
    public string? HivCode { get; set; }
    public DateTime? DiagnosisDate { get; set; }
    public DateTime? ArvStartDate { get; set; }
    public string? CurrentRegimen { get; set; }
    public string? ClinicalStage { get; set; }
    public decimal? LatestCd4 { get; set; }
    public decimal? LatestViralLoad { get; set; }
    public string? FamilyHistory { get; set; }
    public int Status { get; set; }
    public Guid? FacilityId { get; set; }
    public Patient Patient { get; set; } = null!;
    public ICollection<ArvTreatmentCourse> TreatmentCourses { get; set; } = new List<ArvTreatmentCourse>();
}

public class ArvTreatmentCourse : BaseEntity
{
    public Guid HivPatientId { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public string? Regimen { get; set; }
    public string? ChangeReason { get; set; }
    public string? Notes { get; set; }
    public HivPatient HivPatient { get; set; } = null!;
}

public class HivCommunication : BaseEntity
{
    public DateTime ActivityDate { get; set; }
    public string? ActivityType { get; set; }
    public string? Location { get; set; }
    public int? Participants { get; set; }
    public string? Content { get; set; }
    public string? Notes { get; set; }
    public Guid? FacilityId { get; set; }
}
