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
                .ForMember(dest => dest.Messages, opt => opt.MapFrom(src => src.Messages))
                .ForMember(dest => dest.Members, opt => opt.MapFrom(src => src.Members));

            // Mapping GroupMessage -> GroupMessageDTO
            CreateMap<Group, GroupMessageDTO>()
                .ForMember(dest => dest.SenderEmail, opt => opt.MapFrom(src => src.Sender.Email));

            // GroupMember → GroupMemberDTO
            CreateMap<GroupMember, GroupMemberDTO>()
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.User.Email));
        }
    }
}
