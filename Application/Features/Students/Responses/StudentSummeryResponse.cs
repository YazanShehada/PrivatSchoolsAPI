using Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Students.Responses
{
    public class StudentSummeryResponse
    {
        public string Name { get; set; }
        public StudentStatus StudentStatus { get; set; }
        public int age { get; set; }
        public string? ProfileImageUrl { get; set; }

    }
}
