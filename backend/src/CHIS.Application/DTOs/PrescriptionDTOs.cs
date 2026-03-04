namespace CHIS.Application.DTOs;

public class PrescriptionDto
{
    public Guid Id { get; set; }
    public Guid ExaminationId { get; set; }
    public Guid PatientId { get; set; }
    public string? PatientName { get; set; }
    public Guid? DoctorId { get; set; }
    public string? DoctorName { get; set; }
    public DateTime PrescriptionDate { get; set; }
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    public int Status { get; set; }
    public bool IsDispensed { get; set; }
    public List<PrescriptionItemDto> Items { get; set; } = new();
}

public class PrescriptionItemDto
{
    public Guid Id { get; set; }
    public Guid MedicineId { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal Quantity { get; set; }
    public string? Dosage { get; set; }
    public string? Usage { get; set; }
    public int? DaysSupply { get; set; }
    public string? MorningDose { get; set; }
    public string? NoonDose { get; set; }
    public string? AfternoonDose { get; set; }
    public string? EveningDose { get; set; }
    public decimal? UnitPrice { get; set; }
    public decimal? TotalAmount { get; set; }
    public string? Notes { get; set; }
}

public class CreatePrescriptionDto
{
    public Guid ExaminationId { get; set; }
    public Guid PatientId { get; set; }
    public Guid? DoctorId { get; set; }
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    public List<CreatePrescriptionItemDto> Items { get; set; } = new();
}

public class CreatePrescriptionItemDto
{
    public Guid MedicineId { get; set; }
    public decimal Quantity { get; set; }
    public string? Dosage { get; set; }
    public string? Usage { get; set; }
    public int? DaysSupply { get; set; }
    public string? MorningDose { get; set; }
    public string? NoonDose { get; set; }
    public string? AfternoonDose { get; set; }
    public string? EveningDose { get; set; }
    public string? Notes { get; set; }
}

public class MedicineDto
{
    public Guid Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? ActiveIngredient { get; set; }
    public string? Dosage { get; set; }
    public string? Unit { get; set; }
    public string? Packaging { get; set; }
    public string? Route { get; set; }
    public string? Manufacturer { get; set; }
    public string? Country { get; set; }
    public string? BhytCode { get; set; }
    public decimal? BhytPrice { get; set; }
    public decimal? SellPrice { get; set; }
    public string? DrugGroup { get; set; }
    public bool IsActive { get; set; }
}

public class MedicineSearchDto
{
    public string? Keyword { get; set; }
    public string? DrugGroup { get; set; }
    public string? Route { get; set; }
    public int PageIndex { get; set; }
    public int PageSize { get; set; } = 20;
}
