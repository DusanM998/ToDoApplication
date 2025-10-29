using DAL.Repository.Interfaces;
using EL.Models.Group;
using EL.Models.Messages;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.Repository.UoF.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        ITaskRepository Tasks { get; }

        IMessageRepository Messages { get; }

        IGroupRepository Groups { get; }
        IRepository<GroupMessage> GroupMessages { get; }
        IRepository<GroupMember> GroupMembers { get; }

        Task SaveChangesAsync();
    }
}
