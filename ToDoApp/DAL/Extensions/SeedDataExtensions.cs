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
        public static async Task EnsureSeedDataAsync(this IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var services = scope.ServiceProvider;

            var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

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
                    NormalizedEmail = adminEmail.ToUpper(),
                    EmailConfirmed = true,
                    Name = "Admin User",
                    Image = string.Empty,
                    CompletedTasksCount = 0,
                    PendingTasksCount = 0,
                    OverdueTasksCount = 0
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
                    NormalizedEmail = customerEmail.ToUpper(),
                    EmailConfirmed = true,
                    Name = "Customer User",
                    Image = string.Empty,
                    CompletedTasksCount = 0,
                    PendingTasksCount = 0,
                    OverdueTasksCount = 0
                };

                var result = await userManager.CreateAsync(customer, "Customer123!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(customer, SD.Role_Customer);
                }
            }
        }
    }
}
