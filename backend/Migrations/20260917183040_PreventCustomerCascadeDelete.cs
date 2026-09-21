using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class PreventCustomerCascadeDelete : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Users_PersonnelId",
                table: "Customers");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Users_PersonnelId",
                table: "Customers",
                column: "PersonnelId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Customers_Users_PersonnelId",
                table: "Customers");

            migrationBuilder.AddForeignKey(
                name: "FK_Customers_Users_PersonnelId",
                table: "Customers",
                column: "PersonnelId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
