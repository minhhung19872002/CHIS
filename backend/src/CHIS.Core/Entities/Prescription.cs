namespace CHIS.Core.Entities;

public class Medicine : BaseEntity
{
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
    public bool IsApproved { get; set; } = true;
    public bool IsActive { get; set; } = true;
}

public class Prescription : BaseEntity
{
    public Guid ExaminationId { get; set; }
    public Guid PatientId { get; set; }
    public Guid? DoctorId { get; set; }
    public DateTime PrescriptionDate { get; set; }
    public string? Diagnosis { get; set; }
    public string? Notes { get; set; }
    public int Status { get; set; }
    public bool IsDispensed { get; set; }
    public Examination Examination { get; set; } = null!;
    public Patient Patient { get; set; } = null!;
    public ICollection<PrescriptionItem> Items { get; set; } = new List<PrescriptionItem>();
}

public class PrescriptionItem : BaseEntity
{
    public Guid PrescriptionId { get; set; }
    public Guid MedicineId { get; set; }
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
    public Prescription Prescription { get; set; } = null!;
    public Medicine Medicine { get; set; } = null!;
}

public class PrescriptionTemplate : BaseEntity
{
    public string Name { get; set; } = string.Empty;
    public string? Diagnosis { get; set; }
    public Guid? DoctorId { get; set; }
    public string? ItemsJson { get; set; }
}
