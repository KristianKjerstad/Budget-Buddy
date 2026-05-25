using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Data.Migrations
{
    /// <inheritdoc />
    public partial class PopulateCategoriesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "Name", "Description" },
                values: new object[,]
                {
                    { new Guid("550e8400-e29b-41d4-a716-446655440001"), "Food", "Groceries and food purchases" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440002"), "Subscription", "Recurring subscriptions and memberships" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440003"), "Transportation", "Gas, parking, public transit" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440004"), "Restaurant", "Dining out and takeout" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440005"), "Other", "Miscellaneous expenses" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440006"), "Entertainment", "Movies, games, hobbies" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440007"), "Clothing", "Apparel and accessories" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440008"), "Travel", "Flights, hotels, vacation" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440009"), "Insurance", "Health, auto, home insurance" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440010"), "Vipps", "Vipps transfers and payments" },
                    { new Guid("550e8400-e29b-41d4-a716-446655440011"), "Bar", "Drinks and nightlife" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValues: new object[]
                {
                    new Guid("550e8400-e29b-41d4-a716-446655440001"),
                    new Guid("550e8400-e29b-41d4-a716-446655440002"),
                    new Guid("550e8400-e29b-41d4-a716-446655440003"),
                    new Guid("550e8400-e29b-41d4-a716-446655440004"),
                    new Guid("550e8400-e29b-41d4-a716-446655440005"),
                    new Guid("550e8400-e29b-41d4-a716-446655440006"),
                    new Guid("550e8400-e29b-41d4-a716-446655440007"),
                    new Guid("550e8400-e29b-41d4-a716-446655440008"),
                    new Guid("550e8400-e29b-41d4-a716-446655440009"),
                    new Guid("550e8400-e29b-41d4-a716-446655440010"),
                    new Guid("550e8400-e29b-41d4-a716-446655440011")
                });
        }
    }
}
