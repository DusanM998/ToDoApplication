using BLL.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Net.Mail;

namespace BLL.Services.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            try
            {
                // Učitavanje SMTP konfiguracije iz appsettings.json
                var smtpHost = _configuration["Smtp:Host"];
                var smtpPortStr = _configuration["Smtp:Port"];
                var smtpUsername = _configuration["Smtp:Username"];
                var smtpPassword = _configuration["Smtp:Password"];
                var fromEmail = _configuration["Smtp:FromEmail"];
                var fromName = _configuration["Smtp:FromName"] ?? "ToDoApp";

                // Validacija
                if (string.IsNullOrEmpty(smtpHost) ||
                    string.IsNullOrEmpty(smtpPortStr) ||
                    string.IsNullOrEmpty(smtpUsername) ||
                    string.IsNullOrEmpty(smtpPassword) ||
                    string.IsNullOrEmpty(fromEmail))
                {
                    throw new InvalidOperationException("SMTP konfiguracija nije kompletna!");
                }

                if (!int.TryParse(smtpPortStr, out int smtpPort))
                {
                    throw new InvalidOperationException("SMTP port nije valjan broj!");
                }

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(fromEmail, fromName),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                mailMessage.To.Add(toEmail);

                _logger.LogInformation($"Pokušavam da pošaljem email na: {toEmail} | Subject: {subject}");

                // SmtpClient implementira IDisposable → koristi using
                using (var smtpClient = new SmtpClient())
                {
                    smtpClient.Host = smtpHost;
                    smtpClient.Port = smtpPort;
                    smtpClient.EnableSsl = true;
                    smtpClient.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
                    smtpClient.Timeout = 20000; // 20 sekundi timeout

                    await smtpClient.SendMailAsync(mailMessage);
                }

                _logger.LogInformation($"Email uspešno poslat na: {toEmail}");
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, $"SMTP greška prilikom slanja email-a na {toEmail}: {smtpEx.Message}");
                throw new Exception($"Greška sa email serverom: {smtpEx.Message}", smtpEx);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Opšta greška prilikom slanja email-a na {toEmail}: {ex.Message}");
                throw new Exception($"Greška prilikom slanja email-a: {ex.Message}", ex);
            }
        }
    }
}
