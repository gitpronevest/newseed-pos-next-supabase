import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { options } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT update option
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, price, optionGroupId, isAvailable } = body;
        const optionId = parseInt(params.id);

        const [updatedOption] = await db
            .update(options)
            .set({
                ...(name && { name }),
                ...(price !== undefined && { price }),
                ...(optionGroupId && { optionGroupId }),
                ...(isAvailable !== undefined && { isAvailable }),
                updatedAt: new Date(),
            })
            .where(eq(options.id, optionId))
            .returning();

        if (!updatedOption) {
            return NextResponse.json(
                { error: "Option not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedOption);
    } catch (error) {
        console.error("Failed to update option:", error);
        return NextResponse.json(
            { error: "Failed to update option" },
            { status: 500 }
        );
    }
}

// DELETE option
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const optionId = parseInt(params.id);

        const [deletedOption] = await db
            .delete(options)
            .where(eq(options.id, optionId))
            .returning();

        if (!deletedOption) {
            return NextResponse.json(
                { error: "Option not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete option:", error);
        return NextResponse.json(
            { error: "Failed to delete option" },
            { status: 500 }
        );
    }
}