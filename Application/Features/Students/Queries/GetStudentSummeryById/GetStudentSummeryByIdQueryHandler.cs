using Application.Common;
using Application.Features.Students.Responses;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Application.Features.Students.Queries.GetStudentSummeryById
{
    public class GetStudentSummeryByIdQueryHandler(IAppDbContext context) : IRequestHandler<GetStudentSummeryByIdQuery, StudentSummeryResponse>
    {

        public async Task<StudentSummeryResponse> Handle(GetStudentSummeryByIdQuery request, CancellationToken cancellationToken)
        {
            var student = await context.Students.FindAsync(request.Id);
            if (student == null)
            {
                return null;
            }
            var response = new StudentSummeryResponse
            {
                Name = student.Name,
                StudentStatus = student.StudentStatus,
                age = CalculateAge(student.BirthDate),
                ProfileImageUrl = student.ProfileImageUrl
            };
            return response;
        }
        private int CalculateAge(DateTime birthDate)
        {
            var today = DateTime.Today;
            var age = today.Year - birthDate.Year;
            if (birthDate.Date > today.AddYears(-age)) age--;
            return age;
        }
    }
}
