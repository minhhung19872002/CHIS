using CHIS.Application.Services;
using CHIS.Infrastructure.Data;
using CHIS.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CHIS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // ---- DbContext ----
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=localhost,1434;Database=CHIS;User=sa;Password=ChisDocker2024Pass#;TrustServerCertificate=true";

        services.AddDbContext<CHISDbContext>(options =>
            options.UseSqlServer(connectionString));

        // ---- Unit of Work & Generic Repository ----
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        // ---- Core Clinical Services ----
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IPatientService, PatientService>();
        services.AddScoped<IExaminationService, ExaminationService>();
        services.AddScoped<IPrescriptionService, PrescriptionService>();
        services.AddScoped<IInpatientService, InpatientService>();
        services.AddScoped<IBillingService, BillingService>();
        services.AddScoped<IPharmacyService, PharmacyService>();
        services.AddScoped<ILabService, LabService>();
        services.AddScoped<IRadiologyService, RadiologyService>();

        // ---- Community Health Services ----
        services.AddScoped<IPopulationService, PopulationService>();
        services.AddScoped<IChronicDiseaseService, ChronicDiseaseService>();
        services.AddScoped<ICommunicableDiseaseService, CommunicableDiseaseService>();
        services.AddScoped<IReproductiveHealthService, ReproductiveHealthService>();
        services.AddScoped<IHivAidsService, HivAidsService>();
        services.AddScoped<IImmunizationService, ImmunizationService>();

        // ---- Support Services ----
        services.AddScoped<IEquipmentService, EquipmentService>();
        services.AddScoped<IStaffService, StaffService>();
        services.AddScoped<IFoodSafetyService, FoodSafetyService>();
        services.AddScoped<IEnvironmentalHealthService, EnvironmentalHealthService>();
        services.AddScoped<IFinanceService, FinanceService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<ISystemService, SystemService>();
        services.AddScoped<IDataInteropService, DataInteropService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}
