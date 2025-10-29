using DAL.DbContexts;
using DAL.Repository.Implementations;
using DAL.Repository.Interfaces;
using DAL.Repository.UoF.Interfaces;
using EL.Models.Group;
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
        public IGroupRepository Groups { get; private set; }
        public IRepository<GroupMessage> GroupMessages { get; private set; }
        public IRepository<GroupMember> GroupMembers { get; private set; }
        public UnitOfWork(ApplicationDbContext context, ITaskRepository tasks,
            IMessageRepository messages,
            IGroupRepository groupRepository,
            IRepository<GroupMessage> groupMessages,
            IRepository<GroupMember> groupMembers)
        {
            _context = context;
            Tasks = tasks;
            Messages = messages;
            Groups = groupRepository;
            GroupMessages = groupMessages;
            GroupMembers = groupMembers;
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
