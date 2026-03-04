using CHIS.Application.DTOs;

namespace CHIS.Application.Services;

public interface ILabService
{
    Task<PagedResult<ServiceRequestDto>> GetLabRequestsAsync(ServiceRequestSearchDto dto);
    Task<ServiceRequestDto> CreateLabRequestAsync(CreateServiceRequestDto dto);
    Task<ServiceRequestDto> UpdateLabResultAsync(Guid id, UpdateServiceResultDto dto);
    Task ApproveLabResultAsync(Guid id);
    Task<List<ServiceDto>> GetLabServicesAsync(string? keyword = null);
}

public interface IRadiologyService
{
    Task<PagedResult<ServiceRequestDto>> GetImagingRequestsAsync(ServiceRequestSearchDto dto);
    Task<ServiceRequestDto> CreateImagingRequestAsync(CreateServiceRequestDto dto);
    Task<ServiceRequestDto> UpdateImagingResultAsync(Guid id, UpdateServiceResultDto dto);
    Task ApproveImagingResultAsync(Guid id);
    Task<List<ServiceDto>> GetImagingServicesAsync(string? keyword = null);
}
