using DAL.DbContexts;
using DAL.Repository.Implementations;
using DAL.Repository.Interfaces;
using DAL.Repository.UoF.Implementations;
using DAL.Repository.UoF.Interfaces;
using EL.Models.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace DAL.Repository.Setup
{
    public static class RepositoryRegistration
    {
        // umesto da prima connection string kao string, bolje je primati IConfiguration
        public static IServiceCollection AddDataAccess(this IServiceCollection services, IConfiguration configuration)
        {
            

            services.AddScoped<ITaskRepository, TaskRepository>();
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            return services;
        }
    }
}
