using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Api.Data;
using Stokk.Api.Models.DTOs;
using Stokk.Api.Models.Entities;

namespace Stokk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly StokkDbContext _context;

    public AuthController(StokkDbContext context)
    {
        _context = context;
    }

    [HttpGet("companies")]
    public async Task<IActionResult> GetCompanies()
    {
        var companies = await _context.Companies
            .Select(c => new
            {
                c.Id,
                c.Name,
                c.TaxNumber,
                c.City,
                EmployeeCount = c.Employees.Count
            })
            .ToListAsync();
        return Ok(companies);
    }

    // Admin login: Strictly requires batu güdek credentials
    [HttpPost("admin-login")]
    public async Task<IActionResult> AdminLogin([FromBody] LoginRequest req)
    {
        var username = req.Username.Trim().ToLowerInvariant();
        var adminUser = await _context.Users.FirstOrDefaultAsync(u =>
            (u.Username.ToLower() == username || u.Email.ToLower() == username) && u.Role == "Admin");

        if (adminUser == null)
        {
            return Unauthorized(new AuthResponse(false, "Yönetici yetkisine sahip kullanıcı bulunamadı!"));
        }

        if (adminUser.PasswordHash != req.Password)
        {
            return Unauthorized(new AuthResponse(false, "Yönetici şifresi hatalı!"));
        }

        return Ok(new AuthResponse(
            true,
            "Yönetici girişi başarılı. Hoş geldiniz Batu Güdek.",
            adminUser.Id,
            adminUser.Username,
            $"{adminUser.FirstName} {adminUser.LastName}",
            adminUser.Role,
            adminUser.CompanyId,
            adminUser.CompanyName
        ));
    }

    // Customer login: strictly checks credentials against database
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var username = req.Username.Trim().ToLowerInvariant();
        var user = await _context.Users.FirstOrDefaultAsync(u =>
            u.Username.ToLower() == username || u.Email.ToLower() == username);

        if (user == null)
        {
            return NotFound(new AuthResponse(false, "Kullanıcı adı veya e-posta bulunamadı!"));
        }

        if (user.PasswordHash != req.Password)
        {
            return Unauthorized(new AuthResponse(false, "Girdiğiniz şifre hatalı!"));
        }

        return Ok(new AuthResponse(
            true,
            "Giriş başarılı.",
            user.Id,
            user.Username,
            $"{user.FirstName} {user.LastName}",
            user.Role,
            user.CompanyId,
            user.CompanyName
        ));
    }

    // Customer register: 1-N Company Rule enforcement
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        var username = req.Username.Trim().ToLowerInvariant();
        if (await _context.Users.AnyAsync(u => u.Username.ToLower() == username || u.Email.ToLower() == req.Email.ToLower()))
        {
            return BadRequest(new AuthResponse(false, "Bu kullanıcı adı veya e-posta zaten kullanımda!"));
        }

        string companyId = string.Empty;
        string companyName = string.Empty;

        if (req.CompanyMode == "new")
        {
            if (string.IsNullOrWhiteSpace(req.NewCompanyName) || string.IsNullOrWhiteSpace(req.NewCompanyTaxNumber))
            {
                return BadRequest(new AuthResponse(false, "Yeni şirket adı ve vergi numarası zorunludur."));
            }

            companyId = $"COMP-{DateTime.UtcNow.Ticks.ToString()[^4..]}";
            companyName = req.NewCompanyName.Trim();

            var newCompany = new Company
            {
                Id = companyId,
                Name = companyName,
                TaxNumber = req.NewCompanyTaxNumber.Trim(),
                City = req.City,
                Address = $"{req.City} Merkez",
                Phone = req.Phone,
                Email = req.Email
            };
            await _context.Companies.AddAsync(newCompany);
        }
        else
        {
            if (string.IsNullOrWhiteSpace(req.ExistingCompanyId))
            {
                return BadRequest(new AuthResponse(false, "Lütfen bağlı olduğunuz şirketi seçiniz."));
            }

            var existingCompany = await _context.Companies.FindAsync(req.ExistingCompanyId);
            if (existingCompany == null)
            {
                return NotFound(new AuthResponse(false, "Seçilen şirket sistemde bulunamadı."));
            }

            companyId = existingCompany.Id;
            companyName = existingCompany.Name;
        }

        var newUser = new User
        {
            Id = $"cust-{DateTime.UtcNow.Ticks.ToString()[^5..]}",
            Username = req.Username.Trim(),
            PasswordHash = req.Password,
            FirstName = req.FirstName.Trim(),
            LastName = req.LastName.Trim(),
            Role = "Customer",
            CompanyId = companyId,
            CompanyName = companyName,
            Email = req.Email.Trim(),
            Phone = req.Phone.Trim(),
            City = req.City.Trim()
        };

        await _context.Users.AddAsync(newUser);
        await _context.SaveChangesAsync();

        return Ok(new AuthResponse(
            true,
            "Kayıt başarıyla tamamlandı. Şirket bağlantınız oluşturuldu.",
            newUser.Id,
            newUser.Username,
            $"{newUser.FirstName} {newUser.LastName}",
            newUser.Role,
            newUser.CompanyId,
            newUser.CompanyName
        ));
    }
}
