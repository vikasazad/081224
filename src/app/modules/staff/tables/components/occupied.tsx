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

import {
  PlusCircle,
  MoreVertical,
  User,
  Send,
  DollarSign,
  ClipboardCheck,
} from "lucide-react";
import StatusChip from "@/components/ui/StatusChip";
import { getTableData } from "../../utils/staffData";
import ChecklistDialog from "@/components/staff-checkout-checklist";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { sendNotification } from "@/lib/sendNotification";

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
  const [checklistOpen, setChecklistOpen] = useState(false);

  useEffect(() => {
    setTableData(data);
  }, [data]);

  useEffect(() => {
    getTableData().then((data) => {
      setAddItems(data);
    });
  }, []);

  const handleCategorySearchChange = (e: any) => {
    const search = e.target.value;
    setCategorySearchTerm(search);

    if (search) {
      const arr =
        categorySelect === "Food"
          ? addItems.foodMenuItems
          : categorySelect === "Issue"
          ? addItems.hotelRoomIssues
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

  const handleAdd = (items: any[], index: number) => {
    // console.log("AAAAAAAAAAAAAAAAAAAAAAA", items);
    const updatedTableData: any = [...tableData];

    items.forEach((item) => {
      if (item.quantity) {
        // Food item
        const newOrder = {
          itemId: item.id,
          itemName: item.name,
          portionSize: item.quantity,
          price: parseFloat(item.price),
        };

        updatedTableData[index] = {
          ...updatedTableData[index],
          diningDetails: {
            ...updatedTableData[index].diningDetails,
            orders: [
              ...(updatedTableData[index].diningDetails?.orders || []),
              {
                orderId: `OR:${new Date().toLocaleTimeString()}`,
                items: [newOrder],
                attendant: "Attendant Name",
                status: "open",
                timeOfRequest: new Date(),
                timeOfFullfilment: "",
                payment: {},
              },
            ],
          },
        };
      } else if (item.issueSubtype) {
        // Issue item
        const newIssue = {
          issueId: `IS:${new Date().getTime()}`,
          name: item.name,
          issueSubtype: item.issueSubtype,
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
            [item.name.toLowerCase().replace(/\s+/g, "_")]: newIssue,
          },
        };
      }
    });

    // Update the state with the modified array
    setTableData(updatedTableData);
    setSelectedCategoryItems([]);
    setCategorySearchTerm("");
    setIssueDescription("");
  };

  const handleStatusChange = async (
    status: string,
    orderId: string,
    index: number
  ) => {
    if (status === "Paid" || status === "Completed") {
      setCurrentStatusChange({ status, orderId, index });
      setOpenPaymentConfirmation(true);
    } else if (status === "Served") {
      if (tableData[index]) {
        const token =
          tableData[index]?.diningDetails.customer.notificationToken;
        console.log(token);
        updateStatus(status, orderId, index);
        const data = await sendNotification(
          "eUt2ciZlaoB2SfYsmhWjzr:APA91bE99YWRNChjJPWiyicW-CeWRMKmCaaLZJHyC877hTDzLqRoPc6GZrmnk5s7sy0Rxdt14e-Vk_7P24zFU28IQtlzcmAqFedsd_kYrB1whI6dICMP8UQ",
          "Your Food is Ready!",
          "your food is prepared and will be served to your table shortly. Sit back, relax, and Bon appétit!"
        );
        console.log("RESULT", data);
        // const response = await fetch("api/send-notification", {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //   },
        //   body: JSON.stringify({
        //     token:
        //       "f5WtuYAa4fi-Gbg8VSCVub:APA91bEh6W51Od84BARGVCh6Dc475Hqw3nefZncWNFPoT92yaJ4ouaorlliinGnaJu3v202sYHmegcSxURwxOpbbHyaWouYOUuDyLaZ5wlpPSDBl02me5Hs",
        //     title: "Hotel",
        //     message: "Sameple title for the notification",
        //     link: "/staff",
        //   }),
        // });

        // const data = await response.json();
        // console.log(data);
      }
    } else {
      updateStatus(status, orderId, index);
    }
  };

  const updateStatus = (status: any, orderId: any, index: any) => {
    setTableData((prevTableData: any) => {
      const updatedTableData: any = [...prevTableData];

      if (orderId.startsWith("OR")) {
        const orderIndex = updatedTableData[
          index
        ].diningDetails.orders.findIndex(
          (order: any) => order.orderId === orderId
        );
        if (orderIndex !== -1) {
          updatedTableData[index].diningDetails.orders[orderIndex].status =
            status;
          if (status === "paid" || status === "completed") {
            updatedTableData[index].diningDetails.orders[orderIndex].payment = {
              method: "cash",
              amount: calculateOrderTotal(
                updatedTableData[index].diningDetails.orders[orderIndex]
              ),
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
  };

  const calculateOrderTotal = (order: any) => {
    return order.items.reduce(
      (total: any, item: any) => total + parseFloat(item.price),
      0
    );
  };

  return (
    <div className="space-y-4">
      {tableData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.values(tableData).map((item: any, main) => (
            <Card key={main}>
              <CardContent className="px-4 py-0">
                <Accordion type="single" collapsible>
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-bold">
                            {item.diningDetails.location}
                          </span>
                          <span className="text-slate-600">
                            {item.diningDetails.customer.name}
                          </span>
                          <span className="flex items-center gap-1 text-slate-600">
                            <User className="w-4 h-4 mr-1" />
                            {item.diningDetails.noOfGuests}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
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
                              <DialogContent>
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
                                  <Input
                                    placeholder={`Search ${categorySelect} items`}
                                    value={categorySearchTerm}
                                    onChange={handleCategorySearchChange}
                                  />
                                  {categoryItems.length > 0 && (
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
                                                {item.price}
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
                                                  handleCategoryItemSelect(item)
                                                }
                                              />
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
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
                        {item.diningDetails.orders.map((order: any, i: any) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{order.orderId}</Badge>
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
                                    <div className="flex items-center justify-between py-2">
                                      <span className="font-medium">
                                        {itm.itemName}
                                      </span>
                                      <span className="font-medium mx-2">
                                        -
                                      </span>
                                      <span className="font-medium">
                                        {itm.portionSize}
                                      </span>
                                    </div>
                                    <span className="text-green-600 font-medium">
                                      ${itm.price}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              <Separator />
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="font-medium">Subtotal</span>
                                  <Badge variant="outline" className="mx-2">
                                    Paid
                                  </Badge>
                                </div>
                                <span className="text-green-600 font-semibold">
                                  ${calculateOrderTotal(order)}
                                </span>
                              </div>
                            </div>

                            <Separator />
                            {/* {order.status !== "Paid" &&
                            order.status !== "Completed" ? (
                              <p className="font-bold">
                                Pending Amount: ${calculateOrderTotal(order)}
                              </p>
                            ) : (
                              <p className="font-bold">
                                Payment: Cash - ${order.payment.amount}
                              </p>
                            )} */}
                          </div>
                        ))}

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
                            <DollarSign className="text-green-600" size={20} />
                            <span className="text-lg font-semibold">
                              Total:{" "}
                              {item.diningDetails.orders
                                .reduce(
                                  (total: any, order: any) =>
                                    order.status !== "Paid" &&
                                    order.status !== "Completed"
                                      ? total + calculateOrderTotal(order)
                                      : total,
                                  0
                                )
                                .toFixed(2)}
                            </span>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              className="flex items-center gap-2"
                              size="sm"
                              onClick={() => setChecklistOpen(true)}
                            >
                              <ClipboardCheck size={16} />
                              Checkout
                            </Button>
                            <Button
                              className="flex items-center gap-2"
                              size="sm"
                              onClick={() => setChecklistOpen(true)}
                            >
                              <Send size={16} />
                              Submit
                            </Button>
                          </div>
                        </div>

                        <ChecklistDialog
                          data={addItems}
                          open={checklistOpen}
                          onClose={() => setChecklistOpen(false)}
                          roomNumber={item.diningDetails.location}
                        />
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
          <DialogFooter>
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
    </div>
  );
}
