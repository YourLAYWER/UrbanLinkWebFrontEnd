using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using UrbanLink_CRUD.Models.Data;
using UrbanLink_CRUD.Models.Dtos.Users;
using UrbanLink_CRUD.Models.Enums;

namespace UrbanLink_CRUD.Controllers.Users
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly ULDBContext _context;

        public UserController(ULDBContext context)
        {
            _context = context;
        }

        // Id of the signed-in user, read from the JWT
        private int? CurrentUserId()
        {
            var value = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(value, out var id) ? id : null;
        }

        // GET: api/user
        // Password is deliberately excluded from every response below.
        // Admin only: this exposes every user's name and email.
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            return await _context.Users
                .Select(u => new { u.Id, u.Name, u.Email, u.Role, u.CreatedAt })
                .ToListAsync();
        }

        // GET: api/user/me
        // Gets the specific user details through the jwt credentials
        // (unchanged, still available to any signed-in user, e.g. the Android app)
        [HttpGet("me")]
        [Authorize]
        public IActionResult GetUserProfile()
        {
            // 1. Extract the User ID securely from the JWT token
            var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdString == null) return Unauthorized();

            int userId = int.Parse(userIdString);

            // 2. Fetch the user from the database
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            if (user == null) return NotFound(new { message = "User not found" });

            // 3. Return the profile data
            return Ok(new
            {
                Name = user.Name,
                email = user.Email,
                commuterProfile = user.Role.ToString(),
            });
        }

        // GET: api/user/5
        [HttpGet("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = $"User with ID {id} not found." });

            return new { user.Id, user.Name, user.Email, user.Role, user.CreatedAt };
        }

        // PUT: api/user/5
        // Updates name and role only. Email and password go through Auth-specific flows.
        [HttpPut("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserRequestDto request)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = $"User with ID {id} not found." });

            // Guard: never let the system end up with no admin
            var demotingAdmin = user.Role == Role.Admin && request.Role != Role.Admin;
            if (demotingAdmin)
            {
                if (id == CurrentUserId())
                    return BadRequest(new { message = "You can't remove your own admin role." });

                if (await IsLastAdminAsync())
                    return BadRequest(new { message = "You can't remove the last admin." });
            }

            user.Name = request.Name.Trim();
            user.Role = request.Role;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/user/5
        [HttpDelete("{id:int}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = $"User with ID {id} not found." });

            if (id == CurrentUserId())
                return BadRequest(new { message = "You can't delete your own account." });

            if (user.Role == Role.Admin && await IsLastAdminAsync())
                return BadRequest(new { message = "You can't delete the last admin." });

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            return NoContent();
        }

        private async Task<bool> IsLastAdminAsync()
        {
            return await _context.Users.CountAsync(u => u.Role == Role.Admin) <= 1;
        }
    }
}
