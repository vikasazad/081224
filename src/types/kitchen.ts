// Order status enum
export enum OrderStatus {
  New = "New",
  InPreparation = "In Preparation",
  Completed = "Completed",
}

// Order item interface
export interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  count: number;
}

// Order interface
export interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  status: OrderStatus;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  totalAmount: number;
}

// Menu item interface
export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryName: string;
  available: boolean;
}
