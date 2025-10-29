using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;

namespace ToDoApp.Hubs
{
    // SignalR Hub koji upravlja real-time funkcionalnoscu
    public class MessageHub : Hub
    {
        // Kolekcija koja cuva trenutno online korisnike
        private static ConcurrentDictionary<string, string> OnlineUsers = new();

        // Real - time status korisnika
        // Poziva se kada se korisnik poveze na Hub
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

        // Poziva se kada se korisnik diskonektuje sa Huba
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
        // Metoda je prazna jer ne saljem poruke direktno preko Hub-a, vec kroz backend service MessageService
        // Taj servis ima svu logiku slanja poruke
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

        public async Task NotifyMessageRead(int messageId, string senderId, string receiverId)
        {
            // Pošalji pošiljaocu da je njegova poruka pročitana
            if (!string.IsNullOrEmpty(senderId))
            {
                await Clients.User(senderId).SendAsync("MessageRead", new { MessageId = messageId });
            }

            Console.WriteLine($"Poruka {messageId} je procitana od strane {receiverId}, obavestio {senderId}");
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
