"use client";
import React, { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle, Clock, Package, Search } from "lucide-react";
import OrderBoard from "@/app/modules/kitchen/components/orderBoard";
import MenuManagement from "@/app/modules/kitchen/components/menuManagement";
import { type Order, OrderStatus } from "@/types/kitchen";
import {
  getKitchenAndMenuData,
  updateOrderStatus,
  updateMenuItemsAvailability,
} from "@/app/modules/kitchen/utils/kitchenApi";
import {
  sendKitchenAlertToManager,
  sendOrderEscalationToManager,
} from "@/app/modules/staff/utils/whatsapp-staff-manager";
// import { generateSampleOrders } from "@/lib/sample-data";

// Kitchen configuration
const kitchenConfig = {
  waitingAlertMinutes: 15, // Alert after 2 minutes if order hasn't been started
};

// Kitchen Timer Configuration - Customize all timing settings here
export const kitchenTimerConfig = {
  // Preparation timer settings
  totalPreparationMinutes: 15, // Total time for order preparation
  deliveryReadinessMinutes: 5, // Minutes remaining when to send delivery readiness request (5 = send at 10min mark)
  // Alert thresholds
  onTimeThresholdMinutes: 30, // Orders completed within this time are "on time"
  delayedThresholdMinutes: 30, // Orders taking longer than this are "delayed"
  // Escalation settings
  escalationTimeoutMinutes: 40, // Total time (waiting + preparation) before escalating to manager
};

