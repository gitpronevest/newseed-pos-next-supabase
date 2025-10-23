import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { optionGroups } from "@/db/schema";

// GET all option groups
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const groups = await db
            .select()
            .from(optionGroups)
            .orderBy(optionGroups.name);

        return NextResponse.json(groups);
    } catch (error) {
        console.error("Failed to fetch option groups:", error);
        return NextResponse.json(
            { error: "Failed to fetch option groups" },
            { status: 500 }
        );
    }
}

// POST create new option group
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json(
                { error: "Option group name is required" },
                { status: 400 }
            );
        }

        const [newGroup] = await db
            .insert(optionGroups)
            .values({
                name,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json(newGroup);
    } catch (error) {
        console.error("Failed to create option group:", error);
        return NextResponse.json(
            { error: "Failed to create option group" },
            { status: 500 }
        );
    }
}