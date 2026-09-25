using backend.DTOs;

namespace backend.Services
{
    public interface IUserService
    {
        Task<IEnumerable<UserResponseDto>> GetPersonnelListAsync();
        Task<(bool Success, string? ErrorMessage, UserResponseDto? Data)> CreatePersonnelAsync(PersonnelRequestDto dto);
        Task<(bool Success, string? ErrorMessage, UserResponseDto? Data)> UpdatePersonnelAsync(int id, PersonnelRequestDto dto);
        Task<(bool Success, string? ErrorMessage)> DeletePersonnelAsync(int id);
    }
}