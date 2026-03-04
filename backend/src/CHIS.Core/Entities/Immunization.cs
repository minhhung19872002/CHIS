namespace CHIS.Core.Entities;

public class Antigen : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class Vaccine : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Manufacturer { get; set; }
    public string? AntigenList { get; set; }
    public string? StorageCondition { get; set; }
    public int? DosesPerVial { get; set; }
    public bool IsActive { get; set; } = true;
}

public class ImmunizationSubject : BaseEntity
{
    public string SubjectCode { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public int Gender { get; set; }
    public string? MotherName { get; set; }
    public string? FatherName { get; set; }
    public string? Address { get; set; }
    public string? Village { get; set; }
    public string? Phone { get; set; }
    public Guid? FacilityId { get; set; }
    public ICollection<VaccinationRecord> Vaccinations { get; set; } = new List<VaccinationRecord>();
    public ICollection<NutritionMeasurement> NutritionMeasurements { get; set; } = new List<NutritionMeasurement>();
}

public class VaccinationRecord : BaseEntity
{
    public Guid SubjectId { get; set; }
    public Guid VaccineId { get; set; }
    public DateTime VaccinationDate { get; set; }
    public int DoseNumber { get; set; }
    public string? BatchNumber { get; set; }
    public string? InjectionSite { get; set; }
    public string? Route { get; set; }
    public string? Reaction { get; set; }
    public string? ReactionDetail { get; set; }
    public Guid? VaccinatorId { get; set; }
    public Guid? FacilityId { get; set; }
    public ImmunizationSubject Subject { get; set; } = null!;
    public Vaccine Vaccine { get; set; } = null!;
}

public class ImmunizationPlan : BaseEntity
{
    public string PlanCode { get; set; } = string.Empty;
    public int Year { get; set; }
    public int Month { get; set; }
    public Guid FacilityId { get; set; }
    public string? PlanData { get; set; }
    public int Status { get; set; }
}

public class VaccineStock : BaseEntity
{
    public string StockCode { get; set; } = string.Empty;
    public Guid VaccineId { get; set; }
    public string? StockType { get; set; }
    public DateTime StockDate { get; set; }
    public decimal Quantity { get; set; }
    public string? BatchNumber { get; set; }
    public DateTime? ExpiryDate { get; set; }
    public string? Notes { get; set; }
    public int Status { get; set; }
    public Guid? FacilityId { get; set; }
    public Vaccine Vaccine { get; set; } = null!;
}

public class NutritionMeasurement : BaseEntity
{
    public Guid SubjectId { get; set; }
    public DateTime MeasurementDate { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public decimal? HeadCircumference { get; set; }
    public string? NutritionStatus { get; set; }
    public string? Notes { get; set; }
    public ImmunizationSubject Subject { get; set; } = null!;
}
