using EL.Models.Messages;
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
        public DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // 🔹 Onemogući kaskadno brisanje za bar jednu FK relaciju (najčešće za obe)
            builder.Entity<Message>()
                .HasOne(m => m.Sender)
                .WithMany()
                .HasForeignKey(m => m.SenderId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Message>()
                .HasOne(m => m.Receiver)
                .WithMany()
                .HasForeignKey(m => m.ReceiverId)
                .OnDelete(DeleteBehavior.Restrict);
        }

    }
}
