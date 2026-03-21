"use client";

import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ClipboardList,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  Send,
  PackageCheck,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { POStatusBadge } from "./POStatusBadge";
import type { PurchaseOrder, POStatus } from "@/types/inventory";

interface POListProps {
  purchaseOrders: PurchaseOrder[];
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: POStatus) => void;
}

export function POList({
  purchaseOrders,
  onDelete,
  onStatusChange,
}: POListProps) {
  console.log("POLIST DATA:", purchaseOrders);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredPOs = purchaseOrders.filter((po) => {
    const matchesSearch =
      po.name.toLowerCase().includes(search.toLowerCase()) ||
      po.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Purchase Orders
            </CardTitle>
            <CardDescription>
              Manage and track all purchase orders
            </CardDescription>
          </div>
          <Button onClick={() => router.push("/inventory/po/create")}>
            <Plus className="h-4 w-4 mr-2" />
            New PO
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by PO ID or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="pending-approval">Pending Approval</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="partially-received">
                Partially Received
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        {filteredPOs.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              No purchase orders found
            </h3>
            <p className="text-muted-foreground mb-4">
              {search || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first purchase order to get started"}
            </p>
            {!search && statusFilter === "all" && (
              <Button onClick={() => router.push("/inventory/po/create")}>
                <Plus className="h-4 w-4 mr-2" />
                Create Purchase Order
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPOs.map((po) => (
                  <TableRow
                    key={po.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => router.push(`/inventory/po/${po.id}`)}
                  >
                    <TableCell className="font-mono font-medium">
                      {po.id}
                    </TableCell>
                    <TableCell>{po.name}</TableCell>
                    <TableCell className="capitalize">{po.type}</TableCell>
                    <TableCell>
                      <POStatusBadge status={po.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      {po.items.length}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₹{po.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>{formatDate(po.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/inventory/po/${po.id}`);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {po.status === "approved" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onStatusChange?.(po.id, "sent");
                              }}
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Mark as Sent
                            </DropdownMenuItem>
                          )}
                          {(po.status === "sent" ||
                            po.status === "partially-received") && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(
                                  `/inventory/po/${po.id}?receive=true`
                                );
                              }}
                            >
                              <PackageCheck className="h-4 w-4 mr-2" />
                              Receive Items
                            </DropdownMenuItem>
                          )}
                          {po.status === "draft" && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete?.(po.id);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default POList;
