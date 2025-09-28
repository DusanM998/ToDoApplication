using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace EL.Models.DTOs.UserDTO
{
    public class UserDetailsUpdateDTO
    {
        [Key]
        public string Id { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public IFormFile? File { get; set; }
    }
}
