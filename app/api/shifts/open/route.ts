import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { shifts, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Check if there's already an open shift for this user
        const existingOpenShift = await db
            .select()
            .from(shifts)
            .where(eq(shifts.userId, session.user.id))
            .limit(1);

        const openShift = existingOpenShift.find(shift => shift.status === "OPEN");

        if (openShift) {
            return NextResponse.json({
                error: "Shop is already open"
            }, { status: 400 });
        }

        // Create a new shift
        const [newShift] = await db.insert(shifts).values({
            status: "OPEN",
            startTime: new Date(),
            userId: session.user.id,
            totalSales: 0,
            totalTransactions: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();

        return NextResponse.json(newShift);
    } catch (error) {
        console.error("Failed to open shop:", error);
        return NextResponse.json(
            { error: "Failed to open shop" },
            { status: 500 }
        );
    }
}