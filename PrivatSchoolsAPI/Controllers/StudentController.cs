using Application.Features.Students.Command.AddStudent;
using Application.Features.Students.Command.DeleteStudent;
using Application.Features.Students.Command.UpdateStudent;
using Application.Features.Students.Queries.GetAllStudents;
using Application.Features.Students.Queries.GetStudentById;
using Application.Features.Students.Queries.GetStudentSummeryById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PrivatSchoolsAPI.API.Requests.Student;


namespace PrivatSchoolsAPI.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class StudentController : Controller
    {
        public StudentController(IMediator mediator)
        {

            _mediator = mediator;

        }

        private readonly IMediator _mediator;

        /// <summary>
        /// Get all students from the system
        /// </summary>
        /// <returns>A list of all students</returns>
        [HttpGet]
        public async Task<IActionResult> GetAllStudents()
        {
            //var students = await _repo.GetAll().ToListAsync();
            //return Ok(students);
            var result = await _mediator.Send(new GetAllStudentsQuery());


            return Ok(result);
        }

        [HttpGet("Summery/{id}")]

        public async Task<IActionResult> GetStudentSummeryById(Guid id)
        {
            var result = await _mediator.Send(new GetStudentSummeryByIdQuery(id));
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Get student by ID
        /// </summary>
        /// <param name="id">Student unique identifier</param>
        /// <returns>Student details</returns>
        /// <response code="200">Student found</response>
        /// <response code="404">Student not found</response>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetStudentById(Guid id)
        {
            var result = await _mediator.Send(new GetStudentByIdQuery(id));
            if (result == null)
                return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// صفحة إضافة طالب جديد
        /// </summary>
        [Authorize]
        [HttpGet("~/Home/Student/Add")]
        public IActionResult AddStudent()
        {
            return View();
        }

        /// <summary>
        /// Create a new student
        /// </summary>
        /// <param name="student">Student creation data</param>
        /// <returns>Created student</returns>
        /// <response code="200">Student created successfully</response>
        /// <response code="400">Invalid input</response>
        [HttpPost]
        public async Task<IActionResult> AddStudent([FromForm] AddStudentRequest student)
        {

            string ProfileImageUrl = null;

            if (student.StudentImage != null)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var fileName = Guid.NewGuid() + Path.GetExtension(student.StudentImage.FileName);
                var fullPath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await student.StudentImage.CopyToAsync(stream);
                }

                ProfileImageUrl = "/images/" + fileName;
            }
            var command = new AddStudentCommand(

                student.StudentName,
                student.StudentBirthPlace,
                student.StudentBirthDate,
                student.StudentAddress,
                student.StudentFatherJob,
                student.StudentMotherJob,
                student.StudentPhoneNumber,
                student.StudentMotherPhone,
                student.StudentFatherPhone,
                student.StudentHomePhone,
                student.StudentGrade9,
                student.StudentGrade11,
                ProfileImageUrl
                );


            var results = await _mediator.Send(command);
            return Ok(results);

        }

        /// <summary>
        /// Delete a student by ID
        /// </summary>
        /// <param name="id">Student ID</param>
        /// <response code="200">Student removed successfully</response>
        /// <response code="404">Student not found</response>
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteStudent(Guid id)
        {

            var result = await _mediator.Send(new DeleteStudentCommand(id));
            if (!result)
                return NotFound();
            return Ok("removed"); // 200
        }

        /// <summary>
        /// Update student information
        /// </summary>
        /// <param name="id">Student ID</param>
        /// <param name="student">Updated student data</param>
        /// <response code="200">Student updated successfully</response>
        /// <response code="404">Student not found</response>
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateStudent(Guid id, [FromForm] UpdateStudentRequest student)
        {
            string? profileImageUrl = student.profileImageUrl;

            if (student.StudentImage != null)
            {
                var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/images");

                if (!Directory.Exists(folderPath))
                    Directory.CreateDirectory(folderPath);

                var fileName = Guid.NewGuid() + Path.GetExtension(student.StudentImage.FileName);
                var fullPath = Path.Combine(folderPath, fileName);

                using (var stream = new FileStream(fullPath, FileMode.Create))
                {
                    await student.StudentImage.CopyToAsync(stream);

                }

                profileImageUrl = "/images/" + fileName;
            }
            var command = new UpdateStudentCommand(
                id,
                student.StudentName,
                student.StudentBirthPlace,
                student.StudentBirthDate,
                student.StudentAddress,
                student.StudentFatherJob,
                student.StudentMotherJob,
                student.StudentPhoneNumber,
                student.StudentMotherPhone,
                student.StudentFatherPhone,
                student.StudentHomePhone,
                student.StudentGrade9,
                student.StudentGrade11,
                profileImageUrl
);
            var result = await _mediator.Send(command);
            if (!result)
                return NotFound();
            return Ok("updated");
        }
    }
}
