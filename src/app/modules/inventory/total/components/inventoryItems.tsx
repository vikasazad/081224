"use client";

import { useState, useMemo } from "react";
import {
  Edit,
  MoreHorizontal,
  MoveLeft,
  Plus,
  Search,
  Trash,
  Copy,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import type { EditInventoryItem, InventoryItem } from "@/types/inventory";
import { EditItemDialog } from "@/app/modules/inventory/total/components/edit-item-dialog";
import { DeleteAlertDialog } from "@/app/modules/inventory/total/components/delete-alert-dialog";
import { useRouter } from "next/navigation";
import { InventoryForm } from "@/app/modules/inventory/addItems/components/InventoryForm";

export default function InventoryItems() {
  // State management
  const router = useRouter();
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [updatedByFilter, setUpdatedByFilter] = useState("all");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [supplierFilter, setSupplierFilter] = useState("all");

  // Filter and search logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesUpdatedBy =
        updatedByFilter === "all" || item.updatedBy === updatedByFilter;
      const matchesSupplier =
        supplierFilter === "all" || item.supplier === supplierFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesUpdatedBy &&
        matchesSupplier
      );
    });
  }, [
    items,
    searchQuery,
    categoryFilter,
    statusFilter,
    updatedByFilter,
    supplierFilter,
  ]);

  // Pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Action handlers
  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setItems(items.filter((item) => item.id !== itemToDelete));
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSaveItem = (formData: EditInventoryItem) => {
    if (editingItem) {
      // Update existing item
      setItems(
        items.map((item) =>
          item.id === editingItem.id
            ? {
                ...item,
                ...formData,
                status:
                  formData.currentStock === 0
                    ? "Out of Stock"
                    : formData.currentStock <= formData.reorderLevel
                    ? "Low Stock"
                    : "In Stock",
              }
            : item
        )
      );
    } else {
      // Add new item
      const newItem: InventoryItem = {
        id: Math.max(...items.map((item) => item.id)) + 1,
        ...formData,
        status:
          formData.currentStock === 0
            ? "Out of Stock"
            : formData.currentStock <= formData.reorderLevel
            ? "Low Stock"
            : "In Stock",
      };
      setItems([...items, newItem]);
    }
  };

  const handleDuplicate = (item: InventoryItem) => {
    const newItem: InventoryItem = {
      ...item,
      id: Math.max(...items.map((item) => item.id)) + 1,
      name: `${item.name} (Copy)`,
      sku: `${item.sku}-COPY`,
      currentStock: 0,
      status: "Out of Stock",
      lastUpdated: new Date().toISOString().replace("T", " ").substring(0, 16),
      updatedBy: "system",
    };

    // Find the index of the original item and insert the duplicate right after it
    const originalIndex = items.findIndex((i) => i.id === item.id);
    const newItems = [...items];
    newItems.splice(originalIndex + 1, 0, newItem);
    setItems(newItems);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Total Inventory Items</h1>
        <div className="flex justify-between">
          <Button onClick={() => router.back()} className="mr-2">
            <MoveLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => setIsCategoryDialogOpen(true)}
            className="mr-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search items..."
            className="pl-8 md:w-2/3 lg:w-1/3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Electronics">Electronics</SelectItem>
              <SelectItem value="Furniture">Furniture</SelectItem>
              <SelectItem value="Supplies">Supplies</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Stock">In Stock</SelectItem>
              <SelectItem value="Low Stock">Low Stock</SelectItem>
              <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
          <Select value={updatedByFilter} onValueChange={setUpdatedByFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Updated By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="vishal">Vishal</SelectItem>
              <SelectItem value="deepak">Deepak</SelectItem>
              <SelectItem value="vikas">Vikas</SelectItem>
              <SelectItem value="nishant">Nishant</SelectItem>
              <SelectItem value="pathan">Pathan</SelectItem>
            </SelectContent>
          </Select>
          <Select value={supplierFilter} onValueChange={setSupplierFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              <SelectItem value="TechSupplies Inc">TechSupplies Inc</SelectItem>
              <SelectItem value="Global Electronics">
                Global Electronics
              </SelectItem>
              <SelectItem value="Office Supplies Co">
                Office Supplies Co
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Current Stock</TableHead>
              <TableHead>Quantity Type</TableHead>
              <TableHead>Supplier</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Reorder Level</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.currentStock}</TableCell>
                <TableCell>{item.quantityType}</TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>
                  <Badge>{item.status}</Badge>
                </TableCell>
                <TableCell>{item.reorderLevel}</TableCell>
                <TableCell>{item.updatedBy}</TableCell>
                <TableCell>{item.lastUpdated}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(item)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(item)}>
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Show</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => {
              setItemsPerPage(Number(value));
              setCurrentPage(1); // Reset to first page when changing items per page
            }}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">entries</span>
          <Button
            className="ml-2"
            variant="outline"
            size="sm"
            onClick={() =>
              setCurrentPage((page) => Math.min(totalPages, page + 1))
            }
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <InventoryForm />
        </DialogContent>
      </Dialog>

      <EditItemDialog
        item={editingItem}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveItem}
      />

      <DeleteAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />

      <Dialog
        open={isCategoryDialogOpen}
        onOpenChange={setIsCategoryDialogOpen}
      >
        <DialogContent>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Enter the details for the new category.
          </DialogDescription>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory({
                    ...newCategory,
                    description: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                // Handle category addition here
                setIsCategoryDialogOpen(false);
                setNewCategory({ name: "", description: "" });
              }}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

const initialItems: InventoryItem[] = [
  {
    id: 1,
    name: "Widget A",
    sku: "WDG-001",
    category: "Electronics",
    currentStock: 5,
    quantityType: "units",
    supplier: "TechSupplies Inc",
    status: "Low Stock",
    reorderLevel: 10,
    updatedBy: "vishal",
    lastUpdated: "2024-02-25 09:00 AM",
  },
  {
    id: 2,
    name: "Gadget B",
    sku: "GDG-002",
    category: "Electronics",
    currentStock: 25,
    quantityType: "Kg",
    supplier: "Global Electronics",
    status: "In Stock",
    reorderLevel: 15,
    updatedBy: "deepak",
    lastUpdated: "2024-02-24 02:30 PM",
  },
  {
    id: 3,
    name: "Tool C",
    sku: "TL-003",
    category: "Supplies",
    currentStock: 0,
    quantityType: "units",
    supplier: "Global Electronics",
    status: "Out of Stock",
    reorderLevel: 8,
    updatedBy: "vikas",
    lastUpdated: "2024-02-23 11:15 AM",
  },
  {
    id: 4,
    name: "Component D",
    sku: "CMP-004",
    category: "Electronics",
    currentStock: 12,
    quantityType: "units",
    supplier: "Office Supplies Co",
    status: "In Stock",
    reorderLevel: 10,
    updatedBy: "nishant",
    lastUpdated: "2024-02-25 10:45 AM",
  },
  {
    id: 5,
    name: "Part E",
    sku: "PRT-005",
    category: "Supplies",
    currentStock: 4,
    quantityType: "Grams",
    supplier: "TechSupplies Inc",
    status: "Low Stock",
    reorderLevel: 6,
    updatedBy: "pathan",
    lastUpdated: "2024-02-24 04:20 PM",
  },
];
