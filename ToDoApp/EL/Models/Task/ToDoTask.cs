using EL.Models.User;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EL.Models.Task
{
    public class ToDoTask
    {
        [Key]
        public int Id { get; set; }

        [Required] 
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public StatusTaska Status { get; set; } = StatusTaska.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? DueDate { get; set; }
        [Required]
        // Polje koje cuva ID kor. kome task pripada
        // Predst. FK prema tabeli ApplicationUser (svaki zadatak ima tacno jednog vlasnika)
        public string ApplicationUserId { get; set; } = string.Empty;
        [ForeignKey("ApplicationUserId")]
        // FK atr. povezuje ApplicationUserId sa navigacionom vezom User i kaze EF coreu da je ApplicationUserId
        // FK ka tabeli User
        // virtual mi omogucava da se ucita User obj. iz baze samo kada se prvi put pristupi ovom polju
        public virtual ApplicationUser User { get; set; }

        public TaskPriority Priority { get; set; } = TaskPriority.Medium; // Prioriteti za task - Low, Medium, High
        public string? Category { get; set; } // Kategorija za task, npr "Work", "Personal", "School"
    }
}
