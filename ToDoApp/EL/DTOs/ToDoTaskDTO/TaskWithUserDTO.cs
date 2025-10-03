using EL.Models.Task;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.ToDoTaskDTO
{
    public class TaskWithUserDTO
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public StatusTaska Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? DueDate { get; set; }
        public string ApplicationUserId { get; set; } = string.Empty;
        public TaskPriority Priority { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty; // ime korisnika
        public string Email { get; set; } = string.Empty; // email korisnika
    }
}
