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

const Laundry = () => {
  const router = useRouter();
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
    const reorderItems = [
      { name: "Widget A", stock: 5 },
      { name: "Gadget B", stock: 3 },
      { name: "Tool C", stock: 7 },
      { name: "Component D", stock: 2 },
      { name: "Part E", stock: 4 },
      { name: "Material F", stock: 6 },
      { name: "Product G", stock: 1 },
      { name: "Item H", stock: 8 },
      { name: "Unit I", stock: 3 },
      { name: "Element J", stock: 5 },
      { name: "Device K", stock: 2 },
      { name: "Module L", stock: 4 },
    ];

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
              {reorderItems.map((item, index) => (
                <li key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Current stock: {item.stock}
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

    const handleClick = () => {
      if (title === "Add New Item") {
        setOpen(true);
      }
      // Handle other actions for different cards
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
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
              <InventoryForm />
            </DialogContent>
          </Dialog>
        )}
      </>
    );
  }
  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <MetricCard
          title="Total Stock"
          value="1,234"
          icon={<Package className="h-4 w-4" />}
          onClick={() => router.push("/inventory/total")}
        />
        <MetricCard
          title="Reorder Level"
          value="15"
          icon={<PackageCheck className="h-4 w-4" />}
          onClick={() => router.push("/inventory/reorder")}
        />

        <MetricCard
          title="Recent Transactions"
          value="42"
          icon={<RefreshCcw className="h-4 w-4" />}
          onClick={() => router.push("/inventory/transactions")}
        />
        <MetricCard
          title="Low Stock Alerts"
          value="8"
          icon={<AlertTriangle className="h-4 w-4" />}
          onClick={() => router.push("/inventory/low")}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <ReorderAlertsCard />
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <QuickActionCard
              title="Add New Item"
              description="Quickly add a new inventory item."
              buttonText="Add Item"
              icon={<PlusCircle className="h-6 w-6" />}
            />
            <QuickActionCard
              title="View Suppliers"
              description="Manage and view suppliers."
              buttonText="View Suppliers"
              icon={<Users className="h-6 w-6" />}
            />
            {/* <QuickActionCard
              title="Generate Report"
              description="Generate inventory reports."
              buttonText="Generate Report"
              icon={<FileText className="h-6 w-6" />}
            /> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Laundry;
