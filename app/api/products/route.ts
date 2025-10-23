import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { products } from "@/db/schema";
import { desc } from "drizzle-orm";

// GET all products
export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const allProducts = await db
            .select()
            .from(products)
            .orderBy(desc(products.createdAt));

        return NextResponse.json(allProducts);
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

// POST create new product
export async function POST(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, price, stockQuantity, categoryId, linkedOptionGroupIds, isAvailable } = body;

        if (!name || price === undefined || stockQuantity === undefined) {
            return NextResponse.json(
                { error: "Name, price, and stock quantity are required" },
                { status: 400 }
            );
        }

        const [newProduct] = await db
            .insert(products)
            .values({
                name,
                price,
                stockQuantity,
                categoryId: categoryId || null,
                linkedOptionGroupIds: JSON.stringify(linkedOptionGroupIds || []),
                isAvailable: isAvailable !== false,
                createdAt: new Date(),
                updatedAt: new Date(),
            })
            .returning();

        return NextResponse.json(newProduct);
    } catch (error) {
        console.error("Failed to create product:", error);
        return NextResponse.json(
            { error: "Failed to create product" },
            { status: 500 }
        );
    }
}