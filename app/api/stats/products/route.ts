import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { products, eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    try {
        const session = await auth.api.getSession({
            headers: request.headers,
        });

        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get product statistics
        const allProducts = await db
            .select()
            .from(products);

        const activeProducts = allProducts.filter(product => product.isAvailable);
        const lowStockProducts = allProducts.filter(product => product.stockQuantity < 10);

        return NextResponse.json({
            totalProducts: allProducts.length,
            activeProducts: activeProducts.length,
            lowStockProducts: lowStockProducts.length,
        });
    } catch (error) {
        console.error("Failed to fetch product stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch product stats" },
            { status: 500 }
        );
    }
}