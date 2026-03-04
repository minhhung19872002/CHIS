namespace CHIS.Core.Entities;

public class ChronicDiseaseRegister : BaseEntity
{
    public Guid PatientId { get; set; }
    public string DiseaseType { get; set; } = string.Empty;
    public DateTime RegisterDate { get; set; }
    public string? Status { get; set; }
    public string? Notes { get; set; }
    public Guid? FacilityId { get; set; }
    public Patient Patient { get; set; } = null!;
    public ICollection<ChronicDiseaseTreatment> Treatments { get; set; } = new List<ChronicDiseaseTreatment>();
}

public class ChronicDiseaseTreatment : BaseEntity
{
    public Guid RegisterId { get; set; }
    public DateTime TreatmentDate { get; set; }
    public string? Progress { get; set; }
    public string? Orders { get; set; }
    public string? VitalSigns { get; set; }
    public string? Notes { get; set; }
    public Guid? DoctorId { get; set; }
    public ChronicDiseaseRegister Register { get; set; } = null!;
}
