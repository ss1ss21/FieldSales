using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class DailyShift
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("Personnel")]
        public int PersonnelId { get; set; }
        public User? Personnel { get; set; }

        public DateTime ShiftDate { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        public double? StartLat { get; set; }
        public double? StartLng { get; set; }

        public double? EndLat { get; set; }
        public double? EndLng { get; set; }
    }
}