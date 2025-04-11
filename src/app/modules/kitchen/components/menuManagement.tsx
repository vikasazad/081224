"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Search, Filter } from "lucide-react";
import type { MenuItem } from "@/types/kitchen";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface MenuManagementProps {
  menuItems: {
    categories: Array<{
      id: string;
      name: string;
      categoryLogo: string;
      position: string;
      menuItems: MenuItem[];
      categoryName: string;
    }>;
  };
  onAvailabilityChange: (changes: Record<string, boolean>) => Promise<void>;
}

export default function MenuManagement({
  menuItems,
  onAvailabilityChange,
}: MenuManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Add new state for tracking changes
  const [pendingChanges, setPendingChanges] = useState<Map<string, boolean>>(
    new Map()
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Add loading state to component
  const [isUpdating, setIsUpdating] = useState(false);

  console.log(menuItems);

  // Get all unique categories
  const categories = Array.from(
    new Set(
      menuItems.categories.flatMap((category) =>
        category.menuItems.map((item) => item.categoryName)
      )
    )
  );

  // Filter menu items based on search query and filters
  const filteredItems = menuItems.categories.flatMap((category) =>
    category.menuItems.filter((item) => {
      // Search filter
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        categoryFilter.length === 0 ||
        categoryFilter.includes(item.categoryName);

      // Availability filter
      const matchesAvailability =
        availabilityFilter === null ||
        (availabilityFilter === "available" && item.available) ||
        (availabilityFilter === "unavailable" && !item.available);

      return matchesSearch && matchesCategory && matchesAvailability;
    })
  );

  // Update pagination logic
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page size change
  const handlePageSizeChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // New handler for local availability toggle
  const handleAvailabilityToggle = (itemId: string, checked: boolean) => {
    setPendingChanges((prev) => new Map(prev).set(itemId, checked));
  };

  // Update the save changes handler
  const handleSaveChanges = async () => {
    try {
      setIsUpdating(true);
      const changesObject = Object.fromEntries(pendingChanges);
      await onAvailabilityChange(changesObject);
      setPendingChanges(new Map());
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to update availability:", error);
      // Show error toast
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper to check if an item has pending changes
  const hasChanges = pendingChanges.size > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search menu items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              Categories
              {categoryFilter.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {categoryFilter.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={categoryFilter.includes(category)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setCategoryFilter((prev) => [...prev, category]);
                  } else {
                    setCategoryFilter((prev) =>
                      prev.filter((c) => c !== category)
                    );
                  }
                }}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
            {categoryFilter.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  className="w-full justify-center text-xs"
                  onClick={() => setCategoryFilter([])}
                >
                  Clear Filters
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Availability Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex gap-2">
              <Filter className="h-4 w-4" />
              Availability
              {availabilityFilter && (
                <Badge variant="secondary" className="ml-1">
                  1
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Filter by Availability</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={availabilityFilter === "available"}
              onCheckedChange={(checked) => {
                if (checked) {
                  setAvailabilityFilter("available");
                } else {
                  setAvailabilityFilter(null);
                }
              }}
            >
              Available
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={availabilityFilter === "unavailable"}
              onCheckedChange={(checked) => {
                if (checked) {
                  setAvailabilityFilter("unavailable");
                } else {
                  setAvailabilityFilter(null);
                }
              }}
            >
              Unavailable
            </DropdownMenuCheckboxItem>
            {availabilityFilter && (
              <>
                <DropdownMenuSeparator />
                <Button
                  variant="ghost"
                  className="w-full justify-center text-xs"
                  onClick={() => setAvailabilityFilter(null)}
                >
                  Clear Filter
                </Button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Active Filters Display */}
      {(categoryFilter.length > 0 || availabilityFilter) && (
        <div className="flex flex-wrap gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {categoryFilter.map((category) => (
            <Badge
              key={category}
              variant="secondary"
              className="flex gap-1 items-center"
            >
              {category}
              <button
                className="ml-1 hover:text-primary"
                onClick={() =>
                  setCategoryFilter((prev) =>
                    prev.filter((c) => c !== category)
                  )
                }
              >
                ×
              </button>
            </Badge>
          ))}
          {availabilityFilter && (
            <Badge variant="secondary" className="flex gap-1 items-center">
              {availabilityFilter === "available" ? "Available" : "Unavailable"}
              <button
                className="ml-1 hover:text-primary"
                onClick={() => setAvailabilityFilter(null)}
              >
                ×
              </button>
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-6"
            onClick={() => {
              setCategoryFilter([]);
              setAvailabilityFilter(null);
            }}
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Add save changes button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="gap-2">
                Save Availability Changes
                <Badge variant="secondary">{pendingChanges.size}</Badge>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Availability Changes</DialogTitle>
                <DialogDescription>
                  You are about to update the availability status of{" "}
                  {pendingChanges.size} items. This action will affect the menu
                  visibility for customers.
                </DialogDescription>
              </DialogHeader>

              <div className="max-h-[200px] overflow-y-auto">
                {Array.from(pendingChanges).map(([itemId, newAvailability]) => {
                  const item = filteredItems.find((item) => item.id === itemId);
                  return (
                    <div
                      key={itemId}
                      className="flex justify-between items-center py-2"
                    >
                      <span>{item?.name}</span>
                      <Badge
                        variant={newAvailability ? "default" : "secondary"}
                      >
                        {newAvailability ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  );
                })}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPendingChanges(new Map());
                    setIsDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Confirm Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Update the table to use local state */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              {/* <TableHead>Price</TableHead> */}
              <TableHead>Availability</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No menu items found matching your filters
                </TableCell>
              </TableRow>
            ) : (
              paginatedItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-gray-100">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.categoryName}</Badge>
                  </TableCell>
                  {/* <TableCell>
                    {Object.entries(item.price)
                      .map(
                        ([portion, price]) =>
                          `${portion}: ₹${parseFloat(price).toFixed(2)}`
                      )
                      .join(" / ")}
                  </TableCell> */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm text-muted-foreground">
                        {pendingChanges.has(item.id)
                          ? pendingChanges.get(item.id)
                            ? "Available"
                            : "Unavailable"
                          : item.available
                          ? "Available"
                          : "Unavailable"}
                      </span>
                      <Switch
                        checked={
                          pendingChanges.has(item.id)
                            ? pendingChanges.get(item.id)
                            : item.available
                        }
                        onCheckedChange={(checked) =>
                          handleAvailabilityToggle(item.id, checked)
                        }
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Updated Pagination Controls */}
      {filteredItems.length > 0 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent className="w-full flex items-center justify-between">
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  isActive={currentPage === 1}
                />
              </PaginationItem>
              <PaginationItem className="hidden md:block">
                <PaginationLink>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredItems.length)}{" "}
                  of {filteredItems.length} items
                </PaginationLink>
              </PaginationItem>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Items per page:
                </span>
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={handlePageSizeChange}
                >
                  <SelectTrigger className="w-[100px]">
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                    <SelectItem value="200">200</SelectItem>
                    <SelectItem value="500">500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  isActive={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
