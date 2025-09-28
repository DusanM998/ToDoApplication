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
        public IEnumerable<ToDoTask> ToDoTasks { get; set; }
        public object Pagination { get; set; }
    }
}
