namespace CHIS.Application.DTOs;

// ============================================================
// Dashboard & Common
// ============================================================

public class DashboardDto
{
    public int TodayPatients { get; set; }
    public int TodayExaminations { get; set; }
    public int ActiveAdmissions { get; set; }
    public decimal TodayRevenue { get; set; }
    public int PendingPrescriptions { get; set; }
    public int PendingLabRequests { get; set; }
    public List<DepartmentStatDto> DepartmentStats { get; set; } = new();
}

public class DepartmentStatDto
{
    public Guid DepartmentId { get; set; }
    public string? DepartmentName { get; set; }
    public int PatientCount { get; set; }
    public decimal Revenue { get; set; }
}

public class ReportFilterDto
{
    public int? Year { get; set; }
    public int? Month { get; set; }
    public int? Quarter { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? FacilityId { get; set; }
    public Guid? DepartmentId { get; set; }
    public string? ReportType { get; set; }
}

public class ReportExportDto
{
    public string Format { get; set; } = "excel"; // excel | pdf
    public string ReportType { get; set; } = string.Empty;
    public ReportFilterDto Filter { get; set; } = new();
}

public class MonthlyStatisticsDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalExaminations { get; set; }
    public int TotalAdmissions { get; set; }
    public int TotalDischarges { get; set; }
    public int TotalBirths { get; set; }
    public int TotalDeaths { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal BhytRevenue { get; set; }
    public decimal FeeRevenue { get; set; }
}

public class DiseaseStatisticsDto
{
    public string? IcdCode { get; set; }
    public string? DiseaseName { get; set; }
    public int CaseCount { get; set; }
    public int MaleCount { get; set; }
    public int FemaleCount { get; set; }
    public int Under5Count { get; set; }        // Duoi 5 tuoi
    public int Under15Count { get; set; }       // Duoi 15 tuoi
    public int Over60Count { get; set; }        // Tren 60 tuoi
    public int DeathCount { get; set; }         // Tu vong
}

public class ImmunizationCoverageDto
{
    public string? VaccineName { get; set; }
    public int TargetCount { get; set; }
    public int VaccinatedCount { get; set; }
    public decimal CoveragePercent { get; set; }
}

// ============================================================
// BCX Reports - Bao cao tuyen xa (Bieu 1-10)
// ============================================================

/// <summary>BCX Bieu 1: Don vi hanh chinh, dan so, sinh tu</summary>
public class BcxReport1Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    public string? DistrictName { get; set; }
    public string? ProvinceName { get; set; }
    public int TotalPopulation { get; set; }                // Tong dan so
    public int MalePopulation { get; set; }                 // Nam
    public int FemalePopulation { get; set; }               // Nu
    public int TotalHouseholds { get; set; }                // Tong so ho
    public int Under1Population { get; set; }               // Duoi 1 tuoi
    public int Under5Population { get; set; }               // Duoi 5 tuoi
    public int Under15Population { get; set; }              // Duoi 15 tuoi
    public int Over60Population { get; set; }               // Tren 60 tuoi
    public int WomenReproductiveAge { get; set; }           // Phu nu tuoi sinh de (15-49)
    public int TotalBirths { get; set; }                    // Tong so sinh
    public int LiveBirths { get; set; }                     // So sinh song
    public int StillBirths { get; set; }                    // Thai chet luu
    public int TotalDeaths { get; set; }                    // Tong so tu vong
    public int InfantDeaths { get; set; }                   // Tu vong duoi 1 tuoi
    public int Under5Deaths { get; set; }                   // Tu vong duoi 5 tuoi
    public int MaternalDeaths { get; set; }                 // Tu vong me
    public decimal BirthRate { get; set; }                  // Ty le sinh (phan nghin)
    public decimal DeathRate { get; set; }                  // Ty le chet (phan nghin)
    public decimal InfantMortalityRate { get; set; }        // Ty le chet tre em duoi 1 tuoi
    public List<BcxReport1VillageDto> Villages { get; set; } = new();
}

public class BcxReport1VillageDto
{
    public string? VillageName { get; set; }                // Ten thon/ap
    public int Households { get; set; }
    public int Population { get; set; }
    public int Male { get; set; }
    public int Female { get; set; }
    public int Births { get; set; }
    public int Deaths { get; set; }
}

/// <summary>BCX Bieu 2: Ngan sach TYT</summary>
public class BcxReport2Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    public decimal TotalBudget { get; set; }                // Tong ngan sach
    public decimal StateBudget { get; set; }                // Ngan sach nha nuoc
    public decimal InsuranceBudget { get; set; }            // BHYT
    public decimal FeeRevenue { get; set; }                 // Vien phi
    public decimal OtherRevenue { get; set; }               // Nguon khac
    public decimal PersonnelExpense { get; set; }           // Chi nhan su
    public decimal MedicineExpense { get; set; }            // Chi thuoc
    public decimal EquipmentExpense { get; set; }           // Chi trang thiet bi
    public decimal OperatingExpense { get; set; }           // Chi hoat dong
    public decimal OtherExpense { get; set; }               // Chi khac
    public decimal Balance { get; set; }                    // Con lai
    public List<BcxReport2ItemDto> Details { get; set; } = new();
}

public class BcxReport2ItemDto
{
    public string? Category { get; set; }
    public string? Description { get; set; }
    public decimal Amount { get; set; }
}

