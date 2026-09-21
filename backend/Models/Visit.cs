using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Visit
    {
        [Key]
        public int Id { get; set; }
        
        [ForeignKey("Personnel")]
        public int PersonnelId { get; set; }
        public User? Personnel { get; set; }

        [ForeignKey("Customer")]
        public int CustomerId { get; set; }
        public Customer? Customer { get; set; }

        public DateTime VisitDate { get; set; }
        public int RouteOrder { get; set; }
        
        public string Status { get; set; } = "Pending"; 
        
        public string? EvaluationNote { get; set; }
        public DateTime? CheckInTime { get; set; }
    }
}