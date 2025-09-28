namespace El.DTOs.ToDoTaskDTO
{
    public class ToDoTaskCreateDTO
    {
        public string Title { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime? DueDate { get; set; }
    }
}
