using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Erp.Api.Data;
using Stokk.Erp.Api.Models;

namespace Stokk.Erp.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CustomersController : ControllerBase
    {
        private readonly StokkDbContext _context;

        public CustomersController(StokkDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Tüm e-ticaret müşterilerini listeler (arama destekli)
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetCustomers([FromQuery] string? search)
        {
            var query = _context.Customers
                .Include(c => c.Orders)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                query = query.Where(c => 
                    c.FirstName.Contains(search) || 
                    c.LastName.Contains(search) || 
                    c.Email.Contains(search) || 
                    c.Username.Contains(search) ||
                    (c.Phone != null && c.Phone.Contains(search))
                );
            }

            var customers = await query.Select(c => new
            {
                c.CustomerId,
                c.FirstName,
                c.LastName,
                c.Email,
                c.Phone,
                c.Username,
                c.City,
                c.Address,
                c.Status,
                TotalOrders = c.Orders.Count,
                TotalSpent = c.Orders.Sum(o => o.TotalAmount),
                c.CreatedAt
            }).ToListAsync();

            return Ok(customers);
        }

        /// <summary>
        /// Tek bir müşterinin detayını getirir
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomerById(string id)
        {
            var customer = await _context.Customers
                .Include(c => c.Orders)
                .FirstOrDefaultAsync(c => c.CustomerId == id);

            if (customer == null) return NotFound(new { message = "Müşteri bulunamadı." });

            return Ok(customer);
        }

        /// <summary>
        /// Yeni E-Ticaret Müşterisi Kaydı (Register)
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterCustomerDto dto)
        {
            if (await _context.Customers.AnyAsync(c => c.Email == dto.Email))
            {
                return BadRequest(new { message = "Bu e-posta adresi ile kayıtlı bir müşteri zaten var." });
            }

            if (await _context.Customers.AnyAsync(c => c.Username == dto.Username))
            {
                return BadRequest(new { message = "Bu kullanıcı adı zaten alınmış." });
            }

            var customer = new Customer
            {
                CustomerId = "cust-" + Guid.NewGuid().ToString("N")[..8],
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Email = dto.Email.Trim().ToLower(),
                Phone = dto.Phone,
                Username = dto.Username.Trim().ToLower(),
                PasswordHash = dto.Password, // Gerçek üretimde BCrypt / PBKDF2 hashlenir
                City = dto.City,
                Address = dto.Address,
                Status = "Aktif",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCustomerById), new { id = customer.CustomerId }, new
            {
                customer.CustomerId,
                customer.FirstName,
                customer.LastName,
                customer.Email,
                customer.Username,
                customer.Phone
            });
        }

        /// <summary>
        /// Müşteri Giriş Doğrulaması (Kullanıcı Adı veya E-posta + Şifre)
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] CustomerLoginDto dto)
        {
            var identifier = dto.UsernameOrEmail.Trim().ToLower();

            var customer = await _context.Customers
                .FirstOrDefaultAsync(c => (c.Email.ToLower() == identifier || c.Username.ToLower() == identifier)
                                       && c.PasswordHash == dto.Password);

            if (customer == null)
            {
                return Unauthorized(new { message = "Kullanıcı adı / e-posta veya şifre hatalı." });
            }

            return Ok(new
            {
                customer.CustomerId,
                customer.FirstName,
                customer.LastName,
                customer.Email,
                customer.Username,
                customer.Phone,
                Role = "Müşteri"
            });
        }
    }

    public class RegisterCustomerDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Phone { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? City { get; set; }
        public string? Address { get; set; }
    }

    public class CustomerLoginDto
    {
        public string UsernameOrEmail { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
