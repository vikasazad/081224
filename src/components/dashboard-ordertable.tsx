"use client";

import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import StatusChip from "./ui/StatusChip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns"; // Ensure date consistency

function createData(
  id: string,
  name: string,
  locationUnit: string,
  people: string,
  price: string,
  status: string,
  attendant: string,
  paymentid: string,
  startTime: string,
  EndTime: string,
  paymentStatus: string,
  specialRequirements: string
) {
  return {
    id,
    name,
    locationUnit,
    people,
    price,
    status,
    attendant,
    paymentid,
    startTime,
    EndTime,
    paymentStatus,
    specialRequirements,
  };
}

function processData(data: any) {
  const rows: any = [];

  const formatTime = (time: string) => format(new Date(time), "p"); // Use a consistent format for time

  const formatDate = (date: string) => format(new Date(date), "dd/MM/yyyy"); // Consistent date formatting

  // Process hotel rooms
  if (data.hotel?.rooms) {
    data.hotel.rooms.forEach((room: any) => {
      if (room.bookingDetails.status !== "available") {
        rows.push(
          createData(
            room.bookingDetails?.bookingId,
            room.bookingDetails.customer.name,
            room.bookingDetails.location,
            room.bookingDetails.noOfGuests,
            room.bookingDetails.payment?.priceAfterDiscount || 0,
            room.bookingDetails.status,
            room.bookingDetails.attendant || "",
            room.bookingDetails.payment?.paymentId || "",
            formatDate(room.bookingDetails.checkIn), // Use consistent date format
            formatDate(room.bookingDetails.checkOut), // Use consistent date format
            room.bookingDetails.payment?.paymentStatus || "",
            room.bookingDetails.specialRequirements
          )
        );
      }
    });
  }

  // Process restaurant tables
  if (data.restaurant?.tables) {
    data.restaurant.tables.forEach((table: any) => {
      if (table.diningDetails.status !== "available") {
        rows.push(
          createData(
            table.diningDetails.orders[0].orderId,
            table.diningDetails.customer?.name || "",
            table.diningDetails.location,
            table.diningDetails.capacity,
            table.diningDetails?.payment?.priceAfterDiscount || 0,
            table.diningDetails.status,
            table.diningDetails?.attendant || "",
            table.diningDetails?.payment?.paymentId || "",
            formatTime(table.diningDetails?.timeSeated), // Consistent time format
            "",
            table.diningDetails?.payment?.paymentStatus || "",
            table.diningDetails?.specialRequirements
          )
        );
      }
    });
  }

  // Process hotel services
  if (data.hotel?.rooms) {
    data.hotel.rooms.forEach((room: any) => {
      if (room.servicesUsed) {
        Object.values(room.servicesUsed).forEach((service: any) => {
          if (service.status !== "closed") {
            rows.push(
              createData(
                service.serviceId,
                service.type,
                room.bookingDetails.location,
                room.bookingDetails.noOfGuests,
                service.payment?.priceAfterDiscount || 0,
                service.status,
                service.attendant,
                service.payment?.paymentId || "",
                formatTime(service.startTime), // Consistent time format
                formatTime(service.endTime), // Consistent time format
                service.payment?.paymentStatus || "",
                service.specialRequirement || ""
              )
            );
          }
        });
      }
    });
  }

  // Process issues reported
  const processIssues = (issues: any, locationUnit: any, people: any) => {
    if (issues) {
      Object.values(issues).forEach((issue: any) => {
        if (issue.status !== "closed") {
          rows.push(
            createData(
              issue.issueId,
              issue.name,
              locationUnit,
              people,
              "",
              issue.status,
              issue.attendant,
              "",
              formatTime(issue.reportTime), // Consistent time format
              "",
              "",
              issue.description
            )
          );
        }
      });
    }
  };

  if (data.hotel?.rooms) {
    data.hotel.rooms.forEach((room: any) => {
      processIssues(
        room.issuesReported,
        room.bookingDetails.location,
        room.bookingDetails.noOfGuests
      );
    });
  }

  if (data.restaurant?.tables) {
    data.restaurant.tables.forEach((table: any) => {
      processIssues(
        table.issuesReported,
        table.diningDetails.location,
        table.diningDetails.capacity
      );
    });
  }

  return rows;
}

const headCells = [
  { id: "id", label: "Id" },
  { id: "name", label: "Name" },
  { id: "locationUnit", label: "Location" },
  { id: "people", label: "People" },
  { id: "price", label: "Price" },
  { id: "status", label: "Status" },
  { id: "attendant", label: "Attendant" },
  { id: "paymentid", label: "Payment ID" },
  { id: "startTime", label: "Start Time" },
  { id: "EndTime", label: "End Time" },
  { id: "paymentStatus", label: "Payment Status" },
  { id: "specialRequirements", label: "Sp. Req." },
];

export default function OrderTable({ data }: { data: any }) {
  const rows = processData(data);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[600px]">
          {" "}
          {/* Adjust max height as needed */}
          <Table>
            <TableHeader>
              <TableRow>
                {headCells.map((cell) => (
                  <TableHead key={cell.id}>{cell.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row: any) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    <a href="#" className="text-primary hover:underline">
                      {row.id}
                    </a>
                  </TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.locationUnit}</TableCell>
                  <TableCell>{row.people}</TableCell>
                  <TableCell>
                    {row.price && (
                      <>
                        ₹{" "}
                        {new Intl.NumberFormat("en-IN").format(
                          Number(row.price)
                        )}
                      </>
                    )}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell>{row.attendant}</TableCell>
                  <TableCell>{row.paymentid}</TableCell>
                  <TableCell>{row.startTime}</TableCell>
                  <TableCell>{row.EndTime}</TableCell>
                  <TableCell>
                    {row.paymentStatus && (
                      <StatusChip status={row.paymentStatus} />
                    )}
                  </TableCell>
                  <TableCell>{row.specialRequirements}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

OrderTable.propTypes = {
  data: PropTypes.object.isRequired,
};
