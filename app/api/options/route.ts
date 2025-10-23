import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { options, optionGroups } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET all options
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const allOptions = await db
            .select({
                id: options.id,
                optionGroupId: options.optionGroupId,
                name: options.name,
                price: options.price,
                isAvailable: options.isAvailable,
                createdAt: options.createdAt,
                updatedAt: options.updatedAt,
            })
            .from(options)
            .orderBy(desc(options.createdAt));

        return NextResponse.json(allOptions);
    } catch (error) {
        console.error("Failed to fetch options:", error);
        return NextResponse.json(
            { error: "Failed to fetch options" },
            { status: 500 }
        );
    }
}

// POST create new option
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, price, optionGroupId, isAvailable } = body;

        if (!name || price === undefined || !optionGroupId) {
            return NextResponse.json(
                { error: "Name, price, and option group are required" },
                { status: 400 }
            );
        }

        const [newOption] = await db
            .insert(options)
            .values({
                name,
                price,
                optionGroupId,
                isAvailable: isAvailable !== false,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json(newOption);
    } catch (error) {
        console.error("Failed to create option:", error);
        return NextResponse.json(
            { error: "Failed to create option" },
            { status: 500 }
        );
    }
}