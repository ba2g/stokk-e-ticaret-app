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

    // Update User details (Ad, Soyad, E-posta, Telefon, Şirket, Rol, opsiyonel Şifre)
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] Stokk.Api.Models.DTOs.UpdateUserRequest req)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Kullanıcı bulunamadı." });

        // Email uniqueness check if changed
        if (!string.IsNullOrWhiteSpace(req.Email) && req.Email.Trim().ToLower() != user.Email.ToLower())
        {
            if (await _context.Users.AnyAsync(u => u.Id != id && u.Email.ToLower() == req.Email.Trim().ToLower()))
            {
                return BadRequest(new { message = "Bu e-posta adresi başka bir kullanıcı tarafından kullanılmaktadır." });
            }
            user.Email = req.Email.Trim();
        }

        user.FirstName = req.FirstName.Trim();
        user.LastName = req.LastName.Trim();
        user.Phone = req.Phone?.Trim() ?? user.Phone;
        if (!string.IsNullOrWhiteSpace(req.City)) user.City = req.City.Trim();
        if (!string.IsNullOrWhiteSpace(req.CompanyId)) user.CompanyId = req.CompanyId;
        if (!string.IsNullOrWhiteSpace(req.CompanyName)) user.CompanyName = req.CompanyName;
        if (!string.IsNullOrWhiteSpace(req.Role)) user.Role = req.Role;

        // If password is updated, hash it cryptographically
        if (!string.IsNullOrWhiteSpace(req.Password))
        {
            user.PasswordHash = AuthController.HashPassword(req.Password.Trim());
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Kullanıcı bilgileri başarıyla güncellendi.", user });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        if (id == "cust-1")
        {
            return BadRequest(new { message = "Sistem yöneticisi (Batu Güdek) hesabı silinemez." });
        }

        var user = await _context.Users.FindAsync(id);
        if (user == null) return NotFound(new { message = "Kullanıcı bulunamadı." });

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return Ok(new { message = "Kullanıcı silindi." });
    }
}