/// <summary>BCX Bieu 3: Nhan luc y te</summary>
public class BcxReport3Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    public int TotalStaff { get; set; }                     // Tong so CBYT
    public int Doctors { get; set; }                        // Bac si
    public int Pharmacists { get; set; }                    // Duoc si
    public int Nurses { get; set; }                         // Dieu duong
    public int Midwives { get; set; }                       // Ho sinh
    public int Technicians { get; set; }                    // Ky thuat vien
    public int TraditionalMedicine { get; set; }            // Y hoc co truyen
    public int HealthWorkers { get; set; }                  // Nhan vien y te thon ban
    public int Collaborators { get; set; }                  // Cong tac vien
    public int DoctorsPer10k { get; set; }                  // BS/10.000 dan
    public List<BcxReport3StaffDto> StaffDetails { get; set; } = new();
}

public class BcxReport3StaffDto
{
    public string? Position { get; set; }
    public string? Qualification { get; set; }
    public int Count { get; set; }
}

/// <summary>BCX Bieu 4: Co so vat chat, TTB</summary>
public class BcxReport4Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    public int TotalRooms { get; set; }                     // Tong so phong
    public int ExamRooms { get; set; }                      // Phong kham
    public int ProcedureRooms { get; set; }                 // Phong thu thuat
    public int DeliveryRoom { get; set; }                   // Phong de
    public int InpatientBeds { get; set; }                  // Giuong benh
    public int TotalEquipment { get; set; }                 // Tong so TTB
    public int FunctionalEquipment { get; set; }            // TTB hoat dong tot
    public int BrokenEquipment { get; set; }                // TTB hong
    public bool HasWater { get; set; }                      // Co nuoc sach
    public bool HasElectricity { get; set; }                // Co dien
    public bool HasPhone { get; set; }                      // Co dien thoai
    public bool HasInternet { get; set; }                   // Co mang internet
    public bool HasAmbulance { get; set; }                  // Co xe cuu thuong
    public List<BcxReport4EquipmentDto> EquipmentList { get; set; } = new();
}

public class BcxReport4EquipmentDto
{
    public string? Name { get; set; }
    public int Quantity { get; set; }
    public int Functional { get; set; }
    public string? Status { get; set; }
}

/// <summary>BCX Bieu 5: Kham chua benh (KCB)</summary>
public class BcxReport5Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    public int TotalVisits { get; set; }                    // Tong so luot kham
    public int OutpatientVisits { get; set; }               // Ngoai tru
    public int InpatientAdmissions { get; set; }            // Noi tru
    public int EmergencyVisits { get; set; }                // Cap cuu
    public int ChildUnder5Visits { get; set; }              // Tre em duoi 5
    public int Over60Visits { get; set; }                   // Nguoi cao tuoi tren 60
    public int InsuranceVisits { get; set; }                // KCB BHYT
    public int FreeVisits { get; set; }                     // KCB mien phi
    public int ReferralUp { get; set; }                     // Chuyen tuyen tren
    public int ReferralDown { get; set; }                   // Chuyen tuyen duoi
    public int Procedures { get; set; }                     // Thu thuat
    public int SurgeryMinor { get; set; }                   // Tieu phau
    public int TotalPrescriptions { get; set; }             // Tong so don thuoc
    public int AvgMedicinesPerRx { get; set; }              // So thuoc TB/don
    public int AntibioticRxPercent { get; set; }            // % don co khang sinh
    public int InjectionRxPercent { get; set; }             // % don co thuoc tiem
    public List<BcxReport5MonthDto> MonthlyData { get; set; } = new();
}

public class BcxReport5MonthDto
{
    public int Month { get; set; }
    public int Visits { get; set; }
    public int Outpatient { get; set; }
    public int Inpatient { get; set; }
    public int Emergency { get; set; }
}

/// <summary>BCX Bieu 6: CSSKSS - KHHGD</summary>
public class BcxReport6Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    public int WomenReproductiveAge { get; set; }           // PN 15-49
    public int PregnantWomen { get; set; }                  // Phu nu co thai
    public int PrenatalVisits { get; set; }                 // Luot kham thai
    public int PrenatalFirst3Months { get; set; }           // Kham thai 3 thang dau
    public int PrenatalAtLeast4 { get; set; }               // Kham thai >= 4 lan
    public int HospitalDeliveries { get; set; }             // De tai co so y te
    public int HomeDeliveries { get; set; }                 // De tai nha
    public int CaesareanDeliveries { get; set; }            // Mo de
    public int PostpartumVisits { get; set; }               // Kham sau de
    public int Abortions { get; set; }                      // Pha thai
    public int IUDInsertion { get; set; }                   // Dat vong
    public int ContraceptivePills { get; set; }             // Thuoc tranh thai
    public int ContraceptiveInjections { get; set; }        // Tiem tranh thai
    public int Condoms { get; set; }                        // Bao cao su
    public int Sterilization { get; set; }                  // Triet san
    public decimal ContraceptiveRate { get; set; }          // Ty le BPTT
    public int GynecologyExams { get; set; }                // Kham phu khoa
    public int CervicalScreening { get; set; }              // Sang loc UTCTC
    public int BreastScreening { get; set; }                // Sang loc ung thu vu
}

/// <summary>BCX Bieu 7: Tiem chung mo rong</summary>
public class BcxReport7Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    public int TotalUnder1 { get; set; }                    // Tong tre duoi 1
    public int TotalUnder2 { get; set; }                    // Tong tre duoi 2
    public List<BcxReport7VaccineDto> VaccineData { get; set; } = new();
    public int FullyVaccinated { get; set; }                // Tiem du muoi liều
    public decimal FullVaccinationRate { get; set; }        // Ty le tiem du
    public int VitaminAUnder1 { get; set; }                 // Vitamin A duoi 1 tuoi
    public int VitaminA1To5 { get; set; }                   // Vitamin A 1-5 tuoi
    public int TetanusTT2Plus { get; set; }                 // Uon van TT2+
    public int VaccineAdverseReactions { get; set; }        // Phan ung sau tiem
    public int VaccineAdverseSevere { get; set; }           // Phan ung nang
}

