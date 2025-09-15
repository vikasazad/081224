"use client";

import React, { useEffect, useState, useCallback } from "react";
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
  Clock,
  IndianRupee,
  X,
  FileText,
  Dot,
  PhoneCall,
} from "lucide-react";
import StatusChip from "@/components/ui/StatusChip";
import {
  addKitchenOrder,
  generateInvoiceObject,
  getRoomData,
  sendInvoiceWhatsapp,
  setOfflineRoom,
  updateOrdersForAttendant,
} from "../../utils/staffData";
import ChecklistDialog from "@/components/staff-checkout-checklist";
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
  setHistoryRoom,
  setRooms,
} from "../../tables/utils/tableApi";
import { cn } from "@/lib/utils";
import {
  calculateOrderTotal,
  calculateTax,
  calculateFinalAmount,
} from "../../utils/clientside";
import { setInvoiceData } from "@/lib/features/invoiceSlice";
import { useDispatch } from "react-redux";
import { Icons } from "@/components/icons";
// gst = {
//   room: {
//     "upto 7500/night": 12,
//     "above 7500/night": 18,
//   },
//   dining: {
//     "upto 7500/night": 5,
//     "above 7500/night": 18,
//   },
//   service: {
//     all: 18,
//   },
// };
// Function to generate a 4-digit random number
const generateRandomOrderNumber = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export default function Ongoing({
  data,
  status,
  businessInfo,
}: {
  data: any;
  status: any;
  businessInfo: any;
}) {
  // const router = useRouter();
  const dispatch = useDispatch();
  const [roomData, setRoomData] = useState<any>([]);
  const [addItems, setAddItems] = useState<any>([]);
  const [categorySelect, setCategorySelect] = useState("Food");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [categoryItems, setCategoryItems] = useState([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<any[]>([]);

  const [checklistOpen, setChecklistOpen] = useState<number | null>(null);
  const [addedType, setAddedType] = useState<
    "food" | "issue" | "service" | null
  >(null);
  const [availableAttendant, setavailableAttendant] = useState<any>([]);
  const [submitFlag, setSubmitFlag] = useState(false);
  const [openFinalSubmitConfirmation, setOpenFinalSubmitConfirmation] =
    useState(false);
  const [finalSubmitData, setFinalSubmitData] = useState<any>(null);
  const [openDialogIndex, setOpenDialogIndex] = useState<number | null>(null);
  const [confirmationDialog, setConfirmationDialog] = useState<{
    open: boolean;
    status: string;
    orderId: string;
    index: number;
  }>({
    open: false,
    status: "",
    orderId: "",
    index: 0,
  });
  // console.log("addItems", addItems);
  useEffect(() => {
    console.log("DATA", data);
    setRoomData(data);
  }, [data]);

  useEffect(() => {
    getRoomData().then((data) => {
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
    // console.log("ADDITEMS", addItems);
    const search = e.target.value;
    setCategorySearchTerm(search);

    if (search) {
      const arr =
        categorySelect === "Food"
          ? addItems.foodMenuItems
          : categorySelect === "Service"
          ? addItems.hotelServices
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
    console.log("ITEM", item);
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

    // if (!token) {
    //   console.error("Attendant token not found for", attendant);
    //   return;
    // }

    // Copy the current room data for modification
    const updatedTableData = [...roomData];

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
    } else if (orderId.startsWith("IS:")) {
      // Update issuesReported
      if (updatedTableData[index].issuesReported) {
        const issueKeys = Object.keys(updatedTableData[index].issuesReported);
        for (const key of issueKeys) {
          if (updatedTableData[index].issuesReported[key].issueId === orderId) {
            updatedTableData[index].issuesReported[key].attendant = attendant;
            updatedTableData[index].issuesReported[key].attendantToken = token;
            break;
          }
        }
      }
    } else if (orderId.startsWith("SE:")) {
      // Update services used
      const serviceIndex = updatedTableData[index].servicesUsed.findIndex(
        (service: any) => service.serviceId === orderId
      );
      if (serviceIndex !== -1) {
        updatedTableData[index].servicesUsed[serviceIndex].attendant =
          attendant;
        updatedTableData[index].servicesUsed[serviceIndex].attendantToken =
          token;
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
    setRoomData(updatedTableData);
  };

  const handleAdd = async (items: any[], index: number) => {
    console.log("index", index);
    if (items.length > 0) {
      console.log("AAAAAAAA", items);
      const updatedRoomData: any = [...roomData];

      if (items[0]?.quantity) {
        const assignedAttendant: any =
          assignAttendantSequentially(availableAttendant);
        const newOrderId = `OR:R-${
          roomData[index].bookingDetails.location
        }:${generateRandomOrderNumber()}`;
        setAddedType("food");

        const price = calculateOrderTotal(items);
        const gst = calculateTax(price, price, "dining", businessInfo.gstTax);
        const totalPrice = price + gst.gstAmount;
        updatedRoomData[index] = {
          ...updatedRoomData[index],
          diningDetails: {
            ...updatedRoomData[index].diningDetails,

            attendant: assignedAttendant
              ? assignedAttendant.name
              : "Unassigned",
            attendantToken: assignedAttendant
              ? assignedAttendant.notificationToken
              : "",
            location:
              updatedRoomData[index]?.bookingDetails?.location ||
              "Not Available",
            noOfGuests:
              updatedRoomData[index]?.bookingDetails?.noOfGuests ||
              "Not Available",
            timeOfRequest: new Date().toISOString(),
            timeOfFullfilment: "",
            orders: [
              ...(updatedRoomData[index].diningDetails?.orders || []),
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
        if (roomData[index]) {
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
          console.log("UPDATED", updatedRoomData[index]);
          setOfflineRoom(updatedRoomData[index]);
          // const price = gstPercentage
          //   ? (await calculateOrderTotal(items)) +
          //     (await calculateTax(items, gstPercentage))
          //   : await calculateOrderTotal(items);

          // console.log("ADD KITCHEN ORDER", {
          //   newOrderId,
          //   customerName: updatedRoomData[index]?.bookingDetails?.customer?.name,
          //   items,
          //   price,
          // });
          await addKitchenOrder(
            newOrderId,
            updatedRoomData[index]?.bookingDetails?.customer?.name,
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
      } else if (items[0]?.startTime || items[0]?.endTime) {
        // Service items[0]
        console.log("here in services", items[0]);
        const assignedAttendant: any =
          assignAttendantSequentially(availableAttendant);
        const newOrderId = `SE:R-${
          roomData[index].bookingDetails.location
        }:${generateRandomOrderNumber()}`;
        const gst = calculateTax(
          parseFloat(items[0].price),
          parseFloat(items[0].price),
          "services",
          businessInfo.gstTax
        );
        const totalPrice = parseFloat(items[0].price) + gst.gstAmount;
        const newService = {
          serviceId: newOrderId,
          serviceName: items[0].name,
          startTime: items[0].startTime,
          endTime: items[0].endTime,
          price: parseFloat(items[0].price),
          attendant: assignedAttendant ? assignedAttendant.name : "Unassigned",
          attendantToken: assignedAttendant
            ? assignedAttendant.notificationToken
            : "",
          status: "requested",
          description: items[0].description,
          timeOfRequest: new Date().toISOString(),
          payment: {
            discount: {
              type: "none",
              amount: 0,
              code: "",
            },
            gst: {
              ...gst,
            },
            subtotal: parseFloat(items[0].price),
            mode: "",
            paymentId: "",
            paymentStatus: "pending",
            price: parseFloat(items[0].price),
            totalPrice: totalPrice,
            priceAfterDiscount: "",
            timeOfTransaction: "",
            transctionId: "",
          },
        };

        // Ensure servicesUsed is an array before updating
        updatedRoomData[index] = {
          ...updatedRoomData[index],
          servicesUsed: Array.isArray(updatedRoomData[index]?.servicesUsed)
            ? [...updatedRoomData[index].servicesUsed, newService]
            : [newService], // Initialize as a new array if undefined or not an array
        };
        if (availableAttendant) {
          const updatedAttendants = availableAttendant.map((staff: any) =>
            staff.name === assignedAttendant.name
              ? { ...staff, orders: [...staff.orders, newOrderId] }
              : staff
          );
          setavailableAttendant(updatedAttendants);
        }
        if (roomData[index]) {
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
          console.log("UPDATED", updatedRoomData[index]);
          setOfflineRoom(updatedRoomData[index]);
          updateOrdersForAttendant(
            assignedAttendant.name,
            newOrderId,
            assignedAttendant.contact
          );
        }
      } else if (items[0]?.issueSubtype) {
        // Issue item
        const assignedAttendant: any =
          assignAttendantSequentially(availableAttendant);
        const newOrderId = `IS:R-${
          roomData[index].bookingDetails.location
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

        updatedRoomData[index] = {
          ...updatedRoomData[index],
          issuesReported: {
            ...updatedRoomData[index].issuesReported,
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
        if (roomData[index]) {
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
          console.log("UPDATED", updatedRoomData[index]);
          setOfflineRoom(updatedRoomData[index]);
          updateOrdersForAttendant(
            assignedAttendant.name,
            newOrderId,
            assignedAttendant.contact
          );
        }
      }
      console.log("updatedRoomData", updatedRoomData[index]);

      setRoomData(updatedRoomData);
      setSelectedCategoryItems([]);
      setCategorySearchTerm("");
      setIssueDescription("");
      setOpenDialogIndex(null);
    }
  };

  const handleStatusChange = async (
    status: string,
    orderId: string,
    index: number
  ) => {
    console.log("roomData", status, orderId, index);
    if (status === "Paid" || status === "Completed") {
      setConfirmationDialog({
        open: true,
        status,
        orderId,
        index,
      });
    } else if (status === "Served") {
      if (roomData[index]) {
        const token =
          roomData[index]?.bookingDetails.customer.notificationToken;
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
      if (roomData[index]) {
        const token =
          roomData[index]?.bookingDetails.customer.notificationToken;
        const name = roomData[index]?.bookingDetails.customer.name;
        const data = Object.values(roomData[index]?.servicesUsed).map(
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
      if (roomData[index]) {
        const token =
          roomData[index]?.bookingDetails.customer.notificationToken;
        const name = roomData[index]?.bookingDetails.customer.name;
        const data = Object.values(roomData[index]?.servicesUsed).map(
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
      if (roomData[index]) {
        const token =
          roomData[index]?.bookingDetails.customer.notificationToken;
        const name = roomData[index]?.bookingDetails.customer.name;
        let headline, message;
        if (orderId.startsWith("IS")) {
          headline = "Issue cancelled sucessfully";
          message = "Your registered issue is cancelled successfully";
        }
        const data = Object.values(roomData[index]?.servicesUsed).map(
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

  const closeConfirmationDialog = useCallback(() => {
    setConfirmationDialog({
      open: false,
      status: "",
      orderId: "",
      index: 0,
    });
  }, []);

  // Handle escape key to close dialog
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && confirmationDialog.open) {
        closeConfirmationDialog();
      }
    };

    if (confirmationDialog.open) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [confirmationDialog.open, closeConfirmationDialog]);

  const handleConfirmation = useCallback(
    (confirmed: boolean) => {
      if (confirmed) {
        const { status, orderId, index } = confirmationDialog;
        updateStatus(status, orderId, index);
      }
      closeConfirmationDialog();
    },
    [confirmationDialog, closeConfirmationDialog]
  );

  const updateStatus = (status: any, orderId: any, index: any) => {
    setRoomData((prevTableData: any) => {
      const updatedRoomData: any = [...prevTableData];

      if (orderId === "checklist") {
        if (status.toLowerCase() === "paid") {
          updatedRoomData[index].checklist.payment = {
            ...updatedRoomData[index].checklist.payment,
            mode: "cash",
            paymentId: "cash",
            paymentStatus: "paid",
            timeOfTransaction: new Date().toISOString(),
            transctionId: "cash",
          };
        }
      } else if (orderId.startsWith("BOK")) {
        if (status.toLocaleLowerCase() === "paid") {
          updatedRoomData[index].bookingDetails.payment = {
            ...updatedRoomData[index].bookingDetails.payment, // Preserve existing fields
            mode: "cash",
            paymentId: "cash",
            paymentStatus: "paid",
            timeOfTransaction: new Date().toISOString(),
            transctionId: "cash",
          };
        } else {
          updatedRoomData[index].bookingDetails.payment.paymentStatus = status;
        }
      } else if (orderId.startsWith("RES")) {
        console.log("here in ros", orderId, status);
        const orderIndex = updatedRoomData[
          index
        ].diningDetails.orders.findIndex(
          (order: any) => order.orderId === orderId
        );
        if (orderIndex !== -1) {
          if (status.toLocaleLowerCase() === "served") {
            console.log("here1");
            // Set fulfillment time first
            updatedRoomData[index].diningDetails.timeOfFullfilment =
              new Date().toString();
            updatedRoomData[index].diningDetails.orders[
              orderIndex
            ].timeOfFullfilment = new Date().toString();
            updatedRoomData[index].diningDetails.orders[orderIndex].status =
              status;

            // Check payment status and set final status accordingly
          } else if (status.toLocaleLowerCase() === "paid") {
            console.log("here3");
            updatedRoomData[index].diningDetails.orders[orderIndex].status =
              status;
            updatedRoomData[index].diningDetails.orders[orderIndex].payment = {
              ...updatedRoomData[index].diningDetails.orders[orderIndex]
                .payment,
              mode: "cash",
              paymentId: "cash",
              paymentStatus: "paid",
              timeOfTransaction: new Date().toISOString(),
              transctionId: "cash",
            };
          } else {
            updatedRoomData[index].diningDetails.orders[orderIndex].status =
              status;
          }
        }
      } else if (orderId.startsWith("OR")) {
        const orderIndex = updatedRoomData[
          index
        ].diningDetails.orders.findIndex(
          (order: any) => order.orderId === orderId
        );
        if (orderIndex !== -1) {
          updatedRoomData[index].diningDetails.orders[orderIndex].status =
            status;
          if (status.toLocaleLowerCase() === "served") {
            updatedRoomData[index].diningDetails.timeOfFullfilment =
              new Date().toString();
            updatedRoomData[index].diningDetails.orders[
              orderIndex
            ].timeOfFullfilment = new Date().toString();
          }
          if (status.toLocaleLowerCase() === "paid") {
            updatedRoomData[index].diningDetails.orders[orderIndex].payment = {
              ...updatedRoomData[index].diningDetails.orders[orderIndex]
                .payment, // Preserve existing fields
              mode: "cash",
              paymentId: "cash",
              paymentStatus: "paid",
              timeOfTransaction: new Date().toISOString(),
              transctionId: "cash",
            };
          }
        }
      } else if (orderId.startsWith("SE")) {
        console.log("here in services", orderId, status);
        const servicesUsed = updatedRoomData[index].servicesUsed;
        servicesUsed.forEach((el: any, i: number) => {
          if (el.serviceId === orderId) {
            updatedRoomData[index].servicesUsed[i].status = status;
            if (status.toLocaleLowerCase() === "paid") {
              updatedRoomData[index].servicesUsed[i].payment = {
                ...updatedRoomData[index].servicesUsed[i].payment, // Preserve existing fields
                mode: "cash",
                paymentId: "cash",
                paymentStatus: "paid",
                timeOfTransaction: new Date().toISOString(),
                transctionId: "cash",
              };
            }
          }
        });
      } else if (orderId.startsWith("IS")) {
        const issuesReported = updatedRoomData[index].issuesReported;
        for (const issueType in issuesReported) {
          if (issuesReported[issueType].issueId === orderId) {
            issuesReported[issueType].status = status;
            break;
          }
        }
      }

      return updatedRoomData;
    });

    console.log("roomData", roomData);
    if (status.toLocaleLowerCase() === "paid") setRooms(roomData);
    if (status.toLocaleLowerCase() === "served") setRooms(roomData);
    if (status.toLocaleLowerCase() === "cancelled") setRooms(roomData);
  };

  const handleCheckListInfo = (data: any) => {
    // Clone the roomData to make changes
    console.log("DATA", data);

    let index = 0;
    setSubmitFlag(data.flag);
    const updatedRoomData = roomData.map((room: any, i: number) => {
      if (room.bookingDetails.location === data.location) {
        index = i;
        return {
          ...room,
          checklist: {
            ...data,
          },
        };
      }
      return room;
    });
    console.log("roomData", updatedRoomData);
    // Save the updated data into state
    setOfflineRoom(updatedRoomData[index]);
    setRoomData(updatedRoomData);
  };

  const handleFinalSubmit = async (item: any, main: number) => {
    console.log("clicked", item, main);
    const total = calculateFinalAmount(item);

    if (total) {
      setOpenFinalSubmitConfirmation(true);
      setFinalSubmitData({ item, main, type: "payment_pending" });
    } else {
      const invoice = `INV${Math.floor(
        1000000 + Math.random() * 9000000
      ).toString()}`;
      setOpenFinalSubmitConfirmation(true);
      const invoiceObject = await generateInvoiceObject(
        item,
        businessInfo,
        invoice
      );
      console.log("invoiceObject", invoiceObject);
      setFinalSubmitData({ item, main, type: "close_table", invoiceObject });
    }
  };

  const handleRoomClose = async () => {
    console.log("finalSubmitData", finalSubmitData);

    // Generate and upload invoice if invoice object exists
    if (finalSubmitData?.invoiceObject) {
      try {
        const { processAndUploadInvoice } = await import(
          "@/lib/firebase/invoice-storage"
        );
        const downloadURL = await processAndUploadInvoice(
          finalSubmitData?.invoiceObject
        );
        console.log(
          "Invoice uploaded successfully. Download URL:",
          downloadURL
        );
        if (downloadURL) {
          const res = await sendInvoiceWhatsapp(
            downloadURL,
            finalSubmitData?.item?.bookingDetails?.customer?.phone,
            finalSubmitData?.item?.bookingDetails?.customer?.name,
            finalSubmitData?.item?.bookingDetails?.bookingId,
            new Date(
              finalSubmitData?.item?.bookingDetails?.checkIn
            ).toLocaleDateString("en-US", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            }),
            businessInfo?.businessName
          );
          console.log("res", res);
        }
      } catch (error) {
        console.error("Failed to upload invoice:", error);
      }
    }

    // const type =
    //   finalSubmitData.item.diningDetails.capicity === "2"
    //     ? "twoseater"
    //     : finalSubmitData.item.diningDetails.capicity === "4"
    //     ? "fourseater"
    //     : "sixseater";
    // setHistoryRoom(
    //   finalSubmitData.item,
    //   finalSubmitData.item.bookingDetails.roomType
    // );
  };

  const handleInvoice = async (item: any, main: number) => {
    console.log("clicked", item, main);
    const invoice = `INV${Math.floor(
      1000000 + Math.random() * 9000000
    ).toString()}`;
    console.log("invoice", invoice);
    const invoiceObject = await generateInvoiceObject(
      item,
      businessInfo,
      invoice
    );
    console.log("invoiceObject", invoiceObject);
    // const invoice = await generateInvoice(invoiceObject);
    // console.log("invoice", invoice);

    dispatch(setInvoiceData({ invoice, data: invoiceObject }));
    window.open(`/invoice/${invoice}`, "_blank");
  };

  return (
    <div className="space-y-4 mb-10">
      {roomData.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roomData.map((item: any, main: number) => {
            // console.log("ITEM", main);
            return (
              <Card key={main}>
                <CardContent className="px-4 py-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex items-center gap-1">
                            <div className="flex flex-col items-start">
                              <div className="flex items-center gap-3">
                                <span className="text-lg font-bold">
                                  R-{item.bookingDetails.location}
                                </span>
                                <StatusChip
                                  status={item.bookingDetails.status}
                                />
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-slate-600">
                                  {item.bookingDetails.customer.name}
                                </span>
                                <Dot className="w-4 h-4" />
                                <span className="flex items-center gap-1 text-slate-600 cursor-pointer">
                                  <User className="w-4 h-4 mr-1" />
                                  {item.bookingDetails.noOfGuests}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div>
                              <Dialog
                                open={openDialogIndex === main}
                                onOpenChange={(isOpen) => {
                                  if (!item.checklist?.flag) {
                                    setOpenDialogIndex(isOpen ? main : null);
                                  }
                                }}
                              >
                                <DialogTrigger asChild>
                                  <div
                                    className={cn(
                                      "flex items-center gap-1 px-2 py-1 border rounded-md",
                                      item.checklist?.flag &&
                                        "opacity-50 cursor-not-allowed"
                                    )}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!item.checklist?.flag) {
                                        console.log("clicked", main);
                                      }
                                    }}
                                  >
                                    <PlusCircle size={16} />
                                    Add
                                  </div>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>
                                      {item.bookingDetails.location}
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
                                        <SelectItem value="Food">
                                          Food
                                        </SelectItem>
                                        <SelectItem value="Service">
                                          Service
                                        </SelectItem>
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
                                            {categoryItems.map(
                                              (item: any, i) => (
                                                <TableRow key={i}>
                                                  <TableCell>
                                                    {i + 1}.
                                                  </TableCell>
                                                  <TableCell>
                                                    {item.name}
                                                  </TableCell>
                                                  {categorySelect ===
                                                    "Food" && (
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
                                                  {categorySelect ===
                                                    "Service" && (
                                                    <>
                                                      <TableCell>
                                                        {item.startTime}
                                                      </TableCell>
                                                      <TableCell>
                                                        {item.endTime}
                                                      </TableCell>
                                                    </>
                                                  )}
                                                  {(categorySelect ===
                                                    "Service" ||
                                                    categorySelect ===
                                                      "Food") && (
                                                    <TableCell>
                                                      {item.price}
                                                    </TableCell>
                                                  )}
                                                  {categorySelect ===
                                                    "Issue" && (
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
                                                          categorySelect ===
                                                          "Food"
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
                                              )
                                            )}
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
                                      onClick={() => {
                                        handleAdd(selectedCategoryItems, main);
                                      }}
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
                            <div
                              className="flex items-center gap-1 p-1 bg-black text-white rounded-md cursor-pointer"
                              onClick={() => {
                                handleInvoice(item, main);
                                // handleInvoice();
                              }}
                            >
                              <FileText className="w-4 h-4" />
                              <span> Invoice</span>
                            </div>
                            <div className="flex items-center gap-1 py-1 px-2 bg-black text-white rounded-md cursor-pointer">
                              <PhoneCall
                                className="w-4 h-4"
                                onClick={() => {
                                  window.location.href = `tel:${item.bookingDetails.customer.phone}`;
                                }}
                              />
                              <span> Call</span>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          {item.bookingDetails?.bookingId &&
                            (() => {
                              const bookingDetails = item.bookingDetails;
                              return (
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">
                                        {bookingDetails.bookingId}
                                      </Badge>

                                      <Select
                                        onValueChange={(value) =>
                                          handleAttendantChange(
                                            bookingDetails.bookingId,
                                            value,
                                            main
                                          )
                                        }
                                      >
                                        <SelectTrigger className="w-[140px] py-0 h-6">
                                          <SelectValue
                                            placeholder={
                                              bookingDetails.attendant
                                            }
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

                                      <StatusChip
                                        status={
                                          bookingDetails.payment.paymentStatus
                                        }
                                      />
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
                                        {status.room.map(
                                          (stat: any, id: any) => (
                                            <DropdownMenuItem
                                              key={id}
                                              onClick={() =>
                                                handleStatusChange(
                                                  stat,
                                                  bookingDetails.bookingId,
                                                  main
                                                )
                                              }
                                            >
                                              {stat}
                                            </DropdownMenuItem>
                                          )
                                        )}
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  <Separator />
                                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                    <div className="">
                                      <div className="flex items-center justify-between">
                                        <div className="flex flex-col py-2">
                                          <span className="font-medium text-base">
                                            {bookingDetails.roomType}
                                          </span>
                                          <div className="flex items-center text-muted-foreground">
                                            <Clock className="mr-2" size={14} />
                                            <span>
                                              {new Date(
                                                bookingDetails.checkIn
                                              ).toLocaleDateString(
                                                "en-GB"
                                              )}{" "}
                                              -{" "}
                                              {new Date(
                                                bookingDetails.checkOut
                                              ).toLocaleDateString("en-GB")}
                                            </span>
                                          </div>
                                          <div className="flex items-center text-muted-foreground">
                                            <span className="font-normal">
                                              {bookingDetails.inclusions.join(
                                                " , "
                                              )}
                                            </span>
                                          </div>
                                        </div>
                                        <span className="text-green-600 font-medium">
                                          ₹
                                          {Number(bookingDetails.payment.price)}
                                        </span>
                                      </div>
                                    </div>
                                    <Separator />
                                    {bookingDetails.payment.discount.code.trim() !==
                                      "" && (
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <span className="font-medium">
                                            Discount{" "}
                                            <Badge variant="outline">
                                              {
                                                bookingDetails.payment.discount
                                                  .code
                                              }
                                            </Badge>
                                          </span>
                                        </div>
                                        <span className="text-green-600 font-semibold">
                                          - ₹
                                          {bookingDetails.payment.price -
                                            bookingDetails.payment
                                              .priceAfterDiscount}
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <span className="font-medium">
                                          Subtotal
                                        </span>
                                      </div>
                                      <span className="text-green-600 font-semibold">
                                        ₹{bookingDetails.payment.subtotal}
                                      </span>
                                    </div>
                                    {bookingDetails.payment.gst
                                      .gstPercentage && (
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <span className="font-medium">{`Tax (${bookingDetails.payment.gst.gstPercentage}%)`}</span>
                                        </div>
                                        <span className="text-green-600 font-semibold">
                                          ₹
                                          {bookingDetails.payment.gst.gstAmount}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                      <div>
                                        <span className="font-medium">
                                          Total
                                        </span>
                                        {bookingDetails.payment
                                          .paymentStatus === "paid" ? (
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
                                              {bookingDetails.payment.mode}
                                            </Badge>
                                          </>
                                        ) : (
                                          <Badge
                                            variant="outline"
                                            className="mx-2"
                                          >
                                            Pending
                                          </Badge>
                                        )}
                                      </div>
                                      <span className="text-green-600 font-semibold flex items-center gap-1">
                                        <IndianRupee className="w-3 h-3" />
                                        {bookingDetails.payment.totalPrice}
                                      </span>
                                    </div>
                                  </div>

                                  <Separator />
                                </div>
                              );
                            })()}

                          {item.diningDetails?.orders?.map(
                            (order: any, i: any) => (
                              <div key={i} className="space-y-2">
                                <div className="flex justify-between items-center">
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
                                      {order.payment.paymentStatus ===
                                      "paid" ? (
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
                                        <Badge
                                          variant="outline"
                                          className="mx-2"
                                        >
                                          Pending
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-green-600 font-semibold flex items-center gap-1">
                                      <IndianRupee className="w-3 h-3" />
                                      {order.payment.totalPrice}
                                    </span>
                                  </div>
                                </div>

                                <Separator />
                              </div>
                            )
                          )}

                          {Object.values(item.servicesUsed).map(
                            (service: any, i) => (
                              <div
                                key={i}
                                className={`space-y-2 ${cn({
                                  "opacity-50": service.status === "Cancelled",
                                })}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {service.serviceId}
                                    </Badge>

                                    <Select
                                      onValueChange={(value) =>
                                        handleAttendantChange(
                                          service.serviceId,
                                          value,
                                          main
                                        )
                                      }
                                      disabled={service.status === "Cancelled"}
                                    >
                                      <SelectTrigger className="w-[140px] py-0 h-6">
                                        <SelectValue
                                          placeholder={service.attendant}
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
                                    <StatusChip status={service.status} />
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-8 p-0"
                                        disabled={
                                          service.status === "Cancelled"
                                        }
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {status.service.map(
                                        (stat: any, id: any) => (
                                          <DropdownMenuItem
                                            key={id}
                                            onClick={() =>
                                              handleStatusChange(
                                                stat,
                                                service.serviceId,
                                                main
                                              )
                                            }
                                          >
                                            {stat}
                                          </DropdownMenuItem>
                                        )
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                                <Separator />

                                <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                  <div className="">
                                    <div className="flex items-center justify-between">
                                      <div className="flex flex-col py-2">
                                        <span className="font-medium">
                                          {service.serviceName}
                                        </span>
                                        <div className="flex items-center text-muted-foreground">
                                          <Clock className="mr-2" size={14} />
                                          <span>
                                            {service.startTime} -{" "}
                                            {service.endTime}
                                          </span>
                                        </div>
                                        {service.time && (
                                          <div className="flex items-center text-muted-foreground">
                                            <span className="font-normal mr-2">
                                              -
                                            </span>
                                            <span>{service.time}</span>
                                          </div>
                                        )}
                                      </div>
                                      <span className="text-green-600 font-medium">
                                        ₹{Number(service.price)}
                                      </span>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="font-medium">
                                        Subtotal
                                      </span>
                                    </div>
                                    <span className="text-green-600 font-semibold">
                                      ₹{service.payment.subtotal}
                                    </span>
                                  </div>
                                  {service.payment.gst.gstPercentage && (
                                    <div className="flex justify-between items-center">
                                      <div>
                                        <span className="font-medium">{`Tax (${service.payment.gst.gstPercentage}%)`}</span>
                                      </div>
                                      <span className="text-green-600 font-semibold">
                                        ₹{service.payment.gst.gstAmount}
                                      </span>
                                    </div>
                                  )}

                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="font-medium">Total</span>
                                      {service.payment.paymentStatus ===
                                      "paid" ? (
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
                                            {service.payment.mode}
                                          </Badge>
                                        </>
                                      ) : (
                                        <Badge
                                          variant="outline"
                                          className="mx-2"
                                        >
                                          Pending
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="text-green-600 font-semibold flex items-center gap-1">
                                      <IndianRupee className="w-3 h-3" />
                                      {service.payment.totalPrice}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )
                          )}

                          {Object.values(item.issuesReported).map(
                            (issue: any, i) => (
                              <div
                                key={i}
                                className={`space-y-2 ${cn({
                                  "opacity-50": issue.status === "Cancelled",
                                })}`}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {issue.issueId}
                                    </Badge>
                                    <Select
                                      onValueChange={(value) =>
                                        handleAttendantChange(
                                          issue.issueId,
                                          value,
                                          main
                                        )
                                      }
                                      disabled={issue.status === "Cancelled"}
                                    >
                                      <SelectTrigger className="w-[140px] py-0 h-6">
                                        <SelectValue
                                          placeholder={issue.attendant}
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
                                    <StatusChip status={issue.status} />
                                  </div>

                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-8 p-0"
                                        disabled={issue.status === "Cancelled"}
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {status.issue.map(
                                        (stat: any, id: any) => (
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
                                        )
                                      )}
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

                          {item.checklist?.selectedItems?.length > 0 && (
                            <>
                              <div className="font-semibold text-lg flex justify-between items-center">
                                <span>Mini-Bar Items</span>
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
                                    <DropdownMenuItem
                                      onClick={() =>
                                        handleStatusChange(
                                          "Paid",
                                          "checklist",
                                          main
                                        )
                                      }
                                    >
                                      Mark as Paid
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                                <div>
                                  {item.checklist?.selectedItems?.map(
                                    (itm: any, id: number) => (
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
                                    )
                                  )}
                                </div>
                                <Separator />
                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">
                                      Subtotal
                                    </span>
                                  </div>
                                  <span className="text-green-600 font-semibold">
                                    ₹{item.checklist?.payment.subtotal}
                                  </span>
                                </div>
                                {item.checklist?.payment?.gst
                                  ?.gstPercentage && (
                                  <div className="flex justify-between items-center">
                                    <div>
                                      <span className="font-medium">{`Tax (${item.checklist?.payment?.gst?.gstPercentage}%)`}</span>
                                    </div>
                                    <span className="text-green-600 font-semibold">
                                      ₹{item.checklist?.payment?.gst?.gstAmount}
                                    </span>
                                  </div>
                                )}

                                <div className="flex justify-between items-center">
                                  <div>
                                    <span className="font-medium">Total</span>
                                    {item?.checklist?.payment.paymentStatus ===
                                    "paid" ? (
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
                                          {item?.checklist?.payment.mode}
                                        </Badge>
                                      </>
                                    ) : (
                                      <Badge variant="outline" className="mx-2">
                                        Pending
                                      </Badge>
                                    )}
                                  </div>
                                  <span className="text-green-600 font-semibold">
                                    ₹{item.checklist?.payment?.totalPrice}
                                  </span>
                                </div>
                              </div>
                            </>
                          )}

                          {item.checklist?.checkedItems?.length > 0 && (
                            <div className="flex flex-col mx-3">
                              <span className="font-sans- text-lg py-1">
                                Remarks:
                              </span>
                              {item.checklist?.checkedItems.map(
                                (el: string, i: number) => (
                                  <span className="mx-1 pb-1" key={i}>
                                    - {el}
                                  </span>
                                )
                              )}
                              <span className="mx-1 pb-1">
                                - {item.checklist?.note}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-2">
                            <div className="flex items-center gap-2">
                              <div>
                                {(() => {
                                  const total = calculateFinalAmount(item);
                                  // console.log("total", total);
                                  // if (item.checklist?.totalAmount) {
                                  //   total = total + item.checklist?.totalAmount;
                                  // }
                                  // console.log("total", total);

                                  // if (gstPercentage) {
                                  //   const gst = Math.round(
                                  //     (item.checklist?.totalAmount *
                                  //       Number(gstPercentage)) /
                                  //       100
                                  //   );
                                  //   total = total + gst;
                                  // }
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
                                        <div className="text-gray-500 text-sm">
                                          No pending payments
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                className="flex items-center gap-2"
                                size="sm"
                                onClick={() => setChecklistOpen(main)}
                              >
                                Checkout
                              </Button>
                              <Button
                                className="flex items-center gap-2"
                                size="sm"
                                disabled={
                                  submitFlag ? false : !item.checklist?.flag
                                }
                                onClick={() => handleFinalSubmit(item, main)}
                              >
                                Submit
                              </Button>
                            </div>
                          </div>

                          <ChecklistDialog
                            data={addItems}
                            info={handleCheckListInfo}
                            open={checklistOpen === main}
                            onClose={() => setChecklistOpen(null)}
                            roomNumber={item.bookingDetails.location}
                            tax={businessInfo.gstTax}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <span className="text-gray-500 text-sm">No room data found</span>
        </div>
      )}

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
            {finalSubmitData?.type === "payment_pending" && (
              <Button
                variant="outline"
                onClick={() => setOpenFinalSubmitConfirmation(false)}
              >
                Cancel
              </Button>
            )}
            {finalSubmitData?.type === "close_table" ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setOpenFinalSubmitConfirmation(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    // Logic to close the table
                    // You might want to implement a method to remove the table or mark it as closed
                    console.log("tableClosed");
                    setOpenFinalSubmitConfirmation(false);
                    handleRoomClose();
                  }}
                >
                  Confirm Close
                </Button>
              </>
            ) : (
              <Icons.spinner className="mr-2 mt-2 h-4 w-4 animate-spin" />
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Status Update Confirmation Dialog */}
      {confirmationDialog.open && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          style={{ margin: 0, padding: 0 }}
          onClick={() => handleConfirmation(false)}
        >
          <div
            className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left shadow-xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold leading-6 text-gray-900">
                Confirm Status Update
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  This action can only be done if the payment is in cash. Do you
                  confirm that the payment has been received in cash?
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => handleConfirmation(false)}
                className="px-4 py-2"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleConfirmation(true)}
                className="px-4 py-2"
              >
                Confirm
              </Button>
            </div>

            {/* Close button */}
            <button
              onClick={() => handleConfirmation(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
