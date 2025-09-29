using DAL.DbContexts;
using DAL.Repository.Interfaces;
using EL.DTOs.ToDoTaskDTO;
using EL.Models.Task;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repository.Implementations
{
    public class TaskRepository : Repository<ToDoTask> , ITaskRepository
    {
        public TaskRepository(ApplicationDbContext context) : base(context) { }

        public async Task<List<ToDoTask>> GetTasksByUserIdAsync(string userId)
        {
            return await _context.ToDoTasks
                .Where(t => t.ApplicationUserId == userId)
                .OrderByDescending(t => t.CreatedAt)
                .ToListAsync();
        }

        public async Task<List<TaskWithUserDTO>> GetAllWithUsersAsync()
        {
            return await _context.ToDoTasks
                .Include(t => t.User) // ili Include(t => t.ApplicationUser)
                .Select(t => new TaskWithUserDTO
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    DueDate = t.DueDate,
                    ApplicationUserId = t.ApplicationUserId,
                    Name = t.User != null ? t.User.Name : "",
                    Email = t.User != null ? t.User.Email : ""
                })
                .ToListAsync();
        }
    }
}
