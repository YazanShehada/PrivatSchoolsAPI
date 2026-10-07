using Microsoft.AspNetCore.Identity;
using PrivatSchoolsAPI.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PrivatSchoolsAPI.Infrastructure.Identity
{
    public class ApplicationUser : IdentityUser
    {
        public string FullName { get; set; }

        public bool IsActive { get; set; } = true;

    }
    
}
