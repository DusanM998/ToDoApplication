using BLL.Services.Interfaces;
using Microsoft.AspNetCore.SignalR;

namespace ToDoApp.Hubs
{
    // Servis koji omogucava backendu da salje poruke korisniku
    // preko SignalR Huba
    public class SignalRMessageNotifier : IMessageNotifier
    {
        private readonly IHubContext<MessageHub> _hubContext;

        public SignalRMessageNotifier(IHubContext<MessageHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyUserAsync(string userId, object message)
        {
            await _hubContext.Clients.User(userId).SendAsync("ReceiveMessage", message);
        }
    }
}
