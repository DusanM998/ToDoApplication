using DAL.DbContexts;
using EL.Models.Task;
using EL.Models.User;
using EL.Shared;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;

namespace DAL.Extensions
{
    public static class SeedDataExtensions
    {
        // Pokrece se svaki put kada se startuje aplikacija,
        // ali proverava da li podaci koje unosi postoje tako da se oni kreiraju samo ako ne postoje
        public static async Task EnsureSeedDataAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var services = scope.ServiceProvider;

            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();
            var db = services.GetRequiredService<ApplicationDbContext>();

            // 1) Roles
            if (!await roleManager.RoleExistsAsync(SD.Role_Admin))
                await roleManager.CreateAsync(new IdentityRole(SD.Role_Admin));
            if (!await roleManager.RoleExistsAsync(SD.Role_Customer))
                await roleManager.CreateAsync(new IdentityRole(SD.Role_Customer));

            // 2) Admin user
            var adminEmail = "admin@test.com";
            var admin = await userManager.FindByEmailAsync(adminEmail);
            if (admin == null)
            {
                admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    Name = "Admin User",
                    Image = string.Empty
                };

                var result = await userManager.CreateAsync(admin, "Admin123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(admin, SD.Role_Admin);
                }
            }

            // 3) Customer user
            var customerEmail = "customer@test.com";
            var customer = await userManager.FindByEmailAsync(customerEmail);
            if (customer == null)
            {
                customer = new ApplicationUser
                {
                    UserName = customerEmail,
                    Email = customerEmail,
                    EmailConfirmed = true,
                    Name = "Customer User",
                    Image = string.Empty
                };

                var result = await userManager.CreateAsync(customer, "Customer123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(customer, SD.Role_Customer);
                }
            }

            // Ponovo cita korisnike iz baze
            admin = await userManager.FindByEmailAsync(adminEmail);
            customer = await userManager.FindByEmailAsync(customerEmail);

            // 4) Seed tasks
            var seedTasks = new List<ToDoTask>
            {
                new ToDoTask
                {
                    Title = "Finish backend API",
                    Description = "Implement authentication and task CRUD",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 1, 12, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 15, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = admin.Id,
                    Priority = TaskPriority.High,
                    Category = "Work"
                },
                new ToDoTask
                {
                    Title = "Review PRs",
                    Description = "Check and approve pending pull requests",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 2, 10, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 16, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = admin.Id,
                    Priority = TaskPriority.Medium,
                    Category = "Work"
                },
                new ToDoTask
                {
                    Title = "Team meeting",
                    Description = "Weekly sync with backend team",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 3, 9, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 3, 10, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = admin.Id,
                    Priority = TaskPriority.Medium,
                    Category = "Work"
                },
                new ToDoTask
                {
                    Title = "Update documentation",
                    Description = "Update API docs after new endpoints",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 4, 11, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 18, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = admin.Id,
                    Priority = TaskPriority.Low,
                    Category = "Work"
                },
                new ToDoTask
                {
                    Title = "Setup CI/CD pipeline",
                    Description = "Automate deployments to staging",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 5, 13, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 20, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = admin.Id,
                    Priority = TaskPriority.High,
                    Category = "Work"
                },
                new ToDoTask
                {
                    Title = "Refactor services",
                    Description = "Clean up backend services code",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 6, 14, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 21, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = admin.Id,
                    Priority = TaskPriority.Medium,
                    Category = "Work"
                },
                new ToDoTask
                {
                    Title = "Bug fixes",
                    Description = "Fix reported bugs from QA",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 7, 15, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 22, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = admin.Id,
                    Priority = TaskPriority.High,
                    Category = "Work"
                },
                new ToDoTask
                {
                    Title = "Code review session",
                    Description = "Mentor junior developers",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 8, 16, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 23, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = admin.Id,
                    Priority = TaskPriority.Medium,
                    Category = "Work"
                },

                //Taskovi customera
                new ToDoTask
                {
                    Title = "Buy groceries",
                    Description = "Milk, Bread, Eggs, Fruits",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 1, 10, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 10, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = customer.Id,
                    Priority = TaskPriority.Medium,
                    Category = "Personal"
                },
                new ToDoTask
                {
                    Title = "Schedule dentist appointment",
                    Description = "Call and schedule dentist",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 2, 11, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 12, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = customer.Id,
                    Priority = TaskPriority.Low,
                    Category = "Personal"
                },
                new ToDoTask
                {
                    Title = "Pay bills",
                    Description = "Electricity and internet bills",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 3, 12, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 13, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = customer.Id,
                    Priority = TaskPriority.Medium,
                    Category = "Personal"
                },
                new ToDoTask
                {
                    Title = "Clean the house",
                    Description = "Vacuum, mop, dust surfaces",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 4, 13, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 14, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = customer.Id,
                    Priority = TaskPriority.Low,
                    Category = "Personal"
                },
                new ToDoTask
                {
                    Title = "Book flight tickets",
                    Description = "Book tickets for weekend trip",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 5, 14, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 18, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = customer.Id,
                    Priority = TaskPriority.Medium,
                    Category = "Personal"
                },
                new ToDoTask
                {
                    Title = "Finish online course",
                    Description = "Complete C# tutorial on Pluralsight",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 6, 15, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 20, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = customer.Id,
                    Priority = TaskPriority.High,
                    Category = "Personal"
                },
                new ToDoTask
                {
                    Title = "Call plumber",
                    Description = "Fix leaking sink",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 7, 16, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 21, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = customer.Id,
                    Priority = TaskPriority.Medium,
                    Category = "Personal"
                },
                new ToDoTask
                {
                    Title = "Organize closet",
                    Description = "Sort clothes and donate old ones",
                    Status = StatusTaska.Pending,
                    CreatedAt = new DateTime(2025, 10, 8, 17, 0, 0, DateTimeKind.Utc),
                    DueDate = new DateTime(2025, 10, 22, 12, 0, 0, DateTimeKind.Utc),
                    ApplicationUserId = customer.Id,
                    Priority = TaskPriority.Low,
                    Category = "Personal"
                }
            };

            // Dodaj samo one koji ne postoje
            foreach (var task in seedTasks)
            {
                bool exists = await db.ToDoTasks
                    .AnyAsync(t => t.Title == task.Title && t.ApplicationUserId == task.ApplicationUserId);

                if (!exists)
                    db.ToDoTasks.Add(task);
            }

            await db.SaveChangesAsync();
        }

    }
}
