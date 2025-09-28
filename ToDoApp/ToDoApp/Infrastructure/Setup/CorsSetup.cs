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
                    policy.SetIsOriginAllowed(origin =>
                            Uri.TryCreate(origin, UriKind.Absolute, out var uri) 
                            && uri.Host == "localhost")
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .WithExposedHeaders("X-Pagination")
                        .AllowCredentials();
                });
            });

            return services;
        }
    }
}
