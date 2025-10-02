using BLL.Services.Implementations;
using BLL.Services.Interfaces;
using BLL.Setup;
using DAL.DbContexts;
using DAL.Extensions;
using DAL.Repository.Implementations;
using DAL.Repository.Interfaces;
using DAL.Repository.Setup;
using DAL.Repository.UoF.Implementations;
using DAL.Repository.UoF.Interfaces;
using El.Shared;
using EL.Models.User;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Scalar.AspNetCore;
using System.Text;
using ToDoApp.Infrastructure.Setup;

// Middleware - komponenta kroz koju prolazi svaki HTTP zahtev (i odgovor)
// Middleware je komponenta koja ucestvuje u obradi HTTP zahteva i odgovora
// Svi zahtevi u middlware lancu prolaze kroz pipeline (lanac middleware-a)

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// Registruje EF DbContext
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString)
        .EnableSensitiveDataLogging();
});

// Konfiguracija Identity sistema
builder.Services.AddIdentitySetup();

//Konfiguracija Data Access Layera (Repository Pattern)
builder.Services.AddDataAccess(builder.Configuration);

// Konfiguracija Business Logic
builder.Services.AddBusinessLogic();
builder.Services.AddScoped<IAuthService, AuthService>();

// Registracija background servisa za automatsko azuriranje statusa taska
builder.Services.AddHostedService<OverdueTaskBackgroundService>();

// Eksterni servisi Cloudinary
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));
builder.Services.AddSingleton<ICloudinaryService, CloudinaryService>(); // Singleton - jedna instanca servisa za ceo lifecycle aplikacije
builder.Services.AddSingleton<IEmailService, EmailService>();

// JWT konfiguracija
// Mora biti pre UseAuthorization jer je bitno znati ko je korisnik pre nego sto se provere prava pristupa
// Konfigurise Autentifikaciju i autorizaciju za celu aplikaciju
builder.Services.AddJwtAuthentication(builder.Configuration);

builder.Services.AddCorsSetup();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddSwaggerSetup();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        // Opcionalno: primeni sve migracije automatski
        var db = services.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();

        // Pozovi runtime seeder (kreira role, korisnike i pocetne taskove)
        await services.EnsureSeedDataAsync();
    }
    catch (Exception ex)
    {
        
        Console.WriteLine("Greska pri pokretanju seed-a: " + ex.Message);
        throw;
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "ToDo API v1");
    });

    // Scalar koristi istu OpenAPI specifikaciju
    app.MapScalarApiReference(options =>
    {
        options
            .WithTitle("ToDo API Reference")
            .WithOpenApiRoutePattern("/swagger/v1/swagger.json");
    });
}

app.UseHttpsRedirection();

app.UseCors("AllowFrontend");

app.UseAuthentication(); // Middleware koji proverava identitet korisnika (ko je korisnik)

app.UseAuthorization();

app.MapControllers();

app.Run();
