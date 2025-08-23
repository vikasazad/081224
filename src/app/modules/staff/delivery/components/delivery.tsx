"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User, Phone, MapPin, Copy } from "lucide-react";
import StatusChip from "@/components/ui/StatusChip";
import {
  setOfflineRoom,
  updateOrdersForAttendant,
} from "../../utils/staffData";
import { Badge } from "@/components/ui/badge";
import { getOnlineStaffFromFirestore } from "../../tables/utils/tableApi";

export default function Delivery({ data }: { data: any }) {
  const [deliveryData, setDeliveryData] = useState<any>([]);
  // const [addItems, setAddItems] = useState<any>([]);
  const [availableAttendant, setavailableAttendant] = useState<any>([]);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);
  // const gstPercentage = "18";
  const copyToClipboard = async (text: string, phone: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedPhone(phone);
      setTimeout(() => setCopiedPhone(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };
  // console.log("addItems", addItems);
  useEffect(() => {
    console.log("DATA", data);
    setDeliveryData(data);
  }, [data]);

  // useEffect(() => {
  //   getRoomData().then((data) => {
  //     setAddItems(data);
  //   });
  // }, []);
  useEffect(() => {
    const unsubscribe = getOnlineStaffFromFirestore((result: any) => {
      if (result) {
        console.log("EHERHERHEHREHREHRHERH", result);
        setavailableAttendant(result);
      }
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleAttendantChange = (
    orderId: string,
    attendant: string,
    index: number
  ) => {
    console.log("HERE.....................", orderId, attendant, index);
    const attendantData = availableAttendant.find(
      (data: any) => data.name === attendant
    );
    const token = attendantData?.notificationToken;
    const contact = attendantData?.contact;

    // if (!token) {
    //   console.error("Attendant token not found for", attendant);
    //   return;
    // }

    // Copy the current room data for modification
    const updatedTableData = [...deliveryData];

    // Perform changes based on the order ID prefix
    if (orderId.startsWith("BOK:")) {
      // Update booking details
      console.log("HERE.....................");
      updatedTableData[index].bookingDetails.attendant = attendant;
      updatedTableData[index].bookingDetails.attendantToken = token;
    } else if (orderId.startsWith("OR:")) {
      // Update dining details and its orders
      const orderIndex = updatedTableData[index].diningDetails.orders.findIndex(
        (order: any) => order.orderId === orderId
      );
      if (orderIndex !== -1) {
        updatedTableData[index].diningDetails.attendant = attendant;
        updatedTableData[index].diningDetails.attendantToken = token;
        updatedTableData[index].diningDetails.orders[orderIndex].attendant =
          attendant;
        updatedTableData[index].diningDetails.orders[
          orderIndex
        ].attendantToken = token;
      }
    } else {
      console.error("Unrecognized orderId prefix for", orderId);
      return;
    }
    console.log("HERE.....................");
    console.log("updatedTableData", updatedTableData[index]);

    updateOrdersForAttendant(attendant, orderId, contact);
    setOfflineRoom(updatedTableData[index]);
    // Update the state with the modified data
    setDeliveryData(updatedTableData);
  };

  // const handleStatusChange = async (
  //   status: string,
  //   orderId: string,
  //   index: number
  // ) => {
  //   console.log("deliveryData", status, orderId, index);
  //   if (status === "Paid" || status === "Completed") {
  //     setCurrentStatusChange({ status, orderId, index });
  //     setOpenPaymentConfirmation(true);
  //   } else if (status === "Served") {
  //     if (deliveryData[index]) {
  //       const token =
  //         deliveryData[index]?.bookingDetails.customer.notificationToken;
  //       console.log("TOKEN", token);
  //       updateStatus(status, orderId, index);
  //       if (token) {
  //         sendNotification(
  //           token,
  //           "Your Food is Ready!",
  //           "your food is prepared and will be served to your table shortly. Sit back, relax, and Bon appétit!"
  //         );
  //       }
  //     }
  //   } else if (status === "Accepted") {
  //     if (deliveryData[index]) {
  //       const token =
  //         deliveryData[index]?.bookingDetails.customer.notificationToken;
  //       const name = deliveryData[index]?.bookingDetails.customer.name;
  //       const data = Object.values(deliveryData[index]?.servicesUsed).map(
  //         (item: any) => {
  //           if (item.serviceId === orderId) return item.serviceName;
  //         }
  //       );

  //       updateStatus(status, orderId, index);
  //       if (token) {
  //         sendNotification(
  //           token,
  //           "Service Request Accepted!",
  //           `Hi ${name}, your request for ${data} has been accepted. Our team will be with you shortly to provide the service. Thank you for your patience!`
  //         );
  //       }
  //     }
  //   } else if (status === "Denied") {
  //     if (deliveryData[index]) {
  //       const token =
  //         deliveryData[index]?.bookingDetails.customer.notificationToken;
  //       const name = deliveryData[index]?.bookingDetails.customer.name;
  //       const data = Object.values(deliveryData[index]?.servicesUsed).map(
  //         (item: any) => {
  //           if (item.serviceId === orderId) return item.serviceName;
  //         }
  //       );
  //       updateStatus(status, orderId, index);
  //       if (token) {
  //         sendNotification(
  //           token,
  //           "Service Request Denied!",
  //           `Hi ${name}, we regret to inform you that your request for ${data} has been denied. Please feel free to reach out to our staff for further assistance or to explore other available options. We apologize for any inconvenience caused!`
  //         );
  //       }
  //     }
  //   } else if (status === "Cancelled") {
  //     if (deliveryData[index]) {
  //       const token =
  //         deliveryData[index]?.bookingDetails.customer.notificationToken;
  //       const name = deliveryData[index]?.bookingDetails.customer.name;
  //       let headline, message;
  //       if (orderId.startsWith("IS")) {
  //         headline = "Issue cancelled sucessfully";
  //         message = "Your registered issue is cancelled successfully";
  //       }
  //       const data = Object.values(deliveryData[index]?.servicesUsed).map(
  //         (item: any) => {
  //           if (item.serviceId === orderId) return item.serviceName;
  //         }
  //       );
  //       headline = "Service Request Cancelled Sucessfully!";
  //       message = `Hi ${name}, Your request for ${data} has been cancelled. Please feel free to reach out to our staff for further assistance or to explore other available options.`;
  //       updateStatus(status, orderId, index);
  //       if (token) {
  //         sendNotification(token, headline, message);
  //       }
  //     }
  //   } else {
  //     updateStatus(status, orderId, index);
  //   }
  // };

  // const updateStatus = (status: any, orderId: any, index: any) => {
  //   setDeliveryData((prevTableData: any) => {
  //     const updatedRoomData: any = [...prevTableData];

  //     if (orderId === "checklist") {
  //       if (status.toLowerCase() === "paid") {
  //         updatedRoomData[index].checklist.payment = {
  //           ...updatedRoomData[index].checklist.payment,
  //           mode: "cash",
  //           paymentId: "cash",
  //           paymentStatus: "paid",
  //           timeOfTransaction: new Date().toISOString(),
  //           transctionId: "cash",
  //         };
  //       }
  //     } else if (orderId.startsWith("BOK")) {
  //       if (status.toLocaleLowerCase() === "paid") {
  //         updatedRoomData[index].bookingDetails.payment = {
  //           ...updatedRoomData[index].bookingDetails.payment, // Preserve existing fields
  //           mode: "cash",
  //           paymentId: "cash",
  //           paymentStatus: "paid",
  //           timeOfTransaction: new Date().toISOString(),
  //           transctionId: "cash",
  //         };
  //       } else {
  //         updatedRoomData[index].bookingDetails.payment.paymentStatus = status;
  //       }
  //     } else if (orderId.startsWith("RES")) {
  //       console.log("here in ros", orderId, status);
  //       const orderIndex = updatedRoomData[
  //         index
  //       ].diningDetails.orders.findIndex(
  //         (order: any) => order.orderId === orderId
  //       );
  //       if (orderIndex !== -1) {
  //         if (status.toLocaleLowerCase() === "served") {
  //           console.log("here1");
  //           // Set fulfillment time first
  //           updatedRoomData[index].diningDetails.timeOfFullfilment =
  //             new Date().toString();
  //           updatedRoomData[index].diningDetails.orders[
  //             orderIndex
  //           ].timeOfFullfilment = new Date().toString();
  //           updatedRoomData[index].diningDetails.orders[orderIndex].status =
  //             status;

  //           // Check payment status and set final status accordingly
  //         } else if (status.toLocaleLowerCase() === "paid") {
  //           console.log("here3");
  //           updatedRoomData[index].diningDetails.orders[orderIndex].status =
  //             status;
  //           updatedRoomData[index].diningDetails.orders[orderIndex].payment = {
  //             ...updatedRoomData[index].diningDetails.orders[orderIndex]
  //               .payment,
  //             mode: "cash",
  //             paymentId: "cash",
  //             paymentStatus: "paid",
  //             timeOfTransaction: new Date().toISOString(),
  //             transctionId: "cash",
  //           };
  //         } else {
  //           updatedRoomData[index].diningDetails.orders[orderIndex].status =
  //             status;
  //         }
  //       }
  //     } else if (orderId.startsWith("OR")) {
  //       const orderIndex = updatedRoomData[
  //         index
  //       ].diningDetails.orders.findIndex(
  //         (order: any) => order.orderId === orderId
  //       );
  //       if (orderIndex !== -1) {
  //         updatedRoomData[index].diningDetails.orders[orderIndex].status =
  //           status;
  //         if (status.toLocaleLowerCase() === "served") {
  //           updatedRoomData[index].diningDetails.timeOfFullfilment =
  //             new Date().toString();
  //           updatedRoomData[index].diningDetails.orders[
  //             orderIndex
  //           ].timeOfFullfilment = new Date().toString();
  //         }
  //         if (status.toLocaleLowerCase() === "paid") {
  //           updatedRoomData[index].diningDetails.orders[orderIndex].payment = {
  //             ...updatedRoomData[index].diningDetails.orders[orderIndex]
  //               .payment, // Preserve existing fields
  //             mode: "cash",
  //             paymentId: "cash",
  //             paymentStatus: "paid",
  //             timeOfTransaction: new Date().toISOString(),
  //             transctionId: "cash",
  //           };
  //         }
  //       }
  //     } else if (orderId.startsWith("SE")) {
  //       console.log("here in services", orderId, status);
  //       const servicesUsed = updatedRoomData[index].servicesUsed;
  //       servicesUsed.forEach((el: any, i: number) => {
  //         if (el.serviceId === orderId) {
  //           updatedRoomData[index].servicesUsed[i].status = status;
  //           if (status.toLocaleLowerCase() === "paid") {
  //             updatedRoomData[index].servicesUsed[i].payment = {
  //               ...updatedRoomData[index].servicesUsed[i].payment, // Preserve existing fields
  //               mode: "cash",
  //               paymentId: "cash",
  //               paymentStatus: "paid",
  //               timeOfTransaction: new Date().toISOString(),
  //               transctionId: "cash",
  //             };
  //           }
  //         }
  //       });
  //     } else if (orderId.startsWith("IS")) {
  //       const issuesReported = updatedRoomData[index].issuesReported;
  //       for (const issueType in issuesReported) {
  //         if (issuesReported[issueType].issueId === orderId) {
  //           issuesReported[issueType].status = status;
  //           break;
  //         }
  //       }
  //     }

  //     return updatedRoomData;
  //   });

  //   console.log("deliveryData", deliveryData);
  //   if (status.toLocaleLowerCase() === "paid") setRooms(deliveryData);
  //   if (status.toLocaleLowerCase() === "served") setRooms(deliveryData);
  //   if (status.toLocaleLowerCase() === "cancelled") setRooms(deliveryData);
  // };

  console.log("deliveryData", deliveryData);
  return (
    <div className="space-y-4 mb-10">
      {Object.values(deliveryData).length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(deliveryData).map((order: any) =>
            Object.values(order).map((item: any, main) => {
              console.log("ITEM", item);
              return (
                <Card key={main}>
                  <CardContent className="px-4 py-0">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="item-1">
                        <AccordionTrigger>
                          <div className="flex justify-between items-center w-full">
                            <div className="flex flex-col items-start">
                              <span className="text-xl font-bold">
                                {item.orderId}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(item?.timeOfRequest).toLocaleString(
                                  "en-US",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  }
                                )}
                              </span>
                            </div>
                            <StatusChip status={item?.status} />
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-1 gap-4">
                              <div className="w-full">
                                <Select
                                  onValueChange={(value) =>
                                    handleAttendantChange(
                                      item.orderId,
                                      value,
                                      main
                                    )
                                  }
                                >
                                  <SelectTrigger className="w-full py-0 h-8">
                                    <SelectValue
                                      placeholder={item?.deliveryPerson?.name}
                                    />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availableAttendant.map(
                                      (attendant: any) => (
                                        <SelectItem
                                          key={attendant.name}
                                          value={attendant.name}
                                        >
                                          {attendant.name}
                                        </SelectItem>
                                      )
                                    )}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 w-8 p-0 bg-transparent"
                                >
                                  <Phone className="h-3 w-3" />
                                </Button>
                                <Button size="sm" className="h-8 px-3 text-xs">
                                  Track
                                </Button>
                              </div>

                              {/* <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 w-8 p-0"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        {status.dining.map(
                                          (stat: any, id: any) => (
                                            <DropdownMenuItem
                                              key={id}
                                              onClick={() =>
                                                handleStatusChange(
                                                  stat,
                                                  order.orderId,
                                                  main
                                                )
                                              }
                                            >
                                              {stat}
                                            </DropdownMenuItem>
                                          )
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu> */}
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between pt-2">
                              <div className="w-[50%] flex items-center gap-2">
                                <User className="h-4 w-4 text-gray-500" />
                                <div>
                                  <p className="text-sm font-medium">
                                    {item?.customer?.name}
                                  </p>
                                  <div className="flex items-center gap-1">
                                    <p className="text-sm text-gray-500">
                                      {item?.customer?.phone}
                                    </p>
                                    <button
                                      onClick={() =>
                                        copyToClipboard(
                                          item?.customer?.phone,
                                          item?.customer?.phone
                                        )
                                      }
                                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                                      title="Copy phone number"
                                    >
                                      {copiedPhone === item?.customer?.phone ? (
                                        <span className="text-xs text-green-600">
                                          Copied!
                                        </span>
                                      ) : (
                                        <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <div className=" flex items-center gap-2">
                                  <MapPin className="h-4 w-4 text-gray-500 " />
                                  <div className="flex-1">
                                    <p className="text-sm text-gray-700">
                                      {item?.address.address}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {item?.address.distanceFromRestaurant} km
                                      away
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <Separator />

                            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                              <div className="">
                                {item?.items?.map((itm: any, id: number) => (
                                  <div
                                    key={id}
                                    className="flex items-center justify-between"
                                  >
                                    <div className="flex flex-col ">
                                      <span className="font-semibold">
                                        {itm.name}
                                      </span>
                                      <div className="flex items-center text-muted-foreground">
                                        <span className="font-normal mr-2">
                                          -
                                        </span>
                                        <span className="font-normal">
                                          {itm.quantity}
                                        </span>
                                      </div>
                                    </div>
                                    <span className="text-green-600 font-semibold">
                                      ₹{Number(itm.price)}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium">Subtotal</span>
                                </div>
                                <span className="text-green-600 font-medium">
                                  ₹{item?.payment?.subtotal}
                                </span>
                              </div>
                              {item?.payment?.gst.gstPercentage && (
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">{`Tax (${item?.payment?.gst.gstPercentage}%)`}</span>
                                  </div>
                                  <span className="text-green-600 font-medium">
                                    ₹{item?.payment?.gst.gstAmount}
                                  </span>
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-semibold">Total</span>
                                  {item?.payment.paymentStatus === "paid" ? (
                                    <>
                                      <Badge variant="outline" className="mx-2">
                                        Paid
                                      </Badge>
                                      <Badge variant="outline" className="mx-2">
                                        {item?.payment.mode}
                                      </Badge>
                                    </>
                                  ) : (
                                    <Badge variant="outline" className="mx-2">
                                      Pending
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-green-600 font-semibold">
                                  ₹{item?.payment.price}
                                </span>
                              </div>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <span className="text-gray-500 text-sm">No room data found</span>
        </div>
      )}
    </div>
  );
}
