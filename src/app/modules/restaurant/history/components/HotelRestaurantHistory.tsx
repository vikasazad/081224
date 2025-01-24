import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Users, Settings } from "lucide-react";

const HotelRestaurantHistory = ({ data }: any) => {
  const [isExpanded, setIsExpanded] = useState<Set<string>>(new Set());
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  console.log("data", data);

  const OrderDetailsTable = ({ items }: { items: any }) => (
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
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => {
              console.log("item", item);
              return (
                <tr key={item.itemId}>
                  <td className="py-2">{item.itemId}</td>
                  <td className="py-2">{item.itemName}</td>
                  <td className="py-2">{item.portionSize}</td>
                  <td className="py-2 text-right">₹{Number(item.price)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

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
              {/* <th className="text-right py-2">PRICE (DISC)</th>
              <th className="text-center py-2">DISC TYPE</th>
              <th className="text-right py-2">DISC AMT</th>
              <th className="text-center py-2">DISC CODE</th> */}
              <th className="text-center py-2">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">{payment.paymentId}</td>
              <td className="py-2">{payment.mode}</td>
              <td className="py-2">
                {payment.timeOfTransaction.toLocaleString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </td>
              <td className="py-2 text-right">₹{payment.price}</td>
              {/* <td className="py-2 text-right">${payment.priceAfterDiscount}</td>
              <td className="py-2 text-center">{payment.discType}</td>
              <td className="py-2 text-right">${payment.discAmt}</td>
              <td className="py-2 text-center">{payment.discCode}</td> */}
              <td className="py-2 text-center">
                <Badge
                  className={
                    payment.status === "pending"
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

  const TimeFormatter = ({
    timeSeated,
    timeLeft,
  }: {
    timeSeated: string;
    timeLeft: string;
  }) => {
    const formatTime = (time: string) => {
      const dateObj = new Date(time);
      return dateObj.toLocaleString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formatDate = (time: string) => {
      const dateObj = new Date(time);
      return dateObj.toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
      });
    };

    const formattedTimeSeated = formatTime(timeSeated);
    const formattedTimeLeft = formatTime(timeLeft);
    const formattedDate = formatDate(timeSeated);
    const time = `${formattedTimeSeated} - ${formattedTimeLeft} ${formattedDate}`;

    return time;
  };
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders((prevExpandedOrders) => {
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
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-xl font-semibold flex items-center justify-between">
            Table History
            <Badge className="ml-2">Table {data.table}</Badge>
          </CardTitle>
        </CardHeader>
        {data.data.length > 0 &&
          data.data
            .filter((table: any) => table.diningDetails.location === data.table)
            .map((item: any, i: number) => (
              <CardContent className="p-6" key={i}>
                <div className="border rounded-lg">
                  <button
                    onClick={() =>
                      toggleDataExpansion(item.diningDetails.orders[0].orderId)
                    }
                    className="w-full hover:bg-gray-50 p-4 rounded-lg flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <Users className="h-5 w-5 text-gray-500" />
                        <div className="text-left">
                          <p className="font-medium">
                            {item.diningDetails.attendant}
                          </p>
                          <p className="text-sm text-gray-500">
                            {TimeFormatter({
                              timeSeated: item.diningDetails.timeSeated,
                              timeLeft: item.diningDetails.timeLeft,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <Badge>{item.diningDetails.status}</Badge>
                        <p className="font-semibold">
                          ₹
                          {item.transctions.reduce(
                            (total: any, data: any) =>
                              total + Number(data.payment.price),
                            0
                          )}
                        </p>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            isExpanded.has(item.diningDetails.orders[0].orderId)
                              ? "transform rotate-180"
                              : ""
                          }`}
                        />
                      </div>
                    </div>
                  </button>

                  {isExpanded.has(item.diningDetails.orders[0].orderId) && (
                    <div className="px-4 pt-2 pb-4 space-y-6">
                      {/* Room Service Order Section */}
                      {item.diningDetails.orders.map(
                        (odr: any, itm: number) => (
                          <div className="border rounded-lg" key={itm}>
                            <button
                              onClick={() => toggleOrderExpansion(odr.orderId)}
                              className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                            >
                              <div className="flex  gap-2">
                                <div>
                                  <p className="font-medium text-left">
                                    {odr.orderId}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {odr.items.length} items • {odr.attendant}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <Badge className="bg-green-100 text-green-800">
                                  {odr.status}
                                </Badge>
                                <p className="font-medium">
                                  ₹{odr.payment.price}
                                </p>
                                <ChevronDown
                                  className={`h-4 w-4 transition-transform ${
                                    expandedOrders.has(odr.orderId)
                                      ? "transform rotate-180"
                                      : ""
                                  }`}
                                />
                              </div>
                            </button>
                            {expandedOrders.has(odr.orderId) && (
                              <div className="p-4 space-y-4" key={itm}>
                                <OrderDetailsTable items={odr.items} />
                                <PaymentDetailsTable payment={odr.payment} />
                              </div>
                            )}
                          </div>
                        )
                      )}

                      {/* Maintenance Section */}
                      {Object.values(item.issuesReported).map(
                        (iss: any, id: number) => (
                          <div className="bg-gray-50 p-4 rounded-lg" key={id}>
                            <h3 className="font-medium mb-3 flex items-center gap-2">
                              <Settings className="h-4 w-4" />
                              {iss.category}
                            </h3>
                            <div className="flex items-center justify-between text-sm">
                              <div>
                                <p className="font-medium">{iss.name}</p>
                                <p className="text-gray-500">
                                  {iss.attendant} • {iss.description}
                                </p>
                                <p className="text-gray-500">
                                  Reported:{" "}
                                  {iss.reportTime.toLocaleString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}{" "}
                                  • Resolved:{" "}
                                  {iss.resolutionTime.toLocaleString("en-US", {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  })}
                                </p>
                              </div>
                              <Badge className="bg-green-100 text-green-800">
                                {iss.status}
                              </Badge>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            ))}
      </Card>
    </>
  );
};

export default HotelRestaurantHistory;
