using BLL.Mapping;
using BLL.Services.Implementations;
using BLL.Services.Interfaces;
using BLL.Validators;
using DAL.Repository.Interfaces;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Setup
{
    public static class ServiceRegistration
    {
        public static IServiceCollection AddBusinessLogic(this IServiceCollection services)
        {
            services.AddScoped<ITaskService, TaskService>();
            services.AddScoped<IMessageService, MessageService>();
            services.AddScoped<IGroupService, GroupService>();

            services.AddAutoMapper(typeof(GroupProfile));

            services.AddValidatorsFromAssemblyContaining<MessageValidator>();
            return services;
        }
    }
}
