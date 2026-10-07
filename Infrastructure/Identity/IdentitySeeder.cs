using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Identity;
using PrivatSchoolsAPI.Infrastructure.Identity;

namespace Infrastructure.Identity
{
    public static class IdentitySeeder
    {
        public static async Task SeedRolesAsync(
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager
        )
        {
            string[] roles = ["Admin", "User"];

            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
            const string adminEmail = "admin@privateschools.com";
            const string adminPassword = "Admin123!";

            var admin = await userManager.FindByEmailAsync(adminEmail);

            if (admin is null)
            {
                admin = new ApplicationUser
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    FullName = "System Admin",
                    IsActive = true,
                };

                var result = await userManager.CreateAsync(admin, adminPassword);

                if (!result.Succeeded)
                {
                    throw new Exception(
                        string.Join(", ", result.Errors.Select(x => x.Description))
                    );
                }
            }

            
            if (!await userManager.IsInRoleAsync(admin, "Admin"))
            {
                await userManager.AddToRoleAsync(admin, "Admin");
            }
        }
    }
}
