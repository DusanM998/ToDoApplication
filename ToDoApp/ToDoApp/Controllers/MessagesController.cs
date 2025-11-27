using BLL.Services.Interfaces;
using EL.DTOs.MessagesDTO;
using EL.Shared;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;
using ToDoApp.Hubs;

namespace ToDoApp.Controllers
{
    [Route("api/messages")]
    [Authorize]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        private readonly IMessageService _messageService;
        private readonly IHubContext<MessageHub> _hubContext;
        public MessagesController(IMessageService messageService, IHubContext<MessageHub> hubContext)
        {
            _messageService = messageService;
            _hubContext = hubContext;
        }

        // Slanje poruke
        [HttpPost("send")]
        public async Task<ActionResult<ApiResponse>> SendMessage([FromForm] MessageCreateDTO dto)
        {
            var senderId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (senderId == null)
                return Unauthorized("User is not authenticated.");

            var response = await _messageService.SendMessageAsync(senderId, dto);

            // MessageService vec salje real-time notifikacije preko IMessageNotifier

            return StatusCode((int)response.StatusCode, response);
        }

        // Dohvati celu konverzaciju izmedju dva korisnika
        [HttpGet("conversation/{otherUserId}")]
        public async Task<ActionResult<ApiResponse>> GetConversation(string otherUserId)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (currentUserId == null)
                return Unauthorized("User is not authenticated.");

            var response = await _messageService.GetConversationAsync(currentUserId, otherUserId);
            return StatusCode((int)response.StatusCode, response);
        }

        // Dohvati neprocitane poruke
        [HttpGet("unread")]
        public async Task<ActionResult<ApiResponse>> GetUnreadMessages()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized("User is not authenticated.");

            var response = await _messageService.GetUnreadMessagesAsync(userId);
            return StatusCode((int)response.StatusCode, response);
        }

        // Oznaci poruku kao procitanu
        [HttpPut("{messageId}/read")]
        public async Task<ActionResult<ApiResponse>> MarkAsRead(int messageId)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized("User is not authenticated.");

            var response = await _messageService.MarkAsReadAsync(messageId, userId);

            // Obavesti posiljaoca da je poruka procitana
            if (response.IsSuccess && response.Result is MessageResponseDTO message)
            {
                await _hubContext.Clients.User(message.SenderId)
                    .SendAsync("MessageRead", new { MessageId = message.Id });
            }

            return StatusCode((int)response.StatusCode, response);
        }

        // Vraca sve konverzacije za korisnika
        [HttpGet("conversations")]
        public async Task<ActionResult<ApiResponse>> GetAllConversations()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized("User is not authenticated.");

            var response = await _messageService.GetAllConversationsAsync(userId);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
