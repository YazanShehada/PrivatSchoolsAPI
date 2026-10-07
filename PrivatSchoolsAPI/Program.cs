
using Application.Behaviors;
using Application.Common;
using Application.Services;
using FluentValidation;
using Infrastructure.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PrivatSchoolsAPI.Infrastructure.Data;
using PrivatSchoolsAPI.Infrastructure.Identity;
using System.Reflection;
using Microsoft.AspNetCore.Identity.UI;
using Scalar.AspNetCore;
using Microsoft.AspNetCore.Identity;
using Infrastructure.Identity;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddDbContext<AppDbContext>(x => x.UseSqlServer
(builder.Configuration.GetConnectionString("MyConnection")));

builder.Services.AddDefaultIdentity<ApplicationUser>().AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddRazorPages();

builder.Services.AddScoped<IAppDbContext>(provider =>
    provider.GetRequiredService<AppDbContext>());

builder.Services.AddScoped<ICurrentUser, CurrentUser>();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(Application.AssemblyMarker).Assembly));

builder.Services.AddValidatorsFromAssembly((typeof(Application.AssemblyMarker).Assembly));

builder.Services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));

builder.Services.AddControllersWithViews();

builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("RedisConStr");
    options.InstanceName = "Redis_";

});

builder.Services.AddScoped<IRedisCacheService, RedisCacheService>();

builder.Services.AddOpenApi();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider
        .GetRequiredService<RoleManager<IdentityRole>>();
    var userManager = scope.ServiceProvider
        .GetRequiredService<UserManager<ApplicationUser>>();

    await IdentitySeeder.SeedRolesAsync(roleManager, userManager);
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();

    // 4. Map the interactive Scalar documentation UI
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

app.UseStaticFiles();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

// Map Razor Pages so Identity UI endpoints are reachable (e.g. /Identity/Account/Login)
app.MapRazorPages();

app.Run();
