using BLL.Services.Interfaces;
using DAL.Repository.UoF.Implementations;
using DAL.Repository.UoF.Interfaces;
using El.DTOs.ToDoTaskDTO;
using EL.DTOs.ToDoTaskDTO;
using EL.Models.Task;
using EL.Shared;
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

        public TaskService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        //Dohvata sve taskove za datog korisnika
        public async Task<ApiResponse> GetTasksAsync(string userId)
        {
            var response = new ApiResponse();

            var tasks = await _unitOfWork.Tasks.GetAllAsync();
            var userTasks = tasks
                .Where(t => t.ApplicationUserId == userId)
                .OrderByDescending(t => t.CreatedAt)
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

            // Validacija podataka iz DTO-a (opciono, možeš koristiti FluentValidation ili ModelState u kontroleru)
            if (string.IsNullOrWhiteSpace(taskDto.Title))
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ErrorMessages.Add("Naslov taska je obavezan.");
                return response;
            }

            // Mapiranje DTO -> Entity
            var task = new ToDoTask
            {
                Title = taskDto.Title,
                Description = taskDto.Description,
                DueDate = taskDto.DueDate,
                ApplicationUserId = userId,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Tasks.AddAsync(task);
            await _unitOfWork.SaveChangesAsync();

            response.Result = task;
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

            task.Title = taskDto.Title;
            task.Description = taskDto.Description;
            task.DueDate = taskDto.DueDate;
            task.IsCompleted = taskDto.IsCompleted;

            _unitOfWork.Tasks.Update(task);
            await _unitOfWork.SaveChangesAsync();

            response.Result = task;
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
                    .OrderByDescending(t => t.CreatedAt);

                // Pretraga po naslovu/opisu
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(t =>
                        t.Title.Contains(search) ||
                        (t.Description != null && t.Description.Contains(search)));
                }

                // Filtriranje po statusu
                if (isCompleted.HasValue)
                {
                    query = query.Where(t => t.IsCompleted == isCompleted.Value);
                }

                // Filtriranje po roku (due date)
                if (dueDateFrom.HasValue)
                {
                    query = query.Where(t => t.DueDate >= dueDateFrom.Value);
                }
                if (dueDateTo.HasValue)
                {
                    query = query.Where(t => t.DueDate <= dueDateTo.Value);
                }

                // Pagination
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

                // Response
                response.Result = new FilteredTasksResult
                {
                    ToDoTasks = tasks,
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
