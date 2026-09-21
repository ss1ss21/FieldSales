using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using System;
using System.Threading.Tasks;

namespace backend.Controllers
{
    public class StartDayRequestDto
    {
        public int PersonnelId { get; set; }
        public double StartLat { get; set; }
        public double StartLng { get; set; }
    }

    public class EndDayRequestDto
    {
        public int ShiftId { get; set; }
        public double EndLat { get; set; }
        public double EndLng { get; set; }
    }

    public class CompleteVisitRequestDto
    {
        public string Status { get; set; } = string.Empty;
        public string? EvaluationNote { get; set; }
    }

    public class RecalculateRouteRequestDto
    {
        public int PersonnelId { get; set; }
        public double CurrentLat { get; set; }
        public double CurrentLng { get; set; }
    }

    public class CreateVisitDto
    {
        public int PersonnelId { get; set; }
        public int CustomerId { get; set; }
        public DateTime VisitDate { get; set; }
    }

    [Route("api/[controller]")]
    [ApiController]
    public class VisitsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public VisitsController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/visits/start-day
        [HttpPost("start-day")]
        public async Task<IActionResult> StartDay([FromBody] StartDayRequestDto request)
        {
            var today = DateTime.Today;

            var activeShift = await _context.DailyShifts
                .FirstOrDefaultAsync(s => s.PersonnelId == request.PersonnelId && s.ShiftDate.Date == today && s.EndTime == null);

            if (activeShift == null)
            {
                activeShift = new DailyShift
                {
                    PersonnelId = request.PersonnelId,
                    ShiftDate = today,
                    StartTime = DateTime.Now,
                    StartLat = request.StartLat,
                    StartLng = request.StartLng
                };
                _context.DailyShifts.Add(activeShift);
                await _context.SaveChangesAsync();
            }

            var existingVisits = await _context.Visits
                .Include(v => v.Customer)
                .Where(v => v.PersonnelId == request.PersonnelId && v.VisitDate.Date == today)
                .ToListAsync();

            var duplicatedVisits = existingVisits
                .GroupBy(v => v.CustomerId)
                .Where(g => g.Count() > 1)
                .SelectMany(g => g.Skip(1))
                .ToList();

            if (duplicatedVisits.Any())
            {
                _context.Visits.RemoveRange(duplicatedVisits);
                await _context.SaveChangesAsync();
                
                existingVisits = await _context.Visits
                    .Include(v => v.Customer)
                    .Where(v => v.PersonnelId == request.PersonnelId && v.VisitDate.Date == today)
                    .ToListAsync();
            }

            if (!existingVisits.Any())
            {
                var customers = await _context.Customers
                    .Where(c => c.PersonnelId == request.PersonnelId)
                    .ToListAsync();

                if (!customers.Any())
                {
                    return BadRequest("Bu personele atanmış herhangi bir bayi/müşteri bulunamadı.");
                }

                var uniqueCustomers = customers
                    .GroupBy(c => c.Id)
                    .Select(g => g.First())
                    .OrderBy(c => CalculateDistance(request.StartLat, request.StartLng, (double)c.Latitude, (double)c.Longitude))
                    .ToList();

                int order = 1;
                foreach (var customer in uniqueCustomers)
                {
                    _context.Visits.Add(new Visit
                    {
                        PersonnelId = request.PersonnelId,
                        CustomerId = customer.Id,
                        VisitDate = today,
                        RouteOrder = order++,
                        Status = "Pending"
                    });
                }
                await _context.SaveChangesAsync();
            }
            else
            {
                var pendingVisits = existingVisits
                    .Where(v => v.Status == "Pending")
                    .OrderBy(v => CalculateDistance(request.StartLat, request.StartLng, (double)v.Customer.Latitude, (double)v.Customer.Longitude))
                    .ToList();

                int order = 1;
                foreach (var visit in pendingVisits)
                {
                    visit.RouteOrder = order++;
                }
                await _context.SaveChangesAsync();
            }

            var finalVisits = await _context.Visits
                .Include(v => v.Customer)
                .Where(v => v.PersonnelId == request.PersonnelId && v.VisitDate.Date == today)
                .OrderBy(v => v.RouteOrder)
                .ToListAsync();

            var uniqueFinalVisits = finalVisits
                .GroupBy(v => v.CustomerId)
                .Select(g => g.First())
                .ToList();

            return Ok(new { 
                Message = "Rota başarıyla oluşturuldu.", 
                Shift = activeShift,
                Visits = uniqueFinalVisits 
            });
        }

        [HttpGet("today/{personnelId}")]
        public async Task<IActionResult> GetToday(int personnelId)
        {
            var today = DateTime.Today;
            
            var activeShift = await _context.DailyShifts
                .FirstOrDefaultAsync(s => s.PersonnelId == personnelId && s.ShiftDate.Date == today && s.EndTime == null);

            var visits = await _context.Visits
                .Include(v => v.Customer) 
                .Where(v => v.PersonnelId == personnelId && v.VisitDate.Date == today)
                .OrderBy(v => v.RouteOrder)
                .ToListAsync();

            var uniqueVisits = visits
                .GroupBy(v => v.CustomerId)
                .Select(g => g.First())
                .ToList();

            return Ok(new { Shift = activeShift, Visits = uniqueVisits });
        }

