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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

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
  endTime: string,
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
    endTime,
    paymentStatus,
    specialRequirements,
  };
}

function processData(data: any) {
  const rows: any = [];

  // const formatTime = (time: string) => format(new Date(time), "p");
  // const formatDate = (date: string) => format(new Date(date), "dd/MM/yyyy");

  if (data.hotel?.rooms) {
    data.hotel.rooms.forEach((room: any) => {
      if (room.bookingDetails.status !== "available") {
        rows.push(
          createData(
            room.bookingDetails?.bookingId,
            room.bookingDetails.customer.name,
            room.bookingDetails.location,
            room.bookingDetails.noOfGuests,
            room.bookingDetails.payment?.price || 0,
            room.bookingDetails.status,
            room.bookingDetails.attendant || "",
            room.bookingDetails.payment?.paymentId || "",
            room.bookingDetails.checkIn,
            room.bookingDetails.checkOut,
            room.bookingDetails.payment?.paymentStatus || "",
            room.bookingDetails.specialRequirements
          )
        );
      }
    });
  }

  if (data.hotel?.rooms) {
    data.hotel?.rooms.forEach((table: any) => {
      // console.log("TABLE", table);
      if (table?.diningDetails?.status !== "available") {
        table?.diningDetails?.orders?.forEach((item: any) => {
          // console.log("HOTEKLLLLL", item);
          rows.push(
            createData(
              item.orderId,
              table.bookingDetails.customer?.name || "",
              table.diningDetails.location,
              table.diningDetails.noOfGuests,
              item.payment.price || 0,
              item.status,
              item?.attendant || "",
              item?.payment?.paymentId || "",
              item?.timeOfRequest,
              item?.timeOfFullfilment,
              item.payment.paymentStatus || "",
              item?.specialRequirements
            )
          );
        });
      }
    });
  }
  if (data.restaurant?.tables) {
    data.restaurant.tables.forEach((table: any) => {
      if (table.diningDetails.status !== "available") {
        table.diningDetails.orders.forEach((item: any) => {
          rows.push(
            createData(
              item.orderId,
              table.diningDetails.customer?.name || "",
              table.diningDetails.location,
              table.diningDetails.noOfGuests,
              item.payment.price || 0,
              table.diningDetails.status,
              item?.attendant || "",
              item?.payment?.paymentId || "",
              item?.timeOfRequest,
              item?.timeOfFullfilment,
              item.payment.paymentStatus || "",
              item?.specialRequirements
            )
          );
        });
      }
    });
  }

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
                service.startTime,
                service.endTime,
                service.payment?.paymentStatus || "",
                service.specialRequirement || ""
              )
            );
          }
        });
      }
    });
  }

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
              issue.reportTime,
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

  // Sort rows by startTime in descending order
  rows.sort(
    (a: any, b: any) =>
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
  );

  // Format start and end times in HR:MIN DD:MM format
  rows.forEach((row: any) => {
    // Format startTime if it's a valid date
    if (row.startTime && !isNaN(new Date(row.startTime).getTime())) {
      row.startTime = format(new Date(row.startTime), "HH:mm (d MMM)");
    }

    // Format endTime if it's a valid date
    if (row.endTime && !isNaN(new Date(row.endTime).getTime())) {
      row.endTime = format(new Date(row.endTime), "HH:mm (d MMM)");
    }
  });

  // console.log("ROWS", rows);
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
  { id: "endTime", label: "End Time" },
  { id: "paymentStatus", label: "Payment Status" },
  { id: "specialRequirements", label: "Sp. Req." },
];

export default function OrderTable({ data }: { data: any }) {
  const rows = processData(data);
  // console.log("ROWSssss", rows);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
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
                        ₹
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
                  <TableCell>{row.endTime}</TableCell>
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
        </div>
      </CardContent>
    </Card>
  );
}

OrderTable.propTypes = {
  data: PropTypes.object.isRequired,
};
