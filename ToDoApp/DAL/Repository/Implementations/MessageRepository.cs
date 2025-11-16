using DAL.DbContexts;
using DAL.Repository.Interfaces;
using EL.Models.Messages;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repository.Implementations
{
    public class MessageRepository : Repository<Message>, IMessageRepository
    {
        public MessageRepository(ApplicationDbContext context) : base(context)
        {
            
        }

        // Vraca sve poruke izmedju dva korisnika (bilo koji smer)
        public IQueryable<Message> GetConversationAsQueryable(string userId1, string userId2)
        {
            return _context.Messages
                .Where(m => (m.SenderId == userId1 && m.ReceiverId == userId2) ||
                            (m.SenderId == userId2 && m.ReceiverId == userId1))
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .OrderBy(m => m.SendAt);
        }

        // Vraca sve neprocitane poruke korisnika
        public async Task<List<Message>> GetUnreadMessagesAsync(string userId)
        {
            return await _context.Messages
                .Where(m => m.ReceiverId == userId && !m.IsRead)
                .OrderByDescending(m => m.SendAt)
                .ToListAsync();
        }

        // Vraca sve konverzacije za korisnika
        public IQueryable<Message> GetAllMessagesForUserAsQueeyable(string userId)
        {
            return _context.Messages
                .Include(m => m.Sender)
                .Include(m => m.Receiver)
                .Where(m => m.SenderId == userId || m.ReceiverId == userId)
                .OrderBy(m => m.SendAt);
        }
    }
}
