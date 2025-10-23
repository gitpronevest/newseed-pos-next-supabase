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
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Settings, DollarSign } from "lucide-react";

interface Option {
    id: number;
    optionGroupId: number;
    name: string;
    price: number;
    isAvailable: boolean;
    createdAt: number;
    updatedAt: number;
}

interface OptionGroup {
    id: number;
    name: string;
}

export default function OptionsPage() {
    const [options, setOptions] = useState<Option[]>([]);
    const [optionGroups, setOptionGroups] = useState<OptionGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingOption, setEditingOption] = useState<Option | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        optionGroupId: "",
        isAvailable: true,
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [optionsRes, groupsRes] = await Promise.all([
                fetch("/api/options"),
                fetch("/api/option-groups"),
            ]);

            if (optionsRes.ok) setOptions(await optionsRes.json());
            if (groupsRes.ok) setOptionGroups(await groupsRes.json());
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const url = editingOption ? `/api/options/${editingOption.id}` : "/api/options";
            const method = editingOption ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    price: parseFloat(formData.price),
                    optionGroupId: parseInt(formData.optionGroupId),
                }),
            });

            if (response.ok) {
                await fetchData();
                setIsDialogOpen(false);
                setEditingOption(null);
                setFormData({
                    name: "",
                    price: "",
                    optionGroupId: "",
                    isAvailable: true,
                });
            }
        } catch (error) {
            console.error("Failed to save option:", error);
        }
    };

    const handleEdit = (option: Option) => {
        setEditingOption(option);
        setFormData({
            name: option.name,
            price: option.price.toString(),
            optionGroupId: option.optionGroupId.toString(),
            isAvailable: option.isAvailable,
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this option?")) return;

        try {
            const response = await fetch(`/api/options/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error("Failed to delete option:", error);
        }
    };

    const toggleAvailability = async (id: number, isAvailable: boolean) => {
        try {
            const response = await fetch(`/api/options/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isAvailable }),
            });

            if (response.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error("Failed to update option availability:", error);
        }
    };

    const openCreateDialog = () => {
        setEditingOption(null);
        setFormData({
            name: "",
            price: "",
            optionGroupId: "",
            isAvailable: true,
        });
        setIsDialogOpen(true);
    };

    const getOptionGroupName = (optionGroupId: number) => {
        const group = optionGroups.find((g) => g.id === optionGroupId);
        return group?.name || "Unknown";
    };

    const groupedOptions = options.reduce((acc, option) => {
        const groupName = getOptionGroupName(option.optionGroupId);
        if (!acc[groupName]) acc[groupName] = [];
        acc[groupName].push(option);
        return acc;
    }, {} as Record<string, Option[]>);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Options</h1>
                        <p className="text-muted-foreground">Manage product add-ons and options</p>
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
                    <h1 className="text-3xl font-bold tracking-tight">Options</h1>
                    <p className="text-muted-foreground">Manage product add-ons and options</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openCreateDialog}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Option
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <form onSubmit={handleSubmit}>
                            <DialogHeader>
                                <DialogTitle>
                                    {editingOption ? "Edit Option" : "Add New Option"}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingOption
                                        ? "Update the option details below."
                                        : "Create a new option for your products."
                                    }
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="optionGroupId">Option Group</Label>
                                    <Select
                                        value={formData.optionGroupId}
                                        onValueChange={(value) => setFormData({ ...formData, optionGroupId: value })}
                                        required
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select option group" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {optionGroups.map((group) => (
                                                <SelectItem key={group.id} value={group.id.toString()}>
                                                    {group.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name">Option Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Honey, Extra Shot"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Additional Price ($)</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.50"
                                        required
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="isAvailable"
                                        checked={formData.isAvailable}
                                        onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked })}
                                    />
                                    <Label htmlFor="isAvailable">Option is available</Label>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingOption ? "Update" : "Create"} Option
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {Object.entries(groupedOptions).map(([groupName, groupOptions]) => (
                <Card key={groupName}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            {groupName}
                        </CardTitle>
                        <CardDescription>
                            {groupOptions.length} option{groupOptions.length !== 1 ? "s" : ""} in this group
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Option</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {groupOptions.map((option) => (
                                    <TableRow key={option.id}>
                                        <TableCell className="font-medium">{option.name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                                {option.price.toFixed(2)}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={option.isAvailable}
                                                    onCheckedChange={(checked) => toggleAvailability(option.id, checked)}
                                                />
                                                <Badge variant={option.isAvailable ? "default" : "secondary"}>
                                                    {option.isAvailable ? "Available" : "Unavailable"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEdit(option)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(option.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            ))}

            {options.length === 0 && (
                <Card>
                    <CardContent className="text-center py-8">
                        <Settings className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No options</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Get started by creating your first option group and option.
                        </p>
                        <div className="mt-6">
                            <Button onClick={openCreateDialog}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Option
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}