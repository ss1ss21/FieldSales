using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly AppDbContext _context;

        public CustomerService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<CustomerResponseDto>> GetAllCustomersAsync()
        {
            return await _context.Customers
                .Include(c => c.Personnel)
                .Select(c => new CustomerResponseDto
                {
                    Id = c.Id,
                    DealerName = c.DealerName,
                    ContactName = c.ContactName,
                    Address = c.Address,
                    Latitude = c.Latitude,
                    Longitude = c.Longitude,
                    PersonnelId = c.PersonnelId,
                    Personnel = c.Personnel != null ? new PersonnelSummaryDto
                    {
                        Id = c.Personnel.Id,
                        FullName = c.Personnel.FullName,
                        Email = c.Personnel.Email
                    } : null,
                    PersonnelFullName = c.Personnel != null ? c.Personnel.FullName : null
                })
                .ToListAsync();
        }

        public async Task<CustomerResponseDto?> GetCustomerByIdAsync(int id)
        {
            var c = await _context.Customers
                .Include(c => c.Personnel)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (c == null) return null;

            return new CustomerResponseDto
            {
                Id = c.Id,
                DealerName = c.DealerName,
                ContactName = c.ContactName,
                Address = c.Address,
                Latitude = c.Latitude,
                Longitude = c.Longitude,
                PersonnelId = c.PersonnelId,
                Personnel = c.Personnel != null ? new PersonnelSummaryDto
                {
                    Id = c.Personnel.Id,
                    FullName = c.Personnel.FullName,
                    Email = c.Personnel.Email
                } : null,
                PersonnelFullName = c.Personnel != null ? c.Personnel.FullName : null
            };
        }

        public async Task<CustomerResponseDto> CreateCustomerAsync(CreateCustomerDto dto)
        {
            var customer = new Customer
            {
                DealerName = dto.DealerName,
                ContactName = dto.ContactName,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                PersonnelId = dto.PersonnelId
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return await GetCustomerByIdAsync(customer.Id) ?? new CustomerResponseDto 
            { 
                Id = customer.Id, 
                DealerName = customer.DealerName,
                ContactName = customer.ContactName,
                PersonnelId = customer.PersonnelId
            };
        }

        public async Task<bool> UpdateCustomerAsync(int id, UpdateCustomerDto dto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;

            customer.DealerName = dto.DealerName;
            customer.ContactName = dto.ContactName;
            customer.Address = dto.Address;
            customer.Latitude = dto.Latitude;
            customer.Longitude = dto.Longitude;
            customer.PersonnelId = dto.PersonnelId;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteCustomerAsync(int id)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null) return false;

            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}