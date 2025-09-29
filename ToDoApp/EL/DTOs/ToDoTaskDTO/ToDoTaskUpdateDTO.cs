using EL.Models.Task;

namespace El.DTOs.ToDoTaskDTO
{
    public class ToDoTaskUpdateDTO
    {
        public string? Title { get; set; }
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
        public StatusTaska? Status { get; set; } //Opciono polje za update statusa (ako ga ne prosledim ostaje Pending)
        public string? Category { get; set; }
        public TaskPriority? Priority { get; set; }
    }
}