        [HttpPost("recalculate")]
        public async Task<IActionResult> RecalculateRoute([FromBody] RecalculateRouteRequestDto request)
        {
            var today = DateTime.Today;
            
            var pendingVisits = await _context.Visits
                .Include(v => v.Customer)
                .Where(v => v.PersonnelId == request.PersonnelId && v.VisitDate.Date == today && v.Status == "Pending")
                .ToListAsync();

            if (!pendingVisits.Any()) return Ok(new { Message = "Yeniden hesaplanacak bekleyen ziyaret yok." });

            var sortedVisits = pendingVisits
                .GroupBy(v => v.CustomerId)
                .Select(g => g.First())
                .OrderBy(v => CalculateDistance(request.CurrentLat, request.CurrentLng, (double)v.Customer!.Latitude, (double)v.Customer.Longitude))
                .ToList();

            int order = 1;
            foreach (var visit in sortedVisits)
            {
                visit.RouteOrder = order++;
            }

            await _context.SaveChangesAsync();
            return Ok(sortedVisits);
        }

        [HttpPut("{id}/complete")]
        public async Task<IActionResult> CompleteVisit(int id, [FromBody] CompleteVisitRequestDto request)
        {
            var visit = await _context.Visits.FindAsync(id);
            if (visit == null) return NotFound("Ziyaret bulunamadı.");

            visit.Status = request.Status;
            visit.EvaluationNote = request.EvaluationNote;
            visit.CheckInTime = DateTime.Now;

            await _context.SaveChangesAsync();
            return Ok(visit);
        }

        [HttpPost("end-day")]
        public async Task<IActionResult> EndDay([FromBody] EndDayRequestDto request)
        {
            var shift = await _context.DailyShifts.FindAsync(request.ShiftId);
            if (shift == null) return NotFound("Aktif vardiya bulunamadı.");

            shift.EndTime = DateTime.Now;
            shift.EndLat = request.EndLat;
            shift.EndLng = request.EndLng;

            var pendingVisits = await _context.Visits
                .Where(v => v.PersonnelId == shift.PersonnelId && v.VisitDate.Date == DateTime.Today && v.Status == "Pending")
                .ToListAsync();

            foreach (var visit in pendingVisits)
            {
                visit.Status = "Postponed"; 
            }

            await _context.SaveChangesAsync();
            return Ok(shift);
        }

        [HttpGet("clear-db")]
        [AllowAnonymous] 
        public async Task<IActionResult> ClearDb()
        {
            _context.Visits.RemoveRange(_context.Visits);
            _context.DailyShifts.RemoveRange(_context.DailyShifts);
            await _context.SaveChangesAsync();
            return Ok("Veritabanı başarıyla temizlendi.");
        }

        // SQLite'ın tarih engellerini atlayarak %100 Mükerrer Kayıt (Duplicate) koruması sağlar
        [HttpPost]
        public async Task<IActionResult> CreateVisit([FromBody] CreateVisitDto dto)
        {
            // Önce personelin bu müşteriye ait tüm ziyaretlerini çekiyoruz (SQLite tarih filtrelemesinde patlamaması için)
            var existingVisits = await _context.Visits
                .Where(v => v.PersonnelId == dto.PersonnelId && v.CustomerId == dto.CustomerId)
                .ToListAsync();

            // C# (RAM) üzerinde tarih karşılaştırması yaparak kesin sonucu buluyoruz
            var isAlreadyPlanned = existingVisits.Any(v => v.VisitDate.Date == dto.VisitDate.Date);

            if (isAlreadyPlanned)
            {
                return BadRequest("Bu personel için seçili tarihte bu bayiye zaten bir ziyaret planlanmış.");
            }

            // Güvenlik duvarını geçtikten sonra yeni rotayı belirliyoruz
            var maxOrder = await _context.Visits
                .Where(v => v.PersonnelId == dto.PersonnelId && v.VisitDate.Date == dto.VisitDate.Date)
                .MaxAsync(v => (int?)v.RouteOrder) ?? 0;

            var visit = new Visit
            {
                PersonnelId = dto.PersonnelId,
                CustomerId = dto.CustomerId,
                VisitDate = dto.VisitDate.Date,
                RouteOrder = maxOrder + 1, 
                Status = "Pending"
            };

            _context.Visits.Add(visit);
            await _context.SaveChangesAsync();

            return Ok(visit);
        }

        [HttpGet("admin")]
        public async Task<IActionResult> GetAdminVisits([FromQuery] string date, [FromQuery] int? personnelId)
        {
            if (!DateTime.TryParse(date, out DateTime filterDate))
            {
                filterDate = DateTime.Today;
            }

            var query = _context.Visits
                .Include(v => v.Customer)
                .Include(v => v.Personnel)
                .Where(v => v.VisitDate.Date == filterDate.Date);

            if (personnelId.HasValue && personnelId.Value > 0)
            {
                query = query.Where(v => v.PersonnelId == personnelId.Value);
            }

            var visits = await query
                .OrderBy(v => v.PersonnelId)
                .ThenBy(v => v.RouteOrder)
                .Select(v => new {
                    id = v.Id,
                    personnelName = v.Personnel.FullName,
                    customerName = v.Customer.DealerName,
                    visitDate = v.VisitDate,
                    routeOrder = v.RouteOrder,
                    status = v.Status,
                    checkInTime = v.CheckInTime,
                    evaluationNote = v.EvaluationNote
                })
                .ToListAsync();

            return Ok(visits);
        }

        private double CalculateDistance(double lat1, double lon1, double lat2, double lon2)
        {
            var rLat1 = Math.PI * lat1 / 180;
            var rLat2 = Math.PI * lat2 / 180;
            var theta = lon1 - lon2;
            var rTheta = Math.PI * theta / 180;
            var dist = Math.Sin(rLat1) * Math.Sin(rLat2) + Math.Cos(rLat1) * Math.Cos(rLat2) * Math.Cos(rTheta);
            dist = Math.Acos(dist);
            dist = dist * 180 / Math.PI;
            dist = dist * 60 * 1.1515;
            return dist * 1.609344; 
        }
    }
}