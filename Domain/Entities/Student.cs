using Domain.Enums;

namespace PrivatSchoolsAPI.Domain.Entities
{
    public class Student
    {
        public Guid Id { get; set; }
        public string ApplicationUserId { get; set; } = null!;
        public  StudentStatus StudentStatus { get; set; } 
        public string Name { get; set; }
        public string BirthPlace { get; set; }
        public DateTime BirthDate { get; set; }
        public string? Address { get; set; }
        public string? FatherJob { get; set; }
        public string? MotherJob { get; set; }
        public string? PhoneNumber { get; set; }
        public string? MotherPhone { get; set; }
        public string? FatherPhone { get; set; }
        public string? HomePhone { get; set; }
        public string? Grade9 { get; set; }
        public string? Grade11 { get; set; }
        public string? ProfileImageUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public List<Payment>? Payments { get; set; } = new List<Payment>();
        public List<Absences>? Absences { get; set; } = new List<Absences>();
        public List<TestResult>? Tests { get; set; } = new List<TestResult>();
    }
}
