using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class VisitService : IVisitService
    {
        private readonly AppDbContext _context;

        public VisitService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<(DailyShift Shift, List<Visit> Visits)> StartDayAsync(StartDayRequestDto request)
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

            var plannedVisits = await _context.Visits
                .Include(v => v.Customer)
                .Where(v => v.PersonnelId == request.PersonnelId && v.VisitDate.Date == today)
                .ToListAsync();

            if (!plannedVisits.Any())
            {
                return (activeShift, new List<Visit>());
            }

            var pendingVisits = plannedVisits
                .Where(v => v.Status == "Pending" && v.Customer != null)
                .OrderBy(v => CalculateDistance(request.StartLat, request.StartLng, v.Customer!.Latitude, v.Customer.Longitude))
                .ToList();

            int order = 1;
            foreach (var visit in pendingVisits)
            {
                visit.RouteOrder = order++;
            }
            await _context.SaveChangesAsync();

            var finalVisits = await _context.Visits
                .Include(v => v.Customer)
                .Where(v => v.PersonnelId == request.PersonnelId && v.VisitDate.Date == today)
                .OrderBy(v => v.RouteOrder)
                .ToListAsync();

            return (activeShift, finalVisits);
        }

        public async Task<(DailyShift? Shift, List<Visit> Visits)> GetTodayAsync(int personnelId)
        {
            var today = DateTime.Today;

            var shift = await _context.DailyShifts
                .OrderByDescending(s => s.Id)
                .FirstOrDefaultAsync(s => s.PersonnelId == personnelId && s.ShiftDate.Date == today);

            var visits = await _context.Visits
                .Include(v => v.Customer)
                .Where(v => v.PersonnelId == personnelId && v.VisitDate.Date == today)
                .OrderBy(v => v.RouteOrder)
                .ToListAsync();

            return (shift, visits);
        }

        public async Task<List<Visit>> RecalculateRouteAsync(RecalculateRouteRequestDto request)
        {
            var today = DateTime.Today;

            var pendingVisits = await _context.Visits
                .Include(v => v.Customer)
                .Where(v => v.PersonnelId == request.PersonnelId && v.VisitDate.Date == today && v.Status == "Pending")
                .ToListAsync();

            if (!pendingVisits.Any()) return new List<Visit>();

            var sortedVisits = pendingVisits
                .OrderBy(v => CalculateDistance(request.CurrentLat, request.CurrentLng, v.Customer!.Latitude, v.Customer.Longitude))
                .ToList();

            int order = 1;
            foreach (var visit in sortedVisits)
            {
                visit.RouteOrder = order++;
            }

            await _context.SaveChangesAsync();
            return sortedVisits;
        }

        public async Task<(bool Success, string? ErrorMessage, Visit? Visit)> CompleteVisitAsync(int id, CompleteVisitRequestDto request)
        {
            var visit = await _context.Visits.FindAsync(id);
            if (visit == null) return (false, "Ziyaret bulunamadı.", null);

            visit.Status = request.Status;
            visit.EvaluationNote = request.EvaluationNote;
            visit.CheckInTime = DateTime.Now;

            await _context.SaveChangesAsync();
            return (true, null, visit);
        }

        public async Task<(bool Success, string? ErrorMessage, DailyShift? Shift)> EndDayAsync(EndDayRequestDto request)
        {
            var shift = await _context.DailyShifts.FindAsync(request.ShiftId);
            if (shift == null) return (false, "Aktif vardiya bulunamadı.", null);

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
            return (true, null, shift);
        }

        public async Task<(bool Success, string? ErrorMessage, Visit? Visit)> CreateVisitAsync(CreateVisitDto dto)
        {
            var visitDate = dto.VisitDate.Date;

            // 1. Personel seçilen günde mesaisini bitirmiş mi kontrolü
            var isShiftEnded = await _context.DailyShifts
                .AnyAsync(s => s.PersonnelId == dto.PersonnelId && s.ShiftDate.Date == visitDate && s.EndTime != null);

            if (isShiftEnded)
            {
                return (false, "Bu personel seçilen tarihte mesaisini sonlandırmıştır. Yeni randevu planlanamaz.", null);
            }

            // 2. Mükerrer randevu kontrolü
            var existingVisits = await _context.Visits
                .Where(v => v.PersonnelId == dto.PersonnelId && v.CustomerId == dto.CustomerId)
                .ToListAsync();

            var isAlreadyPlanned = existingVisits.Any(v => v.VisitDate.Date == visitDate);

            if (isAlreadyPlanned)
            {
                return (false, "Bu personel için seçili tarihte bu bayiye zaten bir ziyaret planlanmış.", null);
            }

            // 3. Sıralama ve Ekleme
            var maxOrder = await _context.Visits
                .Where(v => v.PersonnelId == dto.PersonnelId && v.VisitDate.Date == visitDate)
                .MaxAsync(v => (int?)v.RouteOrder) ?? 0;

            var visit = new Visit
            {
                PersonnelId = dto.PersonnelId,
                CustomerId = dto.CustomerId,
                VisitDate = visitDate,
                RouteOrder = maxOrder + 1,
                Status = "Pending"
            };

            _context.Visits.Add(visit);
            await _context.SaveChangesAsync();

            return (true, null, visit);
        }

        public async Task<List<AdminVisitResponseDto>> GetAdminVisitsAsync(string date, int? personnelId)
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

            return await query
                .OrderBy(v => v.PersonnelId)
                .ThenBy(v => v.RouteOrder)
                .Select(v => new AdminVisitResponseDto
                {
                    Id = v.Id,
                    PersonnelName = v.Personnel != null ? v.Personnel.FullName : string.Empty,
                    CustomerName = v.Customer != null ? v.Customer.DealerName : string.Empty,
                    VisitDate = v.VisitDate,
                    RouteOrder = v.RouteOrder,
                    Status = v.Status,
                    CheckInTime = v.CheckInTime,
                    EvaluationNote = v.EvaluationNote
                })
                .ToListAsync();
        }

        public async Task ClearDbAsync()
        {
            _context.Visits.RemoveRange(_context.Visits);
            _context.DailyShifts.RemoveRange(_context.DailyShifts);
            await _context.SaveChangesAsync();
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