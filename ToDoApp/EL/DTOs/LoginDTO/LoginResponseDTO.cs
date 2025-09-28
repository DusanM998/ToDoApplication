namespace El.DTOs.LoginDTO
{
    public class LoginResponseDTO
    {
        public string Email { get; set; } = string.Empty;
        public string Token { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
    }
}
