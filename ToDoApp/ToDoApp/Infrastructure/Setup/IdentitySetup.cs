using DAL.DbContexts;
using EL.Models.User;
using Microsoft.AspNetCore.Identity;

namespace ToDoApp.Infrastructure.Setup
{
    public static class IdentitySetup
    {
        public static IServiceCollection AddIdentitySetup(this IServiceCollection services)
        {
            services.AddIdentity<ApplicationUser, IdentityRole>()
                .AddEntityFrameworkStores<ApplicationDbContext>()
                .AddApiEndpoints();

            return services;
        }
    }
}
