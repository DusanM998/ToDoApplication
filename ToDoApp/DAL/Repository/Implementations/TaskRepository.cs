using DAL.DbContexts;
using DAL.Repository.Interfaces;
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
    }
}
