using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stokk.Api.Data;

namespace Stokk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DbInspectorController : ControllerBase
{
    private readonly StokkDbContext _context;
    private readonly IConfiguration _config;

    public DbInspectorController(StokkDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    [HttpGet("snapshot")]
    public async Task<IActionResult> GetSnapshot()
    {
        var provider = _config.GetValue<string>("DatabaseProvider") ?? "Sqlite";

        var users = await _context.Users.ToListAsync();
        var orders = await _context.Orders.Include(o => o.Items).ToListAsync();
        var products = await _context.Products.ToListAsync();
        var companies = await _context.Companies.Include(c => c.Employees).ToListAsync();
        var campaigns = await _context.Campaigns.ToListAsync();
        var carts = await _context.CartItems.ToListAsync();
        var stockLogs = await _context.StockLogs.ToListAsync();

        var stats = new
        {
            DatabaseProvider = provider,
            ConnectedDatabase = _context.Database.ProviderName,
            TotalUsers = users.Count,
            TotalOrders = orders.Count,
            TotalProducts = products.Count,
            TotalCompanies = companies.Count,
            TotalCartItems = carts.Count,
            TotalStockLogs = stockLogs.Count,
            ServerTimeUtc = DateTime.UtcNow
        };

        return Ok(new
        {
            Stats = stats,
            Data = new
            {
                Users = users,
                Orders = orders,
                Products = products,
                Companies = companies,
                Campaigns = campaigns,
                CartItems = carts,
                StockLogs = stockLogs
            }
        });
    }
}
