using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.GroupDTO
{
    public class GroupMessageDTO
    {
        public int Id { get; set; }
        public string SenderId { get; set; } = string.Empty;
        public string SenderEmail { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime SendAt { get; set; }
    }
}
