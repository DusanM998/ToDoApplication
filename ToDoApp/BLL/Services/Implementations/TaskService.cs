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
using System.Net.NetworkInformation;
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

        // Dohvata sve taskove za sve korisnike
        public async Task<ApiResponse> GetAllTasks()
        {
            var response = new ApiResponse();

            var tasks = await _unitOfWork.Tasks.GetAllWithUsersAsync();

            response.Result = tasks;
            response.StatusCode = HttpStatusCode.OK;
            return response;
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

            var today = DateTime.UtcNow.Date;
            // Provera da li je dueDate prosao
            if (taskDto.DueDate.HasValue && taskDto.DueDate.Value.Date < today)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ErrorMessages.Add("Rok za task ne moze biti u proslosti!. Izaberite drugi datum.");
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
                Status = EL.Models.Task.StatusTaska.Pending,
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
                Status = task.Status,
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

            var today = DateTime.UtcNow.Date;
            if (taskDto.DueDate.HasValue && taskDto.DueDate.Value.Date < today)
            {
                response.IsSuccess = false;
                response.StatusCode = HttpStatusCode.BadRequest;
                response.ErrorMessages.Add("Rok za task ne moze biti u proslosti!. Izaberite drugi datum.");
                return response;
            }

            var user = await _userManager.FindByIdAsync(userId);

            var oldStatus = task.Status;
            var newStatus = taskDto.Status ?? StatusTaska.Pending;

            // update polja samo ako su vrednosti prosledjene
            if (taskDto.Title != null) task.Title = taskDto.Title;
            if (taskDto.Description != null) task.Description = taskDto.Description;
            if (taskDto.DueDate.HasValue) task.DueDate = taskDto.DueDate;
            if (taskDto.Category != null) task.Category = taskDto.Category;
            if (taskDto.Priority.HasValue) task.Priority = taskDto.Priority.Value;
            task.Status = newStatus;

            _unitOfWork.Tasks.Update(task);

            // update brojaca za korisnika
            if (user != null && oldStatus != newStatus)
            {
                // Skidam staro stanje
                if (oldStatus == StatusTaska.Completed)
                    user.CompletedTasksCount -= 1;
                else if (oldStatus == StatusTaska.Pending)
                    user.PendingTasksCount -= 1;
                else if (oldStatus == StatusTaska.Overdue)
                    user.OverdueTasksCount -= 1;

                // dodaj novo stanje
                if (newStatus == StatusTaska.Completed)
                    user.CompletedTasksCount += 1;
                else if (newStatus == StatusTaska.Pending)
                    user.PendingTasksCount += 1;
                else if (newStatus == StatusTaska.Overdue)
                    user.OverdueTasksCount += 1;

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
                Status = task.Status,
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

            // azuriraj broj Completed/Pending/Overdue taskova pri brisanju
            if (user != null)
            {
                if (task.Status == StatusTaska.Completed)
                    user.CompletedTasksCount -= 1;
                else if (task.Status == StatusTaska.Pending)
                    user.PendingTasksCount -= 1;
                else if (task.Status == StatusTaska.Overdue)
                    user.OverdueTasksCount -= 1;

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
            StatusTaska? status,
            DateTime? dueDateFrom,
            DateTime? dueDateTo,
            string? category,
            TaskPriority? priority,
            int pageNumber = 1,
            int pageSize = 10)
        {
            var response = new ApiResponse();

            try
            {
                IQueryable<ToDoTask> query = (await _unitOfWork.Tasks.GetAllAsync())
                    .AsQueryable()
                    .Where(t => t.ApplicationUserId == userId) // Filter taskova tako da se uzmu samo oni koji pripadaju trenutno ulogovanom korisniku
                    .OrderByDescending(t => t.Priority)
                    .ThenByDescending(t => t.DueDate);

                // Filter po nazivu taska
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(t =>
                        t.Title.Contains(search) ||
                        (t.Description != null && t.Description.Contains(search)));
                }

                // Filter po statusu 
                if (status.HasValue)
                {
                    query = query.Where(t => t.Status == status.Value);
                }

                //...po datumu (od)
                if (dueDateFrom.HasValue)
                {
                    query = query.Where(t => t.DueDate >= dueDateFrom.Value);
                }
                //..do
                if (dueDateTo.HasValue)
                {
                    query = query.Where(t => t.DueDate <= dueDateTo.Value);
                }

                // Filter po kategoriji
                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(t => t.Category == category);
                }

                // Filter po prioritetu
                if(priority.HasValue)
                {
                    query = query.Where(t => t.Priority == priority.Value);
                }

                var totalRecords = query.Count(); // Vraca ukupan broj taskova nakon primene svih filtera
                var tasks = query
                    .Skip((pageNumber - 1) * pageSize) // Preskace prvih 10 elemenata (pocev od prvog)
                    .Take(pageSize) // uzima odredjeni broj elemenata nakon sto su neki preskoceni
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
                    Status = t.Status,
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

        // Metoda koja prolazi kroz sve taskove i azurira im status na "Overdue"
        // Ako ih korisnik nije oznacio kao zavrsene
        public async Task<ApiResponse> UpdateOverdueTasksAsync()
        {
            var response = new ApiResponse();

            // uzmi sve taskove
            var tasks = await _unitOfWork.Tasks.GetAllAsync(); // prvo pribavljam sve taskove

            var now = DateTime.UtcNow;
            var updatedCount = 0;

            foreach (var task in tasks)
            {
                // filtriram
                // samo one koji imaju due date u proslosti i nisu Completed
                if (task.DueDate.HasValue &&
                    task.DueDate.Value < now &&
                    task.Status != StatusTaska.Completed &&
                    task.Status != StatusTaska.Overdue)
                {
                    var user = await _userManager.FindByIdAsync(task.ApplicationUserId); // uzimam taskove za konkretnog korisnika 
                    if (user != null)
                    {
                        // Azuriram im status od Pending(U toku) na Overdue(isteko)
                        if (task.Status == StatusTaska.Pending)
                        {
                            user.PendingTasksCount -= 1;
                            user.OverdueTasksCount += 1;
                        }

                        await _userManager.UpdateAsync(user); // Azuriram korisnikove informacije
                    }

                    task.Status = StatusTaska.Overdue;
                    _unitOfWork.Tasks.Update(task); // Azuriram taskove
                    updatedCount++; //broj azuriranih taskova
                }
            }

            await _unitOfWork.SaveChangesAsync(); // Snimam promene u bazi

            // Vracam rezultat
            response.IsSuccess = true;
            response.StatusCode = HttpStatusCode.OK;
            response.Result = $"{updatedCount} taskova je automatski označeno kao Overdue.";
            return response;
        }
    }
}
