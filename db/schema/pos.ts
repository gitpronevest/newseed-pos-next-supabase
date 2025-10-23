import { sqliteTable, integer, text, real, boolean } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

// Shifts table for managing sales shifts
export const shifts = sqliteTable("shifts", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    status: text("status").notNull().default("CLOSED"), // OPEN, CLOSED
    startTime: integer("start_time", { mode: "timestamp" }),
    endTime: integer("end_time", { mode: "timestamp" }),
    totalSales: real("total_sales").default(0).notNull(),
    totalTransactions: integer("total_transactions").default(0).notNull(),
    userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Product categories
export const productCategories = sqliteTable("product_categories", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Option groups (add-on categories)
export const optionGroups = sqliteTable("option_groups", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Individual options (add-ons)
export const options = sqliteTable("options", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    optionGroupId: integer("option_group_id").references(() => optionGroups.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    price: real("price").default(0).notNull(),
    isAvailable: boolean("is_available").default(true).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Products
export const products = sqliteTable("products", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    price: real("price").notNull(),
    stockQuantity: integer("stock_quantity").default(0).notNull(),
    categoryId: integer("category_id").references(() => productCategories.id, { onDelete: "set null" }),
    linkedOptionGroupIds: text("linked_option_group_ids"), // JSON string for SQLite
    isAvailable: boolean("is_available").default(true).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Transactions
export const transactions = sqliteTable("transactions", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    shiftId: integer("shift_id").references(() => shifts.id, { onDelete: "cascade" }),
    transactionId: text("transaction_id").notNull().unique(), // Human-readable ID like TRX-20251022-001
    items: text("items").notNull(), // JSON string for SQLite
    totalAmount: real("total_amount").notNull(),
    paymentMethod: text("payment_method").notNull(), // CASH, CARD, QRIS
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// Transaction item structure (for the items JSONB field)
export interface TransactionItem {
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    selectedOptions: {
        optionId: number;
        optionName: string;
        optionPrice: string;
    }[];
}

// Types for TypeScript
export type Shift = typeof shifts.$inferSelect;
export type NewShift = typeof shifts.$inferInsert;
export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;
export type OptionGroup = typeof optionGroups.$inferSelect;
export type NewOptionGroup = typeof optionGroups.$inferInsert;
export type Option = typeof options.$inferSelect;
export type NewOption = typeof options.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;