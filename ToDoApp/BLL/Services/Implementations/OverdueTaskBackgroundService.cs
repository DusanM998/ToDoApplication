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
    // Background servis koji sluzi za azuriranje statusa taska ako je isteko
    public class OverdueTaskBackgroundService : BackgroundService, IOverdueTaskBackgroundService
    {
        private readonly IServiceProvider _serviceProvider; // Omogucava kreiranje scopa za DI
        private readonly ILogger<OverdueTaskBackgroundService> _logger; // Za logovanje gresaka

        public OverdueTaskBackgroundService(IServiceProvider serviceProvider, ILogger<OverdueTaskBackgroundService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        // Metoda se pokrece automatski kada se aplikacija startuje
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while(!stoppingToken.IsCancellationRequested) //...i ceka 24h pre sledeceg izvrsavanja
            {
                await CheckAndUpdateOverdueTasksAsync(stoppingToken);
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken); // Na svaka 24h se izvrsava
            }
        }

        public async Task CheckAndUpdateOverdueTasksAsync(CancellationToken cancellationToken)
        {
            try
            {
                // using sluzi da kada se zavrsi blok koda, resurs nad kojim je using automatski poziva Dispose()
                // bez obzira da li se greska desila unutar bloka ili ne (odlaze oslobadjanje resursa dok se ne zavrsi scope bloka)
                using var scope = _serviceProvider.CreateScope();
                var taskService = scope.ServiceProvider.GetRequiredService<ITaskService>(); // Preuzima se ITaskService iz DI container

                var response = await taskService.UpdateOverdueTasksAsync(); // metoda u ITaskService azurira status taskova (ako su istekli)
                _logger.LogInformation("Overdue tasks updated at {time}: {result}", DateTime.UtcNow, response.Result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while updating overdue tasks.");
            }
        }
    }
}
