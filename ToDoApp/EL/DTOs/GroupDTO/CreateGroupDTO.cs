using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.GroupDTO
{
    public class CreateGroupDTO
    {
        public string Name { get; set; } = string.Empty;
        public List<string> Members { get; set; } = new();
    }
}
