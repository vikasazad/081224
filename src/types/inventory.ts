export interface InventoryItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  reorderLevel: number;
  updatedBy: string;
  lastUpdated: string;
  quantityType: string;
  supplier: string;
}

export interface EditInventoryItem
  extends Omit<InventoryItem, "id" | "status"> {
  // Add at least one member to avoid TypeScript error
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  reorderLevel: number;
  lastUpdated: string;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  updatedBy: string;
  lastUpdated: string;
}

export interface EditCategory extends Omit<Category, "id" | "lastUpdated"> {
  // Add required fields to avoid empty interface
  name: string;
  description: string;
}

export interface Supplier {
  id: number;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  gstNumber: string;
}

export interface EditSupplier extends Omit<Supplier, "id"> {
  // Add required fields to avoid empty interface
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  address: string;
  gstNumber: string;
}
