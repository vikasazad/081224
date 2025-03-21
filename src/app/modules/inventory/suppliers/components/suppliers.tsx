"use client";

import * as React from "react";
import {
  Edit,
  MoreHorizontal,
  MoveLeft,
  Plus,
  Search,
  Trash,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { Supplier } from "@/types/inventory";
import { DeleteAlertDialog } from "@/app/modules/inventory/suppliers/components/delete-alert-dialog";
import { SupplierForm } from "@/app/modules/inventory/addItems/components/SupplierForm";
import { useRouter } from "next/navigation";
import {
  addNewSupplier,
  saveDeletedSupplier,
  saveEditedSupplier,
} from "../../utils/inventoryAPI";

const ITEMS_PER_PAGE = 20;

export default function Suppliers({ data }: any) {
  // State management
  const router = useRouter();
  const [suppliers, setSuppliers] = React.useState<Supplier[]>(data?.suppliers);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingSupplier, setEditingSupplier] = React.useState<Supplier | null>(
    null
  );
  const [isSupplierFormOpen, setIsSupplierFormOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [supplierToDelete, setSupplierToDelete] = React.useState<string | null>(
    null
  );

  // Filter and search logic
  const filteredSuppliers = React.useMemo(() => {
    return suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        supplier.gstNumber.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [suppliers, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSuppliers.length / ITEMS_PER_PAGE);
  const paginatedSuppliers = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredSuppliers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredSuppliers, currentPage]);

  // Action handlers
  const handleAddNew = () => {
    setEditingSupplier(null);
    setIsSupplierFormOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierFormOpen(true);
  };

  const handleDelete = (name: string) => {
    setSupplierToDelete(name);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (supplierToDelete) {
      const deletedSupplier = suppliers.filter(
        (supplier) => supplier.name !== supplierToDelete
      );
      await saveDeletedSupplier(deletedSupplier);
      setSuppliers(deletedSupplier);
      setIsDeleteDialogOpen(false);
      setSupplierToDelete(null);
    }
  };

  const handleSaveSupplier = async (formData: any) => {
    if (editingSupplier) {
      // Update existing supplier
      const editedSupplier = suppliers.map((supplier) =>
        supplier.name === editingSupplier.name
          ? { ...supplier, ...formData }
          : supplier
      );
      console.log("EDITED", editedSupplier);
      await saveEditedSupplier(editedSupplier);
      setSuppliers(editedSupplier);
    } else {
      // Add new supplier
      await addNewSupplier(formData);
      setSuppliers([...suppliers, formData]);
    }
  };

  const handleSupplierFormSave = (formData: any) => {
    const supplierData = {
      phoneNumber: formData.phoneNumbers,
      gstNumber: formData.gstNumbers,
      name: formData.name,
      email: formData.email,
      address: formData.address,
    };

    if (editingSupplier) {
      handleSaveSupplier(supplierData);
    } else {
      console.log("ASDFASD", supplierData);
      handleSaveSupplier(supplierData);
    }
    setIsSupplierFormOpen(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <div className="flex justify-between">
          <Button onClick={() => router.back()} className="mr-2">
            <MoveLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8 md:w-2/3 lg:w-1/3"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>GST Number</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedSuppliers.map((supplier: any) => (
              <TableRow key={supplier.name}>
                <TableCell className="font-medium">{supplier.name}</TableCell>
                <TableCell>{supplier.phoneNumber.join(", ")}</TableCell>
                <TableCell>{supplier.email}</TableCell>
                <TableCell>{supplier.address}</TableCell>
                <TableCell>{supplier.gstNumber.join(", ")}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-4 h-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(supplier)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(supplier.name)}
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
        <Button
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

      <Dialog open={isSupplierFormOpen} onOpenChange={setIsSupplierFormOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingSupplier ? "Edit Supplier" : "Add Supplier"}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription></DialogDescription>
          <SupplierForm
            onSave={handleSupplierFormSave}
            onCancel={() => setIsSupplierFormOpen(false)}
            initialData={
              editingSupplier
                ? {
                    name: editingSupplier.name,
                    phoneNumbers: editingSupplier.phoneNumber,
                    email: editingSupplier.email,
                    address: editingSupplier.address,
                    gstNumbers: editingSupplier.gstNumber,
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      <DeleteAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
