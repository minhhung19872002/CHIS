namespace CHIS.Application.DTOs;

public class ExaminationDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public string? PatientCode { get; set; }
    public Guid MedicalRecordId { get; set; }
    public Guid? RoomId { get; set; }
    public string? RoomName { get; set; }
    public Guid? DoctorId { get; set; }
    public string? DoctorName { get; set; }
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
}

public class ExaminationSearchDto
{
    public string? Keyword { get; set; }
    public Guid? RoomId { get; set; }
    public Guid? DoctorId { get; set; }
    public int? Status { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}

public class CreateExaminationDto
{
    public Guid PatientId { get; set; }
    public Guid MedicalRecordId { get; set; }
    public Guid? RoomId { get; set; }
    public Guid? DoctorId { get; set; }
    public string? ChiefComplaint { get; set; }
    public int? QueueType { get; set; }
}

public class UpdateExaminationDto
{
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
    public decimal? Temperature { get; set; }
    public int? SystolicBP { get; set; }
    public int? DiastolicBP { get; set; }
    public int? HeartRate { get; set; }
    public int? RespiratoryRate { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? SpO2 { get; set; }
}

public class QueueTicketDto
{
    public Guid Id { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public Guid RoomId { get; set; }
    public string? RoomName { get; set; }
    public string TicketCode { get; set; } = string.Empty;
    public int QueueNumber { get; set; }
    public int QueueType { get; set; }
    public int Status { get; set; }
    public DateTime? CalledAt { get; set; }
    public DateTime CreatedAt { get; set; }
}
