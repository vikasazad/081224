"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, ArrowLeft } from "lucide-react";
import { createStockCount } from "@/app/modules/inventory/stock-count/utils/stockCountApi";
import type { InventoryStore, Category } from "@/types/inventory";

interface NewStockCountPageProps {
  data: InventoryStore;
}

export default function NewStockCountPage({ data }: NewStockCountPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [category, setCategory] = useState<string>("all");
  const [isCreating, setIsCreating] = useState(false);

  const categories: Category[] = data?.categories || [];
  const items = data?.items || [];

  const filteredItemCount =
    category === "all"
      ? items.length
      : items.filter((item) => item.category === category).length;

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const countedBy =
        session?.user?.name || session?.user?.email || "Unknown";
      const newCount = await createStockCount(
        countedBy,
        category === "all" ? undefined : category
      );

      if (newCount) {
        router.push(`/inventory/stock-count/${newCount.id}`);
      }
    } catch (error) {
      console.error("Error creating stock count:", error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/inventory/stock-count")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              New Stock Count
            </CardTitle>
            <CardDescription>
              Start a new physical inventory count
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="category">Category (Optional)</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.name} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Filter the count to a specific category, or count all items
          </p>
        </div>

        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">Items to count</p>
          <p className="text-2xl font-bold">{filteredItemCount}</p>
        </div>

        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => router.push("/inventory/stock-count")}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || filteredItemCount === 0}
          >
            {isCreating ? "Creating..." : "Start Count"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
