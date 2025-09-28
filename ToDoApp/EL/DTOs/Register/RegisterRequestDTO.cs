using Microsoft.AspNetCore.Http;

namespace EL.Models.DTOs.Register
{
    public class RegisterRequestDTO
    {
        public string UserName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public IFormFile File { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
