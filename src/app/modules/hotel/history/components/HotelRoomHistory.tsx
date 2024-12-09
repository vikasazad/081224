import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, Users, DollarSign, Clock, Settings } from "lucide-react";

const HotelRoomHistory = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState<any>(null);
  const [expandedService, setExpandedService] = useState<any>(null);

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
              <th className="text-right py-2">REQUEST TIME</th>
              <th className="text-right py-2">FULFILLMENT TIME</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any) => (
              <tr key={item.id}>
                <td className="py-2">{item.id}</td>
                <td className="py-2">{item.name}</td>
                <td className="py-2">{item.portion}</td>
                <td className="py-2 text-right">${item.price}</td>
                <td className="py-2 text-right">{item.requestTime}</td>
                <td className="py-2 text-right">{item.fulfillmentTime}</td>
              </tr>
            ))}
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
              <th className="text-right py-2">PRICE (DISC)</th>
              <th className="text-center py-2">DISC TYPE</th>
              <th className="text-right py-2">DISC AMT</th>
              <th className="text-center py-2">DISC CODE</th>
              <th className="text-center py-2">STATUS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="py-2">{payment.id}</td>
              <td className="py-2">{payment.mode}</td>
              <td className="py-2">{payment.txnTime}</td>
              <td className="py-2 text-right">${payment.price}</td>
              <td className="py-2 text-right">${payment.priceDisc}</td>
              <td className="py-2 text-center">{payment.discType}</td>
              <td className="py-2 text-right">${payment.discAmt}</td>
              <td className="py-2 text-center">{payment.discCode}</td>
              <td className="py-2 text-center">
                <Badge
                  className={
                    payment.status === "pending"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  {payment.status}
                </Badge>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <Card className="w-full max-w-4xl shadow-lg">
      <CardHeader className="bg-gray-50">
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          Room History
          <Badge className="ml-2">Room 101</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="border rounded-lg">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full hover:bg-gray-50 p-4 rounded-lg flex items-center justify-between transition-colors"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-gray-500" />
                <div className="text-left">
                  <p className="font-medium">Vipin</p>
                  <p className="text-sm text-gray-500">
                    Sept 25 - Sept 26, 2024
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <Badge>Checked Out</Badge>
                <p className="font-semibold">₹675</p>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    isExpanded ? "transform rotate-180" : ""
                  }`}
                />
              </div>
            </div>
          </button>

          {isExpanded && (
            <div className="px-4 pt-2 pb-4 space-y-6">
              {/* Room Service Order Section */}
              <div className="border rounded-lg">
                <button
                  onClick={() => setExpandedOrder("OR:R024")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Order #OR:R024</p>
                      <p className="text-sm text-gray-500">
                        2 items • Michael Brown
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className="bg-green-100 text-green-800">
                      completed
                    </Badge>
                    <p className="font-medium">$27</p>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedOrder === "OR:R024"
                          ? "transform rotate-180"
                          : ""
                      }`}
                    />
                  </div>
                </button>
                {expandedOrder === "OR:R024" && (
                  <div className="p-4 space-y-4">
                    <OrderDetailsTable
                      items={[
                        {
                          id: "kdi2",
                          name: "Club Sandwich",
                          portion: "Regular",
                          price: 15,
                          requestTime: "3:40:00 PM",
                          fulfillmentTime: "3:55:00 PM",
                        },
                        {
                          id: "iosn3r3",
                          name: "Caesar Salad",
                          portion: "Large",
                          price: 12,
                          requestTime: "3:40:00 PM",
                          fulfillmentTime: "3:55:00 PM",
                        },
                      ]}
                    />
                    <PaymentDetailsTable
                      payment={{
                        id: "RO24092101",
                        mode: "room charge",
                        txnTime: "12:30:00 PM",
                        price: 27,
                        priceDisc: 27,
                        discType: "none",
                        discAmt: 0,
                        discCode: "",
                        status: "pending",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Services Section */}
              <div className="border rounded-lg">
                <button
                  onClick={() => setExpandedService("SE:123")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <div>
                      <p className="font-medium">Swedish Massage</p>
                      <p className="text-sm text-gray-500">
                        Sarah Johnson • 5:17 PM - 6:17 PM
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge>on checkout</Badge>
                    <p className="font-medium">$80</p>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        expandedService === "SE:123"
                          ? "transform rotate-180"
                          : ""
                      }`}
                    />
                  </div>
                </button>
                {expandedService === "SE:123" && (
                  <div className="p-4">
                    <PaymentDetailsTable
                      payment={{
                        id: "SPA24092101",
                        mode: "room charge",
                        txnTime: "12:30:00 PM",
                        price: 80,
                        priceDisc: 72,
                        discType: "percentage",
                        discAmt: 10,
                        discCode: "SPAWEEKEND",
                        status: "on checkout",
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Maintenance Section */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Maintenance
                </h3>
                <div className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-medium">Leaky Faucet</p>
                    <p className="text-gray-500">
                      Robert Lee • Bathroom sink faucet is dripping
                    </p>
                    <p className="text-gray-500">
                      Reported: 3:17 PM • Resolved: 3:30 PM
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    Completed
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HotelRoomHistory;
