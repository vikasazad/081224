"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Mail, Phone, Key, FileText } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Business type is required"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
  countryCode: z.string().min(1, "Country code is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  gst: z.string().min(15, "GST number must be 15 characters"),
  panNo: z.string().min(10, "PAN number must be 10 characters"),
});

// Define type for form data based on the schema
type FormData = z.infer<typeof formSchema>;

const Business = ({ data }: { data: any }) => {
  console.log(data);
  const defaultValues: FormData = {
    businessName: data.businessName,
    businessType: data.businessType,
    email: data.email,
    password: data.password,
    countryCode: "+1",
    phone: data.phone,
    gst: data.gst,
    panNo: data.panNo,
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues,
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="max-w-4xl mx-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            Business Information
          </CardTitle>
          <CardDescription>Update your business details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Business Name */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="businessName" className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Business Name
              </Label>
              <Input
                id="businessName"
                {...register("businessName")}
                className={errors.businessName ? "border-red-500" : ""}
              />
              {errors.businessName && (
                <p className="text-sm text-red-500">
                  {errors.businessName.message}
                </p>
              )}
            </div>

            {/* Business Type */}
            <div className="col-span-2 space-y-2">
              <Label htmlFor="businessType">Business Type</Label>
              <Input
                id="businessType"
                {...register("businessType")}
                className={errors.businessType ? "border-red-500" : ""}
              />
              {errors.businessType && (
                <p className="text-sm text-red-500">
                  {errors.businessType.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              {errors.password && (
                <p className="text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Phone Section */}
            <div className="space-y-2">
              <Label htmlFor="countryCode" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Country Code
              </Label>
              <Input
                id="countryCode"
                {...register("countryCode")}
                className={errors.countryCode ? "border-red-500" : ""}
              />
              {errors.countryCode && (
                <p className="text-sm text-red-500">
                  {errors.countryCode.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>

            {/* Registration Numbers */}
            <div className="space-y-2">
              <Label htmlFor="gst" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                GST Number
              </Label>
              <Input
                id="gst"
                {...register("gst")}
                className={errors.gst ? "border-red-500" : ""}
              />
              {errors.gst && (
                <p className="text-sm text-red-500">{errors.gst.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="panNo">PAN Number</Label>
              <Input
                id="panNo"
                {...register("panNo")}
                className={errors.panNo ? "border-red-500" : ""}
              />
              {errors.panNo && (
                <p className="text-sm text-red-500">{errors.panNo.message}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <Button type="submit" className="ml-auto">
            Update Information
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};

export default Business;
