using Application.Common;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using PrivatSchoolsAPI.Domain.Entities;
using PrivatSchoolsAPI.Infrastructure.Identity;

namespace PrivatSchoolsAPI.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext<ApplicationUser>, IAppDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options) { }

        public DbSet<Student> Students => Set<Student>();
        public DbSet<Payment> Payments => Set<Payment>();
        public DbSet<Absences> Absences => Set<Absences>();
        public DbSet<TestResult> TestResults => Set<TestResult>();

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder
                .Entity<ApplicationUser>()
                .HasMany<Student>()
                .WithOne()
                .HasForeignKey(x => x.ApplicationUserId)
                .IsRequired()
                .OnDelete(DeleteBehavior.Restrict);


        }
    }
}