public class BcxReport7VaccineDto
{
    public string? VaccineName { get; set; }
    public string? AntigenName { get; set; }
    public int Target { get; set; }                         // Chi tieu
    public int Dose1 { get; set; }
    public int Dose2 { get; set; }
    public int Dose3 { get; set; }
    public int Dose4 { get; set; }
    public int Booster { get; set; }                        // Tiem nhac
    public decimal CoveragePercent { get; set; }
}

/// <summary>BCX Bieu 8: Benh truyen nhiem</summary>
public class BcxReport8Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    public List<BcxReport8DiseaseDto> Diseases { get; set; } = new();
    public int TotalCases { get; set; }
    public int TotalDeaths { get; set; }
}

public class BcxReport8DiseaseDto
{
    public string? DiseaseName { get; set; }                // Ten benh
    public string? IcdCode { get; set; }
    public int Cases { get; set; }                          // Mac
    public int Deaths { get; set; }                         // Chet
    public int Under5Cases { get; set; }                    // Mac duoi 5 tuoi
    public int Under5Deaths { get; set; }                   // Chet duoi 5 tuoi
}

/// <summary>BCX Bieu 9: Benh khong lay nhiem (KLN)</summary>
public class BcxReport9Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    public int TotalHypertension { get; set; }              // Tang huyet ap
    public int ManagedHypertension { get; set; }            // THA dang quan ly
    public int ControlledHypertension { get; set; }         // THA kiem soat tot
    public int TotalDiabetes { get; set; }                  // Dai thao duong
    public int ManagedDiabetes { get; set; }                // DTD dang quan ly
    public int ControlledDiabetes { get; set; }             // DTD kiem soat tot
    public int TotalAsthma { get; set; }                    // Hen phe quan
    public int TotalCOPD { get; set; }                      // Phoi tac nghen man tinh
    public int TotalMentalHealth { get; set; }              // Tam than
    public int ManagedMentalHealth { get; set; }            // TT dang quan ly
    public int TotalEpilepsy { get; set; }                  // Dong kinh
    public int TotalCancer { get; set; }                    // Ung thu
    public int NewChronicCases { get; set; }                // Ca moi phat hien
    public List<BcxReport9DetailDto> Details { get; set; } = new();
}

public class BcxReport9DetailDto
{
    public string? DiseaseType { get; set; }
    public int TotalRegistered { get; set; }
    public int NewCases { get; set; }
    public int Managed { get; set; }
    public int Controlled { get; set; }
    public int Lost { get; set; }                           // Mat dau
    public int Deaths { get; set; }
}

/// <summary>BCX Bieu 10: GDSK, VSMT, ATTP</summary>
public class BcxReport10Dto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    // Giao duc suc khoe
    public int HealthCampaigns { get; set; }                // So buoi truyen thong
    public int CampaignParticipants { get; set; }           // So nguoi tham gia
    public int HomeVisits { get; set; }                     // So ho duoc tham gia dinh
    // Ve sinh moi truong
    public int TotalHouseholds { get; set; }
    public int HouseholdsWithLatrine { get; set; }          // Ho co nha tieu hop ve sinh
    public int HouseholdsWithCleanWater { get; set; }       // Ho co nuoc sach
    public decimal CleanWaterRate { get; set; }             // Ty le nuoc sach
    public decimal LatrineRate { get; set; }                // Ty le nha tieu HVS
    // An toan thuc pham
    public int FoodBusinesses { get; set; }                 // So co so thuc pham
    public int FoodInspections { get; set; }                // So dot kiem tra
    public int FoodViolations { get; set; }                 // So vi pham
    public int FoodPoisoningCases { get; set; }             // So vu ngo doc
    public int FoodPoisoningVictims { get; set; }           // So nguoi bi ngo doc
}

// ============================================================
// BCH Reports - Bao cao tuyen huyen (Bieu 1-16)
// ============================================================

/// <summary>BCH Bieu 1: Don vi HC, dan so, tu vong</summary>
public class BchReport1Dto
{
    public int Year { get; set; }
    public string? DistrictName { get; set; }
    public int TotalCommunes { get; set; }                  // Tong xa/phuong
    public int TotalPopulation { get; set; }
    public int MalePopulation { get; set; }
    public int FemalePopulation { get; set; }
    public int TotalHouseholds { get; set; }
    public int TotalBirths { get; set; }
    public int TotalDeaths { get; set; }
    public int InfantDeaths { get; set; }
    public int Under5Deaths { get; set; }
    public int MaternalDeaths { get; set; }
    public List<BchReport1FacilityDto> Facilities { get; set; } = new();
}

public class BchReport1FacilityDto
{
    public Guid FacilityId { get; set; }
    public string? FacilityName { get; set; }
    public int Population { get; set; }
    public int Births { get; set; }
    public int Deaths { get; set; }
}

/// <summary>BCH Bieu 2: Nhan luc y te toan huyen</summary>
public class BchReport2Dto
{
    public int Year { get; set; }
    public string? DistrictName { get; set; }
    public int TotalStaff { get; set; }
    public int Doctors { get; set; }
    public int Pharmacists { get; set; }
    public int Nurses { get; set; }
    public int Midwives { get; set; }
    public int Technicians { get; set; }
    public int VillageHealthWorkers { get; set; }
    public List<BchReport2FacilityDto> FacilityBreakdown { get; set; } = new();
}

public class BchReport2FacilityDto
{
    public string? FacilityName { get; set; }
    public int Staff { get; set; }
    public int Doctors { get; set; }
    public int Nurses { get; set; }
}

