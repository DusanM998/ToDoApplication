using EL.DTOs.ToDoTaskDTO;
using EL.Models.Task;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repository.Interfaces
{
    public interface ITaskRepository : IRepository<ToDoTask>
    {
        Task<List<ToDoTask>> GetTasksByUserIdAsync(string userId);
        IQueryable<TaskWithUserDTO> GetAllWithUsersAsQueryable();
        IQueryable<ToDoTask> GetAllAsQueryable(string userId, string? search, StatusTaska? status,
            DateTime? dueDateFrom,
            DateTime? dueDateTo,
            string? category,
            TaskPriority? priority);
        
    }
}
