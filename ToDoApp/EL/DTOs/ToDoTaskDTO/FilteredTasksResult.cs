using EL.Models.Task;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace EL.DTOs.ToDoTaskDTO
{
    public class FilteredTasksResult
    {
        public IEnumerable<ToDoTaskResponseDTO> ToDoTasks { get; set; } = new List<ToDoTaskResponseDTO>();
        public object Pagination { get; set; }
    }
}
