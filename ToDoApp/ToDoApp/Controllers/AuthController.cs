using BLL.Services.Interfaces;
using El.DTOs.LoginDTO;
using El.DTOs.PasswordAuthDTO;
using EL.Models.DTOs.Register;
using EL.Models.DTOs.UserDTO;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ToDoApp.Models.Dto.PasswordAuthDTO;

namespace ToDoApp.Controllers
{
    [Route("api/auth")] // Svi endpointi u ovom kontroleru pocinju s ovim
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromForm] RegisterRequestDTO register)
        {
            var result = await _authService.RegisterAsync(register);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDTO login)
        {
            var result = await _authService.LoginAsync(login);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("allUsers")]
        public async Task<IActionResult> GetAllUsers()
        {
            var response = await _authService.GetAllUsersAsync();
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("{id}", Name = "GetUserDetails")]
        public async Task<IActionResult> GetUserDetails(string id)
        {
            var result = await _authService.GetUserDetailsAsync(id);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateUserDetails(string id, [FromForm] UserDetailsUpdateDTO userDetailsUpdateDTO)
        {
            var result = await _authService.UpdateUserDetailsAsync(id, userDetailsUpdateDTO);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> Me()
        {
            var userId = User?.FindFirst("id")?.Value;
            var result = await _authService.MeAsync(userId);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("verify-password")]
        public async Task<IActionResult> VerifyPassword([FromBody] VerifyPasswordDTO verifyPasswordDTO)
        {
            var result = await _authService.VerifyPasswordAsync(verifyPasswordDTO);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] string refreshToken)
        {
            var result = await _authService.RefreshTokenAsync(refreshToken);
            if (!result.IsSuccess) return Unauthorized(result);
            return Ok(result);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDTO)
        {
            var result = await _authService.ForgotPasswordAsync(forgotPasswordDTO);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDTO resetPasswordDTO)
        {
            var result = await _authService.ResetPasswordAsync(resetPasswordDTO);
            if (!result.IsSuccess) return BadRequest(result);
            return Ok(result);
        }
    }
}
