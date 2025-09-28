using Microsoft.AspNetCore.Http;

namespace BLL.Services.Interfaces
{
    // Apstrakcija za Cloudinary operacije
    public interface ICloudinaryService
    {
        // Upload slike - vraca URL kao string
        Task<string> UploadImageAsync(IFormFile file);

        // Brise sliku na osnovu javnog URL-a i vraca true
        // ako je brisanje uspesno
        Task<bool> DeleteImageAsync(string imageUrl);
    }
}
