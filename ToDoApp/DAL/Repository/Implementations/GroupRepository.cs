using DAL.DbContexts;
using DAL.Repository.Interfaces;
using EL.Models.Group;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repository.Implementations
{
    public class GroupRepository : Repository<Group>, IGroupRepository
    {
        public GroupRepository(ApplicationDbContext context) : base (context) 
        {
            
        }
        
        // Vraca grupu po imenu, ukljucujuci clanove grupe
        public async Task<Group?> GetByNameAsync(string groupName)
        {
            return await _context.Groups
                .Include(g => g.Members)
                    .ThenInclude(m => m.User)
                .Include(g => g.Messages)
                    .ThenInclude(m => m.Sender)
                .FirstOrDefaultAsync(g => g.Name == groupName);
        }

        // Vraca sve grupe u kojima korisnik ucestvuje
        public async Task<List<Group>> GetGroupsForUserAsync(string userId)
        {
            return await _context.Groups
                .Include(g => g.Members)
                    .ThenInclude(m => m.User)
                .Include(g => g.Messages)
                    .ThenInclude(m => m.Sender)
                .Where(g => g.Members.Any(m => m.UserId == userId))
                .OrderByDescending(g => g.Messages.Max(m => m.SentAt))
                .ToListAsync();
        }

        // Vraca sve poruke za odredjenu grupu
        public async Task<List<GroupMessage>> GetMessageForGroupAsync(int groupId)
        {
            return await _context.GroupMessages
                .Include(m => m.Sender)
                .Where(m => m.GroupId == groupId)
                .OrderBy(m => m.SentAt)
                .ToListAsync();
        }
    }
}
