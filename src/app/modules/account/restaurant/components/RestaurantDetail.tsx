"use client";
import React, { useRef, useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { toast } from "sonner";
import { X } from "lucide-react";

const RestaurantDetail = ({ data }: { data: any }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [dbImages, setDbImages] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rating: "",
    address: "",
    website: "",
    maps: "",
    opening: "",
    closing: "",
    minOrder: "",
    deliveryFee: "",
    deliveryTime: "",
    openStatus: false,
    enableReviews: false,
    paymentMethods: [] as string[],
  });

  const [errors, setErrors] = useState({
    name: "",
    description: "",
    rating: "",
    address: "",
    website: "",
    maps: "",
    opening: "",
    closing: "",
    minOrder: "",
    deliveryFee: "",
    deliveryTime: "",
    images: "",
    paymentMethods: "",
  });

  // Populate form with initial data
  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        description: data.description || "",
        rating: data.rating ? data.rating.replace("/5", "") : "",
        address: data.address || "",
        website: data.siteUrl || "",
        maps: data.locationGoogleMapsLink || "",
        opening: convertTo24Hour(data.openingTime) || "",
        closing: convertTo24Hour(data.closingTime) || "",
        minOrder: data.minimumOrderPrice
          ? data.minimumOrderPrice.replace(" USD", "")
          : "",
        deliveryFee: data.deliveryFee
          ? data.deliveryFee.replace(" USD", "")
          : "",
        deliveryTime: data.avgDeliveryTime
          ? data.avgDeliveryTime.replace(" mins", "")
          : "",
        openStatus: data.openStatus || false,
        enableReviews: data.reviewEnabled || false,
        paymentMethods: data.paymentOptions || [],
      });

      // Set initial DB images
      if (data.images && Array.isArray(data.images)) {
        setDbImages(
          data.images.map((url: string, index: number) => ({
            id: `db-${index}`,
            url,
            isFromDb: true,
          }))
        );
      }
    }
  }, [data]);

  const validateForm = () => {
    const newErrors = {
      name: !formData.name ? "Restaurant name is required" : "",
      description: !formData.description ? "Description is required" : "",
      rating: !formData.rating
        ? "Rating is required"
        : Number(formData.rating) < 0 || Number(formData.rating) > 5
        ? "Rating must be between 0 and 5"
        : "",
      address: !formData.address ? "Address is required" : "",
      website: !formData.website
        ? "Website URL is required"
        : !/^https?:\/\/.+\..+/.test(formData.website)
        ? "Invalid website URL"
        : "",
      maps: !formData.maps
        ? "Google Maps link is required"
        : !/^https?:\/\/.+\..+/.test(formData.maps)
        ? "Invalid Google Maps URL"
        : "",
      opening: !formData.opening ? "Opening time is required" : "",
      closing: !formData.closing ? "Closing time is required" : "",
      minOrder: !formData.minOrder
        ? "Minimum order is required"
        : Number(formData.minOrder) < 0
        ? "Minimum order cannot be negative"
        : "",
      deliveryFee: !formData.deliveryFee
        ? "Delivery fee is required"
        : Number(formData.deliveryFee) < 0
        ? "Delivery fee cannot be negative"
        : "",
      deliveryTime: !formData.deliveryTime
        ? "Delivery time is required"
        : Number(formData.deliveryTime) < 0
        ? "Delivery time cannot be negative"
        : "",
      images:
        images.length + dbImages.length === 0
          ? "At least one image is required"
          : images.length + dbImages.length > 6
          ? "Maximum 6 images allowed"
          : "",
      paymentMethods:
        formData.paymentMethods.length === 0
          ? "At least one payment method is required"
          : "",
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      const formattedData = {
        ...formData,
        rating: `${formData.rating}/5`,
        minimumOrderPrice: `${formData.minOrder} USD`,
        deliveryFee: `${formData.deliveryFee} USD`,
        avgDeliveryTime: `${formData.deliveryTime} mins`,
        openingTime: convertTo12Hour(formData.opening),
        closingTime: convertTo12Hour(formData.closing),
        images: [
          ...dbImages.map((img) => img.url),
          ...images.map((img: any) => img.url),
        ],
      };
      console.log("Submitted Data:", formattedData);
      toast.success("Form submitted successfully!");
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "number" ? value.replace(/[^0-9.]/g, "") : value,
    }));
    // Clear error when user starts typing
    if (errors[id as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const handlePaymentMethodChange = (checked: boolean, value: string) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: checked
        ? [...prev.paymentMethods, value]
        : prev.paymentMethods.filter((method) => method !== value),
    }));
    setErrors((prev) => ({ ...prev, paymentMethods: "" }));
  };

  // Rest of the file handling functions remain the same
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateAndProcessFiles = (files: FileList) => {
    const newFiles = Array.from(files);
    const totalImages = images.length + dbImages.length + newFiles.length;

    if (totalImages > 6) {
      toast.error("Maximum 6 images allowed");
      return;
    }

    newFiles.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 2MB limit`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        setImages((prev) => [
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
    setErrors((prev) => ({ ...prev, images: "" }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndProcessFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      validateAndProcessFiles(e.target.files);
    }
  };

  const handleDeleteImage = (imageId: string) => {
    setImages((prev) => prev.filter((img: any) => img.id !== imageId));
  };

  const handleDeleteDbImage = (imageId: string) => {
    setDbImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  // Helper functions for time conversion
  const convertTo24Hour = (time12h: string) => {
    if (!time12h) return "";
    const [time, modifier] = time12h.split(" ");
    let hours = time.split(":")[0];
    const minutes = time.split(":")[1];
    if (hours === "12") hours = "00";
    if (modifier === "PM") hours = String(parseInt(hours, 10) + 12);
    return `${hours.padStart(2, "0")}:${minutes}`;
  };

  const convertTo12Hour = (time24h: string) => {
    if (!time24h) return "";
    const [hours, minutes] = time24h.split(":");
    const hour = parseInt(hours, 10);
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${suffix}`;
  };

  const paymentMethods = [
    { id: "visa", label: "Visa" },
    { id: "mastercard", label: "MasterCard" },
    { id: "amex", label: "American Express" },
    { id: "applepay", label: "Apple Pay" },
  ];

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-4xl mx-8">
        <CardHeader>
          <h2 className="text-2xl font-bold">Restaurant Information</h2>
          <p className="text-sm text-muted-foreground">
            Fill in the details about your restaurant
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Restaurant Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rating">Rating (0-5)</Label>
              <Input
                id="rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
                className={errors.rating ? "border-red-500" : ""}
              />
              {errors.rating && (
                <p className="text-sm text-red-500">{errors.rating}</p>
              )}
            </div>
          </div>

          {/* Location & Contact */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={handleInputChange}
                className={errors.address ? "border-red-500" : ""}
              />
              {errors.address && (
                <p className="text-sm text-red-500">{errors.address}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                className={errors.website ? "border-red-500" : ""}
              />
              {errors.website && (
                <p className="text-sm text-red-500">{errors.website}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="maps">Google Maps Link</Label>
              <Input
                id="maps"
                value={formData.maps}
                onChange={handleInputChange}
                className={errors.maps ? "border-red-500" : ""}
              />
              {errors.maps && (
                <p className="text-sm text-red-500">{errors.maps}</p>
              )}
            </div>
          </div>

          {/* Operating Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="opening">Opening Time</Label>
              <Input
                id="opening"
                type="time"
                value={formData.opening}
                onChange={handleInputChange}
                className={errors.opening ? "border-red-500" : ""}
              />
              {errors.opening && (
                <p className="text-sm text-red-500">{errors.opening}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="closing">Closing Time</Label>
              <Input
                id="closing"
                type="time"
                value={formData.closing}
                onChange={handleInputChange}
                className={errors.closing ? "border-red-500" : ""}
              />
              {errors.closing && (
                <p className="text-sm text-red-500">{errors.closing}</p>
              )}
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-4">
            <Label>Payment Methods</Label>
            <div className="grid grid-cols-2 gap-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={method.id}
                    checked={formData.paymentMethods.includes(method.label)}
                    onCheckedChange={(checked) =>
                      handlePaymentMethodChange(
                        checked as boolean,
                        method.label
                      )
                    }
                  />
                  <Label htmlFor={method.id} className="text-sm font-normal">
                    {method.label}
                  </Label>
                </div>
              ))}
            </div>
            {errors.paymentMethods && (
              <p className="text-sm text-red-500">{errors.paymentMethods}</p>
            )}
          </div>

          {/* Delivery Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Delivery Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minOrder">Minimum Order (USD)</Label>
                <Input
                  id="minOrder"
                  type="number"
                  min="0"
                  value={formData.minOrder}
                  onChange={handleInputChange}
                  className={errors.minOrder ? "border-red-500" : ""}
                />
                {errors.minOrder && (
                  <p className="text-sm text-red-500">{errors.minOrder}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryFee">Delivery Fee (USD)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  value={formData.deliveryFee}
                  onChange={handleInputChange}
                  className={errors.deliveryFee ? "border-red-500" : ""}
                />
                {errors.deliveryFee && (
                  <p className="text-sm text-red-500">{errors.deliveryFee}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryTime">
                Average Delivery Time (minutes)
              </Label>
              <Input
                id="deliveryTime"
                type="number"
                min="0"
                value={formData.deliveryTime}
                onChange={handleInputChange}
                className={errors.deliveryTime ? "border-red-500" : ""}
              />
              {errors.deliveryTime && (
                <p className="text-sm text-red-500">{errors.deliveryTime}</p>
              )}
            </div>
          </div>

          {/* Additional Settings */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="openStatus"
              checked={formData.openStatus}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  openStatus: checked as boolean,
                }))
              }
            />
            <Label htmlFor="openStatus" className="text-sm font-normal">
              Currently Open
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="enableReviews"
              checked={formData.enableReviews}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({
                  ...prev,
                  enableReviews: checked as boolean,
                }))
              }
            />
            <Label htmlFor="enableReviews" className="text-sm font-normal">
              Enable Reviews
            </Label>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <Label>Restaurant Images</Label>
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
                  Drag and drop your images here or{" "}
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
              <p className="text-sm text-red-500">{errors.images}</p>
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
                        alt="Restaurant"
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                    <button
                      type="button"
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
                      type="button"
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
        </CardContent>

        <CardFooter className="flex justify-end space-x-4 bg-muted/50 p-6">
          <Button variant="outline" type="button">
            Cancel
          </Button>
          <Button type="submit">Save Restaurant</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default RestaurantDetail;
