"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Plus, Minus, X, CreditCard, DollarSign, QrCode, Receipt, Package, Store } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    categoryId?: number;
    linkedOptionGroupIds: string;
    isAvailable: boolean;
}

interface ProductCategory {
    id: number;
    name: string;
    description?: string;
}

interface Option {
    id: number;
    optionGroupId: number;
    name: string;
    price: number;
    isAvailable: boolean;
}

interface OptionGroup {
    id: number;
    name: string;
}

interface CartItem {
    productId: number;
    productName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    selectedOptions: {
        optionId: number;
        optionName: string;
        optionPrice: number;
    }[];
}

interface CurrentShift {
    id: number;
    status: "OPEN" | "CLOSED";
}

export default function POSPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [options, setOptions] = useState<Option[]>([]);
    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
    const [currentShift, setCurrentShift] = useState<CurrentShift | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    const [lastTransactionId, setLastTransactionId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [paymentForm, setPaymentForm] = useState({
        customerName: "",
        customerPhone: "",
        paymentMethod: "CASH" as "CASH" | "CARD" | "QRIS",
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes, optionsRes, groupsRes, shiftRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/categories"),
                fetch("/api/options"),
                fetch("/api/option-groups"),
                fetch("/api/shifts/current"),
            ]);

            if (productsRes.ok) {
                const productsData = await productsRes.json();
                setProducts(productsData.filter((p: Product) => p.isAvailable));
            }
            if (categoriesRes.ok) setCategories(await categoriesRes.json());
            if (optionsRes.ok) setOptions(await optionsRes.json());
            if (groupsRes.ok) setOptionGroups(await groupsRes.json());
            if (shiftRes.ok && shiftRes.status !== 204) {
                setCurrentShift(await shiftRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch POS data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredProducts = selectedCategory === "all"
        ? products
        : products.filter(p => p.categoryId === parseInt(selectedCategory));

    const addToCart = (product: Product) => {
        const linkedOptionGroupIds = JSON.parse(product.linkedOptionGroupIds || "[]");

        setCart(prev => {
            const existingItem = prev.find(item => item.productId === product.id);

            if (existingItem) {
                return prev.map(item =>
                    item.productId === product.id
                        ? {
                            ...item,
                            quantity: item.quantity + 1,
                            totalPrice: (item.quantity + 1) * item.unitPrice
                        }
                        : item
                );
            }

            return [...prev, {
                productId: product.id,
                productName: product.name,
                unitPrice: product.price,
                quantity: 1,
                totalPrice: product.price,
                selectedOptions: [],
                linkedOptionGroupIds,
            }];
        });
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.productId === productId) {
                const newQuantity = item.quantity + delta;
                if (newQuantity <= 0) return null;
                return {
                    ...item,
                    quantity: newQuantity,
                    totalPrice: newQuantity * item.unitPrice
                };
            }
            return item;
        }).filter(Boolean) as CartItem[]);
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => {
            const optionsTotal = item.selectedOptions.reduce((optSum, opt) => optSum + opt.optionPrice, 0);
            return sum + (item.totalPrice + (optionsTotal * item.quantity));
        }, 0);
    };

    const processPayment = async () => {
        if (!currentShift) {
            alert("Shop must be open to process transactions");
            return;
        }

        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    shiftId: currentShift.id,
                    items: cart,
                    totalAmount: calculateTotal(),
                    paymentMethod: paymentForm.paymentMethod,
                    customerName: paymentForm.customerName || null,
                    customerPhone: paymentForm.customerPhone || null,
                }),
            });

            if (response.ok) {
                const transaction = await response.json();
                setLastTransactionId(transaction.transactionId);
                setCart([]);
                setPaymentForm({ customerName: "", customerPhone: "", paymentMethod: "CASH" });
                setIsPaymentOpen(false);
                setIsReceiptOpen(true);
            }
        } catch (error) {
            console.error("Failed to process payment:", error);
            alert("Failed to process payment. Please try again.");
        }
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "All";
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || "Unknown";
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground animate-pulse" />
                    <p className="mt-2 text-muted-foreground">Loading POS...</p>
                </div>
            </div>
        );
    }

    if (!currentShift) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Store className="mx-auto h-12 w-12 text-muted-foreground" />
                        <CardTitle>Shop is Closed</CardTitle>
                        <CardDescription>
                            Please open the shop from the dashboard to start processing transactions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="w-full">
                            <a href="/admin">Go to Dashboard</a>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center">
                    <div className="mr-4 flex">
                        <Store className="mr-2 h-6 w-6" />
                        <h1 className="text-lg font-semibold">Newseed POS</h1>
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                        <Badge variant="default" className="bg-green-500">
                            Shop Open
                        </Badge>
                        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
                            <SheetTrigger asChild>
                                <Button size="lg" className="relative">
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Cart
                                    {cart.length > 0 && (
                                        <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center text-xs">
                                            {cart.reduce((sum, item) => sum + item.quantity, 0)}
                                        </Badge>
                                    )}
                                </Button>
                            </SheetTrigger>
                            <SheetContent className="w-full sm:max-w-lg">
                                <SheetHeader>
                                    <SheetTitle>Shopping Cart</SheetTitle>
                                    <SheetDescription>
                                        Review your items before checkout
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="mt-6">
                                    {cart.length === 0 ? (
                                        <div className="text-center py-8">
                                            <ShoppingCart className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <p className="mt-2 text-muted-foreground">Your cart is empty</p>
                                        </div>
                                    ) : (
                                        <>
                                            <ScrollArea className="h-[400px]">
                                                <div className="space-y-4">
                                                    {cart.map((item) => (
                                                        <div key={item.productId} className="flex items-center justify-between p-3 border rounded-lg">
                                                            <div className="flex-1">
                                                                <h4 className="font-medium">{item.productName}</h4>
                                                                <p className="text-sm text-muted-foreground">${item.unitPrice.toFixed(2)} each</p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateQuantity(item.productId, -1)}
                                                                >
                                                                    <Minus className="h-3 w-3" />
                                                                </Button>
                                                                <span className="w-8 text-center">{item.quantity}</span>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => updateQuantity(item.productId, 1)}
                                                                >
                                                                    <Plus className="h-3 w-3" />
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => removeFromCart(item.productId)}
                                                                >
                                                                    <X className="h-3 w-3" />
                                                                </Button>
                                                            </div>
                                                            <div className="text-right ml-4">
                                                                <p className="font-medium">${item.totalPrice.toFixed(2)}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </ScrollArea>
                                            <div className="mt-6 pt-6 border-t">
                                                <div className="flex justify-between text-lg font-semibold">
                                                    <span>Total:</span>
                                                    <span>${calculateTotal().toFixed(2)}</span>
                                                </div>
                                                <Button
                                                    className="w-full mt-4"
                                                    size="lg"
                                                    onClick={() => setIsPaymentOpen(true)}
                                                >
                                                    Proceed to Payment
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-6">
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                        <TabsTrigger value="all">All</TabsTrigger>
                        {categories.map((category) => (
                            <TabsTrigger key={category.id} value={category.id.toString()}>
                                {category.name}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value={selectedCategory} className="mt-6">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                            {filteredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className="cursor-pointer hover:shadow-md transition-shadow"
                                    onClick={() => addToCart(product)}
                                >
                                    <CardContent className="p-4">
                                        <div className="text-center">
                                            <Package className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                                            <h3 className="font-medium text-sm">{product.name}</h3>
                                            <p className="text-lg font-bold text-green-600">${product.price.toFixed(2)}</p>
                                            <p className="text-xs text-muted-foreground">
                                                Stock: {product.stockQuantity}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </main>

            {/* Payment Dialog */}
            <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Complete Payment</DialogTitle>
                        <DialogDescription>
                            Enter payment details to complete this transaction
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="customerName">Customer Name (Optional)</Label>
                                <Input
                                    id="customerName"
                                    value={paymentForm.customerName}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, customerName: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                                <Input
                                    id="customerPhone"
                                    value={paymentForm.customerPhone}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, customerPhone: e.target.value })}
                                    placeholder="+1234567890"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentMethod">Payment Method</Label>
                            <Select
                                value={paymentForm.paymentMethod}
                                onValueChange={(value: "CASH" | "CARD" | "QRIS") =>
                                    setPaymentForm({ ...paymentForm, paymentMethod: value })
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CASH">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="h-4 w-4" />
                                            Cash
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="CARD">
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            Card
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="QRIS">
                                        <div className="flex items-center gap-2">
                                            <QrCode className="h-4 w-4" />
                                            QRIS
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Separator />
                        <div className="flex justify-between text-lg font-semibold">
                            <span>Total Amount:</span>
                            <span>${calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={processPayment}>
                            Complete Payment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Receipt Dialog */}
            <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Payment Successful!</DialogTitle>
                        <DialogDescription>
                            Transaction completed successfully
                        </DialogDescription>
                    </DialogHeader>
                    <div className="text-center py-6">
                        <Receipt className="mx-auto h-12 w-12 text-green-600 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Thank you for your purchase!</h3>
                        <p className="text-muted-foreground mb-4">Transaction ID: {lastTransactionId}</p>
                        <div className="space-y-2 text-left bg-muted p-4 rounded-lg">
                            <div className="flex justify-between">
                                <span>Total Amount:</span>
                                <span className="font-semibold">${calculateTotal().toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Payment Method:</span>
                                <span>{paymentForm.paymentMethod}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setIsReceiptOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}