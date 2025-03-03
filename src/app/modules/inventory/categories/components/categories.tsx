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

import type { EditCategory, Category } from "@/types/inventory";
import { EditCategoryDialog } from "@/app/modules/inventory/category/components/edit-category-dialog";
import { DeleteAlertDialog } from "@/app/modules/inventory/category/components/delete-alert-dialog";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 5;

export default function Categories() {
  // State management
  const router = useRouter();
  const [categories, setCategories] =
    React.useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<number | null>(
    null
  );

  // Filter and search logic
  const filteredCategories = React.useMemo(() => {
    return categories.filter(
      (category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCategories.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredCategories, currentPage]);

  // Action handlers
  const handleAddNew = () => {
    setEditingCategory(null);
    setIsEditDialogOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    setCategoryToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(
        categories.filter((category) => category.id !== categoryToDelete)
      );
      setIsDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleSaveCategory = (formData: EditCategory) => {
    const now = new Date().toISOString();

    if (editingCategory) {
      // Update existing category
      setCategories(
        categories.map((category) =>
          category.id === editingCategory.id
            ? { ...category, ...formData, lastUpdated: now }
            : category
        )
      );
    } else {
      // Add new category
      const newCategory: Category = {
        id: Math.max(...categories.map((category) => category.id)) + 1,
        ...formData,
        lastUpdated: now,
      };
      setCategories([...categories, newCategory]);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex justify-between">
          <Button onClick={() => router.back()} className="mr-2">
            <MoveLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleAddNew}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search categories..."
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
              <TableHead>Description</TableHead>
              <TableHead>Updated By</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.description}</TableCell>
                <TableCell>{category.updatedBy}</TableCell>
                <TableCell>
                  {new Date(category.lastUpdated).toLocaleString()}
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
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(category.id)}
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

      <EditCategoryDialog
        category={editingCategory}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSaveCategory}
      />

      <DeleteAlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

const initialCategories: Category[] = [
  {
    id: 1,
    name: "Electronics",
    description: "Electronic devices and accessories",
    updatedBy: "John Doe",
    lastUpdated: "2024-02-25T09:00:00Z",
  },
  {
    id: 2,
    name: "Furniture",
    description: "Home and office furniture",
    updatedBy: "Jane Smith",
    lastUpdated: "2024-02-24T14:30:00Z",
  },
  {
    id: 3,
    name: "Clothing",
    description: "Apparel and fashion items",
    updatedBy: "Mike Johnson",
    lastUpdated: "2024-02-23T11:15:00Z",
  },
];
