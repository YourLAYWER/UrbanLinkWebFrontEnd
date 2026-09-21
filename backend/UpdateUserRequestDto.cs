using System.ComponentModel.DataAnnotations;
using UrbanLink_CRUD.Models.Enums;

namespace UrbanLink_CRUD.Models.Dtos.Users
{
    // Only the fields an admin may change. Email and password are deliberately absent.
    public class UpdateUserRequestDto
    {
        [Required]
        [StringLength(100, MinimumLength = 1)]
        public string Name { get; set; } = string.Empty;

        // Rejects numbers that aren't a defined Role value
        [EnumDataType(typeof(Role))]
        public Role Role { get; set; }
    }
}
