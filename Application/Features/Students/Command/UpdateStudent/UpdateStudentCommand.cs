using Domain.Enums;
using MediatR;

namespace Application.Features.Students.Command.UpdateStudent
{
    public record UpdateStudentCommand(Guid Id,
    string StudentName,
    StudentStatus? StudentStatus,
    string StudentBirthPlace,
    DateTime StudentBirthDate,
    string? StudentAddress,
    string? StudentFatherJob,
    string? StudentMotherJob,
    string? StudentPhoneNumber,
    string? StudentMotherPhone,
    string? StudentFatherPhone,
    string? StudentHomePhone,
    string? StudentGrade9,
    string? StudentGrade11,
    string? ProfileImageUrl) : IRequest<bool>
    {

    }
}
