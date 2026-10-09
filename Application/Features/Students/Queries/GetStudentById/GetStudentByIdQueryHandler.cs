

using Application.Common;
using Application.Features.Students.Responses;
using MediatR;

namespace Application.Features.Students.Queries.GetStudentById
{
    public class GetStudentByIdQueryHandler : IRequestHandler<GetStudentByIdQuery, StudentDetailsResponse>
    {
        public GetStudentByIdQueryHandler(IAppDbContext context)
        {
            _context = context;
        }

        private readonly IAppDbContext _context;

        public Task<StudentDetailsResponse> Handle(GetStudentByIdQuery request, CancellationToken cancellationToken)
        {
            var student = _context.Students.FirstOrDefault(x => x.Id == request.Id);
            if (student == null)
            {
                return Task.FromResult<StudentDetailsResponse>(null);
            }
            else
            {
                StudentDetailsResponse studentDetails = new StudentDetailsResponse
                {
                    StudentId = student.Id,
                    StudentStatus = student.StudentStatus,
                    StudentName = student.Name,
                    StudentBirthDate = student.BirthDate,
                    StudentBirthPlace = student.BirthPlace,
                    StudentAddress = student.Address,
                    StudentFatherJob = student.FatherJob,
                    StudentMotherJob = student.MotherJob,
                    StudentPhoneNumber = student.PhoneNumber,
                    StudentMotherPhone = student.MotherPhone,
                    StudentFatherPhone = student.FatherPhone,
                    StudentHomePhone = student.HomePhone,
                    StudentGrade9 = student.Grade9,
                    StudentGrade11 = student.Grade11,
                    ProfileImageUrl = student.ProfileImageUrl

                };
                return Task.FromResult(studentDetails);
            }
        }
    }
}
