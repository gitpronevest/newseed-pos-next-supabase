import 'dotenv/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { user, session, account, verification } from '../db/schema/auth';
import { shifts, productCategories, optionGroups, options, products, transactions } from '../db/schema/pos';

const sqlite = new Database(process.env.DATABASE_URL!.replace('sqlite:', ''));
const db = drizzle(sqlite);

async function seed() {
    console.log('🌱 Starting database seeding...');

    try {
        // Create tables manually since we're using SQLite
        console.log('📋 Creating tables...');

        // User table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS user (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                email_verified INTEGER NOT NULL DEFAULT 0,
                image TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `);

        // Session table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS session (
                id TEXT PRIMARY KEY,
                expires_at INTEGER NOT NULL,
                token TEXT NOT NULL UNIQUE,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                ip_address TEXT,
                user_agent TEXT,
                user_id TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
            )
        `);

        // Account table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS account (
                id TEXT PRIMARY KEY,
                account_id TEXT NOT NULL,
                provider_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                access_token TEXT,
                refresh_token TEXT,
                id_token TEXT,
                access_token_expires_at INTEGER,
                refresh_token_expires_at INTEGER,
                scope TEXT,
                password TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
            )
        `);

        // Verification table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS verification (
                id TEXT PRIMARY KEY,
                identifier TEXT NOT NULL,
                value TEXT NOT NULL,
                expires_at INTEGER NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `);

        // Product Categories table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS product_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `);

        // Option Groups table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS option_groups (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL
            )
        `);

        // Options table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS options (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                option_group_id INTEGER,
                name TEXT NOT NULL,
                price REAL NOT NULL DEFAULT 0,
                is_available INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (option_group_id) REFERENCES option_groups(id) ON DELETE CASCADE
            )
        `);

        // Products table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                stock_quantity INTEGER NOT NULL DEFAULT 0,
                category_id INTEGER,
                linked_option_group_ids TEXT,
                is_available INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (category_id) REFERENCES product_categories(id) ON DELETE SET NULL
            )
        `);

        // Shifts table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS shifts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                status TEXT NOT NULL DEFAULT 'CLOSED',
                start_time INTEGER,
                end_time INTEGER,
                total_sales REAL NOT NULL DEFAULT 0,
                total_transactions INTEGER NOT NULL DEFAULT 0,
                user_id TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
            )
        `);

        // Transactions table
        sqlite.exec(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                shift_id INTEGER,
                transaction_id TEXT NOT NULL UNIQUE,
                items TEXT NOT NULL,
                total_amount REAL NOT NULL,
                payment_method TEXT NOT NULL,
                customer_name TEXT,
                customer_phone TEXT,
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                FOREIGN KEY (shift_id) REFERENCES shifts(id) ON DELETE CASCADE
            )
        `);

        console.log('✅ Tables created successfully!');

        // Insert sample data
        console.log('📝 Inserting sample data...');

        // Insert sample categories
        const insertCategory = sqlite.prepare(`
            INSERT OR IGNORE INTO product_categories (id, name, description, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?)
        `);

        insertCategory.run(1, 'Smoothies', 'Fresh and healthy smoothie options', Date.now(), Date.now());
        insertCategory.run(2, 'Coffee', 'Hot and cold coffee beverages', Date.now(), Date.now());
        insertCategory.run(3, 'Snacks', 'Light snacks and pastries', Date.now(), Date.now());

        // Insert sample option groups
        const insertOptionGroup = sqlite.prepare(`
            INSERT OR IGNORE INTO option_groups (id, name, created_at, updated_at)
            VALUES (?, ?, ?, ?)
        `);

        insertOptionGroup.run(1, 'Signature Add-Ons', Date.now(), Date.now());
        insertOptionGroup.run(2, 'Extra Ingredients', Date.now(), Date.now());

        // Insert sample options
        const insertOption = sqlite.prepare(`
            INSERT OR IGNORE INTO options (id, option_group_id, name, price, is_available, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        // Signature Add-ons
        insertOption.run(1, 1, 'Honey', 0.50, 1, Date.now(), Date.now());
        insertOption.run(2, 1, 'Yogurt', 0.75, 1, Date.now(), Date.now());
        insertOption.run(3, 1, 'Protein Powder', 1.00, 1, Date.now(), Date.now());

        // Extra Ingredients
        insertOption.run(4, 2, 'Extra Shot', 0.75, 1, Date.now(), Date.now());
        insertOption.run(5, 2, 'Almond Milk', 0.50, 1, Date.now(), Date.now());
        insertOption.run(6, 2, 'Vanilla Syrup', 0.50, 1, Date.now(), Date.now());

        // Insert sample products
        const insertProduct = sqlite.prepare(`
            INSERT OR IGNORE INTO products (id, name, price, stock_quantity, category_id, linked_option_group_ids, is_available, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertProduct.run(1, 'Green Smoothie', 6.50, 50, 1, '[1, 2]', 1, Date.now(), Date.now());
        insertProduct.run(2, 'Berry Blast', 7.00, 30, 1, '[1, 2]', 1, Date.now(), Date.now());
        insertProduct.run(3, 'Cappuccino', 4.50, 100, 2, '[4, 6]', 1, Date.now(), Date.now());
        insertProduct.run(4, 'Iced Latte', 5.00, 80, 2, '[4, 5]', 1, Date.now(), Date.now());
        insertProduct.run(5, 'Chocolate Croissant', 3.50, 20, 3, '[]', 1, Date.now(), Date.now());

        console.log('✅ Sample data inserted successfully!');
        console.log('🎉 Database seeded successfully!');

    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        sqlite.close();
    }
}

seed().catch(console.error);