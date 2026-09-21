namespace backend.DTOs
{
    public class LoginRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class RegisterRequestDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Fullname { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Fullname { get; set; } = string.Empty;
        
        // --- REACT'IN ÇÖKMESİNİ ENGELLEYEN YENİ EKLENEN VERİLER ---
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}