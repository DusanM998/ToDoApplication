using AutoMapper;
using EL.DTOs.GroupDTO;
using EL.Models.Group;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Mapping
{
    public class GroupProfile : Profile
    {
        public GroupProfile()
        {
            // Mapping Group -> GroupDTO
            CreateMap<Group, GroupDTO>()
                .ForMember(dest => dest.Messages,
                    opt => opt.MapFrom(src => src.Messages))
                .ForMember(dest => dest.Members,
                    opt => opt.MapFrom(src => src.Members));

            // Mapping GroupMessage -> GroupMessageDTO
            CreateMap<GroupMember, GroupMemberDTO>()
                .ForMember(dest => dest.UserId,
                    opt => opt.MapFrom(src => src.UserId))
                .ForMember(dest => dest.Email,
                    opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.IsAdmin,
                    opt => opt.MapFrom(src => src.IsAdmin));

            // GroupMember → GroupMemberDTO
            CreateMap<GroupMessage, GroupMessageDTO>()
                .ForMember(dest => dest.SenderId,
                    opt => opt.MapFrom(src => src.SenderId))
                .ForMember(dest => dest.SenderEmail,
                    opt => opt.MapFrom(src => src.Sender.Email))
                .ForMember(dest => dest.Content,
                    opt => opt.MapFrom(src => src.Content))
                .ForMember(dest => dest.SendAt,
                    opt => opt.MapFrom(src => src.SendAt));

            CreateMap<GroupMessageCreateDTO, GroupMessage>()
                .ForMember(dest => dest.Content,
                opt => opt.MapFrom(src => src.Content));

        }
    }
}
