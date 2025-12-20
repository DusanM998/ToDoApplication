using EL.Models.Group;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repository.Interfaces
{
    public interface IGroupRepository : IRepository<Group>
    {
        Task<Group?> GetByNameAsync(string groupName);
        Task<List<Group>> GetGroupsForUserAsync(string userId);
        Task<List<GroupMessage>> GetMessageForGroupAsync(int groupId);

        Task<Group?> GetByIdWithMembersAsync(int groupId);
        void Remove(Group group);

    }
}
