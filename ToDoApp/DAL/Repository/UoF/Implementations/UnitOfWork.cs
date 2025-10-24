using DAL.DbContexts;
using DAL.Repository.Implementations;
using DAL.Repository.Interfaces;
using DAL.Repository.UoF.Interfaces;
using EL.Models.Task;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repository.UoF.Implementations
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        public ITaskRepository Tasks { get; private set; }
        public IMessageRepository Messages { get; private set; }
        public UnitOfWork(ApplicationDbContext context, ITaskRepository tasks, IMessageRepository messages)
        {
            _context = context;
            Tasks = tasks;
            Messages = messages;
        }
        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
