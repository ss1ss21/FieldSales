using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class Customer
    {
        [Key]
        public int Id{get;set;}
        [Required]
        public string DealerName{get;set;} = string.Empty;
        [Required]
        public string ContactName{get;set;} = string.Empty;
        public string Address{get;set;} = string.Empty;
        public double Latitude{get;set;}
        public double Longitude{get;set;}
        public int PersonnelId { get; set; }
        [ForeignKey("PersonnelId")]
        public User? Personnel { get; set; }
    }
}