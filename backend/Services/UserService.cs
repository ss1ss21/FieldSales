using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class UserService : IUserService
    {
        private readonly AppDbContext _context;

        public UserService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<UserResponseDto>> GetPersonnelListAsync()
        {
            return await _context.Users
                .Where(u => u.Role == "Personnel")
                .Select(u => new UserResponseDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role
                })
                .ToListAsync();
        }

        public async Task<(bool Success, string? ErrorMessage, UserResponseDto? Data)> CreatePersonnelAsync(PersonnelRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                return (false, "Şifre alanı zorunludur.", null);
            }

            var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);
            if (emailExists)
            {
                return (false, "Bu e-posta adresi zaten kullanımda.", null);
            }

            var newUser = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                Role = "Personnel",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password)
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            var responseData = new UserResponseDto
            {
                Id = newUser.Id,
                FullName = newUser.FullName,
                Email = newUser.Email,
                Role = newUser.Role
            };

            return (true, null, responseData);
        }

        public async Task<(bool Success, string? ErrorMessage, UserResponseDto? Data)> UpdatePersonnelAsync(int id, PersonnelRequestDto dto)
        {
            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null)
            {
                return (false, "Personel bulunamadı.", null);
            }

            // Başka bir kullanıcı aynı e-postayı kullanıyor mu kontrolü
            var emailTaken = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id);
            if (emailTaken)
            {
                return (false, "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.", null);
            }

            existingUser.FullName = dto.FullName;
            existingUser.Email = dto.Email;

            // Şifre alanı dolu geldiyse güncelle, boşsa mevcut şifreyi koru
            if (!string.IsNullOrWhiteSpace(dto.Password))
            {
                existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();

            var responseData = new UserResponseDto
            {
                Id = existingUser.Id,
                FullName = existingUser.FullName,
                Email = existingUser.Email,
                Role = existingUser.Role
            };

            return (true, null, responseData);
        }

        public async Task<(bool Success, string? ErrorMessage)> DeletePersonnelAsync(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null)
            {
                return (false, "Personel bulunamadı.");
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return (true, null);
        }
    }
}