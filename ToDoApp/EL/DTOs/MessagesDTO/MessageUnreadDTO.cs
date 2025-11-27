using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.MessagesDTO
{
    public class MessageUnreadDTO
    {
        public int Id { get; set; }
        public string SenderId { get; set; }
        public string ReceiverId { get; set; }
        public string Content { get; set; }
        public DateTime SendAt { get; set; }
        public bool IsRead { get; set; }
        public string ImageUrls { get; set; }
    }
}
