import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { IndianRupee, Search, X } from "lucide-react";
import { toast } from "sonner";
import { calculateTax } from "@/app/modules/staff/utils/clientside";
const checklistItems = [
  {
    name: "Room Cleanliness: Is the room is not clean or not in good condition?",
  },
  {
    name: "Damages/Missing Items: Are any items (e.g., towels, electronics) missing or damaged?",
  },
  {
    name: "Laundry/Towels: Are laundry items and towels properly placed (e.g., laundry bag, bathroom)?",
  },
  {
    name: "Maintenance Issues: Are there any broken fixtures or maintenance concerns?",
  },
  {
    name: "Repairs Needed: Are any repairs needed before the next guest checks in?",
  },
  // {
  //   name: "Outstanding Charges: Are all charges (e.g., mini-bar, room service) settled?",
  // },
  { name: "Keys Returned: Have all room keys not been returned?" },
  { name: "Left-Behind Items: Were any personal belongings left in the room?" },
];
const ChecklistDialog = ({
  data,
  info,
  open,
  onClose,
  roomNumber,
  tax,
}: {
  data: any;
  info: any;
  open: any;
  onClose: any;
  roomNumber: string;
  tax: string;
}) => {
  const [addItems, setAddItems] = useState<any>([]);
  const [checkedItems, setCheckedItems] = useState<any>({});
  const [isMiniBarChecked, setIsMiniBarChecked] = useState<any>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [note, setNote] = useState("");
  const [quickSubmit, setQuickSubmit] = useState(false);
  useEffect(() => {
    if (data) setAddItems(data);
  }, [data]);
  const handleChecklistItemChange = (index: any) => {
    console.log("index", index);
    setCheckedItems((prev: any) => {
      const newCheckedItems = { ...prev, [index]: !prev[index] };

      return newCheckedItems;
    });
  };

  const handleSearchChange = (e: any) => {
    const search = e.target.value;
    setSearchTerm(search);
    if (search) {
      const filtered = addItems.foodMenuItems.filter((item: any) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredItems(filtered);
    } else {
      setFilteredItems([]);
    }
  };
  const handleItemSelect = (item: any) => {
    console.log("item", item);
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + Number(item.price), 0);
  };
  // const calculateTax = (tax: string) => {
  //   // console.log("Calculating Tax...", order);
  //   const total = calculateTotal();
  //   // console.log("Order Total for Tax Calculation:", total);

  //   const roundedTax = Math.round((total * parseFloat(tax)) / 100);
  //   // console.log(`Calculated Tax (${tax}%):`, roundedTax);

  //   return roundedTax;
  // };

  const handleSubmit = () => {
    const checkedChecklistItems = Object.keys(checkedItems).filter(
      (key) => checkedItems[key]
    );

    // Quick submit case: bypass all checklist validation  // Case 1: No checklist items are checked
    if (quickSubmit && checkedChecklistItems.length === 0) {
      console.log("here1");
      info({
        flag: true, // Quick submit
        location: roomNumber,
      });
      onClose();
      return;
    }

    // Case 2: Checklist items are checked but no note is added
    if (checkedChecklistItems.length > 0 && !note.trim()) {
      console.log("here2");
      toast.error("Please add a note before submitting.");
      return;
    }

    // Case 3: Checklist items are checked and a note is provided
    const gst = calculateTax(
      calculateTotal(),
      calculateTotal(),
      "services",
      tax
    );
    const total = calculateTotal() + gst?.gstAmount;
    info({
      checkedItems: checkedChecklistItems?.map(
        (el: any) => checklistItems[el].name
      ),
      note,
      selectedItems,
      payment: {
        transctionId: "",
        paymentStatus: "pending",
        mode: "",
        paymentId: "",
        price: calculateTotal(),
        subtotal: calculateTotal(),
        priceAfterDiscount: "",
        timeOfTransaction: "",
        gst: {
          ...gst,
        },
        totalPrice: total,
        discount: {
          type: "none",
          amount: 0,
          code: "",
        },
      },

      location: roomNumber,
      flag: true, // All criteria met
    });

    // console.log("checkedChecklistItems", {
    //   checkedItems: checkedChecklistItems?.map(
    //     (el: any) => checklistItems[el].name
    //   ),
    //   note,
    //   selectedItems,
    //   payment: {
    //     transctionId: "",
    //     paymentStatus: "pending",
    //     mode: "",
    //     paymentId: "",
    //     price: calculateTotal(),
    //     subtotal: calculateTotal(),
    //     priceAfterDiscount: "",
    //     timeOfTransaction: "",
    //     ...gst,
    //     totalPrice: total,
    //     discount: {
    //       type: "none",
    //       amount: 0,
    //       code: "",
    //     },
    //   },

    //   location: roomNumber,
    //   flag: true, // All criteria met);
    // });

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col md:max-w-[450px]">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>R:{roomNumber}</DialogTitle>
          <DialogDescription>
            Complete the checkout process. Check items that are in as-is
            condition.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto py-4">
          <div className="grid gap-4">
            {checklistItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`checklist-item-${index}`}
                  checked={checkedItems[index] || false}
                  onCheckedChange={() => handleChecklistItemChange(index)}
                />
                <Label
                  htmlFor={`checklist-item-${index}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {item.name}
                </Label>
              </div>
            ))}
            <Separator />
            <h3 className="text-lg font-semibold">Additional Charges</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="mini-bar"
                checked={isMiniBarChecked}
                onCheckedChange={(checked) => setIsMiniBarChecked(checked)}
              />
              <Label htmlFor="mini-bar">
                Mini-Bar: Were any mini-bar items consumed?
              </Label>
            </div>
            {isMiniBarChecked && (
              <>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search minibar items"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  {filteredItems.length === 0 ? (
                    <Search className="h-4 w-4" />
                  ) : (
                    <X
                      className="h-4 w-4 cursor-pointer"
                      onClick={() => {
                        setFilteredItems([]);
                        setSearchTerm("");
                      }}
                    />
                  )}
                </div>
                {filteredItems.length > 0 && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Select</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>{Number(item.price)}</TableCell>
                          <TableCell>
                            <Checkbox
                              checked={selectedItems.includes(item)}
                              onCheckedChange={() => handleItemSelect(item)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {selectedItems.length > 0 && (
                  <>
                    <h4 className="text-md font-semibold">Selected Items:</h4>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Select</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedItems.map((item, i) => (
                          <TableRow key={i}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>{item.price}</TableCell>
                            <TableCell>
                              <Checkbox
                                checked={selectedItems.includes(item)}
                                onCheckedChange={() => handleItemSelect(item)}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </>
            )}
            <Separator />
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Add any additional notes here"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
            {(() => {
              const gst = calculateTax(
                calculateTotal(),
                calculateTotal(),
                "services",
                tax
              );

              const total = calculateTotal() + gst?.gstAmount;

              return (
                <div className="text-right">
                  <p className="flex items-center justify-end text-lg font-semibold mr-2">
                    Total Amount: <IndianRupee className="w-4 h-4 mr-1" />
                    {total}
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
        <DialogFooter>
          <div className="flex items-center space-x-2 mr-auto">
            <Checkbox
              id="quick-submit"
              checked={quickSubmit}
              onCheckedChange={(checked) => setQuickSubmit(checked as boolean)}
            />
            <Label htmlFor="quick-submit" className="text-sm">
              Quick submit (no issues)
            </Label>
          </div>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistDialog;