/// <summary>BCH Bieu 3: KCB toan huyen</summary>
public class BchReport3Dto
{
    public int Year { get; set; }
    public string? DistrictName { get; set; }
    public int TotalVisits { get; set; }
    public int OutpatientVisits { get; set; }
    public int InpatientAdmissions { get; set; }
    public int EmergencyVisits { get; set; }
    public int ReferralUp { get; set; }
    public int Procedures { get; set; }
    public int SurgeryMajor { get; set; }
    public int SurgeryMinor { get; set; }
    public decimal AvgLengthOfStay { get; set; }            // SNGDT trung binh
    public decimal BedOccupancyRate { get; set; }           // Cong suat su dung giuong
    public List<BchReport3FacilityDto> FacilityBreakdown { get; set; } = new();
}

public class BchReport3FacilityDto
{
    public string? FacilityName { get; set; }
    public int Visits { get; set; }
    public int Inpatient { get; set; }
    public int Referrals { get; set; }
}

/// <summary>BCH Bieu 4: Benh tat toan huyen</summary>
public class BchReport4Dto
{
    public int Year { get; set; }
    public List<DiseaseStatisticsDto> TopDiseases { get; set; } = new();
    public int TotalDiseaseGroups { get; set; }
}

/// <summary>BCH Bieu 5: Tai chinh y te</summary>
public class BchReport5Dto
{
    public int Year { get; set; }
    public decimal TotalBudget { get; set; }
    public decimal StateBudget { get; set; }
    public decimal InsuranceRevenue { get; set; }
    public decimal FeeRevenue { get; set; }
    public decimal OtherRevenue { get; set; }
    public decimal TotalExpense { get; set; }
    public decimal PersonnelExpense { get; set; }
    public decimal MedicineExpense { get; set; }
    public decimal EquipmentExpense { get; set; }
    public decimal OperatingExpense { get; set; }
    public List<BchReport5FacilityDto> FacilityBreakdown { get; set; } = new();
}

public class BchReport5FacilityDto
{
    public string? FacilityName { get; set; }
    public decimal Budget { get; set; }
    public decimal Revenue { get; set; }
    public decimal Expense { get; set; }
}

/// <summary>BCH Bieu 6: CSSKSS toan huyen</summary>
public class BchReport6Dto
{
    public int Year { get; set; }
    public int TotalPregnant { get; set; }
    public int PrenatalFirst3Months { get; set; }
    public int PrenatalAtLeast4 { get; set; }
    public int HospitalDeliveries { get; set; }
    public int CaesareanDeliveries { get; set; }
    public int PostpartumVisits { get; set; }
    public int Abortions { get; set; }
    public int MaternalDeaths { get; set; }
    public int NeonatalDeaths { get; set; }
    public decimal ContraceptiveRate { get; set; }
    public int CervicalScreening { get; set; }
    public List<BchReport6FacilityDto> FacilityBreakdown { get; set; } = new();
}

public class BchReport6FacilityDto
{
    public string? FacilityName { get; set; }
    public int Pregnant { get; set; }
    public int Deliveries { get; set; }
    public int FamilyPlanning { get; set; }
}

/// <summary>BCH Bieu 7: Tiem chung toan huyen</summary>
public class BchReport7Dto
{
    public int Year { get; set; }
    public int TotalUnder1 { get; set; }
    public int FullyVaccinated { get; set; }
    public decimal FullVaccinationRate { get; set; }
    public List<BcxReport7VaccineDto> VaccineData { get; set; } = new();
    public List<BchReport7FacilityDto> FacilityBreakdown { get; set; } = new();
}

public class BchReport7FacilityDto
{
    public string? FacilityName { get; set; }
    public int Target { get; set; }
    public int Vaccinated { get; set; }
    public decimal Rate { get; set; }
}

/// <summary>BCH Bieu 8: Benh truyen nhiem toan huyen</summary>
public class BchReport8Dto
{
    public int Year { get; set; }
    public List<BcxReport8DiseaseDto> Diseases { get; set; } = new();
    public int TotalCases { get; set; }
    public int TotalDeaths { get; set; }
    public List<BchReport8FacilityDto> FacilityBreakdown { get; set; } = new();
}

public class BchReport8FacilityDto
{
    public string? FacilityName { get; set; }
    public int Cases { get; set; }
    public int Deaths { get; set; }
}

/// <summary>BCH Bieu 9: Benh KLN toan huyen</summary>
public class BchReport9Dto
{
    public int Year { get; set; }
    public int TotalHypertension { get; set; }
    public int TotalDiabetes { get; set; }
    public int TotalAsthma { get; set; }
    public int TotalCOPD { get; set; }
    public int TotalMentalHealth { get; set; }
    public int TotalEpilepsy { get; set; }
    public int TotalCancer { get; set; }
    public List<BcxReport9DetailDto> Details { get; set; } = new();
}

/// <summary>BCH Bieu 10: GDSK, VSMT, ATTP toan huyen</summary>
public class BchReport10Dto
{
    public int Year { get; set; }
    public int TotalCampaigns { get; set; }
    public int TotalParticipants { get; set; }
    public int TotalHouseholds { get; set; }
    public int HouseholdsCleanWater { get; set; }
    public int HouseholdsLatrine { get; set; }
    public int FoodBusinesses { get; set; }
    public int FoodViolations { get; set; }
    public int FoodPoisoningCases { get; set; }
}

