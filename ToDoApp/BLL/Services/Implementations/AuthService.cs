using Azure;
using BLL.Services.Interfaces;
using DAL.DbContexts;
using El.DTOs.LoginDTO;
using El.DTOs.PasswordAuthDTO;
using EL.Models.DTOs.Register;
using EL.Models.DTOs.UserDTO;
using EL.Models.User;
using EL.Shared;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using ToDoApp.Models.Dto.PasswordAuthDTO;

namespace BLL.Services.Implementations
{
    public class AuthService : IAuthService
    {
        private readonly ApplicationDbContext _db;
        private ApiResponse _response;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ICloudinaryService _cloudinaryService;
        private readonly IEmailService _emailService;
        private readonly string _secretKey;
        private readonly string _frontendURL;

        public AuthService(ApplicationDbContext db, IConfiguration configuration, 
            UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager,
            ICloudinaryService cloudinaryService, IEmailService emailService)
        {
            _db = db;
            _response = new ApiResponse();
            _userManager = userManager;
            _roleManager = roleManager;
            _cloudinaryService = cloudinaryService;
            _emailService = emailService;
            _secretKey = configuration.GetValue<string>("ApiSettings:Secret");

            _frontendURL = configuration.GetValue<string>("FrontendSettings:Url");
        }

        public async Task<ApiResponse> RegisterAsync(RegisterRequestDTO register)
        {
            // Proveravam da li je prosledjen fajl (slika u zahtevu)
            if (register.File == null || register.File.Length == 0)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Fajl nije prosleđen!");
                return _response;
            }

            // Upload slike na Cloudinary i dobijanje URL-a
            string imageUrl = await _cloudinaryService.UploadImageAsync(register.File);
            if (string.IsNullOrEmpty(imageUrl))
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Neuspešan upload slike!");
                return _response;
            }

            // Proveravam da li korisnicko ime vec postoji u bazi
            ApplicationUser? userFromDb = _db.ApplicationUsers
                .FirstOrDefault(u => u.UserName.ToLower() == register.UserName.ToLower());

