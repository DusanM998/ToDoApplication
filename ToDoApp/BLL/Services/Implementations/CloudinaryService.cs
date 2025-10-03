using BLL.Services.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using El.Shared;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using System;
using System.Threading.Tasks;

namespace BLL.Services.Implementations
{
    // Koristim Cloudinary Service za upravljanje multimedijalnim fajlovima
    // iz razloga sto on cuva fajlove na cloud, a ne lokalno, generise URL za te fajlove, itd
    public class CloudinaryService : ICloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        // Constructor prima cloudinary kredencijale iz konfiguracije (appsettings.json)
        // Kreira objekat Cloudinary koji sluzi za komunikaciju sa servisom
        public CloudinaryService(IOptions<CloudinarySettings> config)
        {
            var account = new Account(
                config.Value.CloudName,
                config.Value.ApiKey,
                config.Value.ApiSecret
            );

            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        // Prima fajl iz HTTP zahteva (IFormFile) i pravi parametre za upload
        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("Fajl nije validan!");
            }

            // Kreiram stream prom. i kada izadjem iz trenutnog scope-a, automatski poziva Dispose() nad njom
            // da bi oslobodio resurse
            using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream), // File - ime fajla + stream
                Folder = "slike", // Folder - slike ce se cuvati u folderu 'slike' na Coludinary-u
                Transformation = new Transformation().Width(500).Height(500).Crop("fill") // Transformation -
                                                                                          // slika ce automatski biti resize-ovana
                                                                                          // na 500x500 tako da popuni okvir
            };

            var uploadResult = await (_cloudinary.UploadAsync(uploadParams)); // Poziva se UploadAsync metoda i dobija se rezultat
            return uploadResult.SecureUrl.ToString(); //vraca URL slike koji se moze sacuvati u bazi i koristiti za prikaz
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            try
            {
                var publicId = imageUrl.Split("/").Last().Split(".").First();

                var deleteParams = new DeletionParams(publicId);
                var deleteResult = await _cloudinary.DestroyAsync(deleteParams);

                return deleteResult.Result == "Ok";
            }
            catch (Exception ex)
            {
                throw new Exception($"Greska prilikom brisanja slike!: {ex.Message}");
            }
        }
    }
}
