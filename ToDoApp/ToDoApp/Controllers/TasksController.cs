using BLL.Services.Implementations;
using BLL.Services.Interfaces;
using El.DTOs.ToDoTaskDTO;
using EL.DTOs.ToDoTaskDTO;
using EL.Shared;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net;
using System.Security.Claims;
using ToDoApp.Models;

namespace ToDoApp.Controllers
{
    [Route("api/tasks")]
    [ApiController]
    public class TasksController : ControllerBase
    {
        private readonly ITaskService _taskService;

        public TasksController(ITaskService taskService)
        {
            _taskService = taskService;
        }

        // Dohvatanje svih taskova za trenutnog korisnika
        [HttpGet]
        public async Task<ActionResult<ApiResponse>> GetTasks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _taskService.GetTasksAsync(userId);
            return StatusCode((int)response.StatusCode, response);
        }

        // Dohvatanje taska po ID
        [HttpGet("{id:int}")]
        public async Task<ActionResult<ApiResponse>> GetTaskById(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _taskService.GetTaskByIdAsync(id, userId);
            return StatusCode((int)response.StatusCode, response);
        }

        // Kreiranje novog taska
        [HttpPost]
        public async Task<ActionResult<ApiResponse>> CreateTask([FromBody] ToDoTaskCreateDTO taskDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _taskService.CreateTaskAsync(taskDto, userId);
            return StatusCode((int)response.StatusCode, response);
        }

        // Ažuriranje taska
        [HttpPut("{id:int}")]
        public async Task<ActionResult<ApiResponse>> UpdateTask(int id, [FromBody] ToDoTaskUpdateDTO taskDto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _taskService.UpdateTaskAsync(id, taskDto, userId);
            return StatusCode((int)response.StatusCode, response);
        }

        // Brisanje taska
        [HttpDelete("{id:int}")]
        public async Task<ActionResult<ApiResponse>> DeleteTask(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _taskService.DeleteTaskAsync(id, userId);
            return StatusCode((int)response.StatusCode, response);
        }

        [HttpGet("filter")]
        public async Task<IActionResult> GetFilteredTasks(
            string? search,
            bool? isCompleted,
            DateTime? dueDateFrom,
            DateTime? dueDateTo,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _taskService.GetFilteredTasksAsync(
                userId,
                search,
                isCompleted,
                dueDateFrom,
                dueDateTo,
                pageNumber,
                pageSize);

            if (!response.IsSuccess)
                return StatusCode((int)response.StatusCode, response);

            var result = (FilteredTasksResult)response.Result;

            Response.Headers.Append("X-Pagination",
                System.Text.Json.JsonSerializer.Serialize(result.Pagination));

            return Ok(result.ToDoTasks);
        }
    }
}