/// <summary>BCH Bieu 11: HIV/AIDS, ma tuy</summary>
public class BchReport11Dto
{
    public int Year { get; set; }
    public int TotalHivPatients { get; set; }               // Tong so HIV
    public int NewHivCases { get; set; }                    // Ca moi
    public int OnArv { get; set; }                          // Dang dieu tri ARV
    public int HivDeaths { get; set; }                      // Tu vong
    public int HivTesting { get; set; }                     // So luot xet nghiem
    public int HivPositive { get; set; }                    // Duong tinh
    public int PmtctScreened { get; set; }                  // Thai phu XN HIV
    public int HivCommunications { get; set; }              // Buoi truyen thong
    public int CommunicationParticipants { get; set; }
}

/// <summary>BCH Bieu 12: Dinh duong</summary>
public class BchReport12Dto
{
    public int Year { get; set; }
    public int TotalUnder5 { get; set; }
    public int Measured { get; set; }                       // Tre duoc can do
    public int Underweight { get; set; }                    // Suy dinh duong the nhe can
    public int Stunted { get; set; }                        // Suy dinh duong the thap coi
    public int Wasted { get; set; }                         // Suy dinh duong the gay com
    public int Overweight { get; set; }                     // Thua can beo phi
    public decimal UnderweightRate { get; set; }
    public decimal StuntedRate { get; set; }
    public decimal WastedRate { get; set; }
    public int VitaminAUnder1 { get; set; }
    public int VitaminA1To5 { get; set; }
    public int IronSupplement { get; set; }                 // Bo sung sat
}

/// <summary>BCH Bieu 13: Tai nan thuong tich</summary>
public class BchReport13Dto
{
    public int Year { get; set; }
    public int TotalInjuries { get; set; }
    public int TrafficAccidents { get; set; }               // TNGT
    public int OccupationalInjuries { get; set; }           // TNLD
    public int Drowning { get; set; }                       // Duoi nuoc
    public int Falls { get; set; }                          // Nga
    public int Burns { get; set; }                          // Bong
    public int Poisoning { get; set; }                      // Ngo doc
    public int Violence { get; set; }                       // Bao luc
    public int OtherInjuries { get; set; }                  // Khac
    public int InjuryDeaths { get; set; }                   // Tu vong do TNTT
    public List<BchReport13AgeGroupDto> AgeGroups { get; set; } = new();
}

public class BchReport13AgeGroupDto
{
    public string? AgeGroup { get; set; }
    public int Cases { get; set; }
    public int Deaths { get; set; }
}

/// <summary>BCH Bieu 14: Nguoi cao tuoi</summary>
public class BchReport14Dto
{
    public int Year { get; set; }
    public int TotalElderly { get; set; }                   // Tong NCT (>=60)
    public int ElderlyMale { get; set; }
    public int ElderlyFemale { get; set; }
    public int HealthChecked { get; set; }                  // Duoc KSK
    public int WithChronicDisease { get; set; }             // Co benh man tinh
    public int OnMedication { get; set; }                   // Dang dieu tri
    public int NeedingCare { get; set; }                    // Can cham soc
    public int LiveAlone { get; set; }                      // Song mot minh
}

/// <summary>BCH Bieu 15: Truong hoc</summary>
public class BchReport15Dto
{
    public int Year { get; set; }
    public int TotalSchools { get; set; }
    public int SchoolsWithHealthStaff { get; set; }         // Truong co CBYT
    public int StudentsHealthChecked { get; set; }          // Hoc sinh KSK
    public int StudentsWithEyeDisease { get; set; }         // Can thi/benh mat
    public int StudentsWithDentalDisease { get; set; }      // Benh rang mieng
    public int HealthEducationSessions { get; set; }        // Buoi GDSK
}

/// <summary>BCH Bieu 16: Tong hop chi tieu</summary>
public class BchReport16Dto
{
    public int Year { get; set; }
    public string? DistrictName { get; set; }
    public List<BchReport16IndicatorDto> Indicators { get; set; } = new();
}

public class BchReport16IndicatorDto
{
    public string? IndicatorCode { get; set; }
    public string? IndicatorName { get; set; }              // Ten chi tieu
    public string? Unit { get; set; }                       // Don vi tinh
    public decimal? Target { get; set; }                    // Chi tieu
    public decimal? Achieved { get; set; }                  // Dat
    public decimal? AchievementRate { get; set; }           // Ty le dat (%)
}

// ============================================================
// BCX TT37 Reports - Bao cao tuyen xa theo TT37 (Bieu 1-8)
// ============================================================

/// <summary>TT37 Xa Bieu 1: Tong hop hoat dong KCB</summary>
public class BcxTT37Report1Dto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public int TotalVisits { get; set; }
    public int OutpatientVisits { get; set; }
    public int InpatientDays { get; set; }
    public int EmergencyVisits { get; set; }
    public int Procedures { get; set; }
    public int Referrals { get; set; }
    public int InsuranceVisits { get; set; }
    public int FreeVisits { get; set; }
    public List<BcxTT37MonthDto> MonthlyData { get; set; } = new();
}

public class BcxTT37MonthDto
{
    public int Month { get; set; }
    public int Visits { get; set; }
    public int Outpatient { get; set; }
    public int Inpatient { get; set; }
}

/// <summary>TT37 Xa Bieu 2: Benh tat (10 benh mac nhieu nhat)</summary>
public class BcxTT37Report2Dto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public List<DiseaseStatisticsDto> TopDiseases { get; set; } = new();
}

/// <summary>TT37 Xa Bieu 3: Thu thuat</summary>
public class BcxTT37Report3Dto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public int TotalProcedures { get; set; }
    public List<BcxTT37ProcedureDto> Procedures { get; set; } = new();
}

public class BcxTT37ProcedureDto
{
    public string? ProcedureName { get; set; }
    public int Count { get; set; }
    public int Successful { get; set; }
    public int Complications { get; set; }
}

