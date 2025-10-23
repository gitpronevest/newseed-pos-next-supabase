import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

// PUT update product
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
        const { name, price, stockQuantity, categoryId, linkedOptionGroupIds, isAvailable } = body;
        const productId = parseInt(params.id);

        if (!name || price === undefined || stockQuantity === undefined) {
            return NextResponse.json(
                { error: "Name, price, and stock quantity are required" },
                { status: 400 }
            );
        }

        const [updatedProduct] = await db
            .update(products)
            .set({
                name,
                price,
                stockQuantity,
                categoryId: categoryId || null,
                linkedOptionGroupIds: JSON.stringify(linkedOptionGroupIds || []),
                isAvailable: isAvailable !== false,
                updatedAt: new Date(),
            })
            .where(eq(products.id, productId))
            .returning();

        if (!updatedProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error("Failed to update product:", error);
        return NextResponse.json(
            { error: "Failed to update product" },
            { status: 500 }
        );
    }
}

// DELETE product
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

        const productId = parseInt(params.id);

        const [deletedProduct] = await db
            .delete(products)
            .where(eq(products.id, productId))
            .returning();

        if (!deletedProduct) {
            return NextResponse.json(
                { error: "Product not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to delete product:", error);
        return NextResponse.json(
            { error: "Failed to delete product" },
            { status: 500 }
        );
    }
}