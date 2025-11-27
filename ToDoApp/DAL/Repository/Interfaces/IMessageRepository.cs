using EL.Models.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repository.Interfaces
{
    public interface IMessageRepository : IRepository<Message>
    {
        IQueryable<Message> GetConversationAsQueryable(string userId1, string userId2);
        IQueryable<Message> GetUnreadMessagesAsQueryable(string userId);
        IQueryable<Message> GetAllMessagesForUserAsQueeyable(string userId);
    }
}
