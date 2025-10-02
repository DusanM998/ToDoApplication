using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DAL.Migrations
{
    /// <inheritdoc />
    public partial class SeedDataForUsersAndTasks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ToDoTasks",
                columns: new[] { "Id", "ApplicationUserId", "Category", "CreatedAt", "Description", "DueDate", "Priority", "Status", "Title" },
                values: new object[,]
                {
                    { 48, "b86af68e-2acd-4907-8017-9589d9ebefa8", "Work", new DateTime(2025, 10, 1, 12, 0, 0, 0, DateTimeKind.Utc), "Implement authentication and task CRUD", new DateTime(2025, 10, 15, 12, 0, 0, 0, DateTimeKind.Utc), 3, 1, "Finish backend API" },
                    { 49, "2b525ece-53a7-4446-bfab-d538f5724788", "Personal", new DateTime(2025, 10, 1, 12, 0, 0, 0, DateTimeKind.Utc), "Milk, Bread, Eggs", new DateTime(2025, 10, 14, 12, 0, 0, 0, DateTimeKind.Utc), 2, 1, "Buy groceries" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ToDoTasks",
                keyColumn: "Id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "ToDoTasks",
                keyColumn: "Id",
                keyValue: 49);
        }
    }
}
