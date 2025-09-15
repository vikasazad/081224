"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";

import { Separator } from "@/components/ui/separator";

import { PlusCircle, MoreVertical, User, IndianRupee } from "lucide-react";
import StatusChip from "@/components/ui/StatusChip";
import {
  addKitchenOrder,
  getTableData,
  setOfflineTable,
  updateOrdersForAttendant,
} from "../../utils/staffData";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sendNotification } from "@/lib/sendNotification";
import {
  assignAttendantSequentially,
  getOnlineStaffFromFirestore,
  setAttendent,
  setHistory,
  setTables,
} from "../utils/tableApi";
import {
  calculateOrderTotal,
  calculateTax,
  calculateFinalAmount,
} from "../../utils/clientside";

const generateRandomOrderNumber = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
export default function Occupied({
  data,
  status,
  businessInfo,
}: {
  data: any;
  status: any;
  businessInfo: any;
}) {
  console.log("businessInfo", businessInfo);
  const [tableData, setTableData] = useState<any>([]);
  const [addItems, setAddItems] = useState<any>([]);
  const [categorySelect, setCategorySelect] = useState("Food");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [categoryItems, setCategoryItems] = useState([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<any[]>([]);
  const [openPaymentConfirmation, setOpenPaymentConfirmation] = useState(false);
  const [currentStatusChange, setCurrentStatusChange] = useState<any>(null);
  const [addedType, setAddedType] = useState<"food" | "issue" | null>(null);
  const [availableAttendant, setavailableAttendant] = useState<any>([]);
  const [openFinalSubmitConfirmation, setOpenFinalSubmitConfirmation] =
    useState(false);
  const [finalSubmitData, setFinalSubmitData] = useState<any>(null);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  useEffect(() => {
    getTableData().then((data) => {
      setAddItems(data);
    });
  }, []);
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

  const handleCategorySearchChange = (e: any) => {
    console.log("addItems", addItems);
    const search = e.target.value;
    setCategorySearchTerm(search);

    if (search) {
      const arr =
        categorySelect === "Food"
          ? addItems.foodMenuItems
          : categorySelect === "Issue"
          ? addItems.hotelTableIssues
          : [];

      const filtered = arr.filter((item: any) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setCategoryItems(filtered);
    } else {
      setCategoryItems([]);
    }
  };
  const handleCategoryItemSelect = (item: any) => {
    setSelectedCategoryItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

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
    console.log("attendantData", attendantData);

    // if (!token) {
    //   console.error("Attendant token not found for", attendant);
    //   return;
    // }

    // Copy the current room data for modification
    const updatedTableData = [...tableData];
    console.log("orderId", orderId.startsWith("RES:"));
    // Perform changes based on the order ID prefix
    if (orderId.startsWith("RES:")) {
      // Update booking details
      console.log("HERE.....................");
      updatedTableData[index].diningDetails.attendant =
        attendantData?.name || "";
      updatedTableData[index].diningDetails.attendantToken = token || "";
      updatedTableData[index].diningDetails.attendantContact = contact || "";
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
        updatedTableData[index].diningDetails.orders[
          orderIndex
        ].attendantContact = contact;
      }
    } else if (orderId.startsWith("IS:")) {
      // Update issuesReported
      if (updatedTableData[index].issuesReported) {
        const issueKeys = Object.keys(updatedTableData[index].issuesReported);
        for (const key of issueKeys) {
          if (updatedTableData[index].issuesReported[key].issueId === orderId) {
            updatedTableData[index].issuesReported[key].attendant = attendant;
            updatedTableData[index].issuesReported[key].attendantToken = token;
            updatedTableData[index].issuesReported[key].attendantContact =
              contact;
            break;
          }
        }
      }
    } else {
      console.error("Unrecognized orderId prefix for", orderId);
      return;
    }

    console.log("updatedTableData..........", updatedTableData);
    console.log("HERE.....................");
    console.log("updatedTableData", updatedTableData[index]);

    updateOrdersForAttendant(attendant, orderId, contact);
    setAttendent(updatedTableData);
    setTableData(updatedTableData);

    // setTableData((prevTableData: any) => {
    //   const updatedTableData = [...prevTableData];

    //   // Find the order and update its attendant
    //   const orderIndex = updatedTableData[index].diningDetails.orders.findIndex(
    //     (order: any) => order.orderId === orderId
    //   );

    //   const token = availableAttendant.find(
    //     (data: any) => data.name === attendant
    //   );

    //   if (orderIndex !== -1) {
    //     updatedTableData[index].diningDetails.attendant = attendant;
    //     updatedTableData[index].diningDetails.attendantToken =
    //       token.notificationToken;
    //     updatedTableData[index].diningDetails.orders[orderIndex].attendant =
    //       attendant;
    //     updatedTableData[index].diningDetails.orders[
    //       orderIndex
    //     ].attendantToken = attendant;
    //     if (
    //       updatedTableData[index].diningDetails.orders[orderIndex].payment
    //         .paymentStatus === "paid"
    //     ) {
    //       updatedTableData[index].transctions[orderIndex].attendant = attendant;
    //       updatedTableData[index].transctions[orderIndex].attendantToken =
    //         token.notificationToken;
    //     }
    //     updateOrdersForAttendant(attendant, orderId);
    //     setAttendent(updatedTableData);
    //   }

    //   console.log("updatedTableData", updatedTableData);

    //   return updatedTableData;
    // });
  };

  console.log(tableData);

  const handleAdd = async (items: any[], index: number) => {
    console.log("AAAAAAAA", items);
    const updatedTableData: any = [...tableData];

    if (items[0].quantity) {
      const assignedAttendant: any =
        assignAttendantSequentially(availableAttendant);
      const newOrderId = `OR:R-${
        tableData[index].diningDetails.location
      }:${generateRandomOrderNumber()}`;
      setAddedType("food");
      const price = calculateOrderTotal(items);
      const gst = calculateTax(price, price, "restaurant", businessInfo.gstTax);
      const totalPrice = price + gst.gstAmount;
      updatedTableData[index] = {
        ...updatedTableData[index],
        diningDetails: {
          ...updatedTableData[index].diningDetails,
          attendant: assignedAttendant ? assignedAttendant.name : "Unassigned",
          attendantToken: assignedAttendant
            ? assignedAttendant.notificationToken
            : "",
          location:
            updatedTableData[index]?.diningDetails?.location || "Not Available",
          noOfGuests:
            updatedTableData[index]?.diningDetails?.noOfGuests ||
            "Not Available",
          timeOfRequest: new Date().toISOString(),
          timeOfFullfilment: "",
          orders: [
            ...(updatedTableData[index].diningDetails?.orders || []),
            {
              orderId: newOrderId,
              items: items,
              attendant: assignedAttendant
                ? assignedAttendant.name
                : "Unassigned",
              attendantToken: assignedAttendant
                ? assignedAttendant.notificationToken
                : "",
              status: "order placed",
              timeOfRequest: new Date().toISOString(),
              timeOfFullfilment: "",
              specialRequirement: "",
              payment: {
                discount: {
                  type: "none",
                  amount: 0,
                  code: "",
                },
                gst: {
                  ...gst,
                },
                subtotal: price,
                mode: "",
                paymentId: "",
                paymentStatus: "pending",
                price: price,
                totalPrice: totalPrice,
                priceAfterDiscount: "",
                timeOfTransaction: "",
                transctionId: "",
              },
            },
          ],
        },
      };

      if (availableAttendant) {
        const updatedAttendants = availableAttendant.map((staff: any) =>
          staff.name === assignedAttendant.name
            ? { ...staff, orders: [...staff.orders, newOrderId] }
            : staff
        );
        setavailableAttendant(updatedAttendants);
      }
      if (tableData[index]) {
        // const token =
        //   tableData[index]?.diningDetails.customer.notificationToken;
        // if (token) {
        //   console.log("token", token);
        //   sendNotification(
        //     token,
        //     "Item Added to Order!",
        //     "Hi, the item you requested has been added to your order and will be served shortly. Thank you for your patience!"
        //   );
        // }

        // const data = await setOfflineItem(updatedTableData);
        console.log("UPDATED", updatedTableData[index]);
        setOfflineTable(updatedTableData[index]);
        updateOrdersForAttendant(assignedAttendant.name, newOrderId);

        await addKitchenOrder(
          newOrderId,
          updatedTableData[index]?.diningDetails?.customer?.name,
          items,
          totalPrice,
          assignedAttendant.name,
          assignedAttendant.contact
        );
        updateOrdersForAttendant(
          assignedAttendant.name,
          newOrderId,
          assignedAttendant.contact
        );
      }
    } else if (items[0].issueSubtype) {
      // Issue item
      const assignedAttendant: any =
        assignAttendantSequentially(availableAttendant);
      const newOrderId = `IS:R-${
        tableData[index].diningDetails.location
      }:${generateRandomOrderNumber()}`;
      setAddedType("issue");
      const newIssue = {
        issueId: newOrderId,
        name: items[0].name,
        category: items[0].issueSubtype,
        description: issueDescription
          ? issueDescription
          : "No description provided",
        reportTime: new Date().toISOString(),
        status: "Assigned",
        attendant: assignedAttendant ? assignedAttendant.name : "Unassigned",
        attendantToken: assignedAttendant
          ? assignedAttendant.notificationToken
          : "",
        attendantContact: assignedAttendant ? assignedAttendant.contact : "",
      };

      updatedTableData[index] = {
        ...updatedTableData[index],
        issuesReported: {
          ...updatedTableData[index].issuesReported,
          [items[0].name]: newIssue,
        },
      };

      if (availableAttendant) {
        const updatedAttendants = availableAttendant.map((staff: any) =>
          staff.name === assignedAttendant.name
            ? { ...staff, orders: [...staff.orders, newOrderId] }
            : staff
        );
        setavailableAttendant(updatedAttendants);
      }
      if (tableData[index]) {
        // const token = roomData[index]?.diningDetails.customer.notificationToken;
        // if (token) {
        //   console.log("token", token);
        //   sendNotification(
        //     token,
        //     "Item Added to Order!",
        //     "Hi, the item you requested has been added to your order and will be served shortly. Thank you for your patience!"
        //   );
        // }

        // const data = await setOfflineItem(updatedTableData);
        console.log("UPDATED", updatedTableData[index]);
        setOfflineTable(updatedTableData[index]);
        updateOrdersForAttendant(
          assignedAttendant.name,
          newOrderId,
          assignedAttendant.contact
        );
      }
    }
    console.log("updatedTableData", updatedTableData[index]);

    setTableData(updatedTableData);
    setSelectedCategoryItems([]);
    setCategorySearchTerm("");
    setIssueDescription("");
    // setIsAddDialogOpen(false);
  };

  // console.log("first", availableAttendant);

  const handleStatusChange = async (
    status: string,
    orderId: string,
    index: number
  ) => {
    console.log("roomData", status, orderId, index);
    if (status === "Paid" || status === "Completed") {
      setCurrentStatusChange({ status, orderId, index });
      setOpenPaymentConfirmation(true);
    } else if (status === "Served") {
      if (tableData[index]) {
        const token =
          tableData[index]?.diningDetails.customer.notificationToken;
        console.log("TOKEN", token);
        updateStatus(status, orderId, index);
        if (token) {
          sendNotification(
            token,
            "Your Food is Ready!",
            "your food is prepared and will be served to your table shortly. Sit back, relax, and Bon appétit!"
          );
        }
      }
    } else if (status === "Accepted") {
      if (tableData[index]) {
        const token =
          tableData[index]?.diningDetails.customer.notificationToken;
        const name = tableData[index]?.diningDetails.customer.name;
        const data = Object.values(tableData[index]?.diningDetails.orders).map(
          (item: any) => {
            if (item.serviceId === orderId) return item.serviceName;
          }
        );

        updateStatus(status, orderId, index);
        if (token) {
          sendNotification(
            token,
            "Service Request Accepted!",
            `Hi ${name}, your request for ${data} has been accepted. Our team will be with you shortly to provide the service. Thank you for your patience!`
          );
        }
      }
    } else if (status === "Denied") {
      if (tableData[index]) {
        const token =
          tableData[index]?.diningDetails.customer.notificationToken;
        const name = tableData[index]?.diningDetails.customer.name;
        const data = Object.values(tableData[index]?.diningDetails.orders).map(
          (item: any) => {
            if (item.serviceId === orderId) return item.serviceName;
          }
        );
        updateStatus(status, orderId, index);
        if (token) {
          sendNotification(
            token,
            "Service Request Denied!",
            `Hi ${name}, we regret to inform you that your request for ${data} has been denied. Please feel free to reach out to our staff for further assistance or to explore other available options. We apologize for any inconvenience caused!`
          );
        }
      }
    } else if (status === "Cancelled") {
      if (tableData[index]) {
        const token =
          tableData[index]?.diningDetails.customer.notificationToken;
        const name = tableData[index]?.diningDetails.customer.name;
        let headline, message;
        if (orderId.startsWith("IS")) {
          headline = "Issue cancelled sucessfully";
          message = "Your registered issue is cancelled successfully";
        }
        const data = Object.values(tableData[index]?.diningDetails.orders).map(
          (item: any) => {
            if (item.serviceId === orderId) return item.serviceName;
          }
        );
        headline = "Service Request Cancelled Sucessfully!";
        message = `Hi ${name}, Your request for ${data} has been cancelled. Please feel free to reach out to our staff for further assistance or to explore other available options.`;
        updateStatus(status, orderId, index);
        if (token) {
          sendNotification(token, headline, message);
        }
      }
    } else {
      updateStatus(status, orderId, index);
    }
  };

  const updateStatus = (status: any, orderId: any, index: any) => {
    setTableData((prevTableData: any) => {
      const updatedTableData: any = [...prevTableData];

      if (orderId.startsWith("RES")) {
        console.log("here in ros", orderId, status);
        const orderIndex = updatedTableData[
          index
        ].diningDetails.orders.findIndex(
          (order: any) => order.orderId === orderId
        );
        if (orderIndex !== -1) {
          if (status.toLocaleLowerCase() === "served") {
            console.log("here1");
            // Set fulfillment time first
            updatedTableData[index].diningDetails.timeOfFullfilment =
              new Date().toISOString();
            updatedTableData[index].diningDetails.orders[
              orderIndex
            ].timeOfFullfilment = new Date().toISOString();
            updatedTableData[index].diningDetails.orders[orderIndex].status =
              status;

            // Check payment status and set final status accordingly
          } else if (status.toLocaleLowerCase() === "paid") {
            console.log("here3");
            updatedTableData[index].diningDetails.orders[orderIndex].status =
              status;
            updatedTableData[index].diningDetails.orders[orderIndex].payment = {
              ...updatedTableData[index].diningDetails.orders[orderIndex]
                .payment,
              mode: "cash",
              paymentId: "cash",
              paymentStatus: "paid",
              timeOfTransaction: new Date().toISOString(),
              transctionId: "cash",
            };
          } else {
            updatedTableData[index].diningDetails.orders[orderIndex].status =
              status;
          }
        }
      } else if (orderId.startsWith("OR")) {
        const orderIndex = updatedTableData[
          index
        ].diningDetails.orders.findIndex(
          (order: any) => order.orderId === orderId
        );
        if (orderIndex !== -1) {
          updatedTableData[index].diningDetails.orders[orderIndex].status =
            status;
          if (status.toLocaleLowerCase() === "served") {
            updatedTableData[index].diningDetails.timeOfFullfilment =
              new Date().toString();
            updatedTableData[index].diningDetails.orders[
              orderIndex
            ].timeOfFullfilment = new Date().toISOString();
          }
          if (status.toLocaleLowerCase() === "paid") {
            updatedTableData[index].diningDetails.orders[orderIndex].payment = {
              ...updatedTableData[index].diningDetails.orders[orderIndex]
                .payment, // Preserve existing fields
              mode: "cash",
              paymentId: "cash",
              paymentStatus: "paid",
              timeOfTransaction: new Date().toISOString(),
              transctionId: "cash",
            };
          }
        }
      } else if (orderId.startsWith("IS")) {
        const issuesReported = updatedTableData[index].issuesReported;
        for (const issueType in issuesReported) {
          if (issuesReported[issueType].issueId === orderId) {
            issuesReported[issueType].status = status;
            issuesReported[issueType].timeOfFullfilment =
              new Date().toISOString();
            break;
          }
        }
      }

      return updatedTableData;
    });

    console.log("tableData", tableData);
    if (status.toLocaleLowerCase() === "paid") setTables(tableData);
    if (status.toLocaleLowerCase() === "served") setTables(tableData);
    if (status.toLocaleLowerCase() === "cancelled") setTables(tableData);
    if (status.toLocaleLowerCase() === "fixed") setTables(tableData);

    // setTableData((prevTableData: any) => {
    //   const updatedTableData: any = [...prevTableData];

    //   if (orderId.startsWith("OR") || orderId.startsWith("BOK")) {
    //     const orderIndex = updatedTableData[
    //       index
    //     ].diningDetails.orders.findIndex(
    //       (order: any) => order.orderId === orderId
    //     );
    //     if (orderIndex !== -1) {
    //       updatedTableData[index].diningDetails.orders[orderIndex].status =
    //         status;
    //       if (status.toLocaleLowerCase() === "served") {
    //         if (
    //           updatedTableData[index].diningDetails.orders[orderIndex].payment
    //             .paymentStatus === "paid"
    //         ) {
    //           updateStatus("paid", orderId, index);
    //         } else {
    //           updateStatus("Pending", orderId, index);
    //         }
    //       }
    //       if (status.toLocaleLowerCase() === "paid") {
    //         updatedTableData[index].diningDetails.orders[orderIndex].payment = {
    //           ...updatedTableData[index].diningDetails.orders[orderIndex]
    //             .payment, // Preserve existing fields
    //           mode: "cash",
    //           paymentId: "cash",
    //           paymentStatus: "paid",
    //           timeOfTransaction: new Date().toISOString(),
    //           transctionId: "cash",
    //         };
    //       }
    //     }
    //   } else if (orderId.startsWith("IS")) {
    //     const issuesReported = updatedTableData[index].issuesReported;
    //     for (const issueType in issuesReported) {
    //       if (issuesReported[issueType].issueId === orderId) {
    //         issuesReported[issueType].status = status;
    //         break;
    //       }
    //     }
    //   }

    //   return updatedTableData;
    // });

    // console.log("tableData", tableData);
    // if (status.toLocaleLowerCase() === "served") setTables(tableData);
    // if (status.toLocaleLowerCase() === "paid") setTables(tableData);
  };

  const handleFinalSubmit = (item: any, main: number) => {
    console.log("clicked", item, main);

    const remaining = item.diningDetails.orders.find(
      (data: any) => data.payment.paymentStatus === "pending"
    )?.orderId;

    if (remaining) {
      // If there are pending payments, show a payment required dialog
      setOpenFinalSubmitConfirmation(true);
      setFinalSubmitData({ item, main, type: "payment_pending" });
    } else {
      // If no pending payments, ask for table closure confirmation
      setOpenFinalSubmitConfirmation(true);
      setFinalSubmitData({ item, main, type: "close_table" });
    }
  };

  const handleTableClose = () => {
    console.log("finalSubmitData", finalSubmitData);
    const type =
      finalSubmitData.item.diningDetails.capicity === "2"
        ? "twoseater"
        : finalSubmitData.item.diningDetails.capicity === "4"
        ? "fourseater"
        : "sixseater";
    setHistory(finalSubmitData.item, type);
  };

  return (
    <div className="space-y-4">
      {tableData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(tableData).map((item: any, main) => (
            <Card key={main}>
              <CardContent className="px-4 py-0">
                <Accordion type="single" collapsible>
                  <AccordionItem value={String(main)}>
                    <AccordionTrigger>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold">
                            T-{item.diningDetails.location}
                          </span>
                          <span className="text-slate-600">
                            {item.diningDetails.customer.name}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <User className="w-4 h-4 mr-1" />
                            {item.diningDetails.noOfGuests}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 ">
                          <div>
                            <Dialog
                              open={openDialogIndex === main}
                              onOpenChange={(isOpen) =>
                                setOpenDialogIndex(isOpen ? main : null)
                              }
                            >
                              <DialogTrigger asChild>
                                <div
                                  className="flex items-center gap-1 px-2 py-1 border rounded-md"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                  }}
                                >
                                  <PlusCircle size={16} />
                                  Add
                                </div>
                              </DialogTrigger>
                              <DialogContent className="">
                                <DialogHeader>
                                  <DialogTitle>
                                    {item.diningDetails.location}
                                  </DialogTitle>
                                  <DialogDescription></DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                  <Select
                                    value={categorySelect}
                                    onValueChange={(value) =>
                                      setCategorySelect(value)
                                    }
                                    disabled={addedType !== null}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Food">Food</SelectItem>
                                      <SelectItem value="Issue">
                                        Issue
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {addedType && (
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setAddedType(null);
                                        setCategorySelect("Food");
                                        setSelectedCategoryItems([]);
                                        setCategorySearchTerm("");
                                        setIssueDescription("");
                                      }}
                                    >
                                      Reset Selection
                                    </Button>
                                  )}
                                  <Input
                                    placeholder={`Search ${categorySelect} items`}
                                    value={categorySearchTerm}
                                    onChange={handleCategorySearchChange}
                                  />
                                  {categoryItems.length > 0 && (
                                    <div className="max-h-[300px] overflow-y-auto border rounded px-2">
                                      <Table>
                                        <TableBody>
                                          {categoryItems.map((item: any, i) => (
                                            <TableRow key={i}>
                                              <TableCell>{i + 1}.</TableCell>
                                              <TableCell>{item.name}</TableCell>
                                              {categorySelect === "Food" && (
                                                <TableCell>
                                                  <div className="flex items-center gap-2">
                                                    <span className="text-sm text-muted-foreground">
                                                      {item.quantity}
                                                    </span>
                                                    <Input
                                                      type="number"
                                                      min="1"
                                                      defaultValue="1"
                                                      className="w-20"
                                                      onChange={(e) => {
                                                        item.count =
                                                          parseInt(
                                                            e.target.value
                                                          ) || 1;
                                                      }}
                                                    />
                                                  </div>
                                                </TableCell>
                                              )}
                                              {categorySelect === "Food" && (
                                                <TableCell>
                                                  {Number(item.price)}
                                                </TableCell>
                                              )}
                                              {categorySelect === "Issue" && (
                                                <TableCell>
                                                  {item.issueSubtype}
                                                </TableCell>
                                              )}
                                              <TableCell>
                                                <Checkbox
                                                  checked={selectedCategoryItems.includes(
                                                    item
                                                  )}
                                                  onCheckedChange={() => {
                                                    if (
                                                      categorySelect === "Food"
                                                    ) {
                                                      if (!item.count) {
                                                        item.count = 1;
                                                      }
                                                    }
                                                    handleCategoryItemSelect(
                                                      item
                                                    );
                                                  }}
                                                />
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                  {categorySelect === "Issue" && (
                                    <Textarea
                                      placeholder="Notes"
                                      value={issueDescription}
                                      onChange={(e) =>
                                        setIssueDescription(e.target.value)
                                      }
                                    />
                                  )}
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() =>
                                      handleAdd(selectedCategoryItems, main)
                                    }
                                    disabled={
                                      selectedCategoryItems.length === 0
                                    }
                                  >
                                    Add
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                          <StatusChip status={item.diningDetails.status} />
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        {item.diningDetails.orders.map((order: any, i: any) => {
                          // console.log("ORDER", order);
                          return (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between items-center mt-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {order.orderId}
                                  </Badge>

                                  <Select
                                    onValueChange={(value) =>
                                      handleAttendantChange(
                                        order.orderId,
                                        value,
                                        main
                                      )
                                    }
                                  >
                                    <SelectTrigger className="w-[140px] py-0 h-6">
                                      <SelectValue
                                        placeholder={order.attendant}
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

                                  <StatusChip status={order.status} />
                                </div>

                                <DropdownMenu>
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
                                    {status.dining.map((stat: any, id: any) => (
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
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <Separator />
                              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                <div className="">
                                  {order.items.map((itm: any, id: number) => (
                                    <div
                                      key={id}
                                      className="flex items-center justify-between"
                                    >
                                      <div className="flex flex-col py-2">
                                        <span className="font-medium">
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
                                      <span className="text-green-600 font-medium">
                                        ₹{Number(itm.price)}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">
                                      Subtotal
                                    </span>
                                  </div>
                                  <span className="text-green-600 font-semibold">
                                    ₹{order.payment.subtotal}
                                  </span>
                                </div>
                                {order.payment.gst.gstPercentage && (
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="font-medium">{`Tax (${order.payment.gst.gstPercentage}%)`}</span>
                                    </div>
                                    <span className="text-green-600 font-semibold">
                                      ₹{order.payment.gst.gstAmount}
                                    </span>
                                  </div>
                                )}

                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">Total</span>
                                    {order.payment.paymentStatus === "paid" ? (
                                      <>
                                        <Badge
                                          variant="outline"
                                          className="mx-2"
                                        >
                                          Paid
                                        </Badge>
                                        <Badge
                                          variant="outline"
                                          className="mx-2"
                                        >
                                          {order.payment.mode}
                                        </Badge>
                                      </>
                                    ) : (
                                      <Badge variant="outline" className="mx-2">
                                        Pending
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-green-600 font-semibold">
                                    ₹{order.payment.price}
                                  </span>
                                </div>
                              </div>

                              <Separator />
                            </div>
                          );
                        })}

                        {Object.values(item.issuesReported).map(
                          (issue: any, i) => (
                            <div key={i} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline">
                                    {issue.issueId}
                                  </Badge>
                                  <StatusChip status={issue.status} />
                                </div>

                                <DropdownMenu>
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
                                    {status.issue.map((stat: any, id: any) => (
                                      <DropdownMenuItem
                                        key={id}
                                        onClick={() =>
                                          handleStatusChange(
                                            stat,
                                            issue.issueId,
                                            main
                                          )
                                        }
                                      >
                                        {stat}
                                      </DropdownMenuItem>
                                    ))}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>

                              <Separator />
                              <div className="bg-slate-50 rounded-lg p-4">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-center">
                                      <span className="font-medium mr-2">
                                        {issue.name}
                                      </span>
                                      <Badge variant="outline">
                                        {issue.category}
                                      </Badge>
                                    </div>

                                    {issue.resolutionTime ? (
                                      <div className="flex">
                                        <Badge variant="outline">Paid</Badge>
                                        <span>
                                          {new Date(
                                            issue.resolutionTime
                                          ).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-sm text-slate-500">
                                        {new Date(
                                          issue.reportTime
                                        ).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-slate-600">
                                    {issue.description}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}

                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center gap-2">
                            <div>
                              {(() => {
                                const total = calculateFinalAmount(item);
                                return (
                                  <>
                                    {total ? (
                                      <div className="flex items-center">
                                        <IndianRupee
                                          className="text-green-600"
                                          size={20}
                                        />
                                        <span className="text-xl font-semibold mx-2">
                                          {total}
                                        </span>
                                        <Badge>Pending</Badge>
                                      </div>
                                    ) : (
                                      ""
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                            {/* <span className="text-xl font-semibold">
                              {calculateFinalAmount(item) || "0"}
                            </span> */}
                          </div>
                          <div className="flex gap-3">
                            <Button
                              className="flex items-center gap-2"
                              size="sm"
                              onClick={() => handleFinalSubmit(item, main)}
                            >
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <span className="text-gray-500 text-sm">No table data found</span>
        </div>
      )}
      <Dialog
        open={openPaymentConfirmation}
        onOpenChange={setOpenPaymentConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Cash Payment</DialogTitle>
            <DialogDescription>
              This action can only be done if the payment is in cash. Do you
              confirm that the payment has been received in cash?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col ">
            <Button
              variant="outline"
              onClick={() => setOpenPaymentConfirmation(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (currentStatusChange) {
                  updateStatus(
                    currentStatusChange.status,
                    currentStatusChange.orderId,
                    currentStatusChange.index
                  );
                }
                setOpenPaymentConfirmation(false);
              }}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openFinalSubmitConfirmation}
        onOpenChange={setOpenFinalSubmitConfirmation}
      >
        <DialogContent>
          <DialogHeader>
            {finalSubmitData?.type === "payment_pending" ? (
              <>
                <DialogTitle>Payment Pending</DialogTitle>
                <DialogDescription>
                  This order cannot be submitted because there are pending
                  payments. Please complete all payments before closing the
                  table.
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>Close Table Confirmation</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. Are you sure you want to close
                  the table?
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpenFinalSubmitConfirmation(false)}
            >
              Cancel
            </Button>
            {finalSubmitData?.type === "close_table" && (
              <Button
                onClick={() => {
                  // Logic to close the table
                  // You might want to implement a method to remove the table or mark it as closed
                  console.log("tableClosed");
                  setOpenFinalSubmitConfirmation(false);
                  handleTableClose();
                }}
              >
                Confirm Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
