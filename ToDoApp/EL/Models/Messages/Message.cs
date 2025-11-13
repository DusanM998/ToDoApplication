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
        [Key]
        public int Id { get; set; }
        [Required]
        public string SenderId { get; set; } = string.Empty;
        [ForeignKey(nameof(SenderId))]
        public virtual ApplicationUser Sender { get; set; }
        [Required]
        public string ReceiverId { get; set; } = string.Empty;
        [ForeignKey(nameof(ReceiverId))]
        public virtual ApplicationUser Receiver { get; set; }
        
        public string? Content { get; set; }
        public DateTime SendAt { get; set; } = DateTime.Now;
        public bool IsRead { get; set; } = false;

        public string? ImageUrls { get; set; }
    }
}
