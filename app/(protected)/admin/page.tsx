"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, ShoppingCart, Play, Square } from "lucide-react";

interface ShiftData {
    id: number;
    status: "OPEN" | "CLOSED";
    startTime?: number;
    endTime?: number;
    totalSales: number;
    totalTransactions: number;
}

interface ProductStats {
    totalProducts: number;
    activeProducts: number;
    lowStockProducts: number;
}

export default function AdminDashboard() {
    const [currentShift, setCurrentShift] = useState<ShiftData | null>(null);
    const [productStats, setProductStats] = useState<ProductStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Fetch current shift data and product stats
    useEffect(() => {
        fetchCurrentShift();
        fetchProductStats();

        // Set up real-time updates every 5 seconds when shop is open
        const interval = setInterval(() => {
            if (currentShift?.status === "OPEN") {
                fetchCurrentShift();
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [currentShift?.status]);

    const fetchCurrentShift = async () => {
        try {
            const response = await fetch("/api/shifts/current");
            if (response.ok) {
                const data = await response.json();
                setCurrentShift(data);
            }
        } catch (error) {
            console.error("Failed to fetch current shift:", error);
        }
    };

    const fetchProductStats = async () => {
        try {
            const response = await fetch("/api/stats/products");
            if (response.ok) {
                const data = await response.json();
                setProductStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch product stats:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenShop = async () => {
        try {
            const response = await fetch("/api/shifts/open", {
                method: "POST",
            });
            if (response.ok) {
                const newShift = await response.json();
                setCurrentShift(newShift);
            }
        } catch (error) {
            console.error("Failed to open shop:", error);
        }
    };

    const handleCloseShop = async () => {
        try {
            const response = await fetch("/api/shifts/close", {
                method: "POST",
            });
            if (response.ok) {
                const updatedShift = await response.json();
                setCurrentShift(updatedShift);
            }
        } catch (error) {
            console.error("Failed to close shop:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Manage your shop operations
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-20 bg-muted rounded"></div>
                                <div className="h-4 w-4 bg-muted rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-24 bg-muted rounded mb-2"></div>
                                <div className="h-3 w-32 bg-muted rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground">
                    Manage your shop operations and view real-time statistics
                </p>
            </div>

            {/* Shift Management */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Shop Status
                    </CardTitle>
                    <CardDescription>
                        Manage your sales shifts and track daily operations
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-semibold">
                                    {currentShift?.status === "OPEN" ? "Shop is Open" : "Shop is Closed"}
                                </h3>
                                <Badge variant={currentShift?.status === "OPEN" ? "default" : "secondary"}>
                                    {currentShift?.status || "CLOSED"}
                                </Badge>
                            </div>
                            {currentShift?.startTime && (
                                <p className="text-sm text-muted-foreground">
                                    Opened at {new Date(currentShift.startTime).toLocaleTimeString()}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-2">
                            {currentShift?.status === "OPEN" ? (
                                <Button onClick={handleCloseShop} variant="destructive">
                                    <Square className="mr-2 h-4 w-4" />
                                    Close Shop
                                </Button>
                            ) : (
                                <Button onClick={handleOpenShop}>
                                    <Play className="mr-2 h-4 w-4" />
                                    Open Shop
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Shift Sales
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            ${currentShift?.totalSales?.toFixed(2) || "0.00"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Current shift sales
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Current Shift Transactions
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {currentShift?.totalTransactions || 0}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            +0% from yesterday
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Active Products
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productStats?.activeProducts || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Available for sale
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Low Stock Items
                        </CardTitle>
                        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{productStats?.lowStockProducts || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            Need restocking
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                        Common tasks you might want to perform
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
                        <a href="/admin/pos">
                            <ShoppingCart className="h-6 w-6 mb-2" />
                            <div className="text-left">
                                <div className="font-medium">Start Selling</div>
                                <div className="text-sm text-muted-foreground">Open POS interface</div>
                            </div>
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
                        <a href="/admin/products">
                            <ShoppingCart className="h-6 w-6 mb-2" />
                            <div className="text-left">
                                <div className="font-medium">Manage Products</div>
                                <div className="text-sm text-muted-foreground">Add/edit products</div>
                            </div>
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
                        <a href="/admin/reports">
                            <DollarSign className="h-6 w-6 mb-2" />
                            <div className="text-left">
                                <div className="font-medium">View Reports</div>
                                <div className="text-sm text-muted-foreground">Sales analytics</div>
                            </div>
                        </a>
                    </Button>
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-start">
                        <a href="/admin/categories">
                            <ShoppingCart className="h-6 w-6 mb-2" />
                            <div className="text-left">
                                <div className="font-medium">Categories</div>
                                <div className="text-sm text-muted-foreground">Manage categories</div>
                            </div>
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}