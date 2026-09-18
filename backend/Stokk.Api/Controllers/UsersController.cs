using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Api.Data;
using Stokk.Api.Models.Entities;

namespace Stokk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly StokkDbContext _context;

    public UsersController(StokkDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _context.Users
            .Select(u => new
            {
                u.Id,
                u.Username,
                u.FirstName,
                u.LastName,
                u.Role,
                u.CompanyId,
                u.CompanyName,
                u.Email,
                u.Phone,
                u.City,
                u.CreatedAt,
                // Mask password hash for display
                PasswordMasked = "••••••••••••"
            })
            .ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Kullanıcı bulunamadı." });
        return Ok(user);
    }
}
