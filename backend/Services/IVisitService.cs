using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IVisitService
    {
        Task<(DailyShift Shift, List<Visit> Visits)> StartDayAsync(StartDayRequestDto request);
        Task<(DailyShift? Shift, List<Visit> Visits)> GetTodayAsync(int personnelId);
        Task<List<Visit>> RecalculateRouteAsync(RecalculateRouteRequestDto request);
        Task<(bool Success, string? ErrorMessage, Visit? Visit)> CompleteVisitAsync(int id, CompleteVisitRequestDto request);
        Task<(bool Success, string? ErrorMessage, DailyShift? Shift)> EndDayAsync(EndDayRequestDto request);
        Task<(bool Success, string? ErrorMessage, Visit? Visit)> CreateVisitAsync(CreateVisitDto dto);
        Task<List<AdminVisitResponseDto>> GetAdminVisitsAsync(string date, int? personnelId);
        Task ClearDbAsync();
    }
}