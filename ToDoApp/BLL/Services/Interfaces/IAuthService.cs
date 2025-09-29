using El.DTOs.LoginDTO;
using El.DTOs.PasswordAuthDTO;
using EL.Models.DTOs.Register;
using EL.Models.DTOs.UserDTO;
using EL.Shared;
using ToDoApp.Models.Dto.PasswordAuthDTO;

namespace BLL.Services.Interfaces
{
    public interface IAuthService
    {
        Task<ApiResponse> RegisterAsync(RegisterRequestDTO register);
        Task<ApiResponse> LoginAsync(LoginRequestDTO login);
        Task<ApiResponse> GetUserDetailsAsync(string id);
        Task<ApiResponse> LogoutAsync(string id);
        Task<ApiResponse> UpdateUserDetailsAsync(string id, UserDetailsUpdateDTO userDetailsUpdateDTO);
        Task<ApiResponse> MeAsync(string id);
        Task<ApiResponse> VerifyPasswordAsync(VerifyPasswordDTO verifyPasswordDTO);
        Task<ApiResponse> RefreshTokenAsync(string refreshToken);
        Task<ApiResponse> ForgotPasswordAsync(ForgotPasswordDTO forgotPasswordDTO);
        Task<ApiResponse> ResetPasswordAsync(ResetPasswordDTO resetPasswordDTO);
        Task<ApiResponse> GetAllUsersAsync();
    }
}
