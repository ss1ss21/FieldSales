using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet("personnel")]
        public async Task<IActionResult> GetPersonnel()
        {
            var personnelList = await _userService.GetPersonnelListAsync();
            return Ok(personnelList);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateUser([FromBody] PersonnelRequestDto dto)
        {
            var result = await _userService.CreatePersonnelAsync(dto);
            if (!result.Success)
            {
                return BadRequest(new { message = result.ErrorMessage });
            }

            return Ok(result.Data);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] PersonnelRequestDto dto)
        {
            var result = await _userService.UpdatePersonnelAsync(id, dto);
            if (!result.Success)
            {
                return BadRequest(new { message = result.ErrorMessage });
            }

            return Ok(result.Data);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var result = await _userService.DeletePersonnelAsync(id);
            if (!result.Success)
            {
                return NotFound(new { message = result.ErrorMessage });
            }

            return Ok(new { message = "Personel başarıyla silindi." });
        }
    }
}