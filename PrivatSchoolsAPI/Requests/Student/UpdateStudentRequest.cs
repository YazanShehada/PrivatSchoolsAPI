using Domain.Enums;

namespace PrivatSchoolsAPI.API.Requests.Student
{
    public class UpdateStudentRequest
    {
        public string StudentName { get; set; }
        public StudentStatus StudentStatus { get; set; }
        public string StudentBirthPlace { get; set; }
        public DateTime StudentBirthDate { get; set; }
        public string? StudentAddress { get; set; }
        public string? StudentFatherJob { get; set; }
        public string? StudentMotherJob { get; set; }
        public string? StudentPhoneNumber { get; set; }
        public string? StudentMotherPhone { get; set; }
        public string? StudentFatherPhone { get; set; }
        public string? StudentHomePhone { get; set; }
        public string? StudentGrade9 { get; set; }
        public string? StudentGrade11 { get; set; }
        //public byte[]? StudentProfilePicture { get; set; }
        public IFormFile? StudentImage { get; set; }

        public string? profileImageUrl { get; set; }
    }



}
