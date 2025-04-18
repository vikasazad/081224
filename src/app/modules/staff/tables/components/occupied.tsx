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
import { getTableData, setOfflineTable } from "../../utils/staffData";
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
  calculateFinalAmount,
  calculateOrderTotal,
  calculateTax,
  getOnlineStaffFromFirestore,
  setAttendent,
  setHistory,
  setTables,
  updateOrdersForAttendant,
} from "../utils/tableApi";
export default function Occupied({ data, status }: { data: any; status: any }) {
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
  const gstPercentage = "";

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
    const search = e.target.value;
    setCategorySearchTerm(search);

    if (search) {
      const arr =
        categorySelect === "Food"
          ? addItems.foodMenuItems
          : categorySelect === "Issue"
          ? [
              { name: "General Cleanliness" },
              { name: "Bathroom" },
              { name: "Floors and Carpets" },
              { name: "Wi-Fi" },
              { name: "External Noise" },
              { name: "Internal Noise" },
              { name: "Odors" },
              { name: "Insects or Pests" },
              { name: "Personal Items" },
              { name: "Service" },
              { name: "Chairs" },
              { name: "Staff" },
              { name: "Food" },
              { name: "Payment" },
            ]
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
    setTableData((prevTableData: any) => {
      const updatedTableData = [...prevTableData];

      // Find the order and update its attendant
      const orderIndex = updatedTableData[index].diningDetails.orders.findIndex(
        (order: any) => order.orderId === orderId
      );

      const token = availableAttendant.find(
        (data: any) => data.name === attendant
      );

      if (orderIndex !== -1) {
        updatedTableData[index].diningDetails.attendant = attendant;
        updatedTableData[index].diningDetails.attendantToken =
          token.notificationToken;
        updatedTableData[index].diningDetails.orders[orderIndex].attendant =
          attendant;
        updatedTableData[index].diningDetails.orders[
          orderIndex
        ].attendantToken = attendant;
        if (
          updatedTableData[index].diningDetails.orders[orderIndex].payment
            .paymentStatus === "paid"
        ) {
          updatedTableData[index].transctions[orderIndex].attendant = attendant;
          updatedTableData[index].transctions[orderIndex].attendantToken =
            token.notificationToken;
        }
        updateOrdersForAttendant(attendant, orderId);
        setAttendent(updatedTableData);
      }

      console.log("updatedTableData", updatedTableData);

      return updatedTableData;
    });
  };

  console.log(tableData);

  const handleAdd = async (items: any[], index: number) => {
    console.log("AAAAAAAA", items);
    const updatedTableData: any = [...tableData];

    if (items[0].quantity) {
      const assignedAttendant: any =
        assignAttendantSequentially(availableAttendant);
      const newOrderId = `OR:${
        tableData[index].diningDetails.location
      }:${new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
      setAddedType("food");
      updatedTableData[index] = {
        ...updatedTableData[index],
        diningDetails: {
          ...updatedTableData[index].diningDetails,
          attendant: assignedAttendant ? assignedAttendant.name : "Unassigned",
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
                  gstAmount: gstPercentage
                    ? calculateTax(items, gstPercentage)
                    : "",
                  gstPercentage: gstPercentage || "",
                  cgstAmount: "",
                  cgstPercentage: "",
                  sgstAmount: "",
                  sgstPercentage: "",
                },
                subtotal: calculateOrderTotal(items),
                mode: "",
                paymentId: "",
                paymentStatus: "pending",
                price: gstPercentage
                  ? calculateOrderTotal(items) +
                    calculateTax(items, gstPercentage)
                  : calculateOrderTotal(items),
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
        const token =
          tableData[index]?.diningDetails.customer.notificationToken;
        if (token) {
          console.log("token", token);
          sendNotification(
            token,
            "Item Added to Order!",
            "Hi, the item you requested has been added to your order and will be served shortly. Thank you for your patience!"
          );
        }

        // const data = await setOfflineItem(updatedTableData);
        console.log("UPDATED", updatedTableData[index]);
        setOfflineTable(updatedTableData[index]);
        updateOrdersForAttendant(assignedAttendant.name, newOrderId);
      }
    } else if (items[0].issueSubtype) {
      // Issue item
      setAddedType("issue");
      const newIssue = {
        issueId: `IS:${new Date().getTime()}`,
        name: items[0].name,
        issueSubtype: items[0].issueSubtype,
        description: issueDescription
          ? issueDescription
          : "No description provided",
        reportTime: new Date(),
        status: "Assigned",
        attendant: "Attendant Name",
      };

      updatedTableData[index] = {
        ...updatedTableData[index],
        issuesReported: {
          ...updatedTableData[index].issuesReported,
          [items[0].name.toLowerCase().replace(/\s+/g, "_")]: newIssue,
        },
      };
    }

    setTableData(updatedTableData);
    setSelectedCategoryItems([]);
    setCategorySearchTerm("");
    setIssueDescription("");
  };

  // console.log("first", availableAttendant);

  const handleStatusChange = async (
    status: string,
    orderId: string,
    index: number
  ) => {
    console.log(status, orderId, index);
    if (status.toLocaleLowerCase() === "paid") {
      setCurrentStatusChange({ status, orderId, index });
      setOpenPaymentConfirmation(true);
    } else if (status.toLocaleLowerCase() === "served") {
      if (tableData[index]) {
        const token =
          tableData[index]?.diningDetails.customer.notificationToken;
        console.log(token);
        updateStatus(status, orderId, index);
        sendNotification(
          token,
          "Your Food is Ready!",
          "your food is prepared and will be served to your table shortly. Sit back, relax, and Bon appétit!"
        );
      }
    } else {
      updateStatus(status, orderId, index);
    }
  };

  const updateStatus = (status: any, orderId: any, index: any) => {
    setTableData((prevTableData: any) => {
      const updatedTableData: any = [...prevTableData];

      if (orderId.startsWith("OR") || orderId.startsWith("BOK")) {
        const orderIndex = updatedTableData[
          index
        ].diningDetails.orders.findIndex(
          (order: any) => order.orderId === orderId
        );
        if (orderIndex !== -1) {
          updatedTableData[index].diningDetails.orders[orderIndex].status =
            status;
          if (status.toLocaleLowerCase() === "served") {
            if (
              updatedTableData[index].diningDetails.orders[orderIndex].payment
                .paymentStatus === "paid"
            ) {
              updateStatus("paid", orderId, index);
            } else {
              updateStatus("Pending", orderId, index);
            }
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
            break;
          }
        }
      }

      return updatedTableData;
    });

    console.log("tableData", tableData);
    if (status.toLocaleLowerCase() === "served") setTables(tableData);
    if (status.toLocaleLowerCase() === "paid") setTables(tableData);
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
      {tableData && (
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
                            <Dialog>
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
                                      <SelectItem
                                        value="Food"
                                        disabled={addedType === "issue"}
                                      >
                                        Food
                                      </SelectItem>
                                      <SelectItem
                                        value="Issue"
                                        disabled={addedType === "food"}
                                      >
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
                                                  {item.quantity}
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
                                                  onCheckedChange={() =>
                                                    handleCategoryItemSelect(
                                                      item
                                                    )
                                                  }
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
