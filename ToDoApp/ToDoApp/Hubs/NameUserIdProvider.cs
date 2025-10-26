using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ToDoApp.Hubs
{
    // Da SignalR zna koji userId da poveze sa konekcijom
    public class NameUserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            // Koristi NameIdentifier iz JWT tokena
            return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? connection.ConnectionId;
        }
    }
}
