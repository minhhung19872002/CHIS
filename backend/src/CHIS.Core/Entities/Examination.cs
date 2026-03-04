namespace CHIS.Core.Entities;

public class Examination : BaseEntity
{
    public Guid PatientId { get; set; }
    public Guid MedicalRecordId { get; set; }
    public Guid? RoomId { get; set; }
    public Guid? DoctorId { get; set; }
    public DateTime ExamDate { get; set; }
    public string? ChiefComplaint { get; set; }
    public string? PresentIllness { get; set; }
    public string? PastHistory { get; set; }
    public string? FamilyHistory { get; set; }
    public string? PhysicalExam { get; set; }
    public string? GeneralExam { get; set; }
    public string? CardiovascularExam { get; set; }
    public string? RespiratoryExam { get; set; }
    public string? GIExam { get; set; }
    public string? NeurologicalExam { get; set; }
    public string? MainDiagnosis { get; set; }
    public string? MainIcdCode { get; set; }
    public string? SecondaryDiagnoses { get; set; }
    public string? TreatmentPlan { get; set; }
    public string? Conclusion { get; set; }
    public int Status { get; set; }
    public decimal? Temperature { get; set; }
    public int? SystolicBP { get; set; }
    public int? DiastolicBP { get; set; }
    public int? HeartRate { get; set; }
    public int? RespiratoryRate { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? SpO2 { get; set; }
    public Patient Patient { get; set; } = null!;
    public MedicalRecord MedicalRecord { get; set; } = null!;
    public Room? Room { get; set; }
    public User? Doctor { get; set; }
    public ICollection<Prescription> Prescriptions { get; set; } = new List<Prescription>();
    public ICollection<ServiceRequest> ServiceRequests { get; set; } = new List<ServiceRequest>();
}

public class QueueTicket : BaseEntity
{
    public Guid PatientId { get; set; }
    public Guid? ExaminationId { get; set; }
    public Guid RoomId { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public int QueueNumber { get; set; }
    public int QueueType { get; set; }
    public int Status { get; set; }
    public DateTime? CalledAt { get; set; }
    public Patient Patient { get; set; } = null!;
    public Room Room { get; set; } = null!;
}
