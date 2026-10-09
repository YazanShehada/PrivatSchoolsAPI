using Application.Common;
using Application.Features.Students.Queries.GetAllStudents;
using Application.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;
using PrivatSchoolsAPI.Domain.Entities;

namespace Application.Features.Students.Handelers.GetAllStudents
{
    public class GetAllStudentsQueryHandler : IRequestHandler<GetAllStudentsQuery, List<Student>>
    {

        public GetAllStudentsQueryHandler(IAppDbContext context , IRedisCacheService cache)
        {
            _context = context;
            _cache = cache;
        }

        private readonly IAppDbContext _context;

        private readonly IRedisCacheService _cache;
        public async Task<List<Student>> Handle(GetAllStudentsQuery request, CancellationToken cancellationToken)
        {
            var cacheKey = "all_students";

            return await _cache.GetOrSetAsync(cacheKey, async () =>
            {
                return await _context.Students.ToListAsync(cancellationToken);
            }, TimeSpan.FromMinutes(1));
            //return await _context.Students.ToListAsync(cancellationToken);
        }
    }
}