/// <summary>TT37 Xa Bieu 4: Duoc, VTYT</summary>
public class BcxTT37Report4Dto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public int TotalMedicineTypes { get; set; }             // Tong so loai thuoc
    public decimal TotalMedicineValue { get; set; }         // Tong gia tri thuoc
    public int EssentialMedicines { get; set; }             // So thuoc thiet yeu
    public int AntibiotiTypes { get; set; }                 // Loai khang sinh
    public decimal AntibioticValue { get; set; }            // Gia tri khang sinh
    public int TotalSupplyTypes { get; set; }               // Loai VTYT
    public decimal TotalSupplyValue { get; set; }           // Gia tri VTYT
    public int ExpiredMedicines { get; set; }               // Thuoc het han
}

/// <summary>TT37 Xa Bieu 5: CSSKSS</summary>
public class BcxTT37Report5Dto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public int PrenatalVisits { get; set; }
    public int Deliveries { get; set; }
    public int PostpartumVisits { get; set; }
    public int FamilyPlanning { get; set; }
    public int GynecologyExams { get; set; }
}

/// <summary>TT37 Xa Bieu 6: Tiem chung</summary>
public class BcxTT37Report6Dto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public List<BcxReport7VaccineDto> VaccineData { get; set; } = new();
    public int FullyVaccinated { get; set; }
}

/// <summary>TT37 Xa Bieu 7: Benh truyen nhiem</summary>
public class BcxTT37Report7Dto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public List<BcxReport8DiseaseDto> Diseases { get; set; } = new();
}

/// <summary>TT37 Xa Bieu 8: Benh KLN</summary>
public class BcxTT37Report8Dto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public List<BcxReport9DetailDto> Details { get; set; } = new();
}

// ============================================================
// BCH TT37 Reports - Bao cao tuyen huyen theo TT37 (Bieu 1-14)
// ============================================================

/// <summary>TT37 Huyen Bieu 1-14: Cung cau truc nhu BCH 1-14 nhung theo TT37</summary>
public class BchTT37ReportDto
{
    public int Year { get; set; }
    public int Quarter { get; set; }
    public string? ReportTitle { get; set; }
    public int ReportNumber { get; set; }
    public object? Data { get; set; }                       // Flexible data based on report number
}

// ============================================================
// BHYT Reports - Bao hiem y te
// ============================================================

