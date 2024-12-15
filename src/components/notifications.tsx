"use client";

import React, { useEffect, useState } from "react";
import { Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useNotification } from "@/hooks/useFcmToken";

import { v4 as uuidv4 } from "uuid"; // Add this for generating unique IDs

type NotificationType = "Hotel" | "Restaurant" | "Issues" | "Payments";

interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  timestamp: string;
}

export function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const markAllAsRead = () => {
    setNotifications([]);
  };

  const getNotificationBadge = (type: NotificationType) => {
    const styles = {
      Hotel: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
      Restaurant: "bg-green-100 text-green-700 hover:bg-green-100/80",
      Issues: "bg-red-100 text-red-700 hover:bg-red-100/80",
      Payments: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80",
    }[type];

    return (
      <span
        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${styles}`}
      >
        {type}
      </span>
    );
  };

  const { notificationPayload } = useNotification();

  useEffect(() => {
    if (notificationPayload) {
      const newNotification: Notification = {
        id: uuidv4(), // Generate a unique ID
        type: notificationPayload.title as NotificationType, // Map title to type
        message: notificationPayload.body, // Use body as the message
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      setNotifications((prev) => [newNotification, ...prev]);
    }
  }, [notificationPayload]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "BACKGROUND_MESSAGE") {
          const { title, body } = event.data.payload.notification;

          const newNotification: Notification = {
            id: uuidv4(), // Generate a unique ID
            type: title as NotificationType, // Map title to type
            message: body, // Use body as the message
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };

          // console.log("first", newNotification);

          setNotifications((prev) => [newNotification, ...prev]);
        }
      });
    }
  }, []);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative ">
          <Bell className="h-5 w-5" />
          {notifications.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {notifications.length}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[380px] mr-4"
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="font-normal border-b p-4">
          <div className="flex flex-col space-y-1">
            <p className="text-base font-semibold">Notifications</p>
            <p className="text-sm text-muted-foreground">
              You have {notifications.length} unread messages
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuGroup className="max-h-[450px] overflow-auto">
          {notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              className="flex flex-col items-start p-4 cursor-default"
            >
              <div className="flex w-full gap-2">
                {getNotificationBadge(notif.type)}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 ml-auto shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(notif.id);
                  }}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              </div>
              <p className="text-sm mt-2 font-medium">{notif.message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {notif.timestamp}
              </p>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full text-sm font-medium"
            onClick={markAllAsRead}
          >
            Mark all as read
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
