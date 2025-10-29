using BLL.Services.Interfaces;
using EL.DTOs.GroupDTO;
using EL.Shared;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ToDoApp.Controllers
{
    [Route("api/groups")]
    [ApiController]
    public class GroupController : ControllerBase
    {
        private readonly IGroupService _groupService;

        public GroupController(IGroupService groupService)
        {
            _groupService = groupService;
        }

        // Kreiranje nove grupe
        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse>> CreateGroup([FromBody] CreateGroupDTO dto)
        {
            var creatorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (creatorId == null)
                return Unauthorized("User is not authenticated.");

            var response = await _groupService.CreateGroupAsync(creatorId, dto.Name, dto.Members);

            return StatusCode((int)response.StatusCode, response);
        }

        // Dohvati sve grupe korisnika
        [HttpGet("my-groups")]
        public async Task<ActionResult<ApiResponse>> GetGroupsForUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null)
                return Unauthorized("User is not authenticated.");

            var response = await _groupService.GetGroupsForUserAsync(userId);
            return StatusCode((int)response.StatusCode, response);
        }

        // Slanje poruke u grupu
        [HttpPost("{groupIdentifier}/send")]
        public async Task<ActionResult<ApiResponse>> SendGroupMessage(string groupIdentifier, [FromBody] SendGroupMessageDTO dto)
        {
            var senderId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (senderId == null)
                return Unauthorized("User is not authenticated.");

            var response = await _groupService.SendGroupMessageAsync(senderId, groupIdentifier, dto.Content);

            return StatusCode((int)response.StatusCode, response);
        }

        // Dohvati sve poruke iz grupe
        [HttpGet("{groupId}/messages")]
        public async Task<ActionResult<ApiResponse>> GetMessagesForGroup(int groupId)
        {
            var response = await _groupService.GetMessagesForGroupAsync(groupId);
            return StatusCode((int)response.StatusCode, response);
        }

        // Napustanje grupe (ili izbacivanje iz grupe od strane admina)
        [HttpDelete("{groupId}/members/{memberId}")]
        public async Task<ActionResult<ApiResponse>> RemoveMember(int groupId, string memberId)
        {
            var requesterId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (requesterId == null)
                return Unauthorized("User is not authenticated.");

            var response = await _groupService.RemoveMemberAsync(requesterId, groupId, memberId);
            return StatusCode((int)response.StatusCode, response);
        }
    }
}
