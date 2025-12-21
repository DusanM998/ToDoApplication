using EL.Models.User;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.Models.Messages
{
    public class Message
    {
        public int Id { get; set; }

        public string SenderId { get; set; } = string.Empty;
        public ApplicationUser Sender { get; set; }

        public string ReceiverId { get; set; } = string.Empty;
        public ApplicationUser Receiver { get; set; }

        public string? Content { get; set; }

        public DateTime SendAt { get; set; } = DateTime.UtcNow;

        public bool IsRead { get; set; } = false;
        public string? ImageUrls { get; set; }
    }
}
