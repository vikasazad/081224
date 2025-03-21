"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Plus, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const supplierFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  phoneNumbers: z
    .array(z.string().min(1, { message: "Phone number is required" }))
    .min(1)
    .max(2),
  email: z.string().email({ message: "Invalid email address" }),
  address: z.string().min(1, { message: "Address is required" }),
  gstNumbers: z
    .array(z.string().min(1, { message: "GST number is required" }))
    .min(1),
});

type SupplierFormValues = z.infer<typeof supplierFormSchema>;

interface SupplierFormProps {
  onSave: (data: SupplierFormValues) => void;
  onCancel: () => void;
  initialData?: any;
}

export function SupplierForm({
  onSave,
  onCancel,
  initialData,
}: SupplierFormProps) {
  const [phoneNumbers, setPhoneNumbers] = useState<string[]>(
    initialData?.phoneNumbers || [""]
  );
  const [gstNumbers, setGstNumbers] = useState<string[]>(
    initialData?.gstNumbers || [""]
  );

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      phoneNumbers: initialData?.phoneNumbers || [""],
      email: initialData?.email || "",
      address: initialData?.address || "",
      gstNumbers: initialData?.gstNumbers || [""],
    },
  });

  function onSubmit(data: SupplierFormValues) {
    onSave(data);
  }

  const addPhoneNumber = () => {
    if (phoneNumbers.length < 2) {
      const newPhoneNumbers = [...phoneNumbers, ""];
      setPhoneNumbers(newPhoneNumbers);
      form.setValue("phoneNumbers", newPhoneNumbers);
    }
  };

  const removePhoneNumber = (index: number) => {
    const newPhoneNumbers = phoneNumbers.filter((_, i) => i !== index);
    setPhoneNumbers(newPhoneNumbers);
    form.setValue("phoneNumbers", newPhoneNumbers);
  };

  const addGstNumber = () => {
    const newGstNumbers = [...gstNumbers, ""];
    setGstNumbers(newGstNumbers);
    form.setValue("gstNumbers", newGstNumbers);
  };

  const removeGstNumber = (index: number) => {
    const newGstNumbers = gstNumbers.filter((_, i) => i !== index);
    setGstNumbers(newGstNumbers);
    form.setValue("gstNumbers", newGstNumbers);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="py-2 max-h-[80vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {phoneNumbers.map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`phoneNumbers.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {index === 0 ? "Phone Number" : "Additional Phone Number"}
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input placeholder="Phone number" {...field} />
                        {phoneNumbers.length < 2 && index === 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addPhoneNumber}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {index === 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removePhoneNumber(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="supplier@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Supplier address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {gstNumbers.map((_, index) => (
              <FormField
                key={index}
                control={form.control}
                name={`gstNumbers.${index}`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {index === 0
                        ? "GST Number"
                        : `Additional GST Number ${index + 1}`}
                    </FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input placeholder="GST number" {...field} />
                        {index === gstNumbers.length - 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={addGstNumber}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeGstNumber(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">Save Supplier</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
