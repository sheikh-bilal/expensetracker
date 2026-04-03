"use server";

import connectDB from "@/lib/db";
import Expense from "@/models/Expense";
import Subscription from "@/models/Subscription";

export async function seedDatabase() {
  try {
    await connectDB();

    // Clear existing data
    await Expense.deleteMany({});
    await Subscription.deleteMany({});

    // Seed expenses
    const expenses = [
      { amount: 45.99, category: "food", subCategory: "Grocery", date: new Date("2026-03-25"), paymentMethod: "card", description: "Weekly grocery shopping" },
      { amount: 12.50, category: "food", subCategory: "Restaurant", date: new Date("2026-03-24"), paymentMethod: "upi", description: "Lunch at cafe" },
      { amount: 299.00, category: "shopping", subCategory: "Electronics", date: new Date("2026-03-22"), paymentMethod: "card", description: "New headphones" },
      { amount: 45.00, category: "transport", subCategory: "Gas", date: new Date("2026-03-20"), paymentMethod: "card", description: "Fuel refill" },
      { amount: 15.99, category: "entertainment", subCategory: "Movie", date: new Date("2026-03-18"), paymentMethod: "upi", description: "Movie tickets" },
      { amount: 120.00, category: "bills", subCategory: "Electricity", date: new Date("2026-03-15"), paymentMethod: "bank", description: "Monthly electricity bill" },
      { amount: 85.00, category: "health", subCategory: "Pharmacy", date: new Date("2026-03-12"), paymentMethod: "card", description: "Medicine and supplements" },
      { amount: 49.99, category: "education", subCategory: "Course", date: new Date("2026-03-10"), paymentMethod: "card", description: "Online course subscription" },
      { amount: 35.50, category: "food", subCategory: "Restaurant", date: new Date("2026-03-08"), paymentMethod: "cash", description: "Dinner with friends" },
      { amount: 199.00, category: "shopping", subCategory: "Clothing", date: new Date("2026-03-05"), paymentMethod: "card", description: "New jacket" },
      // February expenses
      { amount: 52.30, category: "food", subCategory: "Grocery", date: new Date("2026-02-28"), paymentMethod: "card", description: "Monthly grocery stock" },
      { amount: 380.00, category: "shopping", subCategory: "Electronics", date: new Date("2026-02-25"), paymentMethod: "card", description: "Smart watch" },
      { amount: 65.00, category: "transport", subCategory: "Gas", date: new Date("2026-02-20"), paymentMethod: "card", description: "Fuel refill" },
      { amount: 18.00, category: "entertainment", subCategory: "Gaming", date: new Date("2026-02-18"), paymentMethod: "upi", description: "Game purchase" },
      // January expenses
      { amount: 48.75, category: "food", subCategory: "Grocery", date: new Date("2026-01-30"), paymentMethod: "card", description: "Weekly grocery" },
      { amount: 250.00, category: "education", subCategory: "Course", date: new Date("2026-01-25"), paymentMethod: "card", description: "Certification course" },
      { amount: 55.00, category: "transport", subCategory: "Gas", date: new Date("2026-01-20"), paymentMethod: "card", description: "Fuel refill" },
    ];

    await Expense.insertMany(expenses);

    // Seed subscriptions
    const subscriptions = [
      { name: "Netflix", amount: 15.99, billingDate: new Date("2026-04-01"), category: "entertainment", isActive: true },
      { name: "Spotify", amount: 9.99, billingDate: new Date("2026-04-05"), category: "entertainment", isActive: true },
      { name: "Amazon Prime", amount: 14.99, billingDate: new Date("2026-04-15"), category: "entertainment", isActive: true },
      { name: "Gym", amount: 49.99, billingDate: new Date("2026-04-01"), category: "health", isActive: true },
      { name: "Adobe Creative", amount: 54.99, billingDate: new Date("2026-04-12"), category: "education", isActive: true },
    ];

    await Subscription.insertMany(subscriptions);

    return { success: true, message: "Database seeded successfully!" };
  } catch (error) {
    console.error("Error seeding database:", error);
    return { success: false, message: "Failed to seed database" };
  }
}
