using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.GroupDTO
{
    public class GroupDTO
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public List<GroupMessageDTO> Messages { get; set; } = new();
        public List<GroupMemberDTO> Members { get; set; } = new();
    }
}
