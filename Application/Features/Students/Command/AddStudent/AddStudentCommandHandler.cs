using Application.Common;
using Application.Features.Students.Command.AddStudent;
using Application.Features.Students.Responses;
using Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Identity;
using PrivatSchoolsAPI.Domain.Entities;

namespace Application.Features.Students.Command
{
    public class AddStudentCommandHandler(IAppDbContext context, ICurrentUser user)
        : IRequestHandler<AddStudentCommand, StudentDetailsResponse>
    {
        public async Task<StudentDetailsResponse> Handle(
            AddStudentCommand request,
            CancellationToken cancellationToken
        )
        {
            
            Student student = new()
            {
                Id = Guid.CreateVersion7(),
                Name = request.StudentName,
                ApplicationUserId = user.UserId,
                StudentStatus = StudentStatus.Pending,
                BirthDate = request.StudentBirthDate,
                BirthPlace = request.StudentBirthPlace,
                Address = request.StudentAddress,
                FatherJob = request.StudentFatherJob,
                MotherJob = request.StudentMotherJob,
                PhoneNumber = request.StudentPhoneNumber,
                MotherPhone = request.StudentMotherPhone,
                FatherPhone = request.StudentFatherPhone,
                HomePhone = request.StudentHomePhone,
                Grade9 = request.StudentGrade9,
                Grade11 = request.StudentGrade11,
                ProfileImageUrl = request.ProfileImageUrl,
            };

            await context.Students.AddAsync(student);
            await context.SaveChangesAsync(cancellationToken);

            return new StudentDetailsResponse
            {
                StudentId = student.Id,
                StudentName = student.Name,
                StudentBirthPlace = student.BirthPlace,
                StudentBirthDate = student.BirthDate,
                StudentAddress = student.Address,
                StudentFatherJob = student.FatherJob,
                StudentMotherJob = student.MotherJob,
                StudentPhoneNumber = student.PhoneNumber,
                StudentMotherPhone = student.MotherPhone,
                StudentFatherPhone = student.FatherPhone,
                StudentHomePhone = student.HomePhone,
                StudentGrade9 = student.Grade9,
                StudentGrade11 = student.Grade11,
                ProfileImageUrl = student.ProfileImageUrl,
            };
        }
    }
}
