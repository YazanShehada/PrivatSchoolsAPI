using Application.Common;

using MediatR;

namespace Application.Features.Students.Command.UpdateStudent
{
    public class UpdateStudentHandler : IRequestHandler<UpdateStudentCommand, bool>
    {
        public UpdateStudentHandler(IAppDbContext context)
        {
            _context = context;
        }
        private readonly IAppDbContext _context;
        public async Task<bool> Handle(UpdateStudentCommand request, CancellationToken cancellationToken)
        {
            var student = _context.Students.Find(request.Id);
            if (student == null)
            {
                return false;
            }
            else
            {
                student.Name = request.StudentName ?? student.Name;
                student.StudentStatus = request.StudentStatus ?? student.StudentStatus;
                student.BirthPlace = request.StudentBirthPlace ?? student.BirthPlace;
                student.BirthDate = request.StudentBirthDate;
                student.Address = request.StudentAddress ?? student.Address;
                student.FatherJob = request.StudentFatherJob ?? student.FatherJob;
                student.MotherJob = request.StudentMotherJob ?? student.MotherJob;
                student.PhoneNumber = request.StudentPhoneNumber ?? student.PhoneNumber;
                student.MotherPhone = request.StudentMotherPhone ?? student.MotherPhone;
                student.FatherPhone = request.StudentFatherPhone ?? student.FatherPhone;
                student.HomePhone = request.StudentHomePhone ?? student.HomePhone;
                student.Grade9 = request.StudentGrade9 ?? student.Grade9;
                student.Grade11 = request.StudentGrade11 ?? student.Grade11;
                student.ProfileImageUrl = request.ProfileImageUrl ?? student.ProfileImageUrl;
                _context.Students.Update(student);
                await _context.SaveChangesAsync(cancellationToken);
                return true;
            }
        }
    }
}
