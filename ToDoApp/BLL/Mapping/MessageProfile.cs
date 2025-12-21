using AutoMapper;
using EL.DTOs.MessagesDTO;
using EL.Models.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Mapping
{
    public class MessageProfile : Profile
    {
        public MessageProfile()
        {
            // Message -> MessageResponseDTO
            CreateMap<Message, MessageResponseDTO>()
                .ForMember(dest => dest.Sender, opt =>
                    opt.MapFrom(src => src.Sender))
                .ForMember(dest => dest.Receiver, opt =>
                    opt.MapFrom(src => src.Receiver))
                .ForMember(dest => dest.ImageUrls, opt =>
                    opt.MapFrom(src => src.ImageUrls));

            // MessageCreateDTO -> Message
            CreateMap<MessageCreateDTO, Message>()
                .ForMember(dest => dest.ImageUrls, opt =>
                    opt.Ignore()) // upload se radi posebno
                .ForMember(dest => dest.SendAt, opt =>
                    opt.MapFrom(_ => DateTime.UtcNow))
                .ForMember(dest => dest.IsRead, opt =>
                    opt.MapFrom(_ => false))
                .ForMember(dest => dest.Sender, opt =>
                    opt.Ignore())
                .ForMember(dest => dest.Receiver, opt =>
                    opt.Ignore());

            // Message -> MessageUnreadDTO
            CreateMap<Message, MessageUnreadDTO>();

            // Message -> ConversationDTO (koristi se kad već imaš grupisane poruke)
            CreateMap<Message, ConversationDTO>()
                .ForMember(dest => dest.UserId, opt => opt.Ignore())
                .ForMember(dest => dest.Messages, opt => opt.Ignore());
        }
    }
}
