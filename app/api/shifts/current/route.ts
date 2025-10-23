import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { shifts, eq, and } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get the current open shift for the user
        const currentShift = await db
            .select()
            .from(shifts)
            .where(and(
                eq(shifts.userId, session.user.id),
                eq(shifts.status, "OPEN")
            ))
            .limit(1);

        if (currentShift.length === 0) {
            return NextResponse.json(null);
        }

        return NextResponse.json(currentShift[0]);
    } catch (error) {
        console.error("Failed to fetch current shift:", error);
        return NextResponse.json(
            { error: "Failed to fetch current shift" },
            { status: 500 }
        );
    }
}