using BLL.Services.Interfaces;
using DAL.Repository.UoF.Interfaces;
using EL.DTOs.MessagesDTO;
using EL.Models.Messages;
using EL.Models.User;
using EL.Shared;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services.Implementations
{
    public class MessageService : IMessageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMessageNotifier _notifier;
        private readonly UserManager<ApplicationUser> _userManager;

        public MessageService(IUnitOfWork unitOfWork, IMessageNotifier notifier, UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _notifier = notifier;
            _userManager = userManager;
        }

        public async Task<ApiResponse> SendMessageAsync(string senderId, MessageCreateDTO dto)
        {
            var response = new ApiResponse();

            // Validacija sadržaja poruke
            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ErrorMessages.Add("Poruka ne može biti prazna.");
                return response;
            }

            // Ako je prosleđen email, koristi UserManager za pronalaženje korisnika
            string? receiverId = dto.ReceiverId;

            if (string.IsNullOrWhiteSpace(receiverId) && !string.IsNullOrWhiteSpace(dto.ReceiverEmail))
            {
                var receiverUser = await _userManager.FindByEmailAsync(dto.ReceiverEmail);

                if (receiverUser == null)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.NotFound;
                    response.ErrorMessages.Add("Korisnik sa unetim emailom nije pronađen.");
                    return response;
                }

                receiverId = receiverUser.Id;
            }

            if (string.IsNullOrWhiteSpace(receiverId))
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ErrorMessages.Add("Nije prosleđen ID ili Email primaoca.");
                return response;
            }

            // Kreira se poruka
            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = dto.Content,
                SendAt = DateTime.UtcNow,
                IsRead = false
            };

            await _unitOfWork.Messages.AddAsync(message);
            await _unitOfWork.SaveChangesAsync();

            // Formatiranje vremena u srpsko lokalno vreme
            var myTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(message.SendAt, myTimeZone);

            var messageData = new
            {
                Id = message.Id,
                SenderId = senderId,
                ReceiverId = receiverId,
                Content = dto.Content,
                SendAt = localTime.ToString("yyyy-MM-ddTHH:mm:ss"), // ISO format sa lokalnim vremenom
                IsRead = message.IsRead
            };

            // ❗ Realtime obaveštenje PRIMAOCU
            await _notifier.NotifyUserAsync(receiverId, messageData);

            // ❗ Realtime obaveštenje POŠILJAOCU (da dobije poruku sa pravim ID-jem iz baze)
            await _notifier.NotifyUserAsync(senderId, messageData);

            response.Result = new
            {
                message.Id,
                message.SenderId,
                message.ReceiverId,
                message.Content,
                SendAt = localTime.ToString("dd.MM.yyyy. HH:mm"),
                message.IsRead
            };
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }

        public async Task<ApiResponse> GetConversationAsync(string currentUserId, string otherUserId)
        {
            var response = new ApiResponse();

            var messages = await _unitOfWork.Messages.GetConversationAsync(currentUserId, otherUserId);

            // Konvertuj UTC vreme u srpsko lokalno vreme
            var myTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");

            var dto = messages.Select(m => new MessageResponseDTO
            {
                Id = m.Id,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                SendAt = TimeZoneInfo.ConvertTimeFromUtc(m.SendAt, myTimeZone), // Konvertuj u lokalno
                IsRead = m.IsRead
            }).ToList();

            response.Result = dto;
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }

        public async Task<ApiResponse> GetUnreadMessagesAsync(string userId)
        {
            var response = new ApiResponse();

            var unread = await _unitOfWork.Messages.GetUnreadMessagesAsync(userId);

            var myTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");

            response.Result = unread.Select(m => new MessageResponseDTO
            {
                Id = m.Id,
                SenderId = m.SenderId,
                ReceiverId = m.ReceiverId,
                Content = m.Content,
                SendAt = TimeZoneInfo.ConvertTimeFromUtc(m.SendAt, myTimeZone),
                IsRead = m.IsRead
            }).ToList();

            response.StatusCode = HttpStatusCode.OK;
            return response;
        }

        public async Task<ApiResponse> MarkAsReadAsync(int messageId, string userId)
        {
            var response = new ApiResponse();
            var message = await _unitOfWork.Messages.GetByIdAsync(messageId);

            if (message == null || message.ReceiverId != userId)
            {
                response.StatusCode = HttpStatusCode.NotFound;
                response.IsSuccess = false;
                response.ErrorMessages.Add("Poruka nije pronađena ili ne pripada korisniku.");
                return response;
            }

            message.IsRead = true;
            _unitOfWork.Messages.Update(message);
            await _unitOfWork.SaveChangesAsync();

            var myTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");

            response.StatusCode = HttpStatusCode.OK;
            response.Result = new MessageResponseDTO
            {
                Id = message.Id,
                SenderId = message.SenderId,
                ReceiverId = message.ReceiverId,
                Content = message.Content,
                SendAt = TimeZoneInfo.ConvertTimeFromUtc(message.SendAt, myTimeZone),
                IsRead = message.IsRead
            };
            return response;
        }

        public async Task<ApiResponse> GetAllConversationsAsync(string userId)
        {
            var response = new ApiResponse();
            var messages = await _unitOfWork.Messages.GetAllMessagesForUserAsync(userId);

            var myTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");

            var conversationPartners = messages
                .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
                .Select(g => new ConversationPartnerDTO
                {
                    UserId = g.Key,
                    Email = g.First().SenderId == userId ? g.First().Receiver.Email : g.First().Sender.Email,
                    LastMessage = g.OrderByDescending(m => m.SendAt).First().Content,
                    LastMessageTime = TimeZoneInfo.ConvertTimeFromUtc(
                        g.OrderByDescending(m => m.SendAt).First().SendAt,
                        myTimeZone
                    ),
                    HasUnread = g.Any(m => !m.IsRead && m.ReceiverId == userId),
                    ProfileImageUrl = g.First().SenderId == userId
                        ? g.First().Receiver.Image
                        : g.First().Sender.Image
                })
                .OrderByDescending(p => p.LastMessageTime)
                .ToList();

            response.Result = conversationPartners;
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }
    }
}
