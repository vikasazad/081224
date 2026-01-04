import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Users, DollarSign, Clock, Settings } from "lucide-react";
import { format } from "date-fns";

const HotelRoomHistory = ({ data }: any) => {
  console.log("data", data);
  const [isExpanded, setIsExpanded] = useState<Set<string>>(new Set());
  const [expandedOrder, setExpandedOrder] = useState<Set<string>>(new Set());
  const [expandedService, setExpandedService] = useState<Set<string>>(
    new Set()
  );

  const OrderDetailsTable = ({
    items,
    timeOfFullfilment,
    timeOfRequest,
  }: any) => {
    // console.log(timeOfFullfilment, timeOfRequest);
    return (
      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <h4 className="font-medium text-sm">Order Details</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b">
              <tr>
                <th className="text-left py-2">ITEM ID</th>
                <th className="text-left py-2">NAME</th>
                <th className="text-left py-2">PORTION</th>
                <th className="text-right py-2">PRICE</th>
                <th className="text-right py-2">REQUEST TIME</th>
                <th className="text-right py-2">FULFILLMENT TIME</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id}>
                  <td className="py-2">{item.id}</td>
                  <td className="py-2">{item.name}</td>
                  <td className="py-2">{item.quantity}</td>
                  <td className="py-2 text-right">₹{item.price}</td>
                  <td className="py-2 text-right">
                    {timeOfRequest
                      ? format(new Date(timeOfRequest), "HH:mm (d MMM)")
                      : "N/A"}
                  </td>
                  <td className="py-2 text-right">
                    {timeOfFullfilment
                      ? format(new Date(timeOfFullfilment), "HH:mm (d MMM)")
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const PaymentDetailsTable = ({ payment }: { payment: any }) => (
    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
      <h4 className="font-medium text-sm">Payment Details</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left py-2">ID</th>
              <th className="text-left py-2">MODE</th>
              <th className="text-left py-2">TXN TIME</th>
              <th className="text-right py-2">PRICE</th>
              {/* <th className="text-right py-2">PRICE (DISC)</th> */}
              {/* <th className="text-center py-2">DISC TYPE</th> */}
              {/* <th className="text-right py-2">DISC AMT</th> */}
              {/* <th className="text-center py-2">DISC CODE</th> */}
              <th className="text-center py-2">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">{payment.paymentId}</td>
              <td className="py-2">{payment.mode}</td>
              <td className="py-2">
                {new Date(payment.timeOfTransaction).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="py-2 text-right">₹{payment.price}</td>
              {/* <td className="py-2 text-right">${payment.priceDisc}</td> */}
              {/* <td className="py-2 text-center">{payment.discType}</td> */}
              {/* <td className="py-2 text-right">${payment.discAmt}</td> */}
              {/* <td className="py-2 text-center">{payment.discCode}</td> */}
              <td className="py-2 text-center">
                <Badge
                  className={
                    payment.paymentStatus === "pending"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  {payment.paymentStatus}
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
  function formatDateRange(checkIn: any, checkOut: any) {
    const options: any = { month: "short", day: "numeric" }; // Define formatting options
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    const checkInFormatted = checkInDate.toLocaleDateString("en-US", options);
    const checkOutFormatted = checkOutDate.toLocaleDateString("en-US", options);

    const year = checkInDate.getFullYear(); // Get the year from check-in
    return `${checkInFormatted} - ${checkOutFormatted}, ${year}`;
  }
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder((prevExpandedOrders) => {
      const newExpandedOrders = new Set(prevExpandedOrders);
      if (newExpandedOrders.has(orderId)) {
        newExpandedOrders.delete(orderId);
      } else {
        newExpandedOrders.add(orderId);
      }
      return newExpandedOrders;
    });
  };
  const toggleServiceExpansion = (orderId: string) => {
    setExpandedService((prevExpandedOrders) => {
      const newExpandedOrders = new Set(prevExpandedOrders);
      if (newExpandedOrders.has(orderId)) {
        newExpandedOrders.delete(orderId);
      } else {
        newExpandedOrders.add(orderId);
      }
      return newExpandedOrders;
    });
  };
  const toggleDataExpansion = (orderId: string) => {
    setIsExpanded((prevExpandedOrders) => {
      const newExpandedOrders = new Set(prevExpandedOrders);
      if (newExpandedOrders.has(orderId)) {
        newExpandedOrders.delete(orderId);
      } else {
        newExpandedOrders.add(orderId);
      }
      return newExpandedOrders;
    });
  };

  return (
    <>
      {data?.data ? (
        <Card className="w-full max-w-4xl shadow-lg">
          <CardHeader className="bg-gray-50">
            <CardTitle className="text-xl font-semibold flex items-center justify-between">
              Room History
              <Badge className="ml-2">Room {data.room}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="border rounded-lg">
              <button
                onClick={() =>
                  toggleDataExpansion(data.data?.bookingDetails?.bookingId)
                }
                className="w-full hover:bg-gray-50 p-4 rounded-lg flex items-center justify-between transition-colors"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <Users className="h-5 w-5 text-gray-500" />
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {data.data?.bookingDetails?.customer?.name}
                        </p>
                        <p className="font-medium">
                          {`(${data.data?.bookingDetails?.customer?.phone})`}
                        </p>
                      </div>

                      <p className="text-sm text-gray-500">
                        {formatDateRange(
                          data.data?.bookingDetails?.checkIn,
                          data.data?.bookingDetails?.checkOut
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <Badge>Checked Out</Badge>
                    <p className="font-semibold">
                      ₹{data.data?.bookingDetails?.payment?.price}
                    </p>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform ${
                        isExpanded.has(data.data?.bookingDetails?.bookingId)
                          ? "transform rotate-180"
                          : ""
                      }`}
                    />
                  </div>
                </div>
              </button>

              {isExpanded.has(data.data?.bookingDetails?.bookingId) && (
                <div className="px-4   pt-2 pb-4 space-y-6">
                  {/* Additional Booking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                    <div>
                      <span className="font-semibold">Booking ID: </span>
                      <span>
                        {data.data?.bookingDetails?.bookingId ?? "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">No. of Guests: </span>
                      <span>
                        {data.data?.bookingDetails?.noOfGuests ?? "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">
                        Nights: {data.data?.bookingDetails?.nights}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Attendant: </span>
                      <span>
                        {data.data?.bookingDetails?.attendant ?? "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold">Inclusions: </span>
                      <span>
                        {Array.isArray(data.data?.bookingDetails?.inclusions)
                          ? data.data?.bookingDetails?.inclusions.join(", ")
                          : data.data?.bookingDetails?.inclusions ?? "N/A"}
                      </span>
                    </div>
                    {data.data?.bookingDetails?.specialRequirements && (
                      <div>
                        <span className="font-semibold">
                          Special Requirements:{" "}
                          {data.data?.bookingDetails?.specialRequirements ??
                            "N/A"}
                        </span>{" "}
                      </div>
                    )}
                  </div>

                  {/* Room Service Order Section */}
                  {data.data?.diningDetails?.orders.map(
                    (el: any, i: number) => (
                      <div className="border rounded-lg" key={i}>
                        <button
                          onClick={() => toggleOrderExpansion(el.orderId)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="font-medium">{el.orderId}</p>
                              <p className="text-sm text-gray-500">
                                {el.items.length} items •{" "}
                                {data.data?.bookingDetails?.customer?.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <Badge className="bg-green-100 text-green-800">
                              {el.status}
                            </Badge>
                            <p className="font-medium">₹{el?.payment?.price}</p>
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${
                                expandedOrder.has(el.orderId)
                                  ? "transform rotate-180"
                                  : ""
                              }`}
                            />
                          </div>
                        </button>
                        {expandedOrder.has(el.orderId) && (
                          <div className="p-4 space-y-4">
                            <OrderDetailsTable
                              items={el.items}
                              timeOfFullfilment={el.timeOfFullfilment}
                              timeOfRequest={el.timeOfRequest}
                            />
                            <PaymentDetailsTable payment={el.payment} />
                          </div>
                        )}
                      </div>
                    )
                  )}

                  {/* Services Section */}
                  {data.data?.servicesUsed.map((el: any, i: number) => (
                    <div className="border rounded-lg" key={i}>
                      <button
                        onClick={() => toggleServiceExpansion(el.serviceId)}
                        className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <div>
                            <p className="font-medium">{el.serviceName}</p>
                            <p className="text-sm text-gray-500">
                              {data.data?.bookingDetails?.customer?.name} •
                              {el.time}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge>{el.status}</Badge>
                          <p className="font-medium">₹{el.price}</p>
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              expandedService.has(el.serviceId)
                                ? "transform rotate-180"
                                : ""
                            }`}
                          />
                        </div>
                      </button>
                      {expandedService.has(el.serviceId) && (
                        <div className="p-4">
                          <PaymentDetailsTable payment={el.payment} />
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Maintenance Section */}
                  {Object.values(data.data?.issuesReported).map(
                    (el: any, i: number) => (
                      <div className="bg-gray-50 p-4 rounded-lg" key={i}>
                        <h3 className="font-medium mb-3 flex items-center gap-2">
                          <Settings className="h-4 w-4" />
                          {el.name}
                        </h3>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-medium">{el.category}</p>
                            <p className="text-gray-500">
                              {el.attendant} • {el.description}
                            </p>
                            <p className="text-gray-500">
                              Reported:{" "}
                              {new Date(el.reportTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              • Resolved:{" "}
                              {new Date(el.resolutionTime).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {el.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        "Not available"
      )}
    </>
  );
};

export default HotelRoomHistory;