export default function KitchenDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<any>([]);
  const [activeTab, setActiveTab] = useState<string>("orders");
  const [filterType, setFilterType] = useState<string | null>(null);
  const [alertedOrders, setAlertedOrders] = useState<Set<string>>(new Set());
  const [escalatedOrders, setEscalatedOrders] = useState<Set<string>>(
    new Set()
  );
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const unsubscribe = getKitchenAndMenuData((data) => {
      if (data) {
        console.log("DATA", data);
        setOrders(data.kitchen.orders || []);
        setMenuItems(data.menu || []);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Function to check for orders waiting too long
  const checkForWaitingOrders = React.useCallback(async () => {
    const now = new Date().getTime();
    const alertThreshold = kitchenConfig.waitingAlertMinutes * 60 * 1000; // 2 minutes in milliseconds

    for (const order of Object.values(orders)) {
      if (
        order.status === OrderStatus.New &&
        !alertedOrders.has(order.id) &&
        order.createdAt
      ) {
        const orderCreatedTime = new Date(order.createdAt).getTime();
        const waitingTime = now - orderCreatedTime;

        if (waitingTime >= alertThreshold) {
          try {
            // Mark order as alerted to prevent duplicate alerts
            setAlertedOrders((prev) => new Set(prev).add(order.id));

            // Send alert to manager using the centralized function
            await sendKitchenAlertToManager(
              order.id,
              order.customerName,
              order.totalAmount,
              order.items,
              Math.floor(waitingTime / 60000)
            );

            console.log(
              `Kitchen alert sent for order ${order.id} after ${Math.floor(
                waitingTime / 60000
              )} minutes`
            );
          } catch (error) {
            console.error(`Failed to send alert for order ${order.id}:`, error);
          }
        }
      }
    }
  }, [orders, alertedOrders]);

  // Function to check for orders needing escalation
  const checkForEscalatedOrders = React.useCallback(async () => {
    const now = new Date().getTime();
    const escalationThreshold =
      kitchenTimerConfig.escalationTimeoutMinutes * 60 * 1000; // Convert to milliseconds

    for (const order of Object.values(orders)) {
      // Check orders that are not completed and not already escalated
      if (
        (order.status === OrderStatus.New ||
          order.status === OrderStatus.InPreparation) &&
        !escalatedOrders.has(order.id) &&
        order.createdAt
      ) {
        const orderCreatedTime = new Date(order.createdAt).getTime();
        const totalTime = now - orderCreatedTime;

        if (totalTime >= escalationThreshold) {
          try {
            // Mark order as escalated to prevent duplicate alerts
            setEscalatedOrders((prev) => new Set(prev).add(order.id));

            // Send escalation alert to manager
            await sendOrderEscalationToManager(
              order.id,
              order.customerName,
              order.totalAmount,
              order.items,
              order.status,
              Math.floor(totalTime / 60000)
            );

            console.log(
              `Order escalation sent for order ${order.id} after ${Math.floor(
                totalTime / 60000
              )} minutes total time`
            );
          } catch (error) {
            console.error(
              `Failed to send escalation for order ${order.id}:`,
              error
            );
          }
        }
      }
    }
  }, [orders, escalatedOrders]);

  // Set up alert checking interval
  useEffect(() => {
    // Only set up interval if there are orders to check
    if (Object.keys(orders).length > 0) {
      intervalRef.current = setInterval(() => {
        checkForWaitingOrders();
        checkForEscalatedOrders();
      }, 30000); // Check every 30 seconds
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    orders,
    alertedOrders,
    escalatedOrders,
    checkForWaitingOrders,
    checkForEscalatedOrders,
  ]);

  // Calculate dashboard statistics using configurable thresholds
  const totalOrders = Object.keys(orders).length;
  const completedOnTime = Object.values(orders).filter(
    (order) =>
      order.status === OrderStatus.Completed &&
      order.completedAt &&
      order.startedAt &&
      new Date(order.completedAt).getTime() -
        new Date(order.startedAt).getTime() <=
        kitchenTimerConfig.onTimeThresholdMinutes * 60 * 1000
  ).length;

  const delayedOrders = Object.values(orders).filter(
    (order) =>
      order.status === OrderStatus.Completed &&
      order.completedAt &&
      order.startedAt &&
      new Date(order.completedAt).getTime() -
        new Date(order.startedAt).getTime() >
        kitchenTimerConfig.delayedThresholdMinutes * 60 * 1000
  ).length;

  // Filter orders based on selected stat
  const getFilteredOrders = () => {
    if (!filterType) return orders;

    switch (filterType) {
      case "total":
        return orders;
      case "onTime":
        return Object.values(orders).filter((order) =>
          order.status === OrderStatus.Completed &&
          order.completedAt &&
          order.startedAt
            ? new Date(order.completedAt).getTime() -
                new Date(order.startedAt).getTime() <=
              kitchenTimerConfig.onTimeThresholdMinutes * 60 * 1000
            : false
        );
      case "delayed":
        return Object.values(orders).filter((order) =>
          order.status === OrderStatus.Completed &&
          order.completedAt &&
          order.startedAt
            ? new Date(order.completedAt).getTime() -
                new Date(order.startedAt).getTime() >
              kitchenTimerConfig.delayedThresholdMinutes * 60 * 1000
            : false
        );
      default:
        return orders;
    }
  };

  // Handle order status change
  const handleOrderStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      const now = new Date().toString();
      let startedAt: string | undefined;
      let completedAt: string | undefined;

      // Determine which timestamps to update
      if (newStatus === OrderStatus.InPreparation) {
        startedAt = now;
        // Remove from alerted orders when preparation starts
        setAlertedOrders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      } else if (newStatus === OrderStatus.Completed) {
        completedAt = now;
        // Remove from both alerted and escalated orders when completed
        setAlertedOrders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
        setEscalatedOrders((prev) => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
        });
      }

      // Update Firestore
      await updateOrderStatus(orderId, newStatus, startedAt, completedAt);

      // Local state update remains the same
      setOrders((prevOrders: any) => {
        const updatedOrders = { ...prevOrders };
        if (orderId in updatedOrders) {
          const order = updatedOrders[orderId];
          updatedOrders[orderId] = {
            ...order,
            status: newStatus,
            ...(startedAt && { startedAt }),
            ...(completedAt && { completedAt }),
          };
        }
        return updatedOrders;
      });
    } catch (error) {
      console.error("Failed to update order status:", error);
      // You might want to add error handling UI feedback here
    }
  };

  // Handle menu item availability toggle
  const handleMenuItemAvailabilityChange = async (
    changes: Record<string, boolean>
  ) => {
    try {
      // Update local state and get updated menu items
      let updatedMenuItems: any;

      setMenuItems((prevMenuItems: any) => {
        updatedMenuItems = {
          categories: prevMenuItems.categories.map((category: any) => ({
            ...category,
            menuItems: category.menuItems.map((item: any) => ({
              ...item,
              available: changes.hasOwnProperty(item.id)
                ? changes[item.id]
                : item.available,
            })),
          })),
        };
        return updatedMenuItems;
      });

      // Wait for state update before sending data
      console.log(updatedMenuItems.categories);
      await updateMenuItemsAvailability(updatedMenuItems.categories);
    } catch (error) {
      console.error("Failed to update menu items availability:", error);
      // Optionally, show an error toast
    }
  };

  console.log(menuItems);

  // Handle stat card click for filtering
  const handleStatCardClick = (type: string) => {
    setFilterType((prevType) => (prevType === type ? null : type));
    setActiveTab("orders");
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Kitchen</h1>
        <p className="text-muted-foreground">
          Manage orders, track preparation times, and update menu availability
        </p>
        {/* Timer Configuration Display */}
        <div className="text-xs text-muted-foreground">
          Timer Config: {kitchenTimerConfig.totalPreparationMinutes}min total |
          Delivery alert at{" "}
          {kitchenTimerConfig.totalPreparationMinutes -
            kitchenTimerConfig.deliveryReadinessMinutes}
          min | Escalation at {kitchenTimerConfig.escalationTimeoutMinutes}min
        </div>
      </div>

      {/* Dashboard Statistics */}
      <div className="grid gap-3 md:grid-cols-3">
        <Card
          className={`flex-1 min-w-[140px] border-l-4 border-l-primary cursor-pointer hover:border-primary transition-colors ${
            filterType === "total" ? "border-primary bg-muted/50" : ""
          }`}
          onClick={() => handleStatCardClick("total")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-primary/10 p-2 rounded-full">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Orders
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{totalOrders}</span>
                <span className="text-xs text-muted-foreground">Today</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`flex-1 min-w-[140px] border-l-4 border-l-green-500 cursor-pointer hover:border-primary transition-colors ${
            filterType === "onTime" ? "border-primary bg-muted/50" : ""
          }`}
          onClick={() => handleStatCardClick("onTime")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-green-500/10 p-2 rounded-full">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Completed On Time
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{completedOnTime}</span>
                <span className="text-xs text-muted-foreground">
                  {totalOrders > 0
                    ? `${Math.round(
                        (completedOnTime / totalOrders) * 100
                      )}% of total`
                    : "0% of total"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`flex-1 min-w-[140px] border-l-4 border-l-amber-500 cursor-pointer hover:border-primary transition-colors ${
            filterType === "delayed" ? "border-primary bg-muted/50" : ""
          }`}
          onClick={() => handleStatCardClick("delayed")}
        >
          <CardContent className="p-4 flex items-center gap-3">
            <div className="bg-amber-500/10 p-2 rounded-full">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Delayed Orders
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{delayedOrders}</span>
                <span className="text-xs text-muted-foreground">
                  {totalOrders > 0
                    ? `${Math.round(
                        (delayedOrders / totalOrders) * 100
                      )}% of total`
                    : "0% of total"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        defaultValue="orders"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="orders">Order Management</TabsTrigger>
          <TabsTrigger value="menu">Menu Management</TabsTrigger>
        </TabsList>
        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center space-x-2">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search orders by ID or customer name..."
                className="pl-8"
              />
            </div>
            {filterType && (
              <div className="text-sm text-muted-foreground">
                Filtered by:{" "}
                {filterType === "total"
                  ? "All Orders"
                  : filterType === "onTime"
                  ? "Completed On Time"
                  : "Delayed Orders"}
              </div>
            )}
          </div>
          <OrderBoard
            orders={getFilteredOrders()}
            onOrderStatusChange={handleOrderStatusChange}
          />
        </TabsContent>
        <TabsContent value="menu">
          <MenuManagement
            menuItems={menuItems}
            onAvailabilityChange={handleMenuItemAvailabilityChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