            if (userFromDb != null)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnicko ime vec postoji!");
                return _response;
            }

            // Kreiram novog korisnika
            ApplicationUser newUser = new()
            {
                UserName = register.UserName,
                Email = register.UserName,
                NormalizedEmail = register.UserName.ToUpper(),
                Name = register.Name,
                Image = imageUrl,
                PhoneNumber = register.PhoneNumber,
                RefreshToken = null,

                CompletedTasksCount = 0,
                PendingTasksCount = 0,
                OverdueTasksCount = 0
            };

            try
            {
                // Kreiram korisnika u bazi koristeci UserManager iz Identity (koji automatski hash-uje sifru)
                var result = await _userManager.CreateAsync(newUser, register.Password);

                if (result.Succeeded)
                {
                    // Proveravam da li role vec postoje, ako ne kreiram ih
                    if (!await _roleManager.RoleExistsAsync(SD.Role_Admin))
                    {
                        await _roleManager.CreateAsync(new IdentityRole(SD.Role_Admin));
                        await _roleManager.CreateAsync(new IdentityRole(SD.Role_Customer));
                    }

                    // Dodeljujem rolu korisniku (Admin ili Customer) (na osnovu unosa iz zahteva)
                    if (register.Role.ToLower() == SD.Role_Admin.ToLower())
                    {
                        await _userManager.AddToRoleAsync(newUser, SD.Role_Admin);
                    }
                    else
                    {
                        await _userManager.AddToRoleAsync(newUser, SD.Role_Customer);
                    }

                    _response.StatusCode = HttpStatusCode.OK;
                    _response.IsSuccess = true;
                    _response.Result = newUser;
                    return _response;
                }
                else
                {
                    // Ako kreiranje korisnika nije uspelo, vracam greske
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.AddRange(result.Errors.Select(e => e.Description));
                    return _response;
                }
            }
            catch (Exception ex)
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Došlo je do greške prilikom registracije: " + ex.Message);
                return _response;
            }
        }

        private string GenerateRefreshToken()
        {
            var randomBytes = new byte[64];
            using (var rng = System.Security.Cryptography.RandomNumberGenerator.Create())
            {
                rng.GetBytes(randomBytes);
                return Convert.ToBase64String(randomBytes);
            }
        }

        public async Task<ApiResponse> LoginAsync(LoginRequestDTO login)
        {
            try
            {
                // Validacija input parametara
                if (login == null || string.IsNullOrWhiteSpace(login.UserName) || string.IsNullOrWhiteSpace(login.Password))
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.Add("Korisničko ime i šifra su obavezni!");
                    return _response;
                }

                // Provera da li korisnik postoji u bazi
                ApplicationUser? userFromDb = _db.ApplicationUsers
                    .FirstOrDefault(u => u.UserName.ToLower() == login.UserName.ToLower());

                if (userFromDb == null)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.Add("Korisničko ime ili šifra su netačni!");
                    return _response;
                }

                // Provera da li je sifra tacna (koristim UserManager iz Identity)
                bool isValid = await _userManager.CheckPasswordAsync(userFromDb, login.Password); //Identity proverava hash sifre
                if (!isValid)
                {
                    _response.Result = new LoginResponseDTO();
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.Add("Korisničko ime ili sifra su netacni!");
                    return _response;
                }

                // Autorizacija korisnika (na osnovu role) i generisanje JWT tokena
                var roles = await _userManager.GetRolesAsync(userFromDb);

                //Ako je password tacan generise se JWT token
                JwtSecurityTokenHandler tokenHandler = new(); // Kreira se handler koji sastavlja i serijalizuje JWT
                byte[] key = Encoding.ASCII.GetBytes(_secretKey); // Pretvara secretKey (iz appsetting.json) u bajtove koji se koriste za potpis i verifikaciju

                SecurityTokenDescriptor tokenDescriptor = new()
                {
                    // Sastavljam Claims koji ce biti u payloadu tokena
                    Subject = new ClaimsIdentity(new Claim[]
                    {
                new Claim(ClaimTypes.NameIdentifier, userFromDb.Id.ToString()),
                new Claim("name", userFromDb.Name),
                new Claim("id", userFromDb.Id.ToString()),
                new Claim(ClaimTypes.Email, userFromDb.UserName.ToString()),
                new Claim(ClaimTypes.Role, roles.FirstOrDefault() ?? ""),
                new Claim("phoneNumber", userFromDb.PhoneNumber ?? "")
                    }),
                    Expires = DateTime.UtcNow.AddHours(1),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256Signature)
                };

                SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
                string jwtToken = tokenHandler.WriteToken(token); // Serijalizacija tokena u string

                // Generise refresh token
                var refreshToken = GenerateRefreshToken();
                userFromDb.RefreshToken = refreshToken;
                userFromDb.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(1); // npr. 1 dan vazenja
                await _db.SaveChangesAsync();

                // Kreiranje odgovora sa email-om i tokenom za korisnika
                LoginResponseDTO loginResponse = new()
                {
                    Email = userFromDb.Email,
                    Token = jwtToken,
                    RefreshToken = refreshToken
                };

                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                _response.Result = loginResponse;
                return _response;
            }
            catch (Exception ex)
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Došlo je do greške prilikom prijave: " + ex.Message);
                return _response;
            }
        }

        public async Task<ApiResponse> LogoutAsync(string userId)
        {
            var user = await _db.ApplicationUsers.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null)
            {
                _response.StatusCode = HttpStatusCode.NotFound;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnik ne postoji!");
                return _response;
            }

            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _db.SaveChangesAsync();

            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            _response.Result = new { message = "Logout successful!" };
            return _response;
        }

        public async Task<ApiResponse> GetAllUsersAsync()
        {
            try
            {
                // Dohvatanje svih korisnika sa njihovim taskovima
                var usersFromDb = await _db.ApplicationUsers
                    .Include(u => u.Tasks)
                    .ToListAsync();

                // Kreiranje custom objekata za rezultat
                var usersResult = new List<object>();
                foreach (var user in usersFromDb)
                {
                    var roles = await _userManager.GetRolesAsync(user);
                    var role = roles.FirstOrDefault(); // Ako ima samo jednu rolu

                    usersResult.Add(new
                    {
                        user.Id,
                        user.UserName,
                        user.Name,
                        user.Email,
                        user.PhoneNumber,
                        user.Image,
                        Role = role,
                        user.CompletedTasksCount,
                        user.PendingTasksCount,
                        user.OverdueTasksCount,
                        Tasks = user.Tasks.Select(t => new
                        {
                            t.Id,
                            t.Title,
                            t.Description,
                            t.DueDate,
                            t.Status,
                            t.Priority,
                            t.Category
                        }).ToList()
                    });
                }

                _response.Result = usersResult;
                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                return _response;
            }
            catch (Exception ex)
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add(ex.Message);
                return _response;
            }
        }

        public async Task<ApiResponse> GetUserDetailsAsync(string id)
        {

            if (string.IsNullOrEmpty(id))
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                return _response;
            }

            ApplicationUser? userFromDb = await _db.ApplicationUsers.FirstOrDefaultAsync(u => u.Id == id);

            if (userFromDb == null)
            {
                _response.StatusCode = HttpStatusCode.NotFound;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnik ne postoji!");
                return _response;
            }

            // Dohvatanje role korisnika
            var roles = await _userManager.GetRolesAsync(userFromDb);
            var role = roles.FirstOrDefault(); // Ako ima samo jednu rolu

            // Vracamo custom objekat sa rolom
            _response.Result = new
            {
                userFromDb.Id,
                userFromDb.UserName,
                userFromDb.Name,
                userFromDb.Email,
                userFromDb.PhoneNumber,
                userFromDb.Image,
                Role = role,
                userFromDb.CompletedTasksCount,
                userFromDb.PendingTasksCount,
                userFromDb.OverdueTasksCount,
            };

            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            return _response;
        }

        public async Task<ApiResponse> UpdateUserDetailsAsync(string id, UserDetailsUpdateDTO userDetailsUpdateDTO)
        {
            try
            {
                if (userDetailsUpdateDTO == null || id != userDetailsUpdateDTO.Id)
                {
                    _response.StatusCode = HttpStatusCode.BadRequest;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.Add("Korisnik nije pronadjen!");
                    return _response;
                }

                ApplicationUser? user = await _db.ApplicationUsers.FindAsync(id);

                if (user == null)
                {
                    _response.StatusCode = HttpStatusCode.NotFound;
                    _response.IsSuccess = false;
                    _response.ErrorMessages.Add("Korisnik nije pronadjen!");
                    return _response;
                }

                user.UserName = userDetailsUpdateDTO.UserName;
                user.Name = userDetailsUpdateDTO.Name;
                user.Email = userDetailsUpdateDTO.UserName;
                user.NormalizedEmail = userDetailsUpdateDTO.UserName.ToUpper();
                user.NormalizedUserName = userDetailsUpdateDTO.UserName.ToUpper();
                user.PhoneNumber = userDetailsUpdateDTO.PhoneNumber;

                // Ažuriranje lozinke ako je poslata nova
                if (!string.IsNullOrWhiteSpace(userDetailsUpdateDTO.Password))
                {
                    var passwordHasher = new PasswordHasher<ApplicationUser>();
                    user.PasswordHash = passwordHasher.HashPassword(user, userDetailsUpdateDTO.Password);
                }

                // Upload nove slike ako postoji
                if (userDetailsUpdateDTO.File != null && userDetailsUpdateDTO.File.Length > 0)
                {
                    // Ako postoji stara slika - obriši je
                    if (!string.IsNullOrEmpty(user.Image))
                    {
                        try
                        {
                            await _cloudinaryService.DeleteImageAsync(user.Image);
                        }
                        catch (Exception ex)
                        {
                            _response.StatusCode = HttpStatusCode.InternalServerError;
                            _response.IsSuccess = false;
                            _response.ErrorMessages.Add($"Greška prilikom brisanja stare slike: {ex.Message}");
                            return _response;
                        }
                    }

                    try
                    {
                        string imageUrl = await _cloudinaryService.UploadImageAsync(userDetailsUpdateDTO.File);
                        user.Image = imageUrl;
                    }
                    catch (Exception ex)
                    {
                        _response.StatusCode = HttpStatusCode.InternalServerError;
                        _response.IsSuccess = false;
                        _response.ErrorMessages.Add($"Greška prilikom upload-a slike: {ex.Message}");
                        return _response;
                    }
                }

                _db.ApplicationUsers.Update(user);
                await _db.SaveChangesAsync();

                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                _response.Result = new { message = "Podaci su uspešno ažurirani!" };
                return _response;
            }
            catch (Exception ex)
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
                return _response;
            }
        }

        //Metoda koja vraca detalje o trenutno ulogovanom korisniku
        public async Task<ApiResponse> MeAsync(string userId)
        {
            try
            {
                // Dobijanje id iz claims
                if (string.IsNullOrEmpty(userId))
                {
                    _response.StatusCode = HttpStatusCode.Unauthorized;
                    _response.IsSuccess = false;
                    return _response;
                }

                var user = await _db.ApplicationUsers
                    .Where(u => u.Id == userId)
                    .FirstOrDefaultAsync();

                if (user == null)
                {
                    _response.StatusCode = HttpStatusCode.NotFound;
                    _response.IsSuccess = false;
                    return _response;
                }

                // dohvata rolu korisnika
                var roles = await _userManager.GetRolesAsync(user);

                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                _response.Result = new
                {
                    user.Id,
                    user.UserName,
                    user.Name,
                    user.Email,
                    user.PhoneNumber,
                    user.Image,
                    Roles = roles,
                    user.CompletedTasksCount,
                    user.PendingTasksCount,
                    user.OverdueTasksCount
                };
                return _response;
            }
            catch (Exception ex)
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages = new List<string> { ex.Message };
                return _response;
            }
        }

        //Metoda za verifikaciju lozinke korisnika
        public async Task<ApiResponse> VerifyPasswordAsync(VerifyPasswordDTO verifyPasswordDTO)
        {
            ApplicationUser? userFromDb = await _db.ApplicationUsers
                .FirstOrDefaultAsync(u => u.Id == verifyPasswordDTO.Id);

            if (userFromDb == null)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnik nije pronadjen!");
                return _response;
            }

            var passwordHasher = new PasswordHasher<ApplicationUser>();
            var result = passwordHasher.VerifyHashedPassword(userFromDb, userFromDb.PasswordHash, verifyPasswordDTO.Password);

            if (result == PasswordVerificationResult.Failed)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Neispravna lozinka!");
                return _response;
            }

            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            _response.Result = userFromDb;
            return _response;
        }

        //Endpoint za osvezavanje tokena
        public async Task<ApiResponse> RefreshTokenAsync(string refreshToken)
        {
            var user = await _db.ApplicationUsers.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                _response.StatusCode = HttpStatusCode.Unauthorized;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Neispravan ili istekao refresh token.");
                return _response;
            }

            // Generiši novi JWT token (kao u loginu)
            var roles = await _userManager.GetRolesAsync(user);
            JwtSecurityTokenHandler tokenHandler = new();
            byte[] key = Encoding.ASCII.GetBytes(_secretKey);

            SecurityTokenDescriptor tokenDescriptor = new()
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
            new Claim("name", user.Name),
            new Claim("id", user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.UserName ?? string.Empty.ToString()),
            new Claim(ClaimTypes.Role, roles.FirstOrDefault() ?? ""),
            new Claim("phoneNumber", user.PhoneNumber ?? "")
                }),
                Expires = DateTime.UtcNow.AddHours(1),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);
            string newJwtToken = tokenHandler.WriteToken(token);

            var newRefreshToken = GenerateRefreshToken();
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _db.SaveChangesAsync();

            _response.StatusCode = HttpStatusCode.OK;
            _response.IsSuccess = true;
            _response.Result = new
            {
                token = newJwtToken,
                refreshToken = newRefreshToken
            };
            return _response;
        }

        //Slanje emaila za reset lozinke
        public async Task<ApiResponse> ForgotPasswordAsync(ForgotPasswordDTO forgotPasswordDTO)
        {
            if (string.IsNullOrWhiteSpace(forgotPasswordDTO.Email))
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Email je obavezan!");
                return _response;
            }

            var user = await _userManager.FindByEmailAsync(forgotPasswordDTO.Email);
            if (user == null)
            {
                // Ne otkrivamo da li email postoji iz sigurnosnih razloga
                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                _response.Result = "Ako email postoji, poslat je link za reset lozinke.";
                return _response;
            }

            // Generisanje tokena za reset lozinke
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            // Token mora biti URL safe
            var encodedToken = Uri.EscapeDataString(token);

            // Link ka React aplikaciji (frontend)
            var resetLink = $"{_frontendURL}/reset-password?email={Uri.EscapeDataString(user.Email)}&token={encodedToken}";

            try
            {
                await _emailService.SendEmailAsync(
                    user.Email,
                    "Resetovanje Lozinke",
                    $"<h3>Resetovanje Lozinke</h3><p>Kliknite na link da resetujete lozinku:</p>" +
                    $"<a href='{resetLink}'>Resetuj Lozinku</a><p>Link ističe za 24 sata.</p>"
                );

                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                _response.Result = "Ako email postoji, poslat je link za reset lozinke.";
                return _response;
            }
            catch (Exception ex)
            {
                _response.StatusCode = HttpStatusCode.InternalServerError;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add($"Greška prilikom slanja email-a: {ex.Message}");
                return _response;
            }
        }

        //Metoda za reset lozinke korisnika
        public async Task<ApiResponse> ResetPasswordAsync(ResetPasswordDTO resetPasswordDTO)
        {
            if (string.IsNullOrWhiteSpace(resetPasswordDTO.Email) ||
                string.IsNullOrWhiteSpace(resetPasswordDTO.Token) ||
                string.IsNullOrWhiteSpace(resetPasswordDTO.NewPassword))
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Email, token i nova lozinka su obavezni!");
                return _response;
            }

            var user = await _userManager.FindByEmailAsync(resetPasswordDTO.Email);
            if (user == null)
            {
                _response.StatusCode = HttpStatusCode.BadRequest;
                _response.IsSuccess = false;
                _response.ErrorMessages.Add("Korisnik nije pronađen!");
                return _response;
            }

            // token stiže već URL-encoded → dekodiraj
            var decodedToken = Uri.UnescapeDataString(resetPasswordDTO.Token);

            var result = await _userManager.ResetPasswordAsync(user, decodedToken, resetPasswordDTO.NewPassword);
            if (result.Succeeded)
            {
                _response.StatusCode = HttpStatusCode.OK;
                _response.IsSuccess = true;
                _response.Result = "Lozinka je uspešno resetovana.";
                return _response;
            }

            _response.StatusCode = HttpStatusCode.BadRequest;
            _response.IsSuccess = false;
            _response.ErrorMessages.AddRange(result.Errors.Select(e => e.Description));
            return _response;
        }
    }
}
