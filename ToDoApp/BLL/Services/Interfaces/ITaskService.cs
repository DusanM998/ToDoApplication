using El.DTOs.ToDoTaskDTO;
using EL.Models.Task;
using EL.Shared;

namespace BLL.Services.Interfaces
{
    public interface ITaskService
    {
        Task<ApiResponse> GetAllTasks();
        Task<ApiResponse> GetTasksAsync(string userId);
        Task<ApiResponse> GetTaskByIdAsync(int id, string userId);
        Task<ApiResponse> CreateTaskAsync(ToDoTaskCreateDTO taskDto, string userId);
        Task<ApiResponse> UpdateTaskAsync(int id, ToDoTaskUpdateDTO taskDto, string userId);
        Task<ApiResponse> DeleteTaskAsync(int id, string userId);
        Task<ApiResponse> GetFilteredTasksAsync(
            string userId,
            string? search,
            StatusTaska? status,
            DateTime? dueDateFrom,
            DateTime? dueDateTo,
            int pageNumber = 1,
            int pageSize = 10);
    }
}
