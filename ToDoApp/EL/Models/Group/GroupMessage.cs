using EL.Models.User;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.Models.Group
{
    public class GroupMessage
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int GroupId { get; set; }
        [ForeignKey(nameof(GroupId))]
        public virtual Group Group { get; set; }

        [Required]
        public string SenderId { get; set; } = string.Empty;
        [ForeignKey(nameof(SenderId))]
        public virtual ApplicationUser Sender { get; set; }

        [Required]
        public string Content { get; set; } = string.Empty;

        public DateTime SentAt { get; set; } = DateTime.UtcNow;
    }
}
