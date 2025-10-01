using Azure;
using DAL.DbContexts;
using DAL.QueryExtensions;
using DAL.Repository.Interfaces;
using EL.DTOs.ToDoTaskDTO;
using EL.Models.Task;
using Microsoft.EntityFrameworkCore;
using Microsoft.VisualBasic;
using System;
using System.Collections.Generic;
using System.Drawing.Printing;
using System.Linq;
using System.Net;
using System.Net.NetworkInformation;
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

        public IQueryable<ToDoTask> GetAllAsQueryable(string userId, string? search, StatusTaska? status,
            DateTime? dueDateFrom,
            DateTime? dueDateTo,
            string? category,
            TaskPriority? priority)
        {
            IQueryable<ToDoTask> query = _context.ToDoTasks
                    .Where(t => t.ApplicationUserId == userId).AsQueryable(); // Filter taskova tako da se uzmu samo oni koji pripadaju trenutno ulogovanom korisniku
                    

            //query = query.ApplySearch(search);

            // Filter po statusu 
            /*if (status.HasValue)
            {
                query = query.Where(t => t.Status == status.Value);
            }

            //...po datumu (od)
            if (dueDateFrom.HasValue)
            {
                query = query.Where(t => t.DueDate >= dueDateFrom.Value);
            }
            //..do
            if (dueDateTo.HasValue)
            {
                query = query.Where(t => t.DueDate <= dueDateTo.Value);
            }

            // Filter po kategoriji
            if (!string.IsNullOrEmpty(category))
            {
                query = query.Where(t => t.Category == category);
            }

            // Filter po prioritetu
            if (priority.HasValue)
            {
                query = query.Where(t => t.Priority == priority.Value);
            }*/

            return query;
        }
    }
}
