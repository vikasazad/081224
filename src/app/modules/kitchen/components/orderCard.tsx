"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertCircle } from "lucide-react";
import { KitchenTimerConfig, type Order, OrderStatus } from "@/types/kitchen";
import OrderTimer from "@/app/modules/kitchen/components/orderTimer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { kitchenTimerConfig } from "./kitchenDashboard";

interface OrderCardProps {
  order: Order;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
  nextStatus: OrderStatus | null;
  nextStatusLabel: string;
  showTimer?: boolean;
  kitchenTimerConfig: KitchenTimerConfig;
}

export default function OrderCard({
  order,
  onStatusChange,
  nextStatus,
  nextStatusLabel,
  showTimer = false,
  kitchenTimerConfig,
}: OrderCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAlertVisible, setIsAlertVisible] = useState(false);

  // Calculate time in preparation if applicable
  const getTimeInPreparation = () => {
    if (
      order.status === OrderStatus.Completed &&
      order.startedAt &&
      order.completedAt
    ) {
      const startTime = new Date(order.startedAt).getTime();
      const endTime = new Date(order.completedAt).getTime();
      const diffMinutes = Math.floor((endTime - startTime) / (1000 * 60));
      return `${diffMinutes} min`;
    }
    return null;
  };

  // Handle timer alert
  const handleTimerAlert = () => {
    setIsAlertVisible(true);
    // Play sound if browser supports it
    try {
      console.log("Playing alert sound");
    } catch (error) {
      console.error("Could not play alert sound", error);
    }
  };

  // Clear alert when order status changes
  useEffect(() => {
    if (order.status !== OrderStatus.InPreparation) {
      setIsAlertVisible(false);
    }
  }, [order.status]);

  return (
    <Card
      className={`
      border-l-4 
      ${order.status === OrderStatus.New ? "border-l-blue-500" : ""} 
      ${
        order.status === OrderStatus.InPreparation ? "border-l-yellow-500" : ""
      } 
      ${order.status === OrderStatus.Completed ? "border-l-green-500" : ""}
      ${isAlertVisible ? "bg-red-50 animate-pulse dark:bg-red-950/20" : ""}
    `}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-bold">Order #{order.id}</h3>
            <p className="text-sm text-muted-foreground">
              {order.customerName}
            </p>
          </div>
          <Badge
            variant={
              order.status === OrderStatus.New
                ? "default"
                : order.status === OrderStatus.InPreparation
                ? "secondary"
                : "outline"
            }
          >
            {order.status}
          </Badge>
        </div>

        <div className="space-y-1 mt-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>
                {item?.count} x {item.name} - {item?.quantity}
              </span>
              <span>₹{item.price}</span>
            </div>
          ))}
          <div className="border-t mt-2 pt-2 flex justify-between font-medium">
            <span>Total</span>
            <span>₹{order?.totalAmount}</span>
          </div>
        </div>

        {/* Show timer for orders in preparation */}
        {showTimer && order.startedAt && (
          <div className="mt-3">
            <OrderTimer
              startTime={new Date(order.startedAt)}
              duration={kitchenTimerConfig?.totalPreparationMinutes}
              onAlert={handleTimerAlert}
              order={order}
              kitchenTimerConfig={kitchenTimerConfig}
            />
            {isAlertVisible && (
              <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400 text-sm font-medium">
                <AlertCircle className="h-4 w-4" />
                Food is ready to serve
              </div>
            )}
          </div>
        )}

        {/* Show preparation time for completed orders */}
        {order.status === OrderStatus.Completed && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {getTimeInPreparation()}
            {order.startedAt &&
              order.completedAt &&
              new Date(order.completedAt).getTime() -
                new Date(order.startedAt).getTime() >
                15 * 60 * 1000 && (
                <Badge
                  variant="outline"
                  className="ml-auto text-red-500 border-red-200 dark:border-red-800"
                >
                  Delayed
                </Badge>
              )}
            {order.startedAt &&
              order.completedAt &&
              new Date(order.completedAt).getTime() -
                new Date(order.startedAt).getTime() <=
                15 * 60 * 1000 && (
                <Badge
                  variant="outline"
                  className="ml-auto text-green-500 border-green-200 dark:border-green-800"
                >
                  On Time
                </Badge>
              )}
          </div>
        )}
      </CardContent>

      {nextStatus && (
        <CardFooter className="px-4 pb-4 pt-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="default" className="w-full">
                      {nextStatusLabel}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Confirm Status Change</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to move order #{order.id} to{" "}
                        {nextStatus}?
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          onStatusChange(order.id, nextStatus);
                          setIsDialogOpen(false);
                        }}
                      >
                        Confirm
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>
                <p>Move order to {nextStatus}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      )}
    </Card>
  );
}
