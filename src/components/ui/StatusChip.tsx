import React from "react";
import { Badge } from "@/components/ui/badge";

const StatusChip = ({ status }: { status: string }) => {
  // Capitalize the first letter of the status
  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  const stat = capitalize(status || "Error");

  const statusStyles: any = {
    Available: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(22, 119, 255)",
    },
    Reserved: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(255, 77, 79)",
    },
    Booked: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(255, 77, 79)",
    },
    Occupied: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(82, 196, 26)",
    },
    Cleaning: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(63, 81, 181)",
    },
    "Checked out": {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(22, 119, 255)",
    },
    "Checking in": {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(22, 119, 255)",
    },
    Upgraded: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(205, 220, 57)",
    },
    Paid: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(233, 30, 99)",
    },
    Ordering: {
      color: "rgb(19, 194, 194)",
      backgroundColor: "rgb(230, 255, 251)",
      borderColor: "rgb(92, 219, 211)",
    },
    "Order placed": {
      color: "rgb(194, 194, 19)",
      backgroundColor: "rgb(255, 251, 230)",
      borderColor: "rgb(219, 211, 92)",
    },
    "In progress": {
      color: "rgb(140, 19, 194)",
      backgroundColor: "rgb(251, 230, 255)",
      borderColor: "rgb(166, 92, 219)",
    },
    Served: {
      color: "rgb(82, 196, 26)",
      backgroundColor: "rgb(246, 255, 237)",
      borderColor: "rgb(149, 222, 100)",
    },
    Billed: {
      color: "rgb(250, 173, 20)",
      backgroundColor: "rgb(255, 251, 230)",
      borderColor: "rgb(255, 214, 102)",
    },
    Pending: {
      color: "rgb(19, 34, 94)",
      backgroundColor: "rgb(230, 230, 251)",
      borderColor: "rgb(92, 102, 158)",
    },
    Cancelled: {
      color: "rgb(255, 77, 79)",
      backgroundColor: "rgb(255, 241, 240)",
      borderColor: "rgb(255, 163, 158)",
    },
    Requested: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(22, 119, 255)",
    },
    Accepted: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(63, 81, 181)",
    },
    Denied: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(255, 77, 79)",
    },
    Completed: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(82, 196, 26)",
    },
    Opened: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(22, 119, 255)",
    },
    Assigned: {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(63, 81, 181)",
    },
    "Fixing required": {
      color: "rgb(255, 255, 255)",
      backgroundColor: "rgb(255, 77, 79)",
    },
  };

  const defaultStyle = {
    color: "rgb(0, 0, 0)",
    backgroundColor: "rgb(240, 240, 240)",
  };

  const style = statusStyles[stat] || defaultStyle;

  return (
    <div>
      <Badge
        style={{
          ...style,
        }}
      >
        {stat}
      </Badge>
    </div>
  );
};

export default StatusChip;
