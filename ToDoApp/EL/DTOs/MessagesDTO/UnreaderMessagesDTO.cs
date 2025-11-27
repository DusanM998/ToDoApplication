using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.MessagesDTO
{
    public class UnreaderMessagesDTO
    {
        public int TotalMessages { get; set; }
        public List<MessageUnreadDTO> Messages { get; set; }
    }
}
