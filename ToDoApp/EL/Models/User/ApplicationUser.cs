using EL.Models.Task;
using Microsoft.AspNetCore.Identity;

namespace EL.Models.User
{
    // Koristim IdentityUser kao baznu klasu za korisnika (Identity mi omogucava da impl. autentifikaciju i autorizaciju,
    // da dodam role za korisnika, hashujem password, itd)
    public class ApplicationUser : IdentityUser 
    {
        public string Name { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryTime { get; set; }

        // Navigaciona property koja predstavlja vezu 1-na-vise izmedju ApplicationUser i ToDoTask
        public ICollection<ToDoTask> Tasks { get; set; } = new List<ToDoTask>();
    }
}
