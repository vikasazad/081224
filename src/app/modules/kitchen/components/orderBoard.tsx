"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import OrderCard from "@/app/modules/kitchen/components/orderCard";
import { KitchenTimerConfig, type Order, OrderStatus } from "@/types/kitchen";
// import { kitchenTimerConfig } from "./kitchenDashboard";

interface OrderBoardProps {
  orders: Order[];
  onOrderStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  kitchenTimerConfig: KitchenTimerConfig;
}

export default function OrderBoard({
  orders,
  onOrderStatusChange,
  kitchenTimerConfig,
}: OrderBoardProps) {
  // Filter and sort orders by status and respective timestamps
  // console.log("ORDERS", orders);
  const newOrders = Object.values(orders)
    .filter((order) => order.status === OrderStatus.New)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const inPreparationOrders = Object.values(orders)
    .filter((order) => order.status === OrderStatus.InPreparation)
    .sort((a, b) => {
      const dateA = a.startedAt ? new Date(a.startedAt).getTime() : 0;
      const dateB = b.startedAt ? new Date(b.startedAt).getTime() : 0;
      return dateB - dateA;
    });

  const completedOrders = Object.values(orders)
    .filter((order) => order.status === OrderStatus.Completed)
    .sort((a, b) => {
      const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      return dateB - dateA;
    });

  // console.log("inPreparationOrders", inPreparationOrders);
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* New Orders Column */}
      <Card>
        <CardHeader className="bg-muted/50 pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            Orders
            <span className="text-sm font-normal bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {newOrders.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {newOrders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No new orders
            </div>
          ) : (
            newOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={onOrderStatusChange}
                nextStatus={OrderStatus.InPreparation}
                nextStatusLabel="Start Preparation"
                kitchenTimerConfig={kitchenTimerConfig}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* In Preparation Column */}
      <Card>
        <CardHeader className="bg-muted/50 pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            In Preparation
            <span className="text-sm font-normal bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {inPreparationOrders.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {inPreparationOrders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No orders in preparation
            </div>
          ) : (
            inPreparationOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={onOrderStatusChange}
                nextStatus={OrderStatus.Completed}
                nextStatusLabel="Mark as Completed"
                showTimer={true}
                kitchenTimerConfig={kitchenTimerConfig}
              />
            ))
          )}
        </CardContent>
      </Card>

      {/* Completed Column */}
      <Card>
        <CardHeader className="bg-muted/50 pb-3">
          <CardTitle className="text-lg flex justify-between items-center">
            Completed
            <span className="text-sm font-normal bg-primary text-primary-foreground px-2 py-1 rounded-full">
              {completedOrders.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
          {completedOrders.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No completed orders
            </div>
          ) : (
            completedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusChange={onOrderStatusChange}
                nextStatus={null}
                nextStatusLabel=""
                kitchenTimerConfig={kitchenTimerConfig}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
