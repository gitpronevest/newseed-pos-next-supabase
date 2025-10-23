import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { shifts, transactions, eq, and, sum } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the current open shift
        const currentShift = await db
            .select()
            .from(shifts)
            .where(and(
                eq(shifts.userId, session.user.id),
                eq(shifts.status, "OPEN")
            ))
            .limit(1);

        if (currentShift.length === 0) {
            return NextResponse.json({
                error: "No open shift found"
            }, { status: 400 });
        }

        const shift = currentShift[0];

        // Calculate total sales and transactions for this shift
        const shiftTransactions = await db
            .select()
            .from(transactions)
            .where(eq(transactions.shiftId, shift.id));

        const totalSales = shiftTransactions.reduce((sum, transaction) => sum + transaction.totalAmount, 0);

        const [updatedShift] = await db
            .update(shifts)
            .set({
                status: "CLOSED",
                endTime: new Date(),
                totalSales: totalSales,
                totalTransactions: shiftTransactions.length,
                updatedAt: new Date(),
            })
            .where(eq(shifts.id, shift.id))
            .returning();

        return NextResponse.json(updatedShift);
    } catch (error) {
        console.error("Failed to close shop:", error);
        return NextResponse.json(
            { error: "Failed to close shop" },
            { status: 500 }
        );
    }
}