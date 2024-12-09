"use client";

import { useRef, useState, useEffect } from "react";
import {
  Building2,
  Clock,
  CreditCard,
  Globe,
  MapPin,
  Star,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function HotelInfo({ data }: { data: any }) {
  // console.log("llalalala", data);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    rating: "",
    siteUrl: "",
    description: "",
    paymentOptions: [] as string[],
    checkin: "",
    checkout: "",
    discountType: "",
    discountCode: "",
    discountAmount: "",
  });

  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dbImages, setDbImages] = useState<any[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form data from DB
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        address: data.address || "",
        rating: data.rating ? data.rating.split("/")[0] : "",
        siteUrl: data.siteUrl || "",
        description: data.description || "",
        paymentOptions: data.paymentOptions || [],
        checkin: convertTo24Hour(data.checkin) || "",
        checkout: convertTo24Hour(data.checkout) || "",
        discountType: data.hotelDiscount?.[0]?.type || "",
        discountCode: data.hotelDiscount?.[0]?.code || "",
        discountAmount: data.hotelDiscount?.[0]?.amount?.replace("%", "") || "",
      });

      // Convert DB images to the required format
      const initialDbImages = (data.images || []).map(
        (url: string, index: number) => ({
          id: `db-${index}`,
          url,
          isFromDb: true,
        })
      );
      setDbImages(initialDbImages);
    }
  }, [data]);

  // Convert time from 12-hour to 24-hour format
  const convertTo24Hour = (time12h: string) => {
    if (!time12h) return "";
    const [time, modifier] = time12h.split(" ");
    let hours = time.split(":")[0];
    const minutes = time.split(":")[1];

    if (hours === "12") {
      hours = "00";
    }

    if (modifier === "PM") {
      hours = String(parseInt(hours, 10) + 12);
    }

    return `${hours}:${minutes}`;
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Hotel name is required";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (
      !formData.rating ||
      parseFloat(formData.rating) < 0 ||
      parseFloat(formData.rating) > 5
    ) {
      newErrors.rating = "Rating must be between 0 and 5";
    }

    if (!formData.siteUrl.trim()) {
      newErrors.siteUrl = "Website URL is required";
    } else if (!/^https?:\/\/.+\..+/.test(formData.siteUrl)) {
      newErrors.siteUrl = "Please enter a valid URL";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.checkin) {
      newErrors.checkin = "Check-in time is required";
    }

    if (!formData.checkout) {
      newErrors.checkout = "Check-out time is required";
    }

    if (images.length + dbImages.length === 0) {
      newErrors.images = "At least one image is required";
    }

    if (formData.discountCode && !formData.discountType) {
      newErrors.discountType =
        "Discount type is required when code is provided";
    }

    if (formData.discountType && !formData.discountCode) {
      newErrors.discountCode =
        "Discount code is required when type is provided";
    }

    if (formData.discountType && !formData.discountAmount) {
      newErrors.discountAmount =
        "Discount amount is required when type is provided";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const submitData = {
        ...formData,
        images: [
          ...dbImages.map((img) => img.url),
          ...images.map((img: any) => img.url),
        ],
        hotelDiscount: formData.discountType
          ? [
              {
                type: formData.discountType,
                code: formData.discountCode,
                amount:
                  formData.discountAmount +
                  (formData.discountType === "percentage" ? "%" : ""),
              },
            ]
          : [],
      };
      console.log("Form submitted:", submitData);
      toast.success("Form submitted successfully!");
    } else {
      toast.error("Please fix the errors before submitting");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndProcessFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    const totalImages = images.length + dbImages.length + newFiles.length;

    if (totalImages > 6) {
      toast.error("Upload Error", {
        description: "Maximum 6 images allowed",
      });
      return;
    }

    newFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid File", {
          description: `${file.name} is not an image file`,
        });
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error("File Too Large", {
          description: `${file.name} exceeds 2MB limit`,
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        setImages((prev: any) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            name: file.name,
            url: e.target.result,
            file,
            isFromDb: false,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteDbImage = (imageId: any) => {
    setDbImages((prev) => prev.filter((img) => img.id !== imageId));
    toast.success("Image Removed", {
      description: "Database image has been removed successfully.",
    });
  };

  const handleDrop = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: any) => {
    validateAndProcessFiles(e.target.files);
  };

  const handleDeleteImage = (imageId: any) => {
    setImages(images.filter((img: any) => img.id !== imageId));
    toast.success("Image Removed", {
      description: "Image has been removed successfully.",
    });
  };

  // ... [Previous file handling functions remain the same] ...

  return (
    <Card className="max-w-4xl mx-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Hotel Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Basic Information */}
        <div className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              <Label>Hotel Name</Label>
            </div>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="grid gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <Label>Address</Label>
            </div>
            <Input
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-sm text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-muted-foreground" />
                <Label>Rating</Label>
              </div>
              <Input
                type="number"
                value={formData.rating}
                onChange={(e) => handleInputChange("rating", e.target.value)}
                min="0"
                max="5"
                step="0.1"
                className={errors.rating ? "border-red-500" : ""}
              />
              {errors.rating && (
                <p className="text-sm text-red-500">{errors.rating}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <Label>Website URL</Label>
              </div>
              <Input
                value={formData.siteUrl}
                onChange={(e) => handleInputChange("siteUrl", e.target.value)}
                className={errors.siteUrl ? "border-red-500" : ""}
              />
              {errors.siteUrl && (
                <p className="text-sm text-red-500">{errors.siteUrl}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              className={`min-h-[100px] ${
                errors.description ? "border-red-500" : ""
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description}</p>
            )}
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <Label>Payment Options</Label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Visa", "MasterCard", "American Express", "PayPal"].map(
              (method) => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    id={method}
                    checked={formData.paymentOptions.includes(method)}
                    onCheckedChange={(checked) => {
                      const newOptions = checked
                        ? [...formData.paymentOptions, method]
                        : formData.paymentOptions.filter(
                            (opt) => opt !== method
                          );
                      handleInputChange("paymentOptions", newOptions);
                    }}
                  />
                  <Label htmlFor={method}>{method}</Label>
                </div>
              )
            )}
          </div>
        </div>

        {/* Check-in/out Times */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Label>Check-in/out Times</Label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Check-in Time</Label>
              <Input
                type="time"
                value={formData.checkin}
                onChange={(e) => handleInputChange("checkin", e.target.value)}
                className={errors.checkin ? "border-red-500" : ""}
              />
              {errors.checkin && (
                <p className="text-sm text-red-500">{errors.checkin}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Check-out Time</Label>
              <Input
                type="time"
                value={formData.checkout}
                onChange={(e) => handleInputChange("checkout", e.target.value)}
                className={errors.checkout ? "border-red-500" : ""}
              />
              {errors.checkout && (
                <p className="text-sm text-red-500">{errors.checkout}</p>
              )}
            </div>
          </div>
        </div>

        {/* Image Upload Section */}
        <div className="space-y-2">
          <Label>Room Images</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-muted-foreground/20"
            } ${errors.images ? "border-red-500" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept="image/*"
              multiple
              className="hidden"
            />
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Drag and drop your images here or
                <Button
                  variant="link"
                  className="px-1"
                  onClick={() => fileInputRef.current?.click()}
                >
                  browse files
                </Button>
              </p>
              <p className="text-xs text-muted-foreground">
                Maximum 6 images, 2MB each
              </p>
            </div>
          </div>
          {errors.images && (
            <p className="text-sm text-red-500 mt-1">{errors.images}</p>
          )}

          {/* Image Preview Section */}
          {(images.length > 0 || dbImages.length > 0) && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {/* Render DB Images */}
              {dbImages.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="relative w-full h-32">
                    <Image
                      src={image.url}
                      alt="Room"
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteDbImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <Badge
                    variant="secondary"
                    className="absolute bottom-2 left-2 opacity-75"
                  >
                    Database Image
                  </Badge>
                </div>
              ))}

              {/* Render Uploaded Images */}
              {images.map((image: any) => (
                <div key={image.id} className="relative group">
                  <div className="relative w-full h-32">
                    <Image
                      src={image.url}
                      alt={image.name}
                      fill
                      className="object-cover rounded-lg"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                  <Badge
                    variant="secondary"
                    className="absolute bottom-2 left-2 opacity-75"
                  >
                    New Upload
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Label>Discount</Label>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountType">Type</Label>
              <Select
                value={formData.discountType}
                onValueChange={(value) =>
                  handleInputChange("discountType", value)
                }
              >
                <SelectTrigger
                  id="discountType"
                  className={errors.discountType ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select discount type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                </SelectContent>
              </Select>
              {errors.discountType && (
                <p className="text-sm text-red-500">{errors.discountType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountCode">Code</Label>
              <Input
                id="discountCode"
                value={formData.discountCode}
                onChange={(e) =>
                  handleInputChange("discountCode", e.target.value)
                }
                className={errors.discountCode ? "border-red-500" : ""}
              />
              {errors.discountCode && (
                <p className="text-sm text-red-500">{errors.discountCode}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountAmount">Amount</Label>
              <Input
                id="discountAmount"
                value={formData.discountAmount}
                onChange={(e) =>
                  handleInputChange("discountAmount", e.target.value)
                }
                className={errors.discountAmount ? "border-red-500" : ""}
              />
              {errors.discountAmount && (
                <p className="text-sm text-red-500">{errors.discountAmount}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="ml-auto" onClick={handleSubmit}>
          Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
}
