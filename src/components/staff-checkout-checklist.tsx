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
import { Search, X } from "lucide-react";
const checklistItems = [
  {
    name: "Room Cleanliness: Is the room in good condition? Any deep cleaning needed?",
  },
  {
    name: "Damages/Missing Items: Any damages or missing items (e.g., towels, electronics)?",
  },
  {
    name: "Laundry/Towels: Are laundry and towels left properly (e.g., laundry bag, bathroom)?",
  },
  { name: "Maintenance Issues: Any issues (e.g., broken fixtures)?" },
  { name: "Repairs Needed: Any repairs required before next occupancy?" },
  {
    name: "Outstanding Charges: Are all charges (e.g., mini-bar, room service) settled?",
  },
  { name: "Keys Returned: Were all room keys returned?" },
  { name: "Left-Behind Items: Were any personal belongings left behind?" },
];
const ChecklistDialog = ({
  data,
  open,
  onClose,
  roomNumber,
}: {
  data: any;
  open: any;
  onClose: any;
  roomNumber: string;
}) => {
  const [addItems, setAddItems] = useState<any>([]);
  const [checkedItems, setCheckedItems] = useState<any>({});
  const [isMiniBarChecked, setIsMiniBarChecked] = useState<any>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  const [note, setNote] = useState("");
  useEffect(() => {
    if (data) setAddItems(data);
  }, [data]);
  const handleChecklistItemChange = (index: any) => {
    setCheckedItems((prev: any) => ({
      ...prev,
      [index]: !prev[index],
    }));
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
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };
  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => total + item.price, 0);
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
                          <TableCell>${item.price}</TableCell>
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
                            <TableCell>${item.price}</TableCell>
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
            <div className="text-right">
              <p className="text-lg font-semibold">
                Total Amount: ${calculateTotal().toFixed(2)}
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChecklistDialog;
