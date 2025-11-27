using EL.DTOs.UserDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.MessagesDTO
{
    public class MessageResponseDTO
    {
        public int Id { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string ReceiverId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SendAt { get; set; }
        public bool IsRead { get; set; }

        public UserDto Sender { get; set; } = new UserDto();
        public UserDto Receiver { get; set; } = new UserDto();

        public string? ImageUrls { get; set; }

    }
}
