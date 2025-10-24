using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ToDoApp.Hubs
{
    public class MessageHub : Hub
    {
        private static ConcurrentDictionary<string, string> OnlineUsers = new();

        // Real - time status korisnika
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                // Dodaje korisnika u listu online
                OnlineUsers[userId] = Context.ConnectionId;

                // Posalje novom korisniku listu svih trenutno online korisnika
                await Clients.Caller.SendAsync("UsersOnline", OnlineUsers.Keys);

                // Obavesti sve ostale klijente da je ovaj korisnik sada online
                await Clients.Others.SendAsync("UserOnline", userId);
            }
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                OnlineUsers.TryRemove(userId, out _);

                // Emituj svim klijentima da je korisnik offline
                await Clients.All.SendAsync("UserOffline", userId);
            }
            await base.OnDisconnectedAsync(exception);
        }

        // Slanje poruka
        public async Task SendMessage(string senderId, string receiverId, string content)
        {
            await Task.CompletedTask;
        }

        // Obelezavanje poruka kao procitanih
        public async Task MarkAsRead(int messageId, string senderId)
        {
            // Obavestava posiljaoca da je poruka procitana
            await Clients.User(senderId).SendAsync("MessageRead", new { MessageId = messageId });
        }

        // Grupni chatovi
        public async Task JoinGroup(string groupName)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("GroupNotification", $"{Context.UserIdentifier} joined the group {groupName}");
        }

        public async Task LeaveGroup(string groupName)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
            await Clients.Group(groupName).SendAsync("GroupNotification", $"{Context.UserIdentifier} left the group {groupName}");
        }

        public async Task SendGroupMessage(string groupName, string senderId, string content)
        {
            var messageObj = new
            {
                SenderId = senderId,
                Content = content,
                SendAt = DateTime.UtcNow,
                Group = groupName
            };

            await Clients.Group(groupName).SendAsync("ReceiveGroupMessage", messageObj);
        }

        // Real - time notifikacije
        public async Task SendNotification(string userId, string notificationContent)
        {
            var notification = new
            {
                Content = notificationContent,
                SendAt = DateTime.UtcNow
            };

            await Clients.User(userId).SendAsync("ReceiveNotification", notification);
        }
    }
}
