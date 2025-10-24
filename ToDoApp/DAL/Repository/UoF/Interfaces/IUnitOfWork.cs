using DAL.Repository.Interfaces;
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
        
        Task SaveChangesAsync();
    }
}
