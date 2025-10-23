import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { transactions, products, shifts } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

interface CartItem {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    selectedOptions: {
        optionId: number;
        optionName: string;
        optionPrice: number;
    }[];
}

// POST create new transaction
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { shiftId, items, totalAmount, paymentMethod, customerName, customerPhone } = body;

        if (!shiftId || !items || !totalAmount || !paymentMethod) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Verify shift is open
        const [shift] = await db
            .select()
            .from(shifts)
            .where(eq(shifts.id, shiftId));

        if (!shift || shift.status !== "OPEN") {
            return NextResponse.json(
                { error: "Invalid or closed shift" },
                { status: 400 }
            );
        }

        // Generate human-readable transaction ID
        const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const transactionId = `TRX-${date}-${random}`;

        // Create transaction
        const [newTransaction] = await db
            .insert(transactions)
            .values({
                shiftId,
                transactionId,
                items: JSON.stringify(items),
                totalAmount,
                paymentMethod,
                customerName: customerName || null,
                customerPhone: customerPhone || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        // Update product stock
        for (const item of items as CartItem[]) {
            await db
                .update(products)
                .set({
                    stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
                    updatedAt: new Date(),
                })
                .where(eq(products.id, item.productId));
        }

        return NextResponse.json(newTransaction);
    } catch (error) {
        console.error("Failed to create transaction:", error);
        return NextResponse.json(
            { error: "Failed to create transaction" },
            { status: 500 }
        );
    }
}