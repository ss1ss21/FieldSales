using System.Threading.Tasks;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VisitsController : ControllerBase
    {
        private readonly IVisitService _visitService;

        public VisitsController(IVisitService visitService)
        {
            _visitService = visitService;
        }

        [HttpPost("start-day")]
        public async Task<IActionResult> StartDay([FromBody] StartDayRequestDto request)
        {
            var result = await _visitService.StartDayAsync(request);

            if (result.Visits.Count == 0)
            {
                return Ok(new
                {
                    Message = "Bugün için planlanmış bir ziyaret bulunamadı.",
                    Shift = result.Shift,
                    Visits = result.Visits
                });
            }

            return Ok(new
            {
                Message = "Rota başarıyla oluşturuldu.",
                Shift = result.Shift,
                Visits = result.Visits
            });
        }

        [HttpGet("today/{personnelId}")]
        public async Task<IActionResult> GetToday(int personnelId)
        {
            var result = await _visitService.GetTodayAsync(personnelId);
            return Ok(new { Shift = result.Shift, Visits = result.Visits });
        }

        [HttpPost("recalculate")]
        public async Task<IActionResult> RecalculateRoute([FromBody] RecalculateRouteRequestDto request)
        {
            var sortedVisits = await _visitService.RecalculateRouteAsync(request);
            if (sortedVisits.Count == 0)
            {
                return Ok(new { Message = "Yeniden hesaplanacak bekleyen ziyaret yok." });
            }

            return Ok(sortedVisits);
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteVisit(int id, [FromBody] CompleteVisitRequestDto request)
        {
            var result = await _visitService.CompleteVisitAsync(id, request);
            if (!result.Success) return NotFound(new { message = result.ErrorMessage });

            return Ok(result.Visit);
        }

        [HttpPost("end-day")]
        public async Task<IActionResult> EndDay([FromBody] EndDayRequestDto request)
        {
            var result = await _visitService.EndDayAsync(request);
            if (!result.Success) return NotFound(new { message = result.ErrorMessage });

            return Ok(result.Shift);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> CreateVisit([FromBody] CreateVisitDto dto)
        {
            var result = await _visitService.CreateVisitAsync(dto);
            if (!result.Success) return BadRequest(new { message = result.ErrorMessage });

            return Ok(result.Visit);
        }

        [HttpGet("admin")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAdminVisits([FromQuery] string date, [FromQuery] int? personnelId)
        {
            var visits = await _visitService.GetAdminVisitsAsync(date, personnelId);
            return Ok(visits);
        }

        [HttpDelete("clear-db")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ClearDb()
        {
            await _visitService.ClearDbAsync();
            return Ok(new { message = "Veritabanı başarıyla temizlendi." });
        }
    }
}