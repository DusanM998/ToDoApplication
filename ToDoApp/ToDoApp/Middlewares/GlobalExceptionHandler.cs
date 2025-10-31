using EL.Shared;
using Microsoft.AspNetCore.Diagnostics;
using System.Net;
using System.Text.Json;

namespace ToDoApp.Middlewares
{
    public class GlobalExceptionHandler : IExceptionHandler
    {
        private readonly ILogger<GlobalExceptionHandler>  _logger;

        public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
        {
            _logger = logger;
        }
        
        public async ValueTask<bool> TryHandleAsync(HttpContext httpContext,
            Exception exception,
            CancellationToken cancellationToken)
        {
            _logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);

            var response = new ApiResponse
            {
                IsSuccess = false,
                StatusCode = HttpStatusCode.InternalServerError,
                ErrorMessages = new List<string> { "Doslo je do greske na serveru.", exception.Message }
            };

            httpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            httpContext.Response.ContentType = "application/json";

            await httpContext.Response.WriteAsync(JsonSerializer.Serialize(response), cancellationToken);

            return true; // ASP.NET zna da smo mi obradili exception
        }
    }
}
