"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { EditSupplier, Supplier } from "@/types/inventory";

interface EditSupplierDialogProps {
  supplier: Supplier | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (supplier: EditSupplier) => void;
}

export function EditSupplierDialog({
  supplier,
  open,
  onOpenChange,
  onSave,
}: EditSupplierDialogProps) {
  console.log("LLLLLLLLLL", supplier);
  const [formData, setFormData] = useState<any>({
    name: supplier?.name || "",
    phoneNumber: supplier?.phoneNumber || "",
    additionalPhoneNumber: supplier?.phoneNumber?.[1] || "",
    email: supplier?.email || "",
    address: supplier?.address || "",
    gstNumbers: supplier?.gstNumber || [""],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const phoneNumbers = [formData.phoneNumber];
    if (formData.additionalPhoneNumber) {
      phoneNumbers.push(formData.additionalPhoneNumber);
    }

    onSave({
      ...formData,
      phoneNumber: phoneNumbers,
      gstNumber: formData.gstNumbers.filter(Boolean),
    });
    onOpenChange(false);
  };

  const addGstNumber = () => {
    setFormData({
      ...formData,
      gstNumbers: [...formData.gstNumbers, ""],
    });
  };

  const updateGstNumber = (index: number, value: string) => {
    const newGstNumbers = [...formData.gstNumbers];
    newGstNumbers[index] = value;
    setFormData({
      ...formData,
      gstNumbers: newGstNumbers,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {supplier ? "Edit Supplier" : "Add New Supplier"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber[0]}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="additionalPhoneNumber">
                Additional Phone Number
              </Label>
              <Input
                id="additionalPhoneNumber"
                value={formData.additionalPhoneNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    additionalPhoneNumber: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label>GST Numbers</Label>
              {formData.gstNumbers.map((gst: string, index: number) => (
                <Input
                  key={index}
                  value={gst}
                  onChange={(e) => updateGstNumber(index, e.target.value)}
                  placeholder={`GST Number ${index + 1}`}
                />
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addGstNumber}
                className="mt-2"
              >
                Add Another GST Number
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
