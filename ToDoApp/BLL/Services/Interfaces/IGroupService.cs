using EL.DTOs.GroupDTO;
using EL.Shared;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services.Interfaces
{
    public interface IGroupService
    {
        Task<ApiResponse> CreateGroupAsync(string creatorId, string groupName, List<string> memberIds);
        Task<ApiResponse> SendGroupMessageAsync(string senderId, string groupIdentifier, GroupMessageCreateDTO dto);
        Task<ApiResponse> GetMessagesForGroupAsync(int groupId);
        Task<ApiResponse> GetGroupsForUserAsync(string userId);
        Task<ApiResponse> RemoveMemberAsync(string requesterId, int groupId, string memberId);
    }
}
