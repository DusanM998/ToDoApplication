using EL.Common;
using EL.Models.Task;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DAL.QueryExtensions
{
    public static class TaskQueryExtensions
    {
        public static IQueryable<ToDoTask> ApplySearch(this IQueryable<ToDoTask> query, string? search, bool isAdmin = false)
        {
            if (string.IsNullOrWhiteSpace(search))
                return query;

            string loweredSearch = search.ToLower();

            return query.Where(t =>
                t.Title.ToLower().Contains(loweredSearch) ||
                (t.Description != null && t.Description.ToLower().Contains(loweredSearch)) ||
                (isAdmin && t.User.Name.ToLower().Contains(loweredSearch))
            );
        }
    }
}
