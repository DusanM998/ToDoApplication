using BLL.Services.Implementations;
using BLL.Services.Interfaces;
using El.DTOs.ToDoTaskDTO;
using EL.DTOs.ToDoTaskDTO;
using EL.Models.Task;
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
        [HttpGet("all")]
        public async Task<ActionResult<ApiResponse>> GetTasks()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            ApiResponse response;

            if (User.IsInRole("admin"))
            {
                response = await _taskService.GetAllTasks(); // admin vidi sve
            }
            else
            {
                response = await _taskService.GetTasksAsync(userId); // obican korisnik vidi svoje
            }

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

        // Azuriranje taska
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
            StatusTaska? status,
            DateTime? dueDateFrom,
            DateTime? dueDateTo,
            string? category,
            TaskPriority? priority,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var response = await _taskService.GetFilteredTasksAsync(
                userId,
                search,
                status,
                dueDateFrom,
                dueDateTo,
                category,
                priority,
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
