namespace ToDoApp.Infrastructure.Setup
{
    public static class CorsSetup
    {
        public static IServiceCollection AddCorsSetup(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy
                        .WithOrigins("http://localhost:5173")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .WithExposedHeaders("X-Pagination")
                        .AllowCredentials();
                });
            });

            return services;
        }
    }
}
