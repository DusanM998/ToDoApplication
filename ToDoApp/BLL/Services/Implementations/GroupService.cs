using BLL.Services.Interfaces;
using DAL.Repository.UoF.Interfaces;
using EL.DTOs.GroupDTO;
using EL.Models.Group;
using EL.Models.User;
using EL.Shared;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services.Implementations
{
    public class GroupService : IGroupService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMessageNotifier _messageNotifier;
        private readonly UserManager<ApplicationUser> _userManager;

        public GroupService(IUnitOfWork unitOfWork, IMessageNotifier messageNotifier, UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _messageNotifier = messageNotifier;
            _userManager = userManager;
        }

        // Kreiranje nove grupe
        public async Task<ApiResponse> CreateGroupAsync(string creatorId, string groupName, List<string> memberIds)
        {
            var response = new ApiResponse();

            if (string.IsNullOrWhiteSpace(groupName))
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ErrorMessages.Add("Ime grupe ne može biti prazno.");
                return response;
            }

            // Proveri da li grupa sa tim imenom vec postoji
            var existingGroup = await _unitOfWork.Groups.GetByNameAsync(groupName);
            if (existingGroup != null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.Conflict;
                response.ErrorMessages.Add("Grupa sa tim imenom već postoji.");
                return response;
            }

            var group = new Group
            {
                Name = groupName,
                CreatedById = creatorId,
                CreatedAt = DateTime.UtcNow
            };

            // Dodaj clanove
            group.Members.Add(new GroupMember
            {
                UserId = creatorId,
                IsAdmin = true
            });

            foreach (var identifier in memberIds.Distinct().Where(id => id != creatorId))
            {
                string? memberId = null;

                // Ako je email (sadrzi @)
                if (identifier.Contains("@"))
                {
                    var user = await _userManager.FindByEmailAsync(identifier);
                    if (user != null)
                        memberId = user.Id;
                }
                else
                {
                    memberId = identifier;
                }

                if (!string.IsNullOrEmpty(memberId))
                {
                    group.Members.Add(new GroupMember
                    {
                        UserId = memberId,
                        IsAdmin = false
                    });
                }
            }

            await _unitOfWork.Groups.AddAsync(group);
            await _unitOfWork.SaveChangesAsync();

            response.StatusCode = HttpStatusCode.Created;
            response.Result = new GroupDTO
            {
                Id = group.Id,
                Name = group.Name,
                Messages = new List<GroupMessageDTO>()
            };

            // Notify members
            foreach (var member in group.Members)
            {
                await _messageNotifier.NotifyUserAsync(member.UserId, new
                {
                    GroupId = group.Id,
                    GroupName = group.Name,
                    Action = "AddedToGroup"
                });
            }

            return response;
        }

        // Dohvati sve grupe korisnika
        public async Task<ApiResponse> GetGroupsForUserAsync(string userId)
        {
            var response = new ApiResponse();

            var groups = await _unitOfWork.Groups.GetGroupsForUserAsync(userId);

            var tz = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");

            var dto = groups.Select(g => new GroupDTO
            {
                Id = g.Id,
                Name = g.Name,
                Messages = g.Messages
                    .OrderBy(m => m.SendAt)
                    .Select(m => new GroupMessageDTO
                    {
                        Id = m.Id,
                        SenderId = m.SenderId,
                        SenderEmail = m.Sender.Email,
                        Content = m.Content,
                        SendAt = TimeZoneInfo.ConvertTimeFromUtc(m.SendAt, tz)
                    }).ToList(),

                // Dodaj i clanove grupe
                Members = g.Members
                    .Select(m => new GroupMemberDTO
                    {
                        UserId = m.UserId,
                        Email = m.User.Email,
                        IsAdmin = m.IsAdmin
                    }).ToList()
            }).ToList();

            response.StatusCode = HttpStatusCode.OK;
            response.Result = dto;
            return response;
        }

        // Slanje poruke u grupu
        public async Task<ApiResponse> SendGroupMessageAsync(string senderId, string groupIdentifier, GroupMessageCreateDTO dto)
        {
            var response = new ApiResponse();

            if (string.IsNullOrWhiteSpace(dto.Content))
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ErrorMessages.Add("Poruka ne može biti prazna.");
                return response;
            }

            // Dozvoli da groupIdentifier bude ID (int u stringu) ili ime grupe
            Group? group = null;
            if (int.TryParse(groupIdentifier, out int groupId))
            {
                group = await _unitOfWork.Groups.GetByIdAsync(groupId);
            }
            else
            {
                group = await _unitOfWork.Groups.GetByNameAsync(groupIdentifier);
            }

            if (group == null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.NotFound;
                response.ErrorMessages.Add("Grupa nije pronađena.");
                return response;
            }

            var message = new GroupMessage
            {
                GroupId = group.Id,
                SenderId = senderId,
                Content = dto.Content,
                SendAt = DateTime.UtcNow
            };

            group.Messages.Add(message);
            _unitOfWork.Groups.Update(group);
            await _unitOfWork.SaveChangesAsync();

            var senderUser = await _userManager.FindByIdAsync(senderId);

            // Formatiranje vremena u lokalno
            var myTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");
            var localTime = TimeZoneInfo.ConvertTimeFromUtc(message.SendAt, myTimeZone);

            var messageDto = new GroupMessageDTO
            {
                Id = message.Id,
                SenderId = senderId,
                SenderEmail = senderUser?.Email ?? string.Empty,
                Content = dto.Content,
                SendAt = localTime,
            };

            //Realtime payload
            var realTimePayload = new
            {
                GroupId = group.Id,
                GroupName = group.Name,
                Message = new
                {
                    Id = message.Id,
                    SenderId = senderId,
                    SenderEmail = senderUser?.Email ?? string.Empty,
                    Content = dto.Content,
                    SendAt = localTime.ToString("yyyy-MM-ddTHH:mm:ss"),
                },
                Action = "NewGroupMessage"
            };

            // Notify all group members
            foreach (var member in group.Members)
            {
                await _messageNotifier.NotifyUserAsync(member.UserId, realTimePayload);
            }

            response.StatusCode = HttpStatusCode.OK;
            response.Result = new
            {
                message.Id,
                message.SenderId,
                SenderEmail = senderUser?.Email ?? "",
                message.Content,
                SendAt = localTime.ToString("dd.MM.yyyy. HH:mm")
            };
            return response;
        }


        // Dohvati sve poruke grupe
        public async Task<ApiResponse> GetMessagesForGroupAsync(int groupId)
        {
            var response = new ApiResponse();

            var messages = await _unitOfWork.Groups.GetMessageForGroupAsync(groupId);

            var tz = TimeZoneInfo.FindSystemTimeZoneById("Central Europe Standard Time");

            var dto = messages.Select(m => new GroupMessageDTO
            {
                Id = m.Id,
                SenderId = m.SenderId,
                SenderEmail = m.Sender.Email,
                Content = m.Content,
                SendAt = TimeZoneInfo.ConvertTimeFromUtc(m.SendAt, tz)
            }).ToList();

            response.StatusCode = HttpStatusCode.OK;
            response.Result = dto;
            return response;
        }

        // Korisnik moze da napusti grupu ili da ga admin izbaci
        public async Task<ApiResponse> RemoveMemberAsync(string requesterId, int groupId, string memberId)
        {
            var response = new ApiResponse();

            var group = await _unitOfWork.Groups.GetByIdWithMembersAsync(groupId);
            if (group == null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.NotFound;
                response.ErrorMessages.Add("Grupa nije pronadjena.");
                return response;
            }

            var requester = group.Members.FirstOrDefault(m => m.UserId == requesterId);
            var member = group.Members.FirstOrDefault(m => m.UserId == memberId);

            if (requester == null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.Forbidden;
                response.ErrorMessages.Add("Niste clan ove grupe.");
                return response;
            }

            if (member == null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.NotFound;
                response.ErrorMessages.Add("Korisnik nije clan grupe.");
                return response;
            }

            // Ako korisnik sam sebe uklanja - izlazak iz grupe
            if (requesterId == memberId)
            {
                group.Members.Remove(member);
            }
            else
            {
                if (!requester.IsAdmin)
                {
                    response.IsSuccess = false;
                    response.StatusCode = HttpStatusCode.Forbidden;
                    response.ErrorMessages.Add("Samo admin moze izbaciti clana iz grupe.");
                    return response;
                }

                group.Members.Remove(member);
            }

            _unitOfWork.Groups.Update(group);
            await _unitOfWork.SaveChangesAsync();

            response.StatusCode = HttpStatusCode.OK;
            response.Result = new { Message = "Korisnik je uspesno uklonjen iz grupe." };

            return response;
        }

        public async Task<ApiResponse> DeleteGroupAsync(string requesterId, int groupId)
        {
            var response = new ApiResponse();

            var group = await _unitOfWork.Groups.GetByIdWithMembersAsync(groupId);
            if (group == null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.NotFound;
                response.ErrorMessages.Add("Grupa nije pronađena.");
                return response;
            }

            var requester = group.Members.FirstOrDefault(m => m.UserId == requesterId);

            if (requester == null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.Forbidden;
                response.ErrorMessages.Add("Niste član ove grupe.");
                return response;
            }

            if (!requester.IsAdmin)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.Forbidden;
                response.ErrorMessages.Add("Samo admin može obrisati grupu.");
                return response;
            }

            // Sve poruke i clanovi ce se obrisati automatski ako je u modelima uključen cascade delete
            _unitOfWork.Groups.Remove(group);
            await _unitOfWork.SaveChangesAsync();

            response.StatusCode = HttpStatusCode.OK;
            response.Result = new { Message = "Grupa je uspešno obrisana." };

            return response;
        }

    }
}
