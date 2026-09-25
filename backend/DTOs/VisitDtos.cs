using System;

namespace backend.DTOs
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

    public class AdminVisitResponseDto
    {
        public int Id { get; set; }
        public string PersonnelName { get; set; } = string.Empty;
        public string CustomerName { get; set; } = string.Empty;
        public DateTime VisitDate { get; set; }
        public int RouteOrder { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? CheckInTime { get; set; }
        public string? EvaluationNote { get; set; }
    }
}