using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.MessagesDTO
{
    public class MessageCreateDTO
    {
        public string? ReceiverId { get; set; }
        public string? ReceiverEmail { get; set; }
        public string Content { get; set; } = string.Empty;
    }
}
