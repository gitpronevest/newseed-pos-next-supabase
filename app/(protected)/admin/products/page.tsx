"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Edit, Trash2, Package, DollarSign } from "lucide-react";

interface Product {
    id: number;
    name: string;
    price: number;
    stockQuantity: number;
    categoryId?: number;
    linkedOptionGroupIds: string;
    isAvailable: boolean;
    createdAt: number;
    updatedAt: number;
}

interface ProductCategory {
    id: number;
    name: string;
    description?: string;
}

interface OptionGroup {
    id: number;
    name: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        stockQuantity: "",
        categoryId: "",
        linkedOptionGroupIds: [] as number[],
        isAvailable: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [productsRes, categoriesRes, optionsRes] = await Promise.all([
                fetch("/api/products"),
                fetch("/api/categories"),
                fetch("/api/option-groups"),
            ]);

            if (productsRes.ok) setProducts(await productsRes.json());
            if (categoriesRes.ok) setCategories(await categoriesRes.json());
            if (optionsRes.ok) setOptionGroups(await optionsRes.json());
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
            const method = editingProduct ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    stockQuantity: parseInt(formData.stockQuantity),
                    categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
                }),
            });

            if (response.ok) {
                await fetchData();
                setIsDialogOpen(false);
                setEditingProduct(null);
                setFormData({
                    name: "",
                    price: "",
                    stockQuantity: "",
                    categoryId: "",
                    linkedOptionGroupIds: [],
                    isAvailable: true,
                });
            }
        } catch (error) {
            console.error("Failed to save product:", error);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            price: product.price.toString(),
            stockQuantity: product.stockQuantity.toString(),
            categoryId: product.categoryId?.toString() || "",
            linkedOptionGroupIds: JSON.parse(product.linkedOptionGroupIds || "[]"),
            isAvailable: product.isAvailable,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this product?")) return;

        try {
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error("Failed to delete product:", error);
        }
    };

    const openCreateDialog = () => {
        setEditingProduct(null);
        setFormData({
            name: "",
            price: "",
            stockQuantity: "",
            categoryId: "",
            linkedOptionGroupIds: [],
            isAvailable: true,
        });
        setIsDialogOpen(true);
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return <Badge variant="secondary">Uncategorized</Badge>;
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || <Badge variant="secondary">Unknown</Badge>;
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                        <p className="text-muted-foreground">Manage your product catalog</p>
                    </div>
                </div>
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardHeader>
                                <div className="h-6 w-32 bg-muted rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-4 w-full bg-muted rounded mb-2"></div>
                                <div className="h-4 w-3/4 bg-muted rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Products</h1>
                    <p className="text-muted-foreground">Manage your product catalog and pricing</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingProduct ? "Edit Product" : "Add New Product"}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingProduct
                                        ? "Update the product details below."
                                        : "Create a new product for your catalog."
                                    }
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Product Name</Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g., Green Smoothie"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price ($)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="6.50"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="stockQuantity">Stock Quantity</Label>
                                        <Input
                                            id="stockQuantity"
                                            type="number"
                                            min="0"
                                            value={formData.stockQuantity}
                                            onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                                            placeholder="50"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="categoryId">Category</Label>
                                        <Select
                                            value={formData.categoryId}
                                            onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label>Option Groups</Label>
                                    <div className="space-y-2">
                                        {optionGroups.map((group) => (
                                            <div key={group.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`option-${group.id}`}
                                                    checked={formData.linkedOptionGroupIds.includes(group.id)}
                                                    onCheckedChange={(checked) => {
                                                        if (checked) {
                                                            setFormData({
                                                                ...formData,
                                                                linkedOptionGroupIds: [...formData.linkedOptionGroupIds, group.id],
                                                            });
                                                        } else {
                                                            setFormData({
                                                                ...formData,
                                                                linkedOptionGroupIds: formData.linkedOptionGroupIds.filter(
                                                                    (id) => id !== group.id
                                                                ),
                                                            });
                                                        }
                                                    }}
                                                />
                                                <Label htmlFor={`option-${group.id}`}>{group.name}</Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="isAvailable"
                                        checked={formData.isAvailable}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: !!checked })}
                                    />
                                    <Label htmlFor="isAvailable">Product is available for sale</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingProduct ? "Update" : "Create"} Product
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Product Catalog
                    </CardTitle>
                    <CardDescription>
                        A list of all products in your system
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {products.length === 0 ? (
                        <div className="text-center py-8">
                            <Package className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No products</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Get started by creating your first product.
                            </p>
                            <div className="mt-6">
                                <Button onClick={openCreateDialog}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Product
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Product</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Stock</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">{product.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                {product.price.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <span className={`${
                                                product.stockQuantity < 10 ? "text-red-600 font-medium" : ""
                                            }`}>
                                                {product.stockQuantity}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                                        <TableCell>
                                            <Badge variant={product.isAvailable ? "default" : "secondary"}>
                                                {product.isAvailable ? "Available" : "Unavailable"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(product)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(product.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}