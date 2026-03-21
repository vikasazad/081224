"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  ClipboardList,
  Link as LinkIcon,
  Plus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { InventoryItem, PurchaseOrder } from "@/types/inventory";

interface DailyReorderListProps {
  allItems: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  onCreatePO?: (items: InventoryItem[]) => void;
}

export function DailyReorderList({
  allItems,
  purchaseOrders,
  onCreatePO,
}: DailyReorderListProps) {
  const router = useRouter();

  // Items at or below reorder level
  const reorderItems = allItems.filter(
    (item) => item.quantity <= item.reorderLevel
  );

  // Split into tracked (in a recurring PO) and untracked
  const trackedItems = reorderItems.filter((item) => item.trackedInPOId);
  const untrackedItems = reorderItems.filter((item) => !item.trackedInPOId);

  // Get the PO name for tracked items
  const getPOName = (poId: string) => {
    const po = purchaseOrders.find((p) => p.id === poId);
    return po?.name || poId;
  };

  const handleCreatePO = () => {
    if (onCreatePO) {
      onCreatePO(untrackedItems);
    } else {
      router.push("/inventory/po/create");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Daily Reorder List
        </CardTitle>
        <CardDescription>
          {reorderItems.length} item{reorderItems.length !== 1 ? "s" : ""} at or
          below reorder level
        </CardDescription>
      </CardHeader>
      <CardContent>
        {reorderItems.length === 0 ? (
          <div className="text-center py-8">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">All stocked up!</h3>
            <p className="text-muted-foreground">
              No items need reordering at this time
            </p>
          </div>
        ) : (
          <Tabs defaultValue="untracked" className="space-y-4">
            <TabsList>
              <TabsTrigger value="untracked" className="gap-2">
                Untracked
                {untrackedItems.length > 0 && (
                  <Badge variant="secondary">{untrackedItems.length}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="tracked" className="gap-2">
                Tracked in PO
                {trackedItems.length > 0 && (
                  <Badge variant="secondary">{trackedItems.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="untracked" className="space-y-4">
              {untrackedItems.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <LinkIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    All reorder items are tracked in purchase orders
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      These items need to be added to a purchase order
                    </p>
                    <Button onClick={handleCreatePO}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create PO
                    </Button>
                  </div>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Supplier</TableHead>
                          <TableHead className="text-right">
                            Current Stock
                          </TableHead>
                          <TableHead className="text-right">
                            Reorder Level
                          </TableHead>
                          <TableHead className="text-right">
                            Suggested Order
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {untrackedItems.map((item) => {
                          const suggestedQty = Math.max(
                            item.reorderLevel * 2 - item.quantity,
                            1
                          );
                          return (
                            <TableRow key={item.sku}>
                              <TableCell className="font-mono text-sm">
                                {item.sku}
                              </TableCell>
                              <TableCell className="font-medium">
                                {item.name}
                              </TableCell>
                              <TableCell>{item.supplier}</TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={
                                    item.quantity === 0
                                      ? "text-red-600 font-medium"
                                      : "text-yellow-600"
                                  }
                                >
                                  {item.quantity}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                {item.reorderLevel}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {suggestedQty}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="tracked" className="space-y-4">
              {trackedItems.length === 0 ? (
                <div className="text-center py-8 border rounded-lg">
                  <ClipboardList className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No items are tracked in recurring purchase orders
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    These items are automatically included in their assigned
                    recurring POs
                  </p>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>SKU</TableHead>
                          <TableHead>Item Name</TableHead>
                          <TableHead>Tracked In</TableHead>
                          <TableHead className="text-right">
                            Current Stock
                          </TableHead>
                          <TableHead className="text-right">
                            Reorder Level
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trackedItems.map((item) => (
                          <TableRow key={item.sku}>
                            <TableCell className="font-mono text-sm">
                              {item.sku}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.name}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="link"
                                className="p-0 h-auto"
                                onClick={() =>
                                  router.push(
                                    `/inventory/po/${item.trackedInPOId}`
                                  )
                                }
                              >
                                {getPOName(item.trackedInPOId!)}
                              </Button>
                            </TableCell>
                            <TableCell className="text-right">
                              <span
                                className={
                                  item.quantity === 0
                                    ? "text-red-600 font-medium"
                                    : "text-yellow-600"
                                }
                              >
                                {item.quantity}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              {item.reorderLevel}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
}

export default DailyReorderList;
