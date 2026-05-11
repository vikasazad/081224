"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import {
  PlusCircle,
  MoreVertical,
  Clock,
  IndianRupee,
  FileText,
  PhoneCall,
  User,
  Loader2,
} from "lucide-react";
import StatusChip from "@/components/ui/StatusChip";
import {
  LiveRoomData,
  LiveRoomDiscount,
  LiveRoomOrder,
  LiveRoomService,
  LiveRoomIssue,
  LiveRoomStatus,
} from "../types/singleScreenDashboardTypes";
import { getAllOnlineConcierge } from "@/app/modules/staff/utils/enhanced-room-data";
import {
  setOfflineRoom,
  updateOrdersForAttendant,
  getRoomData,
  addKitchenOrder,
  sendTakeReviewMessage,
  getDiscount,
  addDiscount,
  removeDiscount,
  getLiveRooms,
  generateInvoiceObject,
  sendFinalMessage,
} from "@/app/modules/staff/utils/staffData";
import { setInvoiceData } from "@/lib/features/invoiceSlice";
import { useDispatch } from "react-redux";
import { setHistoryRoom } from "@/app/modules/staff/tables/utils/tableApi";
import ChecklistDialog from "@/components/staff-checkout-checklist";
import {
  calculateOrderTotal,
  calculateTax,
  calculateFinalAmount,
} from "@/app/modules/staff/utils/clientside";
import { toast } from "sonner";

const generateRandomOrderNumber = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

function normalizeLiveRoomDiscounts(
  discount: LiveRoomDiscount | LiveRoomDiscount[] | undefined | null,
): LiveRoomDiscount[] {
  if (discount == null) return [];
  return Array.isArray(discount) ? discount : [discount];
}

interface AddItemsData {
  foodMenuItems: any[];
  hotelServices: any[];
  hotelRoomIssues: any[];
}

interface ConfirmationDialogState {
  open: boolean;
  status: string;
  orderId: string;
}

interface AvailableStaff {
  name: string;
  phone: string;
  notificationToken: string;
  orders: string[];
  contact?: string;
}

interface OngoingBookingSheetProps {
  liveRoom: LiveRoomData;
  status: LiveRoomStatus;
  onClose: () => void;
  onLiveRoomUpdate?: (updatedRoom: LiveRoomData) => void;
  /** Called after a successful final checkout (`setHistoryRoom`); use to refetch live rooms and close UI. */
  onRoomClosed?: () => void | Promise<void>;
  businessInfo?: {
    gstTax?: any;
    [key: string]: any;
  };
}

