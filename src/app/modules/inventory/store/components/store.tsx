"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Package,
  PackageCheck,
  RefreshCcw,
  AlertTriangle,
  PlusCircle,
  Users,
  FolderPlus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryForm } from "@/app/modules/inventory/addItems/components/InventoryForm";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SupplierForm } from "@/app/modules/inventory/addItems/components/SupplierForm";
import { useSession } from "next-auth/react";
import { saveInventoryItem } from "../../utils/inventoryAPI";

const Store = ({ data }: any) => {
  console.log(data);
  const router = useRouter();
  const { data: session } = useSession();

  function MetricCard({
    title,
    value,
    icon,
    onClick,
  }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    onClick?: () => void;
  }) {
    return (
      <Card onClick={onClick} className="cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {icon}
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
        </CardContent>
      </Card>
    );
  }

  function ReorderAlertsCard() {
    // Simulating a larger number of reorder items
    const reorderItems = data?.items
      ?.filter((item: any) => item.quantity <= item.reorderLevel)
      .reverse();

    return (
      <Card className="border-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-500">
            <AlertTriangle className="h-5 w-5" />
            Reorder Alerts
          </CardTitle>
          <CardDescription>Items at or below reorder level</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] pr-4">
            <ul className="space-y-4">
              {reorderItems.map((item: any, index: number) => (
                <li key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current stock: {item.quantity}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Reorder
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  }

  function QuickActionCard({
    title,
    description,
    buttonText,
    icon,
  }: {
    title: string;
    description: string;
    buttonText: string;
    icon: React.ReactNode;
  }) {
    const [open, setOpen] = useState(false);
    const [categoryName, setCategoryName] = useState("");
    const [categoryDescription, setCategoryDescription] = useState("");

    const handleClick = () => {
      if (
        title === "Add New Item" ||
        title === "Add Category" ||
        title === "Add Supplier"
      ) {
        setOpen(true);
      }
    };

    const handleInventorySubmit = async (formData: any) => {
      // console.log("New inventory item data:", formData);
      try {
        const result = await saveInventoryItem(formData);
        console.log("Item saved successfully:", result);
        setOpen(false);
      } catch (error) {
        console.error("Error saving Item:", error);
        // Handle error (show toast/notification)
      }
      // setOpen(false);
    };

    const handleAddCategory = (e: React.FormEvent) => {
      e.preventDefault();
      // Add your category creation logic here
      console.log({ categoryName, categoryDescription });
      setOpen(false);
      setCategoryName("");
      setCategoryDescription("");
    };

    const handleSupplierSave = () => {
      console.log("Supplier data:");
    };

    return (
      <>
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle>{title}</CardTitle>
            </div>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleClick}>
              {buttonText}
            </Button>
          </CardContent>
        </Card>

        {title === "Add New Item" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogTitle>Add New Item</DialogTitle>
              <DialogDescription>
                Enter the item details below
              </DialogDescription>
              <InventoryForm
                data={data}
                session={session}
                onSubmit={handleInventorySubmit}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {title === "Add Category" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
              <DialogTitle>Add New Category</DialogTitle>
              <DialogDescription>
                Create a new category for organizing inventory items
              </DialogDescription>
              <form onSubmit={handleAddCategory} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Enter category name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Enter category description"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Create Category
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {title === "Add Supplier" && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl">
              <DialogTitle>Add New Supplier</DialogTitle>
              <DialogDescription>
                Enter the suppliers information below
              </DialogDescription>
              <SupplierForm
                onSave={handleSupplierSave}
                onCancel={() => setOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }

  //  const handleAddFormSubmit = (formData: any) => {
  //   // Add the new item to the beginning of the items array
  //   setItems([formData, ...items]);

  //   // Close the dialog
  //   setIsAddDialogOpen(false);
  // };
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Column - Metrics and Quick Actions */}
      <div className="flex-1 space-y-6">
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          <MetricCard
            title="Total Stock"
            value={data?.items?.length}
            icon={<Package className="h-4 w-4" />}
            onClick={() => router.push("/inventory/total")}
          />
          <MetricCard
            title="Low Stock"
            value={data?.items
              ?.filter((item: any) => item.quantity < item.reorderLevel / 2)
              .length.toString()}
            icon={<AlertTriangle className="h-4 w-4" />}
            onClick={() => router.push("/inventory/low")}
          />
          <MetricCard
            title="Reorder Level"
            value={data?.items
              ?.filter((item: any) => item.quantity <= item.reorderLevel)
              .length.toString()}
            icon={<PackageCheck className="h-4 w-4" />}
            onClick={() => router.push("/inventory/reorder")}
          />
          <MetricCard
            title="Recent Transactions"
            value={data?.recentTransactions?.length}
            icon={<RefreshCcw className="h-4 w-4" />}
            onClick={() => router.push("/inventory/transactions")}
          />
          <MetricCard
            title="Categories"
            value={data?.categories?.length}
            icon={<FolderPlus className="h-4 w-4" />}
            onClick={() => router.push("/inventory/categories")}
          />
          <MetricCard
            title="Suppliers"
            value={data?.suppliers?.length}
            icon={<Users className="h-4 w-4" />}
            onClick={() => router.push("/inventory/suppliers")}
          />
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Add New Item"
            description="Quickly add a new inventory item."
            buttonText="Add Item"
            icon={<PlusCircle className="h-6 w-6" />}
          />
          <QuickActionCard
            title="Add Category"
            description="Create a new inventory category."
            buttonText="Add Category"
            icon={<FolderPlus className="h-6 w-6" />}
          />
          <QuickActionCard
            title="Add Supplier"
            description="Add a new supplier to the system."
            buttonText="Add Supplier"
            icon={<Users className="h-6 w-6" />}
          />
        </div>
      </div>

      {/* Right Column - Reorder Alerts */}
      <div className="lg:w-1/3">
        <ReorderAlertsCard />
      </div>
    </div>
  );
};

export default Store;
