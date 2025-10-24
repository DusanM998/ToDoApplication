using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.MessagesDTO
{
    public class ConversationDTO
    {
        public string UserId { get; set; } = string.Empty;
        public List<MessageResponseDTO> Messages { get; set; } = new();
    }
}
