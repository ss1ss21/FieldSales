using Microsoft.AspNetCore.Mvc;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CustomersController : ControllerBase
    {
        private readonly ICustomerService _customerService;

        public CustomersController(ICustomerService customerService)
        {
            _customerService = customerService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<CustomerResponseDto>>> GetCustomers()
        {
            var customers = await _customerService.GetAllCustomersAsync();
            return Ok(customers);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<CustomerResponseDto>> GetCustomer(int id)
        {
            var customer = await _customerService.GetCustomerByIdAsync(id);
            if (customer == null) return NotFound(new { message = "Müşteri bulunamadı." });
            return Ok(customer);
        }

        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<CustomerResponseDto>> CreateCustomer([FromBody] CreateCustomerDto dto)
        {
            var createdCustomer = await _customerService.CreateCustomerAsync(dto);
            return CreatedAtAction(nameof(GetCustomer), new { id = createdCustomer.Id }, createdCustomer);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")] // Sadece Admin müşteri güncelleyebilir
        public async Task<IActionResult> UpdateCustomer(int id, [FromBody] UpdateCustomerDto dto)
        {
            var success = await _customerService.UpdateCustomerAsync(id, dto);
            if (!success) return NotFound(new { message = "Güncellenecek müşteri bulunamadı." });
            return Ok(new { message = "Müşteri başarıyla güncellendi." });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")] // Sadece Admin müşteri silebilir
        public async Task<IActionResult> DeleteCustomer(int id)
        {
            var success = await _customerService.DeleteCustomerAsync(id);
            if (!success) return NotFound(new { message = "Silinecek müşteri bulunamadı." });
            return Ok(new { message = "Müşteri başarıyla silindi." });
        }
    }
}