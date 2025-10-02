using EL.Models.Task;
using EL.Models.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.DataSeeding
{
    public static class ApplicationDbContextSeed
    {
        public static void Seed(ModelBuilder modelBuilder)
        {
            // Taskovi povezani sa vec kreiranim userima (iz SeedDataExtensions)
            var createdAtAdminTask = new DateTime(2025, 10, 1, 12, 0, 0, DateTimeKind.Utc);
            var dueDateAdminTask = new DateTime(2025, 10, 15, 12, 0, 0, DateTimeKind.Utc);

            var createdAtCustomerTask = new DateTime(2025, 10, 1, 12, 0, 0, DateTimeKind.Utc);
            var dueDateCustomerTask = new DateTime(2025, 10, 14, 12, 0, 0, DateTimeKind.Utc);

            modelBuilder.Entity<ToDoTask>().HasData(
                new ToDoTask
                {
                    Id = 48,
                    Title = "Finish backend API",
                    Description = "Implement authentication and task CRUD",
                    Status = StatusTaska.Pending,
                    CreatedAt = createdAtAdminTask,
                    DueDate = dueDateAdminTask,
                    ApplicationUserId = "b86af68e-2acd-4907-8017-9589d9ebefa8", // user iz SeedDataExtensions
                    Priority = TaskPriority.High,
                    Category = "Work"
                },
                new ToDoTask
                {
                    Id = 49,
                    Title = "Buy groceries",
                    Description = "Milk, Bread, Eggs",
                    Status = StatusTaska.Pending,
                    CreatedAt = createdAtCustomerTask,
                    DueDate = dueDateCustomerTask,
                    ApplicationUserId = "2b525ece-53a7-4446-bfab-d538f5724788", // user iz SeedDataExtensions
                    Priority = TaskPriority.Medium,
                    Category = "Personal"
                }
            );
        }
    }
}
