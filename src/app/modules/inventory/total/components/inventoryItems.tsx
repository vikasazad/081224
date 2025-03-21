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
  Rows3,
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
import { useSession } from "next-auth/react";
import { SkuEditDialog } from "./sku-edit-dialog";
import { format } from "date-fns";
import {
  addNewCategory,
  addNewTransaction,
  saveDeletedItem,
  saveEditedItem,
  saveInventoryItem,
  saveNewSky,
} from "../../utils/inventoryAPI";

export default function InventoryItems({ data }: any) {
  // console.log("DATA", data);
  // State management
  const { data: session } = useSession();
  const router = useRouter();
  const [items, setItems] = useState<any>(data?.items.reverse());
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [updatedByFilter, setUpdatedByFilter] = useState("all");
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [isSkuDialogOpen, setIsSkuDialogOpen] = useState(false);
  const [isNewSku, setIsNewSku] = useState<any>(null);
  const [editingSku, setEditingSku] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [isSkuEditDialogOpen, setIsSkuEditDialogOpen] = useState(false);
  const [categoryErrors, setCategoryErrors] = useState({
    name: "",
    description: "",
  });

  // Filter and search logic
  const filteredItems = useMemo(() => {
    return items.filter((item: any) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesUpdatedBy =
        updatedByFilter === "all" ||
        item.updatedBy?.toLowerCase() === updatedByFilter.toLowerCase();
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

  const handleDelete = (itemName: string) => {
    setItemToDelete(itemName);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      if (itemToDelete.includes("Copy")) {
        const deletedItems = items.filter(
          (item: any) => item.name !== itemToDelete
        );
        setItems(deletedItems);
      } else {
        const deletedItems = items.filter(
          (item: any) => item.name !== itemToDelete
        );
        await saveDeletedItem(deletedItems);
        setItems(deletedItems);
        setIsDeleteDialogOpen(false);
        setItemToDelete(null);
      }
    }
  };

  const handleSaveItem = async (
    formData: EditInventoryItem,
    transactionType: string | undefined,
    previousQuantity: number
  ) => {
    if (editingItem) {
      try {
        // Update existing item
        const updatedItems = items.map((item: any) =>
          item.name === editingItem.name
            ? {
                ...item,
                ...formData,
                status:
                  Number(formData.quantity) === 0
                    ? "Out of Stock"
                    : Number(formData.quantity) <= Number(formData.reorderLevel)
                    ? "Low Stock"
                    : "In Stock",
                lastUpdated: new Date().toString(),
                updatedBy: session?.user?.role || "undefined",
              }
            : item
        );

        // Here you can handle the transactionType as needed
        // console.log("ITEMS", formData);
        // console.log("Transaction Type:", transactionType, previousQuantity);
        const transactionItem = {
          id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
          name: formData.name,
          sku: formData.sku,
          category: formData.category,
          previousQuantity: previousQuantity,
          quantity: formData.quantity,
          transactionType: transactionType,
          dateTime: new Date().toString(),
          supplierCustomer: formData.supplier,
        };
        // console.log("ASDFASDF", transactionItem);
        // console.log("LDFS", updatedItems);
        await saveEditedItem(updatedItems);
        if (transactionType) await addNewTransaction(transactionItem);

        if (isNewSku) {
          await saveNewSky(isNewSku);
          setIsNewSku(null);
        }

        setItems(updatedItems);
        setIsEditDialogOpen(false);
        setEditingItem(null);
        router.refresh();
      } catch (error) {
        console.error("Error updating item:", error);
      }
    }
  };

  const handleDuplicate = async (item: InventoryItem) => {
    const newItem: InventoryItem = {
      ...item,
      name: `${item.name} (Copy)`,
      sku: `${item.sku}-COPY`,
      quantity: "0",
      status: "Out of Stock",
      lastUpdated: new Date().toString(),
      updatedBy: session?.user?.role || "undefined",
    };

    // Find the index of the original item and insert the duplicate right after it
    const originalIndex = items.findIndex((i: any) => i.name === item.name);
    const newItems = [...items];
    newItems.splice(originalIndex + 1, 0, newItem);
    setItems(newItems.reverse());
  };

  const handleAddFormSubmit = async (formData: any) => {
    // Add the new item to the beginning of the items array
    try {
      const transactionItem = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        name: formData.name,
        sku: formData.sku,
        category: formData.category,
        previousQuantity: 0,
        quantity: formData.quantity,
        transactionType: "Stock In",
        dateTime: new Date().toString(),
        supplierCustomer: formData.supplier,
      };
      console.log("transactionItem", transactionItem);
      if (transactionItem) await addNewTransaction(transactionItem);
      const result = await saveInventoryItem(formData);
      if (isNewSku) {
        await saveNewSky(isNewSku);
        setIsNewSku(null);
      }
      console.log("Item saved successfully:", result);
      // setOpen(false);
    } catch (error) {
      console.error("Error saving Item:", error);
      // Handle error (show toast/notification)
    }

    // Close the dialog
    setIsAddDialogOpen(false);
  };

  const handleSkuEdit = (sku: string) => {
    const item = data?.sku.find((item: any) => item.value === sku);
    if (item) {
      setEditingSku(item);
      setIsSkuEditDialogOpen(true);
      setIsSkuDialogOpen(false);
    }
  };

  const handleSkuDelete = (sku: string) => {
    const item = data?.sku.find((item: any) => item.value === sku);
    if (item) {
      setItemToDelete(item.value);
      setIsDeleteDialogOpen(true);
      setIsSkuDialogOpen(false);
    }
  };

  const handleSkuSave = (updatedItem: { value: string; label: string }) => {
    // Update the SKU list
    const updatedSkus = data?.sku.map((item: any) =>
      item.value === editingSku?.value ? updatedItem : item
    );

    // Update the main items list
    const updatedItems = items.map((item: any) => {
      if (item.sku === editingSku?.value) {
        return {
          ...item,
          sku: updatedItem.value,
          name: updatedItem.label,
        };
      }
      return item;
    });

    // Update the state
    data.sku = updatedSkus;
    setItems(updatedItems);
    setIsSkuEditDialogOpen(false);
    setIsSkuDialogOpen(true); // Reopen the SKU list dialog
  };

  const handleNewSku = (value: any) => {
    if (value) {
      setIsNewSku(value);
      console.log("VALUE", value);
    }
  };

  const handleAddCategory = async (data: any) => {
    // Reset previous errors
    setCategoryErrors({ name: "", description: "" });

    // Validate fields
    const errors = {
      name: data.name.trim() === "" ? "Category name is required" : "",
      description:
        data.description.trim() === "" ? "Description is required" : "",
    };

    // Check if there are any errors
    if (errors.name || errors.description) {
      setCategoryErrors(errors);
      return;
    }

    // Process valid form
    await addNewCategory({
      ...data,
      updatedBy: session?.user?.role,
      lastUpdated: new Date().toString(),
    });
    setIsCategoryDialogOpen(false);
    setNewCategory({ name: "", description: "" });
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
          <Button onClick={() => setIsSkuDialogOpen(true)} className="mr-2">
            <Rows3 className="w-4 h-4 mr-2" />
            View SKU
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
            className="pl-8 md:w-2/3 lg:w-1/1"
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
              {data?.categories.map((item: any, num: number) => (
                <SelectItem value={item?.name} key={num}>
                  {item?.name}
                </SelectItem>
              ))}
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
              {data?.suppliers.map((item: any, num: number) => (
                <SelectItem value={item?.name} key={num}>
                  {item?.name}
                </SelectItem>
              ))}
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
            {paginatedItems.map((item: any) => (
              <TableRow key={item.sku}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.category}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>{item.quantityUnit}</TableCell>
                <TableCell>{item.supplier}</TableCell>
                <TableCell>
                  <Badge>{item.status}</Badge>
                </TableCell>
                <TableCell>{item.reorderLevel}</TableCell>
                <TableCell>{item.updatedBy}</TableCell>
                <TableCell>
                  {format(new Date(item.date), "HH:mm (d MMM)")}
                </TableCell>
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
                        onClick={() => handleDelete(item.name)}
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
          <DialogTitle>Add New Item</DialogTitle>
          <DialogDescription>
            Fill in the details for the new inventory item.
          </DialogDescription>
          <InventoryForm
            data={data}
            session={session}
            onSubmit={handleAddFormSubmit}
            newSku={handleNewSku}
          />
        </DialogContent>
      </Dialog>

      <EditItemDialog
        item={editingItem}
        open={isEditDialogOpen}
        sku={data?.sku}
        suppliers={data?.suppliers}
        categories={data?.categories}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveItem}
        newSku={handleNewSku}
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
              {categoryErrors.name && (
                <span className="text-sm text-destructive">
                  {categoryErrors.name}
                </span>
              )}
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
              {categoryErrors.description && (
                <span className="text-sm text-destructive">
                  {categoryErrors.description}
                </span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                // Handle category addition here

                handleAddCategory(newCategory);
              }}
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSkuDialogOpen} onOpenChange={setIsSkuDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogTitle>SKU List</DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="max-h-[60vh] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.sku.map((item: any, num: number) => (
                  <TableRow key={num}>
                    <TableCell>{item.value}</TableCell>
                    <TableCell>{item.label}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSkuEdit(item.value)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleSkuDelete(item.value)}
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>

      <SkuEditDialog
        item={editingSku}
        open={isSkuEditDialogOpen}
        onOpenChange={setIsSkuEditDialogOpen}
        onSave={handleSkuSave}
      />
    </div>
  );
}
