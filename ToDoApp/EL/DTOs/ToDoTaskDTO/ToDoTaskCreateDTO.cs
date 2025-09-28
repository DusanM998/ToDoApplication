using EL.Models.Task;

namespace El.DTOs.ToDoTaskDTO
{
    public class ToDoTaskCreateDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public string? Category { get; set; }
        public TaskPriority Priority { get; set; } = TaskPriority.Medium;
    }
}