const OngoingBookingSheet: React.FC<OngoingBookingSheetProps> = ({
  liveRoom,
  status,
  onClose,
  onLiveRoomUpdate,
  onRoomClosed,
  businessInfo,
}) => {
  const dispatch = useDispatch();
  const finalSubmitPrepareCancelledRef = useRef(false);
  const [availableStaff, setAvailableStaff] = useState<AvailableStaff[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(true);
  const [localLiveRoom, setLocalLiveRoom] = useState<LiveRoomData>(liveRoom);
  const [confirmationDialog, setConfirmationDialog] =
    useState<ConfirmationDialogState>({
      open: false,
      status: "",
      orderId: "",
    });

  // Add dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addItems, setAddItems] = useState<AddItemsData>({
    foodMenuItems: [],
    hotelServices: [],
    hotelRoomIssues: [],
  });
  const [categorySelect, setCategorySelect] = useState("Food");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [categoryItems, setCategoryItems] = useState<any[]>([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState<any[]>([]);
  const [issueDescription, setIssueDescription] = useState("");
  const [addedType, setAddedType] = useState<
    "food" | "issue" | "service" | null
  >(null);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const [checklistOpen, setChecklistOpen] = useState(false);
  const [openDiscountDialog, setOpenDiscountDialog] = useState<{
    open: boolean;
    location: string;
  }>({ open: false, location: "" });
  const [discountSelect, setDiscountSelect] = useState<
    { type: string; discount: number; code: string; amount: number }[]
  >([{ type: "", discount: 0, code: "", amount: 0 }]);
  const [selectedDiscount, setSelectedDiscount] = useState("");
  const [finalSubmitDialog, setFinalSubmitDialog] = useState<{
    open: boolean;
    type: "payment_pending" | "close_table" | null;
    invoiceObject?: unknown;
  }>({ open: false, type: null });

  const bookingDetails = localLiveRoom.bookingDetails;
  // console.log(bookingDetails);
  const checklist = localLiveRoom.checklist;
  const diningOrders = localLiveRoom.diningDetails?.orders || [];
  const services = localLiveRoom.servicesUsed || [];
  const issues = Object.values(localLiveRoom.issuesReported || {});
  const pendingTotal = calculateFinalAmount(localLiveRoom);

  useEffect(() => {
    setLocalLiveRoom(liveRoom);
  }, [liveRoom]);

  useEffect(() => {
    const fetchAvailableStaff = async () => {
      setIsLoadingStaff(true);
      try {
        const staff = await getAllOnlineConcierge();
        if (staff && Array.isArray(staff)) {
          setAvailableStaff(staff);
        }
      } catch (error) {
        console.error("Error fetching available staff:", error);
      } finally {
        setIsLoadingStaff(false);
      }
    };

    fetchAvailableStaff();
  }, []);

  useEffect(() => {
    getRoomData().then((data) => {
      if (data) {
        setAddItems(data);
      }
    });
  }, []);

  const handleAddClick = () => {
    if (checklist?.flag) return;
    setAddDialogOpen(true);
  };

  const syncRoomFromServer = async () => {
    const res = await getLiveRooms();
    if (res === false || !res?.rooms) return;
    const loc = String(bookingDetails.location);
    const found = res.rooms.find(
      (r: any) => String(r.bookingDetails?.location) === loc,
    );
    if (found) {
      setLocalLiveRoom(found);
      onLiveRoomUpdate?.(found);
    }
  };

  const handleCheckListInfo = async (data: any) => {
    const updatedLiveRoom: LiveRoomData = {
      ...localLiveRoom,
      checklist: { ...data },
    };
    setLocalLiveRoom(updatedLiveRoom);
    await setOfflineRoom(updatedLiveRoom);
    onLiveRoomUpdate?.(updatedLiveRoom);

    try {
      const phone = updatedLiveRoom.bookingDetails?.customer?.phone;
      const name = updatedLiveRoom.bookingDetails?.customer?.name;
      if (phone && name) {
        await sendTakeReviewMessage(
          `+91${phone}`,
          [name, "HAPPYSTAY"],
          "https://g.page/r/CYrhaBonlOFpEAE/review",
        );
      }
    } catch (e) {
      console.error("sendTakeReviewMessage failed:", e);
    }
  };

  const handleDiscountClick = async () => {
    const discount = await getDiscount();
    if (!discount || !Array.isArray(discount) || discount.length === 0) {
      toast.error("No discount found");
      return;
    }
    setDiscountSelect([
      ...discount,
      { type: "", discount: 0, code: "Clear Discount", amount: 0 },
    ]);
    setOpenDiscountDialog({
      open: true,
      location: bookingDetails.location,
    });
  };

  const handleAddDiscount = async (code: string, location: string) => {
    if (!code) {
      toast.error("Select a discount");
      return;
    }
    if (code === "Clear Discount") {
      await removeDiscount(location);
    } else {
      const discount = discountSelect.find((item) => item.code === code);
      if (discount) {
        await addDiscount(discount, localLiveRoom);
      }
    }
    setOpenDiscountDialog({ open: false, location: "" });
    setSelectedDiscount("");
    await syncRoomFromServer();
    toast.success(
      code === "Clear Discount" ? "Discount cleared" : "Discount applied",
    );
  };

  const handleCategorySearchChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
        item.name.toLowerCase().includes(search.toLowerCase()),
      );
      setCategoryItems(filtered);
    } else {
      setCategoryItems([]);
    }
  };

  const handleCategoryItemSelect = (item: any) => {
    setSelectedCategoryItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item],
    );
  };

  const resetAddDialog = () => {
    setAddedType(null);
    setCategorySelect("Food");
    setSelectedCategoryItems([]);
    setCategorySearchTerm("");
    setCategoryItems([]);
    setIssueDescription("");
  };

  const handleAdd = async (items: any[]) => {
    if (items.length === 0) return;

    setIsAddingItem(true);

    try {
      const updatedLiveRoom = { ...localLiveRoom };
      // Use availableStaff which has the full staff data with notificationToken, contact, phone
      const assignedAttendant =
        availableStaff.length > 0
          ? [...availableStaff].sort(
              (a, b) => (a.orders?.length || 0) - (b.orders?.length || 0),
            )[0]
          : null;

      if (items[0]?.quantity) {
        // Food items
        const newOrderId = `OR:R-${bookingDetails.location}:${generateRandomOrderNumber()}`;
        setAddedType("food");

        const price = calculateOrderTotal(items);
        const gst = businessInfo?.gstTax
          ? calculateTax(price, price, "dining", businessInfo.gstTax)
          : {
              gstAmount: 0,
              gstPercentage: 0,
              cgstAmount: 0,
              sgstAmount: 0,
              cgstPercentage: 0,
              sgstPercentage: 0,
            };
        const totalPrice = price + gst.gstAmount;

        const newOrder: LiveRoomOrder = {
          orderId: newOrderId,
          items: items.map((item) => ({
            ...item,
            count: item.count || 1,
          })),
          attendant: assignedAttendant?.name || "Unassigned",
          attendantToken: assignedAttendant?.notificationToken || "",
          attendantContact:
            assignedAttendant?.contact || assignedAttendant?.phone || "",
          status: "order placed",
          timeOfRequest: new Date().toISOString(),
          timeOfFullfilment: "",
          specialRequirement: "",
          payment: {
            discount: {
              discount: 0,
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
            paymentType: "",
            referenceId: "",
          },
        };

        updatedLiveRoom.diningDetails = {
          ...updatedLiveRoom.diningDetails,
          attendant: assignedAttendant?.name || "Unassigned",
          attendantToken: assignedAttendant?.notificationToken || "",
          attendantContact:
            assignedAttendant?.contact || assignedAttendant?.phone || "",
          location: bookingDetails.location || "Not Available",
          noOfGuests: bookingDetails.noOfGuests || 0,
          timeOfRequest: new Date().toISOString(),
          timeOfFullfilment: "",
          orders: [...(updatedLiveRoom.diningDetails?.orders || []), newOrder],
        };

        // Add to kitchen orders
        if (assignedAttendant) {
          await addKitchenOrder(
            newOrderId,
            bookingDetails.customer?.name || "",
            items,
            totalPrice,
            assignedAttendant.name,
            assignedAttendant.contact || assignedAttendant.phone || "",
          );
          await updateOrdersForAttendant(
            assignedAttendant.name,
            newOrderId,
            assignedAttendant.contact || assignedAttendant.phone || "",
          );
        }
      } else if (items[0]?.startTime || items[0]?.endTime) {
        // Service items
        const newOrderId = `SE:R-${bookingDetails.location}:${generateRandomOrderNumber()}`;
        setAddedType("service");

        const servicePrice = parseFloat(items[0].price) || 0;
        const gst = businessInfo?.gstTax
          ? calculateTax(
              servicePrice,
              servicePrice,
              "services",
              businessInfo.gstTax,
            )
          : {
              gstAmount: 0,
              gstPercentage: 0,
              cgstAmount: 0,
              sgstAmount: 0,
              cgstPercentage: 0,
              sgstPercentage: 0,
            };
        const totalPrice = servicePrice + gst.gstAmount;

        const newService = {
          serviceId: newOrderId,
          serviceName: items[0].name,
          startTime: items[0].startTime,
          endTime: items[0].endTime,
          price: servicePrice,
          attendant: assignedAttendant?.name || "Unassigned",
          attendantToken: assignedAttendant?.notificationToken || "",
          status: "requested",
          description: items[0].description || "",
          timeOfRequest: new Date().toISOString(),
          payment: {
            discount: {
              discount: 0,
              type: "none",
              amount: 0,
              code: "",
            },
            gst: {
              ...gst,
            },
            subtotal: servicePrice,
            mode: "",
            paymentId: "",
            paymentStatus: "pending",
            price: servicePrice,
            totalPrice: totalPrice,
            priceAfterDiscount: "",
            timeOfTransaction: "",
            transctionId: "",
            paymentType: "",
            referenceId: "",
          },
        };

        updatedLiveRoom.servicesUsed = [
          ...(updatedLiveRoom.servicesUsed || []),
          newService as LiveRoomService,
        ];

        if (assignedAttendant) {
          await updateOrdersForAttendant(
            assignedAttendant.name,
            newOrderId,
            assignedAttendant.contact || assignedAttendant.phone || "",
          );
        }
      } else if (items[0]?.issueSubtype) {
        // Issue items
        const newOrderId = `IS:R-${bookingDetails.location}:${generateRandomOrderNumber()}`;
        setAddedType("issue");

        const newIssue: LiveRoomIssue = {
          issueId: newOrderId,
          name: items[0].name,
          category: items[0].issueSubtype,
          description: issueDescription || "No description provided",
          reportTime: new Date().toISOString(),
          status: "Assigned",
          attendant: assignedAttendant?.name || "Unassigned",
          attendantToken: assignedAttendant?.notificationToken || "",
          attendantContact:
            assignedAttendant?.contact || assignedAttendant?.phone || "",
          timeOfFullfilment: "",
        };

        updatedLiveRoom.issuesReported = {
          ...updatedLiveRoom.issuesReported,
          [items[0].name]: newIssue,
        };

        if (assignedAttendant) {
          await updateOrdersForAttendant(
            assignedAttendant.name,
            newOrderId,
            assignedAttendant.contact || assignedAttendant.phone || "",
          );
        }
      }

      // Save to Firestore
      await setOfflineRoom(updatedLiveRoom);

      // Update local state
      setLocalLiveRoom(updatedLiveRoom);

      // Notify parent component
      if (onLiveRoomUpdate) {
        onLiveRoomUpdate(updatedLiveRoom);
      }

      toast.success("Item added successfully");

      // Reset and close dialog
      resetAddDialog();
      setAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Failed to add item");
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleInvoiceClick = async () => {
    if (businessInfo == null || typeof businessInfo !== "object") {
      toast.error(
        "Business information is not available. Cannot open invoice.",
      );
      return;
    }
    try {
      const invoice = `INV${Math.floor(
        1000000 + Math.random() * 9000000,
      ).toString()}`;
      const invoiceObject = await generateInvoiceObject(
        localLiveRoom,
        businessInfo,
        invoice,
      );
      dispatch(setInvoiceData({ invoice, from: "room", data: invoiceObject }));
      window.open(`/invoice/${invoice}`, "_blank");
    } catch (error) {
      console.error("Invoice generation failed:", error);
      toast.error("Failed to generate invoice");
    }
  };

  const handleCallClick = () => {
    console.log("Call button clicked", bookingDetails.customer?.phone);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      const updatedLiveRoom = { ...localLiveRoom };
      const statusLower = newStatus.toLowerCase();

      if (orderId.startsWith("BOK:")) {
        if (statusLower === "paid") {
          updatedLiveRoom.bookingDetails = {
            ...updatedLiveRoom.bookingDetails,
            payment: {
              ...updatedLiveRoom.bookingDetails.payment,
              mode: "cash",
              paymentId: "cash",
              paymentStatus: "paid",
              timeOfTransaction: new Date().toISOString(),
              transctionId: "cash",
            },
          };
        } else {
          updatedLiveRoom.bookingDetails = {
            ...updatedLiveRoom.bookingDetails,
            payment: {
              ...updatedLiveRoom.bookingDetails.payment,
              paymentStatus: newStatus,
            },
          };
        }
      } else if (orderId.startsWith("OR:")) {
        if (updatedLiveRoom.diningDetails?.orders) {
          const orderIndex = updatedLiveRoom.diningDetails.orders.findIndex(
            (order) => order.orderId === orderId,
          );
          if (orderIndex !== -1) {
            const currentOrder =
              updatedLiveRoom.diningDetails.orders[orderIndex];

            if (statusLower === "served") {
              const paymentStatus = currentOrder.payment?.paymentStatus;
              const finalStatus = paymentStatus === "paid" ? "paid" : "pending";

              updatedLiveRoom.diningDetails = {
                ...updatedLiveRoom.diningDetails,
                timeOfFullfilment: new Date().toISOString(),
                orders: updatedLiveRoom.diningDetails.orders.map(
                  (order, idx) =>
                    idx === orderIndex
                      ? {
                          ...order,
                          status: finalStatus,
                          timeOfFullfilment: new Date().toISOString(),
                        }
                      : order,
                ),
              };
            } else if (statusLower === "paid") {
              updatedLiveRoom.diningDetails = {
                ...updatedLiveRoom.diningDetails,
                orders: updatedLiveRoom.diningDetails.orders.map(
                  (order, idx) =>
                    idx === orderIndex
                      ? {
                          ...order,
                          status: newStatus,
                          payment: {
                            ...order.payment,
                            mode: "cash",
                            paymentId: "cash",
                            paymentStatus: "paid",
                            timeOfTransaction: new Date().toISOString(),
                            transctionId: "cash",
                          },
                        }
                      : order,
                ),
              };
            } else {
              updatedLiveRoom.diningDetails = {
                ...updatedLiveRoom.diningDetails,
                orders: updatedLiveRoom.diningDetails.orders.map(
                  (order, idx) =>
                    idx === orderIndex
                      ? { ...order, status: newStatus }
                      : order,
                ),
              };
            }
          }
        }
      } else if (orderId.startsWith("SE:")) {
        if (updatedLiveRoom.servicesUsed) {
          const serviceIndex = updatedLiveRoom.servicesUsed.findIndex(
            (service) => service.serviceId === orderId,
          );
          if (serviceIndex !== -1) {
            const currentService = updatedLiveRoom.servicesUsed[serviceIndex];

            if (statusLower === "accepted") {
              const paymentStatus = currentService.payment?.paymentStatus;
              const finalStatus = paymentStatus === "paid" ? "paid" : "pending";

              updatedLiveRoom.servicesUsed = updatedLiveRoom.servicesUsed.map(
                (service, idx) =>
                  idx === serviceIndex
                    ? { ...service, status: finalStatus }
                    : service,
              );
            } else if (statusLower === "paid") {
              updatedLiveRoom.servicesUsed = updatedLiveRoom.servicesUsed.map(
                (service, idx) =>
                  idx === serviceIndex
                    ? {
                        ...service,
                        status: newStatus,
                        payment: {
                          ...service.payment,
                          mode: "cash",
                          paymentId: "cash",
                          paymentStatus: "paid",
                          timeOfTransaction: new Date().toISOString(),
                          transctionId: "cash",
                        },
                      }
                    : service,
              );
            } else {
              updatedLiveRoom.servicesUsed = updatedLiveRoom.servicesUsed.map(
                (service, idx) =>
                  idx === serviceIndex
                    ? { ...service, status: newStatus }
                    : service,
              );
            }
          }
        }
      } else if (orderId.startsWith("IS:")) {
        if (updatedLiveRoom.issuesReported) {
          const updatedIssues = { ...updatedLiveRoom.issuesReported };
          for (const key of Object.keys(updatedIssues)) {
            if (updatedIssues[key].issueId === orderId) {
              updatedIssues[key] = {
                ...updatedIssues[key],
                status: newStatus,
                timeOfFullfilment: new Date().toISOString(),
              };
              break;
            }
          }
          updatedLiveRoom.issuesReported = updatedIssues;
        }
      } else if (
        orderId === "checklist" &&
        updatedLiveRoom.checklist?.payment
      ) {
        if (statusLower === "paid") {
          updatedLiveRoom.checklist = {
            ...updatedLiveRoom.checklist,
            payment: {
              ...updatedLiveRoom.checklist.payment,
              mode: "cash",
              paymentId: "cash",
              paymentStatus: "paid",
              timeOfTransaction: new Date().toISOString(),
              transctionId: "cash",
            },
          };
        }
      } else {
        console.error("Unrecognized orderId prefix for", orderId);
        toast.error("Invalid order type");
        return;
      }

      setLocalLiveRoom(updatedLiveRoom);
      await setOfflineRoom(updatedLiveRoom);

      if (onLiveRoomUpdate) {
        onLiveRoomUpdate(updatedLiveRoom);
      }

      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    console.log("Status change:", orderId, newStatus);

    const statusLower = newStatus.toLowerCase();

    if (statusLower === "paid" || statusLower === "completed") {
      setConfirmationDialog({
        open: true,
        status: newStatus,
        orderId: orderId,
      });
    } else {
      updateStatus(orderId, newStatus);
    }
  };

  const handleConfirmStatusChange = async () => {
    const { orderId, status } = confirmationDialog;
    await updateStatus(orderId, status);
    setConfirmationDialog({ open: false, status: "", orderId: "" });
  };

  const handleCancelStatusChange = () => {
    setConfirmationDialog({ open: false, status: "", orderId: "" });
  };

  const handleAttendantChange = async (
    orderId: string,
    attendantName: string,
  ) => {
    console.log("Attendant change:", orderId, attendantName);

    const attendantData = availableStaff.find(
      (staff) => staff.name === attendantName,
    );
    const token = attendantData?.notificationToken || "";
    const contact = attendantData?.phone || attendantData?.contact || "";

    if (!attendantData) {
      console.error("Attendant not found:", attendantName);
      toast.error("Failed to find attendant");
      return;
    }

    try {
      const updatedLiveRoom = { ...localLiveRoom };

      if (orderId.startsWith("BOK:")) {
        updatedLiveRoom.bookingDetails = {
          ...updatedLiveRoom.bookingDetails,
          attendant: attendantName,
          attendantToken: token,
          attendantContact: contact,
        };
      } else if (orderId.startsWith("OR:")) {
        if (updatedLiveRoom.diningDetails?.orders) {
          const orderIndex = updatedLiveRoom.diningDetails.orders.findIndex(
            (order) => order.orderId === orderId,
          );
          if (orderIndex !== -1) {
            updatedLiveRoom.diningDetails = {
              ...updatedLiveRoom.diningDetails,
              attendant: attendantName,
              attendantToken: token,
              attendantContact: contact,
              orders: updatedLiveRoom.diningDetails.orders.map((order, idx) =>
                idx === orderIndex
                  ? {
                      ...order,
                      attendant: attendantName,
                      attendantToken: token,
                      attendantContact: contact,
                    }
                  : order,
              ),
            };
          }
        }
      } else if (orderId.startsWith("IS:")) {
        if (updatedLiveRoom.issuesReported) {
          const issueKeys = Object.keys(updatedLiveRoom.issuesReported);
          for (const key of issueKeys) {
            if (updatedLiveRoom.issuesReported[key].issueId === orderId) {
              updatedLiveRoom.issuesReported = {
                ...updatedLiveRoom.issuesReported,
                [key]: {
                  ...updatedLiveRoom.issuesReported[key],
                  attendant: attendantName,
                  attendantToken: token,
                  attendantContact: contact,
                },
              };
              break;
            }
          }
        }
      } else if (orderId.startsWith("SE:")) {
        if (updatedLiveRoom.servicesUsed) {
          const serviceIndex = updatedLiveRoom.servicesUsed.findIndex(
            (service) => service.serviceId === orderId,
          );
          if (serviceIndex !== -1) {
            updatedLiveRoom.servicesUsed = updatedLiveRoom.servicesUsed.map(
              (service, idx) =>
                idx === serviceIndex
                  ? {
                      ...service,
                      attendant: attendantName,
                      attendantToken: token,
                      attendantContact: contact,
                    }
                  : service,
            );
          }
        }
      } else {
        console.error("Unrecognized orderId prefix for", orderId);
        toast.error("Invalid order type");
        return;
      }

      setLocalLiveRoom(updatedLiveRoom);

      await Promise.all([
        updateOrdersForAttendant(attendantName, orderId, contact),
        setOfflineRoom(updatedLiveRoom),
      ]);

      console.log("updatedLiveRoom", updatedLiveRoom);
      console.log("attendantName", attendantName, orderId, contact);

      if (onLiveRoomUpdate) {
        onLiveRoomUpdate(updatedLiveRoom);
      }

      toast.success(`Assigned to ${attendantName}`);
    } catch (error) {
      console.error("Error updating attendant:", error);
      toast.error("Failed to update attendant");
    }
  };

  const handleCheckoutClick = () => {
    setChecklistOpen(true);
  };

  const handleSubmitClick = async () => {
    const pending = Number(calculateFinalAmount(localLiveRoom)) || 0;
    if (!localLiveRoom.checklist?.flag) {
      toast.error("Complete the checkout checklist before submitting.");
      return;
    }
    if (pending > 0) {
      setFinalSubmitDialog({ open: true, type: "payment_pending" });
      return;
    }
    if (businessInfo == null || typeof businessInfo !== "object") {
      toast.error(
        "Business information is not available. Cannot complete checkout.",
      );
      return;
    }
    finalSubmitPrepareCancelledRef.current = false;
    setFinalSubmitDialog({ open: true, type: "close_table" });
    try {
      const invoice = `INV${Math.floor(
        1000000 + Math.random() * 9000000,
      ).toString()}`;
      const invoiceObject = await generateInvoiceObject(
        localLiveRoom,
        businessInfo,
        invoice,
      );
      if (finalSubmitPrepareCancelledRef.current) return;
      setFinalSubmitDialog({
        open: true,
        type: "close_table",
        invoiceObject,
      });
    } catch (error) {
      console.error("Failed to prepare checkout invoice:", error);
      if (!finalSubmitPrepareCancelledRef.current) {
        setFinalSubmitDialog({ open: false, type: null });
        toast.error("Failed to prepare checkout");
      }
    }
  };

  const handleCancelFinalSubmit = () => {
    finalSubmitPrepareCancelledRef.current = true;
    setFinalSubmitDialog({ open: false, type: null });
  };

  const handleConfirmFinalCheckout = async () => {
    const invoiceObject = finalSubmitDialog.invoiceObject;
    const roomSnapshot = localLiveRoom;
    setFinalSubmitDialog({ open: false, type: null });
    try {
      if (invoiceObject) {
        try {
          const { processAndUploadInvoice } =
            await import("@/lib/firebase/invoice-storage");
          const downloadURL = await processAndUploadInvoice(
            invoiceObject,
            "room",
          );
          if (downloadURL && roomSnapshot.bookingDetails?.customer?.phone) {
            await sendFinalMessage(
              `+91${roomSnapshot.bookingDetails.customer.phone}`,
              [roomSnapshot.bookingDetails.customer.name],
              downloadURL,
            );
          }
        } catch (error) {
          console.error("Failed to upload invoice:", error);
        }
      }
      await setHistoryRoom(roomSnapshot, roomSnapshot.bookingDetails.roomType);
      toast.success("Room checked out");
      await onRoomClosed?.();
      onClose();
    } catch (e) {
      console.error("Checkout failed:", e);
      toast.error("Failed to complete checkout");
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB");
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 mt-5">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-xl font-bold">
              R-{bookingDetails.location}
            </span>
            <Badge className="bg-green-500 text-white">Occupied</Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <span>{bookingDetails.customer?.name}</span>
            <span className="text-slate-400">•</span>
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {bookingDetails.noOfGuests}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {checklist?.flag ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleDiscountClick}
            >
              Add Discount
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={handleAddClick}
            >
              <PlusCircle className="w-4 h-4" />
              Add
            </Button>
          )}
          <Button
            size="sm"
            className="gap-1 bg-black text-white hover:bg-gray-800"
            onClick={handleInvoiceClick}
          >
            <FileText className="w-4 h-4" />
            Invoice
          </Button>
          <Button
            size="sm"
            className="gap-1 bg-black text-white hover:bg-gray-800"
            onClick={handleCallClick}
          >
            <PhoneCall className="w-4 h-4" />
            Call
          </Button>
        </div>
      </div>

      <Separator className="mb-4" />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {/* Booking Section */}
        {bookingDetails?.bookingId && (
          <div className="space-y-2">
            <div className="flex justify-between items-center py-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{bookingDetails.bookingId}</Badge>
                <Select
                  onValueChange={(value) =>
                    handleAttendantChange(bookingDetails.bookingId, value)
                  }
                  disabled={isLoadingStaff || availableStaff.length === 0}
                >
                  <SelectTrigger className="w-[140px] py-0 h-6">
                    <SelectValue
                      placeholder={bookingDetails.attendant || "Unassigned"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.map((staff, index) => (
                      <SelectItem key={index} value={staff.name}>
                        {staff.name}
                      </SelectItem>
                    ))}
                    {availableStaff.length === 0 && !isLoadingStaff && (
                      <SelectItem value="" disabled>
                        No staff available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <StatusChip
                  status={bookingDetails.payment?.paymentStatus || "pending"}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {status.room.map((stat, id) => (
                    <DropdownMenuItem
                      key={id}
                      onClick={() =>
                        handleStatusChange(bookingDetails.bookingId, stat)
                      }
                    >
                      {stat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col py-2">
                  <span className="font-medium text-base">
                    {bookingDetails.roomType}
                  </span>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Clock className="mr-2" size={14} />
                    <span>
                      {formatDate(bookingDetails.checkIn)} -{" "}
                      {formatDate(bookingDetails.checkOut)}
                    </span>
                  </div>
                  {bookingDetails.inclusions?.length > 0 && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <span className="font-normal">
                        {bookingDetails.inclusions.join(", ")}
                      </span>
                    </div>
                  )}
                </div>
                <span className="text-green-600 font-medium">
                  ₹{bookingDetails.payment?.price || 0}
                </span>
              </div>

              <Separator />
              {normalizeLiveRoomDiscounts(bookingDetails.payment?.discount).map(
                (discount, index) => (
                  <div
                    className="flex justify-between items-center"
                    key={index}
                  >
                    <div>
                      <span className="font-medium">
                        Discount{" "}
                        <Badge variant="outline">{discount.code}</Badge>
                      </span>
                    </div>
                    <span className="text-green-600 font-semibold">
                      - ₹{discount.amount}
                    </span>
                  </div>
                ),
              )}

              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="text-green-600 font-semibold">
                  ₹{bookingDetails.payment?.subtotal || 0}
                </span>
              </div>

              {bookingDetails.payment?.gst?.gstPercentage > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Tax ({bookingDetails.payment.gst.gstPercentage}%)
                  </span>
                  <span className="text-green-600 font-semibold">
                    ₹{bookingDetails.payment.gst.gstAmount || 0}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total</span>
                  <Badge variant="outline">
                    {bookingDetails.payment?.paymentStatus === "paid"
                      ? "Paid"
                      : "Pending"}
                  </Badge>
                </div>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {bookingDetails.payment?.totalPrice || 0}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Dining Orders Section */}
        {diningOrders.map((order: LiveRoomOrder, i: number) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{order.orderId}</Badge>
                <Select
                  onValueChange={(value) =>
                    handleAttendantChange(order.orderId, value)
                  }
                  disabled={isLoadingStaff || availableStaff.length === 0}
                >
                  <SelectTrigger className="w-[140px] py-0 h-6">
                    <SelectValue
                      placeholder={order.attendant || "Unassigned"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.map((staff, index) => (
                      <SelectItem key={index} value={staff.name}>
                        {staff.name}
                      </SelectItem>
                    ))}
                    {availableStaff.length === 0 && !isLoadingStaff && (
                      <SelectItem value="" disabled>
                        No staff available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <StatusChip status={order.status} />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {status.dining.map((stat, id) => (
                    <DropdownMenuItem
                      key={id}
                      onClick={() => handleStatusChange(order.orderId, stat)}
                    >
                      {stat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              {order.items?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex flex-col py-1">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center text-muted-foreground text-sm">
                      <span className="mr-2">-</span>
                      <span>{item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-green-600 font-medium">
                    ₹{Number(item.price)}
                  </span>
                </div>
              ))}

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="text-green-600 font-semibold">
                  ₹{order.payment?.subtotal || 0}
                </span>
              </div>

              {order.payment?.gst?.gstPercentage > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Tax ({order.payment.gst.gstPercentage}%)
                  </span>
                  <span className="text-green-600 font-semibold">
                    ₹{order.payment.gst.gstAmount || 0}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total</span>
                  <Badge variant="outline">
                    {order.payment?.paymentStatus === "paid"
                      ? "Paid"
                      : "Pending"}
                  </Badge>
                </div>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {order.payment?.totalPrice || 0}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Services Section */}
        {services.map((service: LiveRoomService, i: number) => (
          <div
            key={i}
            className={`space-y-2 ${
              service.status?.toLowerCase() === "cancelled" ? "opacity-50" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{service.serviceId}</Badge>
                <Select
                  onValueChange={(value) =>
                    handleAttendantChange(service.serviceId, value)
                  }
                  disabled={
                    service.status?.toLowerCase() === "cancelled" ||
                    isLoadingStaff ||
                    availableStaff.length === 0
                  }
                >
                  <SelectTrigger className="w-[140px] py-0 h-6">
                    <SelectValue
                      placeholder={service.attendant || "Unassigned"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.map((staff, index) => (
                      <SelectItem key={index} value={staff.name}>
                        {staff.name}
                      </SelectItem>
                    ))}
                    {availableStaff.length === 0 && !isLoadingStaff && (
                      <SelectItem value="" disabled>
                        No staff available
                      </SelectItem>
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
                    disabled={service.status?.toLowerCase() === "cancelled"}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {status.service.map((stat, id) => (
                    <DropdownMenuItem
                      key={id}
                      onClick={() =>
                        handleStatusChange(service.serviceId, stat)
                      }
                    >
                      {stat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col py-2">
                  <span className="font-medium">{service.serviceName}</span>
                  <div className="flex items-center text-muted-foreground text-sm">
                    <Clock className="mr-2" size={14} />
                    <span>
                      {service.startTime} - {service.endTime}
                    </span>
                  </div>
                </div>
                <span className="text-green-600 font-medium">
                  ₹{Number(service.price)}
                </span>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="font-medium">Subtotal</span>
                <span className="text-green-600 font-semibold">
                  ₹{service.payment?.subtotal || 0}
                </span>
              </div>

              {service.payment?.gst?.gstPercentage > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Tax ({service.payment.gst.gstPercentage}%)
                  </span>
                  <span className="text-green-600 font-semibold">
                    ₹{service.payment.gst.gstAmount || 0}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total</span>
                  <Badge variant="outline">
                    {service.payment?.paymentStatus === "paid"
                      ? "Paid"
                      : "Pending"}
                  </Badge>
                </div>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {service.payment?.totalPrice || 0}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Issues Section */}
        {issues.map((issue: LiveRoomIssue, i: number) => (
          <div
            key={i}
            className={`space-y-2 ${
              issue.status?.toLowerCase() === "cancelled" ? "opacity-50" : ""
            }`}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{issue.issueId}</Badge>
                <Select
                  onValueChange={(value) =>
                    handleAttendantChange(issue.issueId, value)
                  }
                  disabled={
                    issue.status?.toLowerCase() === "cancelled" ||
                    isLoadingStaff ||
                    availableStaff.length === 0
                  }
                >
                  <SelectTrigger className="w-[140px] py-0 h-6">
                    <SelectValue
                      placeholder={issue.attendant || "Unassigned"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStaff.map((staff, index) => (
                      <SelectItem key={index} value={staff.name}>
                        {staff.name}
                      </SelectItem>
                    ))}
                    {availableStaff.length === 0 && !isLoadingStaff && (
                      <SelectItem value="" disabled>
                        No staff available
                      </SelectItem>
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
                    disabled={issue.status?.toLowerCase() === "cancelled"}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {status.issue.map((stat, id) => (
                    <DropdownMenuItem
                      key={id}
                      onClick={() => handleStatusChange(issue.issueId, stat)}
                    >
                      {stat}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{issue.name}</span>
                    <Badge variant="outline">{issue.category}</Badge>
                  </div>
                  <span className="text-sm text-slate-500">
                    {formatTime(issue.reportTime)}
                  </span>
                </div>
                <p className="text-sm text-slate-600">{issue.description}</p>
              </div>
            </div>
          </div>
        ))}

        {checklist?.selectedItems?.length > 0 && (
          <div className="space-y-2">
            <div className="font-semibold text-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span>Mini-Bar Items</span>
                <StatusChip
                  status={checklist?.payment?.paymentStatus || "pending"}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("checklist", "Paid")}
                  >
                    Mark as Paid
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="bg-slate-50 rounded-lg p-4 space-y-3">
              <div>
                {checklist.selectedItems.map((itm: any, id: number) => (
                  <div key={id} className="flex items-center justify-between">
                    <div className="flex flex-col py-2">
                      <span className="font-medium">{itm.name}</span>
                      <div className="flex items-center text-muted-foreground text-sm">
                        <span className="mr-2">-</span>
                        <span>{itm.quantity}</span>
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
                <span className="font-medium">Subtotal</span>
                <span className="text-green-600 font-semibold">
                  ₹{checklist?.payment?.subtotal}
                </span>
              </div>
              {checklist?.payment?.gst?.gstPercentage ? (
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Tax ({checklist.payment.gst.gstPercentage}%)
                  </span>
                  <span className="text-green-600 font-semibold">
                    ₹{checklist.payment.gst.gstAmount}
                  </span>
                </div>
              ) : null}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Total</span>
                  {checklist?.payment?.paymentStatus === "paid" ? (
                    <>
                      <Badge variant="outline">Paid</Badge>
                      <Badge variant="outline">
                        {checklist?.payment?.mode}
                      </Badge>
                    </>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <IndianRupee className="w-3 h-3" />
                  {checklist?.payment?.totalPrice}
                </span>
              </div>
            </div>
          </div>
        )}

        {checklist?.checkedItems?.length > 0 && (
          <div className="flex flex-col">
            <span className="font-semibold text-lg py-1">Remarks</span>
            {checklist.checkedItems.map((el: string, i: number) => (
              <span className="text-sm text-slate-600 pb-1" key={i}>
                - {el}
              </span>
            ))}
            {checklist?.note ? (
              <span className="text-sm text-slate-600 pb-1">
                - {checklist.note}
              </span>
            ) : null}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t mt-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {pendingTotal > 0 ? (
              <div className="flex items-center">
                <IndianRupee className="text-green-600" size={20} />
                <span className="text-xl font-semibold mx-2">
                  {pendingTotal}
                </span>
                <Badge>Pending</Badge>
              </div>
            ) : (
              <span className="text-gray-500 text-sm">No pending payments</span>
            )}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleCheckoutClick}>
              Checkout
            </Button>
            <Button
              onClick={handleSubmitClick}
              disabled={!localLiveRoom.checklist?.flag}
            >
              Submit
            </Button>
          </div>
        </div>
      </div>

      <ChecklistDialog
        data={addItems}
        info={handleCheckListInfo}
        open={checklistOpen}
        onClose={() => setChecklistOpen(false)}
        roomNumber={bookingDetails.location}
        tax={businessInfo?.gstTax as any}
      />

      <Dialog
        open={openDiscountDialog.open}
        onOpenChange={(value) =>
          setOpenDiscountDialog({
            open: value,
            location: openDiscountDialog.location,
          })
        }
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Discount</DialogTitle>
            <DialogDescription />
            <Select
              value={selectedDiscount}
              onValueChange={(value) => setSelectedDiscount(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select discount type" />
              </SelectTrigger>
              <SelectContent>
                {discountSelect.map((item, index) => (
                  <SelectItem value={item.code} key={index}>
                    {`${item.code}  ${item.type === "" ? "" : item.type === "percentage" ? `- ${item.discount}%` : `- ₹${item.discount}`}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                setOpenDiscountDialog({ open: false, location: "" })
              }
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() =>
                handleAddDiscount(selectedDiscount, openDiscountDialog.location)
              }
            >
              Add Discount
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={finalSubmitDialog.open}
        onOpenChange={(open) => {
          if (!open) handleCancelFinalSubmit();
        }}
      >
        <DialogContent>
          <DialogHeader>
            {finalSubmitDialog.type === "payment_pending" ? (
              <>
                <DialogTitle>Payment pending</DialogTitle>
                <DialogDescription>
                  This booking cannot be submitted while there are pending
                  payments. Collect payment for all items (including checkout
                  add-ons) before closing the room.
                </DialogDescription>
              </>
            ) : (
              <>
                <DialogTitle>Close room</DialogTitle>
                <DialogDescription>
                  This action moves the stay to history and frees the room.
                  Continue?
                </DialogDescription>
              </>
            )}
          </DialogHeader>
          <DialogFooter>
            {finalSubmitDialog.type === "payment_pending" ? (
              <Button variant="outline" onClick={handleCancelFinalSubmit}>
                OK
              </Button>
            ) : finalSubmitDialog.type === "close_table" ? (
              finalSubmitDialog.invoiceObject !== undefined ? (
                <>
                  <Button variant="outline" onClick={handleCancelFinalSubmit}>
                    Cancel
                  </Button>
                  <Button onClick={handleConfirmFinalCheckout}>
                    Confirm close
                  </Button>
                </>
              ) : (
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              )
            ) : null}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog
        open={addDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            resetAddDialog();
          }
          setAddDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add to R-{bookingDetails.location}</DialogTitle>
            <DialogDescription>
              Select a category and search for items to add
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Select
              value={categorySelect}
              onValueChange={(value) => {
                setCategorySelect(value);
                setCategorySearchTerm("");
                setCategoryItems([]);
                setSelectedCategoryItems([]);
              }}
              disabled={addedType !== null}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Service">Service</SelectItem>
                <SelectItem value="Issue">Issue</SelectItem>
              </SelectContent>
            </Select>
            {addedType && (
              <Button variant="outline" onClick={resetAddDialog}>
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
                    {categoryItems.map((item: any, i: number) => (
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
                                  item.count = parseInt(e.target.value) || 1;
                                }}
                              />
                            </div>
                          </TableCell>
                        )}
                        {categorySelect === "Service" && (
                          <>
                            <TableCell>{item.startTime}</TableCell>
                            <TableCell>{item.endTime}</TableCell>
                          </>
                        )}
                        {(categorySelect === "Service" ||
                          categorySelect === "Food") && (
                          <TableCell>₹{item.price}</TableCell>
                        )}
                        {categorySelect === "Issue" && (
                          <TableCell>{item.issueSubtype}</TableCell>
                        )}
                        <TableCell>
                          <Checkbox
                            checked={selectedCategoryItems.includes(item)}
                            onCheckedChange={() => {
                              if (categorySelect === "Food") {
                                if (!item.count) {
                                  item.count = 1;
                                }
                              }
                              handleCategoryItemSelect(item);
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
                onChange={(e) => setIssueDescription(e.target.value)}
              />
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleAdd(selectedCategoryItems)}
              disabled={selectedCategoryItems.length === 0 || isAddingItem}
            >
              {isAddingItem ? "Adding..." : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Paid/Completed Status */}
      <Dialog
        open={confirmationDialog.open}
        onOpenChange={(open) => {
          if (!open) handleCancelStatusChange();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to mark{" "}
              <span className="font-semibold">
                {confirmationDialog.orderId}
              </span>{" "}
              as{" "}
              <span className="font-semibold">{confirmationDialog.status}</span>
              ?
              {confirmationDialog.status.toLowerCase() === "paid" && (
                <span className="block mt-2 text-amber-600">
                  This will record the payment as cash.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelStatusChange}>
              Cancel
            </Button>
            <Button onClick={handleConfirmStatusChange}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OngoingBookingSheet;
