using BLL.Services.Interfaces;
using DAL.Repository.UoF.Implementations;
using DAL.Repository.UoF.Interfaces;
using El.DTOs.ToDoTaskDTO;
using EL.DTOs.ToDoTaskDTO;
using EL.Models.Task;
using EL.Models.User;
using EL.Shared;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services.Implementations
{
    public class TaskService : ITaskService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly UserManager<ApplicationUser> _userManager;

        public TaskService(IUnitOfWork unitOfWork, UserManager<ApplicationUser> userManager)
        {
            _unitOfWork = unitOfWork;
            _userManager = userManager;
        }

        //Dohvata sve taskove za datog korisnika
        public async Task<ApiResponse> GetTasksAsync(string userId)
        {
            var response = new ApiResponse();

            var tasks = await _unitOfWork.Tasks.GetAllAsync();
            var userTasks = tasks
                .Where(t => t.ApplicationUserId == userId)
                .OrderByDescending(t => t.DueDate)
                .ToList();

            response.Result = userTasks;
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }

        // Dobavljanje taska po ID sa proverom vlasnika
        public async Task<ApiResponse> GetTaskByIdAsync(int id, string userId)
        {
            var response = new ApiResponse();

            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task == null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.NotFound;
                response.ErrorMessages.Add("Task nije pronađen.");
                return response;
            }

            if (task.ApplicationUserId != userId)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.Forbidden;
                response.ErrorMessages.Add("Nemate pristup ovom tasku.");
                return response;
            }

            response.Result = task;
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }

        // Kreiranje novog taska
        public async Task<ApiResponse> CreateTaskAsync(ToDoTaskCreateDTO taskDto, string userId)
        {
            var response = new ApiResponse();

            if (string.IsNullOrWhiteSpace(taskDto.Title))
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ErrorMessages.Add("Naslov taska je obavezan.");
                return response;
            }

            var task = new ToDoTask
            {
                Title = taskDto.Title,
                Description = taskDto.Description,
                DueDate = taskDto.DueDate,
                Category = taskDto.Category,
                Priority = taskDto.Priority,
                ApplicationUserId = userId,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Tasks.AddAsync(task);

            // ažuriraj broj Pending taskova
            var user = await _userManager.FindByIdAsync(userId);
            if (user != null)
            {
                user.PendingTasksCount += 1;
                await _userManager.UpdateAsync(user);
            }

            await _unitOfWork.SaveChangesAsync();

            // MAPIRANJE na Response DTO
            var dto = new ToDoTaskResponseDTO
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Category = task.Category,
                Priority = (int)task.Priority,
                IsCompleted = task.IsCompleted,
                CreatedAt = task.CreatedAt,
                ApplicationUserId = task.ApplicationUserId
            };

            response.Result = dto;
            response.StatusCode = HttpStatusCode.Created;
            return response;
        }

        public async Task<ApiResponse> UpdateTaskAsync(int id, ToDoTaskUpdateDTO taskDto, string userId)
        {
            var response = new ApiResponse();

            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task == null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.NotFound;
                response.ErrorMessages.Add("Task nije pronađen.");
                return response;
            }

            if (task.ApplicationUserId != userId)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.Forbidden;
                response.ErrorMessages.Add("Nemate pristup ovom tasku.");
                return response;
            }

            var user = await _userManager.FindByIdAsync(userId);

            bool wasCompleted = task.IsCompleted;
            bool willBeCompleted = taskDto.IsCompleted;

            // update polja
            task.Title = taskDto.Title;
            task.Description = taskDto.Description;
            task.DueDate = taskDto.DueDate;
            task.IsCompleted = taskDto.IsCompleted;
            task.Category = taskDto.Category;
            task.Priority = taskDto.Priority;

            _unitOfWork.Tasks.Update(task);

            // update brojaca za korisnika
            if (user != null && wasCompleted != willBeCompleted)
            {
                if (willBeCompleted)
                {
                    user.CompletedTasksCount += 1;
                    user.PendingTasksCount -= 1;
                }
                else
                {
                    user.CompletedTasksCount -= 1;
                    user.PendingTasksCount += 1;
                }

                await _userManager.UpdateAsync(user);
            }

            await _unitOfWork.SaveChangesAsync();

            var dto = new ToDoTaskResponseDTO
            {
                Id = task.Id,
                Title = task.Title,
                Description = task.Description,
                DueDate = task.DueDate,
                Category = task.Category,
                Priority = (int)task.Priority,
                IsCompleted = task.IsCompleted,
                CreatedAt = task.CreatedAt,
                ApplicationUserId = task.ApplicationUserId
            };

            response.Result = dto;
            response.StatusCode = HttpStatusCode.OK;
            return response;
        }

        public async Task<ApiResponse> DeleteTaskAsync(int id, string userId)
        {
            var response = new ApiResponse();

            var task = await _unitOfWork.Tasks.GetByIdAsync(id);
            if (task == null)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.NotFound;
                response.ErrorMessages.Add("Task nije pronađen.");
                return response;
            }

            if (task.ApplicationUserId != userId)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.Forbidden;
                response.ErrorMessages.Add("Nemate pristup ovom tasku.");
                return response;
            }

            var user = await _userManager.FindByIdAsync(userId);

            // azuriraj broj Completed/Pending taskova pri brisanju
            if (user != null)
            {
                if (task.IsCompleted)
                {
                    user.CompletedTasksCount -= 1;
                }
                else
                {
                    user.PendingTasksCount -= 1;
                }

                await _userManager.UpdateAsync(user);
            }

            _unitOfWork.Tasks.Delete(task);
            await _unitOfWork.SaveChangesAsync();

            response.StatusCode = HttpStatusCode.NoContent;
            response.IsSuccess = true;
            return response;
        }

        public async Task<ApiResponse> GetFilteredTasksAsync(
            string userId,
            string? search,
            bool? isCompleted,
            DateTime? dueDateFrom,
            DateTime? dueDateTo,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var response = new ApiResponse();

            try
            {
                IQueryable<ToDoTask> query = (await _unitOfWork.Tasks.GetAllAsync())
                    .AsQueryable()
                    .Where(t => t.ApplicationUserId == userId)
                    .OrderByDescending(t => t.Priority)
                    .ThenByDescending(t => t.DueDate);

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(t =>
                        t.Title.Contains(search) ||
                        (t.Description != null && t.Description.Contains(search)));
                }

                if (isCompleted.HasValue)
                {
                    query = query.Where(t => t.IsCompleted == isCompleted.Value);
                }

                if (dueDateFrom.HasValue)
                {
                    query = query.Where(t => t.DueDate >= dueDateFrom.Value);
                }
                if (dueDateTo.HasValue)
                {
                    query = query.Where(t => t.DueDate <= dueDateTo.Value);
                }

                var totalRecords = query.Count();
                var tasks = query
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var pagination = new
                {
                    CurrentPage = pageNumber,
                    PageSize = pageSize,
                    TotalRecords = totalRecords,
                    TotalPages = (int)Math.Ceiling(totalRecords / (double)pageSize)
                };

                // Mapiranje u DTO
                var dtoTasks = tasks.Select(t => new ToDoTaskResponseDTO
                {
                    Id = t.Id,
                    Title = t.Title,
                    Description = t.Description,
                    DueDate = t.DueDate,
                    Category = t.Category,
                    Priority = (int)t.Priority,
                    IsCompleted = t.IsCompleted,
                    CreatedAt = t.CreatedAt,
                    ApplicationUserId = t.ApplicationUserId
                }).ToList();

                response.Result = new FilteredTasksResult
                {
                    ToDoTasks = dtoTasks,
                    Pagination = pagination
                };

                response.StatusCode = HttpStatusCode.OK;
            }
            catch (Exception ex)
            {
                response.IsSuccess = false;
                response.ErrorMessages = new List<string> { ex.Message };
                response.StatusCode = HttpStatusCode.InternalServerError;
            }

            return response;
        }
    }
}
