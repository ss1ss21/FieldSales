using backend.DTOs;

namespace backend.Services
{
    public interface ICustomerService
    {
        Task<IEnumerable<CustomerResponseDto>> GetAllCustomersAsync();
        Task<CustomerResponseDto?> GetCustomerByIdAsync(int id);
        Task<CustomerResponseDto> CreateCustomerAsync(CreateCustomerDto dto);
        Task<bool> UpdateCustomerAsync(int id, UpdateCustomerDto dto);
        Task<bool> DeleteCustomerAsync(int id);
    }
}