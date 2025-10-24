using EL.DTOs.MessagesDTO;
using EL.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services.Interfaces
{
    public interface IMessageService
    {
        Task<ApiResponse> SendMessageAsync(string senderId, MessageCreateDTO dto);
        Task<ApiResponse> GetConversationAsync(string currentUserId, string otherUserId);
        Task<ApiResponse> GetUnreadMessagesAsync(string userId);
        Task<ApiResponse> MarkAsReadAsync(int messageId, string userId);

        Task<ApiResponse> GetAllConversationsAsync(string userId);
    }
}