/// <summary>Mau 19: Bang ke chi phi KCB ngoai tru</summary>
public class BhytMau19Dto
{
    public string? FacilityCode { get; set; }               // Ma co so KCB
    public string? FacilityName { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalPatients { get; set; }                  // Tong so luot
    public decimal TotalAmount { get; set; }                // Tong chi phi
    public decimal BhytAmount { get; set; }                 // BHYT thanh toan
    public decimal PatientAmount { get; set; }              // BN cung chi tra
    public decimal OtherAmount { get; set; }                // Nguon khac
    public List<BhytMau19ItemDto> Items { get; set; } = new();
}

public class BhytMau19ItemDto
{
    public int Stt { get; set; }
    public string? PatientName { get; set; }
    public string? InsuranceNumber { get; set; }            // So the BHYT
    public string? MainDiagnosis { get; set; }
    public string? IcdCode { get; set; }
    public DateTime? ExamDate { get; set; }
    public decimal ExamFee { get; set; }                    // Tien kham
    public decimal MedicineFee { get; set; }                // Tien thuoc
    public decimal LabFee { get; set; }                     // Tien xet nghiem
    public decimal ImagingFee { get; set; }                 // Tien CDHA
    public decimal ProcedureFee { get; set; }               // Tien thu thuat
    public decimal BedFee { get; set; }                     // Tien giuong
    public decimal OtherFee { get; set; }                   // Khac
    public decimal TotalFee { get; set; }                   // Tong cong
    public decimal BhytPay { get; set; }                    // BHYT chi tra
    public decimal PatientPay { get; set; }                 // BN chi tra
}

/// <summary>Mau 20: Bang ke chi phi KCB noi tru</summary>
public class BhytMau20Dto
{
    public string? FacilityCode { get; set; }
    public string? FacilityName { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalPatients { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal BhytAmount { get; set; }
    public decimal PatientAmount { get; set; }
    public List<BhytMau20ItemDto> Items { get; set; } = new();
}

public class BhytMau20ItemDto
{
    public int Stt { get; set; }
    public string? PatientName { get; set; }
    public string? InsuranceNumber { get; set; }
    public string? MainDiagnosis { get; set; }
    public DateTime? AdmissionDate { get; set; }
    public DateTime? DischargeDate { get; set; }
    public int LengthOfStay { get; set; }                   // So ngay dieu tri
    public decimal ExamFee { get; set; }
    public decimal MedicineFee { get; set; }
    public decimal LabFee { get; set; }
    public decimal ImagingFee { get; set; }
    public decimal ProcedureFee { get; set; }
    public decimal SurgeryFee { get; set; }                 // Tien phau thuat
    public decimal BedFee { get; set; }
    public decimal BloodFee { get; set; }                   // Tien mau
    public decimal TotalFee { get; set; }
    public decimal BhytPay { get; set; }
    public decimal PatientPay { get; set; }
}

/// <summary>Mau 21: Tong hop chi phi KCB BHYT</summary>
public class BhytMau21Dto
{
    public string? FacilityCode { get; set; }
    public string? FacilityName { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    // Ngoai tru
    public int OutpatientVisits { get; set; }
    public decimal OutpatientTotal { get; set; }
    public decimal OutpatientBhyt { get; set; }
    public decimal OutpatientPatient { get; set; }
    // Noi tru
    public int InpatientVisits { get; set; }
    public decimal InpatientTotal { get; set; }
    public decimal InpatientBhyt { get; set; }
    public decimal InpatientPatient { get; set; }
    // Tong
    public int TotalVisits { get; set; }
    public decimal GrandTotal { get; set; }
    public decimal GrandBhyt { get; set; }
    public decimal GrandPatient { get; set; }
    // Chi tiet theo nhom
    public decimal ExamTotal { get; set; }                  // Tien kham
    public decimal MedicineTotal { get; set; }              // Tien thuoc
    public decimal LabTotal { get; set; }                   // Tien XN
    public decimal ImagingTotal { get; set; }               // Tien CDHA
    public decimal ProcedureTotal { get; set; }             // Tien TT
    public decimal BedTotal { get; set; }                   // Tien giuong
    public decimal OtherTotal { get; set; }                 // Khac
}

/// <summary>Mau 79: Tong hop thanh toan chi phi KCB</summary>
public class BhytMau79Dto
{
    public string? FacilityCode { get; set; }
    public string? FacilityName { get; set; }
    public int Year { get; set; }
    public int Quarter { get; set; }
    public int TotalRecords { get; set; }                   // Tong so ho so
    public decimal TotalProposed { get; set; }              // De nghi thanh toan
    public decimal TotalApproved { get; set; }              // Duoc duyet
    public decimal TotalRejected { get; set; }              // Tu choi
    public decimal TotalPaid { get; set; }                  // Da thanh toan
    public decimal TotalRemaining { get; set; }             // Con lai
    public List<BhytMau79QuarterDto> QuarterlyData { get; set; } = new();
}

public class BhytMau79QuarterDto
{
    public int Month { get; set; }
    public int Records { get; set; }
    public decimal Proposed { get; set; }
    public decimal Approved { get; set; }
    public decimal Paid { get; set; }
}

/// <summary>Mau 80: Chi tiet chi phi KCB theo nguon</summary>
public class BhytMau80Dto
{
    public string? FacilityCode { get; set; }
    public string? FacilityName { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public List<BhytMau80ItemDto> Items { get; set; } = new();
    public decimal TotalBhyt { get; set; }
    public decimal TotalPatient { get; set; }
    public decimal TotalOther { get; set; }
    public decimal GrandTotal { get; set; }
}

public class BhytMau80ItemDto
{
    public string? Category { get; set; }                   // Nhom chi phi
    public decimal BhytAmount { get; set; }
    public decimal PatientAmount { get; set; }
    public decimal OtherAmount { get; set; }
    public decimal Total { get; set; }
}

/// <summary>Mau 14A: Danh sach benh nhan KCB BHYT</summary>
public class BhytMau14ADto
{
    public string? FacilityCode { get; set; }
    public string? FacilityName { get; set; }
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalPatients { get; set; }
    public List<BhytMau14AItemDto> Items { get; set; } = new();
}

public class BhytMau14AItemDto
{
    public int Stt { get; set; }
    public string? PatientName { get; set; }
    public int? Gender { get; set; }
    public DateTime? DateOfBirth { get; set; }
    public string? Address { get; set; }
    public string? InsuranceNumber { get; set; }
    public DateTime? ExamDate { get; set; }
    public string? MainDiagnosis { get; set; }
    public string? IcdCode { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal BhytAmount { get; set; }
    public decimal PatientAmount { get; set; }
}

/// <summary>TK37.1: Thong ke so tien KCB BHYT theo thang</summary>
public class BhytTK371Dto
{
    public string? FacilityCode { get; set; }
    public string? FacilityName { get; set; }
    public int Year { get; set; }
    public List<BhytTK371MonthDto> MonthlyData { get; set; } = new();
    public decimal YearlyTotal { get; set; }
    public decimal YearlyBhyt { get; set; }
    public decimal YearlyPatient { get; set; }
}

public class BhytTK371MonthDto
{
    public int Month { get; set; }
    public int Visits { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal BhytAmount { get; set; }
    public decimal PatientAmount { get; set; }
}

// ============================================================
// BHYT Summary
// ============================================================

public class BhytSummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public string? FacilityName { get; set; }
    public int TotalInsuredPatients { get; set; }           // Tong BN BHYT
    public int OutpatientInsured { get; set; }              // Ngoai tru BHYT
    public int InpatientInsured { get; set; }               // Noi tru BHYT
    public decimal TotalBhytCost { get; set; }              // Tong chi phi BHYT
    public decimal TotalBhytPaid { get; set; }              // BHYT da thanh toan
    public decimal TotalPatientCopay { get; set; }          // BN dong chi tra
    public decimal AvgCostPerVisit { get; set; }            // Chi phi TB/luot
}

// ============================================================
// So YTCS - So Y te co so (A1-A12)
// ============================================================

/// <summary>Generic structure for A1-A12 community health registers</summary>
public class SoYtcsDto
{
    public string SoType { get; set; } = string.Empty;      // A1, A2, ... A12
    public string? SoName { get; set; }                     // Ten so
    public int Year { get; set; }
    public int TotalRecords { get; set; }
    public List<SoYtcsRecordDto> Records { get; set; } = new();
}

public class SoYtcsRecordDto
{
    public int Stt { get; set; }
    public DateTime? RecordDate { get; set; }
    public string? PatientName { get; set; }
    public int? Gender { get; set; }
    public int? Age { get; set; }
    public string? Address { get; set; }
    public string? Diagnosis { get; set; }
    public string? Treatment { get; set; }
    public string? Result { get; set; }
    public string? Notes { get; set; }
    // Flexible fields for different register types
    public Dictionary<string, string?> ExtraFields { get; set; } = new();
}

// ============================================================
// NCD (Benh khong lay) Statistics
// ============================================================

public class NcdStatisticsDto
{
    public int Year { get; set; }
    public int TotalRegistered { get; set; }                // Tong so dang ky
    public int NewCases { get; set; }                       // Ca moi
    public int ActivelyManaged { get; set; }                // Dang quan ly
    public int ControlledWell { get; set; }                 // Kiem soat tot
    public int Lost { get; set; }                           // Mat dau
    public int Deaths { get; set; }
    public List<NcdDiseaseGroupDto> DiseaseGroups { get; set; } = new();
}

public class NcdDiseaseGroupDto
{
    public string? DiseaseType { get; set; }
    public int Registered { get; set; }
    public int NewCases { get; set; }
    public int Managed { get; set; }
    public int Controlled { get; set; }
}

// ============================================================
// Billing Summary
// ============================================================

public class BillingSummaryDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal BhytRevenue { get; set; }
    public decimal FeeRevenue { get; set; }
    public decimal OtherRevenue { get; set; }
    public int TotalReceipts { get; set; }
    public decimal AvgReceiptAmount { get; set; }
    public List<BillingSummaryItemDto> CategoryBreakdown { get; set; } = new();
    public List<BillingSummaryMonthDto> MonthlyTrend { get; set; } = new();
}

public class BillingSummaryItemDto
{
    public string? Category { get; set; }                   // Kham, Thuoc, XN, CDHA, TT, Giuong, Khac
    public decimal Amount { get; set; }
    public decimal BhytAmount { get; set; }
    public decimal PatientAmount { get; set; }
}

public class BillingSummaryMonthDto
{
    public int Month { get; set; }
    public decimal Revenue { get; set; }
    public decimal BhytRevenue { get; set; }
    public decimal FeeRevenue { get; set; }
}

// ============================================================
// General Summary
// ============================================================

public class GeneralSummaryDto
{
    public int Year { get; set; }
    public string? FacilityName { get; set; }
    // Dan so
    public int TotalPopulation { get; set; }
    public int TotalHouseholds { get; set; }
    // KCB
    public int TotalExaminations { get; set; }
    public int OutpatientVisits { get; set; }
    public int InpatientAdmissions { get; set; }
    public int EmergencyVisits { get; set; }
    // Tai chinh
    public decimal TotalRevenue { get; set; }
    public decimal BhytRevenue { get; set; }
    // Du phong
    public int VaccinationCoverage { get; set; }
    public int ChronicDiseaseManaged { get; set; }
    public int CommunicableCases { get; set; }
    // CSSKSS
    public int PrenatalVisits { get; set; }
    public int Deliveries { get; set; }
    // Nhan luc
    public int TotalStaff { get; set; }
    public int TotalDoctors { get; set; }
}

// ============================================================
// Patient By Level
// ============================================================

public class PatientByLevelDto
{
    public int Year { get; set; }
    public int TotalPatients { get; set; }
    public int BhytPatients { get; set; }                   // BHYT
    public int FreePatients { get; set; }                   // Mien phi
    public int FeePatients { get; set; }                    // Vien phi
    public int ReferralPatients { get; set; }               // Chuyen tuyen
    public List<PatientLevelDto> Levels { get; set; } = new();
}

public class PatientLevelDto
{
    public string? Level { get; set; }                      // Tuyen xa, Tuyen huyen, Tuyen tinh, Tu den
    public int Count { get; set; }
    public decimal Percentage { get; set; }
}

// ============================================================
// Utility Report
// ============================================================

public class UtilityReportDto
{
    public int Year { get; set; }
    public decimal BedOccupancyRate { get; set; }           // Cong suat su dung giuong
    public decimal AvgLengthOfStay { get; set; }            // SNGDT TB
    public int TotalBeds { get; set; }
    public int OccupiedBeds { get; set; }
    public int TotalRooms { get; set; }
    public int ActiveRooms { get; set; }
    public decimal EquipmentUtilization { get; set; }       // % su dung TTB
    public List<UtilityDeptDto> DepartmentUtility { get; set; } = new();
}

public class UtilityDeptDto
{
    public string? DepartmentName { get; set; }
    public int Beds { get; set; }
    public int Occupied { get; set; }
    public decimal OccupancyRate { get; set; }
    public int Visits { get; set; }
}

// ============================================================
// Pharmacy Report
// ============================================================

public class PharmacyReportDto
{
    public int Year { get; set; }
    public int Month { get; set; }
    public int TotalMedicineTypes { get; set; }             // Tong mat hang thuoc
    public decimal TotalMedicineValue { get; set; }         // Gia tri ton kho
    public decimal TotalReceiptValue { get; set; }          // Gia tri nhap
    public decimal TotalIssueValue { get; set; }            // Gia tri xuat
    public int ExpiredItems { get; set; }                   // Thuoc het han
    public int NearExpiryItems { get; set; }                // Thuoc sap het han
    public int OutOfStockItems { get; set; }                // Thuoc het
    public List<PharmacyTopMedicineDto> TopUsed { get; set; } = new();
    public List<PharmacyTopMedicineDto> TopValue { get; set; } = new();
    public List<PharmacySupplyDto> Supplies { get; set; } = new();
}

public class PharmacyTopMedicineDto
{
    public string? MedicineCode { get; set; }
    public string? MedicineName { get; set; }
    public string? Unit { get; set; }
    public decimal Quantity { get; set; }
    public decimal Value { get; set; }
}

public class PharmacySupplyDto
{
    public string? SupplyName { get; set; }
    public string? SupplyType { get; set; }
    public decimal CurrentStock { get; set; }
    public decimal UsedThisPeriod { get; set; }
    public decimal Value { get; set; }
}
