using DAL.DataSeeding;
using EL.Models.Task;
using EL.Models.User;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace DAL.DbContexts
{
    // Glavna klasa koja omogucava komunikaciju sa bazom podataka
    // DbSet property predstavlja tabelu u bazi
    // DbContext je sesija sa b.p. (posrednik izmedju C# objekata i baze podataka)

    // Nasledjujem IdentityDbContext jer koristim ASP.NET Core Identity za upravljanje korisnicima
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
            
        }

        public DbSet<ApplicationUser> ApplicationUsers { get; set; } // Odgovara tabeli ApplicationUsers u bazi
        public DbSet<ToDoTask> ToDoTasks { get; set; }


        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            ApplicationDbContextSeed.Seed(builder);
        }
    }
}
