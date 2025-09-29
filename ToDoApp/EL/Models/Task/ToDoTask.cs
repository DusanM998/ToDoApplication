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
        public string ApplicationUserId { get; set; } = string.Empty;
        [ForeignKey("ApplicationUserId")]
        public virtual ApplicationUser User { get; set; }

        public TaskPriority Priority { get; set; } = TaskPriority.Medium; // Prioriteti za task - Low, Medium, High
        public string? Category { get; set; } // Kategorija za task, npr "Work", "Personal", "School"
    }
}
