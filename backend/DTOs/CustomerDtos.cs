using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public class CreateCustomerDto
    {
        [Required(ErrorMessage = "Bayi adı zorunludur.")]
        public string DealerName { get; set; } = string.Empty;

        [Required(ErrorMessage = "İletişim kişisi zorunludur.")]
        public string ContactName { get; set; } = string.Empty;

        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int PersonnelId { get; set; }
    }

    public class UpdateCustomerDto : CreateCustomerDto
    {
    }

    // Personelin özet nesnesi (Döngüsel referans yaratmaz)
    public class PersonnelSummaryDto
    {
        public int Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class CustomerResponseDto
    {
        public int Id { get; set; }
        public string DealerName { get; set; } = string.Empty;
        public string ContactName { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public int PersonnelId { get; set; }

        // Hem nesne bekleyen hem de direkt string bekleyen yapıları destekler:
        public PersonnelSummaryDto? Personnel { get; set; }
        public string? PersonnelFullName { get; set; }
    }
}