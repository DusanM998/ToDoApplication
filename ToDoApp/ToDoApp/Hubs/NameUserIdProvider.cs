using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ToDoApp.Hubs
{
    public class NameUserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            // Koristi NameIdentifier iz JWT tokena
            return connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? connection.ConnectionId;
        }
    }
}
