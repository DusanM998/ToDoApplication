using BLL.Services.Interfaces;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services.Implementations
{
    public class OverdueTaskBackgroundService : BackgroundService, IOverdueTaskBackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<OverdueTaskBackgroundService> _logger;

        public OverdueTaskBackgroundService(IServiceProvider serviceProvider, ILogger<OverdueTaskBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while(!stoppingToken.IsCancellationRequested)
            {
                await CheckAndUpdateOverdueTasksAsync(stoppingToken);
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken); // Na svaka 24h se izvrsava
            }
        }

        public async Task CheckAndUpdateOverdueTasksAsync(CancellationToken cancellationToken)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var taskService = scope.ServiceProvider.GetRequiredService<ITaskService>();

                var response = await taskService.UpdateOverdueTasksAsync();
                _logger.LogInformation("Overdue tasks updated at {time}: {result}", DateTime.UtcNow, response.Result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating overdue tasks.");
            }
        }
    }
}
