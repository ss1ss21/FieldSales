using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    public class PersonnelRequestDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Password { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/users/personnel
        [HttpGet("personnel")]
        public async Task<IActionResult> GetPersonnel()
        {
            var personnelList = await _context.Users
                .Where(u => u.Role == "Personnel")
                .Select(u => new 
                { 
                    Id = u.Id, 
                    FullName = u.FullName, 
                    Email = u.Email 
                })
                .ToListAsync();
            return Ok(personnelList);
        }

        // POST: api/users (Yeni Personel Ekleme - 404'ü çözen eksik uç)
        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] PersonnelRequestDto dto)
        {
            if (string.IsNullOrEmpty(dto.Password))
            {
                return BadRequest("Şifre alanı zorunludur.");
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

            return Ok(newUser);
        }

        // PUT: api/users/5 (Personel Güncelleme)
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] PersonnelRequestDto dto)
        {
            var existingUser = await _context.Users.FindAsync(id);
            if (existingUser == null) return NotFound("Personel bulunamadı.");

            existingUser.FullName = dto.FullName;
            existingUser.Email = dto.Email;
            
            if (!string.IsNullOrEmpty(dto.Password))
            {
                existingUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);
            }

            await _context.SaveChangesAsync();
            return Ok(existingUser);
        }

        // DELETE: api/users/5 (Personel Silme)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Personel bulunamadı.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Personel başarıyla silindi." });
        }
    }
}