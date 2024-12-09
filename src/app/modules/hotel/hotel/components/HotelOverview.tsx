"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BadgeCheck,
  BedDouble,
  Bell,
  Building2,
  CookingPot,
  DoorClosed,
  Plus,
  ShieldCheck,
  ShowerHead,
  SquareParking,
  Tv,
  Wifi,
  Wind,
  Wine,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
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

import { toast } from "sonner";
import Image from "next/image";
import { FaElevator } from "react-icons/fa6";
import { GiVacuumCleaner } from "react-icons/gi";
import { TbFireExtinguisher } from "react-icons/tb";
import { GrStepsOption } from "react-icons/gr";
import { GiPowerGenerator } from "react-icons/gi";

const HotelOverview = ({ data }: { data: any }) => {
  console.log("lskdjfsl;dfjk", data);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [roomData, setRoomData] = useState<any>();
  const [categoryFlag, setCategoryFlag] = useState<boolean>(false);
  const [roomNumbers, setRoomNumbers] = useState<string[]>([]);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [roomNumberError, setRoomNumberError] = useState("");
  const [images, setImages] = useState<any>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [categoryName, setCategoryName] = useState("Deluxe");
  const [price, setPrice] = useState("250.00");
  const [description, setDescription] = useState(
    "Spacious room with city view and modern amenities"
  );
  const [discountAmount, setDiscountAmount] = useState("10");
  const [discountCode, setDiscountCode] = useState("SUMMER10");
  const [discountType, setDiscountType] = useState("percentage");
  const [dbImages, setDbImages] = useState<any[]>([]);
  const [errors, setErrors] = useState({
    categoryName: "",
    price: "",
    description: "",
    roomNumbers: "",
    amenities: "",
    discountAmount: "",
    discountCode: "",
    discountType: "",
    images: "",
  });

  useEffect(() => {
    // getHotelData().then((data: any) => {
    //   console.log("HOTEL", data);
    //   setRoomData(data.rooms);
    // });
    setRoomData(data.rooms);
  }, [data]);

  // State for amenities
  const [selectedAmenities, setSelectedAmenities] = useState<any[]>([]);

  // {Available amenities for selection
  const availableAmenities = [
    { id: 1, name: "WiFi", icon: <Wifi className="h-4 w-4" /> },
    { id: 2, name: "TV", icon: <Tv className="h-4 w-4" /> },
    { id: 3, name: "AC", icon: <Wind className="h-4 w-4" /> },
    { id: 4, name: "Mini Bar", icon: <Wine className="h-4 w-4" /> },
    { id: 5, name: "Service", icon: <Bell className="h-4 w-4" /> },
    { id: 6, name: "Kitchen", icon: <CookingPot className="h-4 w-4" /> },
    { id: 7, name: "Elevator", icon: <FaElevator /> },
    {
      id: 8,
      name: "Parking facility",
      icon: <SquareParking className="h-4 w-4" />,
    },
    {
      id: 9,
      name: "Private entrance",
      icon: <DoorClosed className="h-4 w-4" />,
    },
    { id: 10, name: "Daily housekeeping", icon: <GiVacuumCleaner /> },
    { id: 11, name: "24/7 check-in", icon: <BadgeCheck className="h-4 w-4" /> },
    { id: 12, name: "Fire extinguisher", icon: <TbFireExtinguisher /> },
    { id: 13, name: "Step free access", icon: <GrStepsOption /> },
    {
      id: 14,
      name: "Attached bathroom",
      icon: <ShowerHead className="h-4 w-4" />,
    },
    { id: 15, name: "Security", icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 16, name: "Power backup", icon: <GiPowerGenerator /> },
    {
      id: 17,
      name: "Geyser",
      icon: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 20.282 2.77 L 17.56 18.416 C 17.312 19.85 15.944 21 14.49 21 H 5.83 c -1.454 0 -2.82 -1.15 -3.07 -2.583 L 0.04 2.767 C -0.222 1.264 0.84 0 2.368 0 h 15.585 c 1.527 0 2.59 1.264 2.33 2.77 Z M 14.49 19.913 c 0.926 0 1.842 -0.77 2 -1.683 l 2.722 -15.647 c 0.146 -0.84 -0.406 -1.497 -1.26 -1.497 H 2.37 c -0.854 0 -1.405 0.656 -1.26 1.497 l 2.723 15.65 c 0.158 0.91 1.073 1.68 2 1.68 h 8.658 Z M 4.986 8.892 L 4.12 1.595 l 1.08 -0.128 l 0.867 7.305 c 0.343 3.326 2.322 6.61 4.25 6.61 c 1.847 0 3.553 -3.144 3.942 -6.618 l 0.864 -7.297 l 1.08 0.128 l -0.866 7.294 c -0.445 3.965 -2.404 7.578 -5.022 7.578 c -2.663 0 -4.936 -3.772 -5.33 -7.576 Z m 3.48 8.634 a 1.68 1.68 0 1 1 -3.358 0 a 1.68 1.68 0 0 1 3.36 0 Z m -2.272 0 a 0.593 0.593 0 1 0 1.187 0 a 0.593 0.593 0 0 0 -1.186 0 Z m 9.02 0 a 1.698 1.698 0 1 1 -3.396 0 a 1.698 1.698 0 0 1 3.396 0 Z m -2.31 0 a 0.61 0.61 0 1 0 1.223 0 a 0.61 0.61 0 0 0 -1.222 0 Z M 9.618 11.8 V 8.713 h 1.086 V 11.8 H 9.618 Z m -1.57 -9.744 h 4.225 v 5.416 H 8.05 V 2.056 Z m 3.682 1.087 H 8.592 l 0.543 -0.544 v 4.33 l -0.543 -0.545 h 3.138 l -0.543 0.543 V 2.6 l 0.543 0.544 Z"
            fill="currentColor"
          />
        </svg>
      ),
    },
  ];

  const validateForm = () => {
    const newErrors: any = {};
    let isValid = true;

    // Validate category name
    if (!categoryName.trim()) {
      newErrors.categoryName = "Category name is required";
      isValid = false;
    }

    // Validate price
    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = "Please enter a valid price";
      isValid = false;
    }

    // Validate description
    if (!description.trim()) {
      newErrors.description = "Room description is required";
      isValid = false;
    }

    // Validate discount amount
    if (isNaN(Number(discountAmount)) || Number(discountAmount) <= 0) {
      newErrors.discountAmount = "Please enter a valid discount amount";
      isValid = false;
    }

    // Validate discount code
    if (discountCode.trim().length < 3) {
      newErrors.discountCode = "Discount code must be at least 3 characters";
      isValid = false;
    }

    // Validate room numbers
    if (roomNumbers.length === 0) {
      newErrors.roomNumbers = "At least one room number is required";
      isValid = false;
    }

    // Validate amenities
    if (selectedAmenities.length === 0) {
      newErrors.amenities = "At least one amenity is required";
      isValid = false;
    }

    // Update image validation to include both uploaded and DB images
    if (images.length + dbImages.length === 0) {
      newErrors.images = "At least one image is required";
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const formData = {
        categoryName,
        price: Number(price),
        description,
        roomNumbers,
        amenities: selectedAmenities.map((a) => a.name),
        discount: {
          amount: Number(discountAmount),
          code: discountCode,
          type: discountType,
        },
        images: [
          ...images.map((img: any) => ({
            id: img.id,
            url: img.url,
            isFromDb: false,
          })),
          ...dbImages.map((img) => ({
            id: img.id,
            url: img.url,
            isFromDb: true,
          })),
        ],
      };

      toast.success("Form submitted successfully", {
        description: "All data has been validated",
      });

      console.log("Submitted Data:", formData);
    } else {
      toast.error("Form validation failed", {
        description: "Please check the errors and try again",
      });
    }
  };

  // Validate and handle room number addition
  const handleAddRoom = () => {
    setRoomNumberError("");

    if (!newRoomNumber) {
      setRoomNumberError("Room number is required");
      toast.error("Room number is required");
      return;
    }

    const roomNum = newRoomNumber;
    if (!roomNum.trim()) {
      setRoomNumberError("Please enter a valid room number");
      toast.error("Invalid room number");
      return;
    }

    if (roomNumbers.includes(roomNum)) {
      setRoomNumberError("Room number already exists");
      toast.error("Room number already exists");
      return;
    }

    setRoomNumbers([...roomNumbers, roomNum]);
    setNewRoomNumber("");
    toast.success("Room Added", {
      description: `Room ${roomNum} has been added successfully.`,
    });
  };

  // Handle deleting room number
  const handleDeleteRoom = (roomToDelete: any) => {
    setRoomNumbers(roomNumbers.filter((room) => room !== roomToDelete));
    toast.success("Room Removed", {
      description: `Room ${roomToDelete} has been removed.`,
    });
  };

  // Handle adding new amenity
  const handleAddAmenity = (amenityId: any) => {
    const amenityToAdd = availableAmenities.find(
      (a) => a.id === Number(amenityId)
    );
    if (
      amenityToAdd &&
      !selectedAmenities.find((a) => a.id === amenityToAdd.id)
    ) {
      setSelectedAmenities([...selectedAmenities, amenityToAdd]);
      toast.success("Amenity Added", {
        description: `${amenityToAdd.name} has been added to amenities.`,
      });
    }
  };

  // Handle deleting amenity
  const handleDeleteAmenity = (amenityId: any) => {
    setSelectedAmenities(
      selectedAmenities.filter((amenity) => amenity.id !== amenityId)
    );
    const amenity: any = availableAmenities.find((a) => a.id === amenityId);
    toast.success("Amenity Removed", {
      description: `${amenity.name} has been removed from amenities.`,
    });
  };

  // Image upload handlers
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

  const categoryClick = (data: any) => {
    console.log("first", data);
    setCategoryName(data.roomType);
    setPrice(data.price);
    setDescription(data.description);
    setDiscountType(data.discount.type);
    setDiscountCode(data.discount.code);
    setDiscountAmount(data.discount.amount);
    setRoomNumbers(data.roomNo);
    const arr: typeof availableAmenities = []; // Declare arr with the same type as availableAmenities

    if (data) {
      data.amenities.forEach((itm: string) => {
        // Use forEach for iterating
        availableAmenities.forEach((item) => {
          // Iterate over availableAmenities
          if (itm === item.name) {
            arr.push(item); // Push the matching item into arr
          }
        });
      });
    }
    setSelectedAmenities(arr);
    const imgArr: any = [];
    if (data) {
      data.images.map((img: string, i: number) => {
        imgArr.push({
          id: `db${i + 1}`,
          url: img,
          isFromDb: true,
        });
      });
    }
    console.log("askjd", imgArr);
    setDbImages(imgArr);
    // setFormData({
    //   rooms: [
    //     {
    //       roomType: data.roomType || "",
    //       roomNos: data.roomNo ? data.roomNo.join(", ") : "",
    //       roomName: "",
    //       roomDescription: data.description || "",
    //       totalRooms: data.totalRooms || "",
    //       price: data.price || "",
    //       amenities: data.amenities || [],
    //       roomImages: [],
    //     },
    //   ],
    // });
    // setNewImg(data.images);
    // setFormErrors({
    //   rooms: [
    //     {
    //       categoryName: "",
    //       roomNos: "",
    //       roomName: "",
    //       roomDescription: "",
    //       totalRooms: "",
    //       price: "",
    //       amenities: "",
    //       roomImages: "",
    //     },
    //   ],
    // });
    // setSelectedCategory(data);
    setCategoryFlag(true);
  };
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:px-8 py-4">
      {!categoryFlag && (
        <>
          {roomData && (
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
              {roomData.map((data: any, i: number) => (
                <Card
                  key={i}
                  onClick={() => categoryClick(data)}
                  className="cursor-pointer"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xl font-bold">
                      <div className="flex items-center justify-between">
                        <BedDouble className="mr-3" /> {data.roomType}
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
      {categoryFlag && (
        <>
          <Card className="w-full max-w-3xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-primary" />
                <CardTitle>Room Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Details Section */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category Name</Label>
                  <Input
                    id="category"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className={errors.categoryName ? "border-red-500" : ""}
                  />
                  {errors.categoryName && (
                    <p className="text-sm text-red-500">
                      {errors.categoryName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price per Night</Label>
                  <Input
                    id="price"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    prefix="$"
                    className={errors.price ? "border-red-500" : ""}
                  />
                  {errors.price && (
                    <p className="text-sm text-red-500">{errors.price}</p>
                  )}
                </div>
              </div>

              {/* Room Numbers Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <Label>Room Numbers</Label>
                    {errors.roomNumbers && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.roomNumbers}
                      </p>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Room
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Room Number</DialogTitle>
                      </DialogHeader>
                      <DialogDescription></DialogDescription>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label htmlFor="roomNumber">Room Number</Label>
                          <Input
                            id="roomNumber"
                            type="number"
                            placeholder="Enter room number"
                            value={newRoomNumber}
                            onChange={(e) => {
                              setNewRoomNumber(e.target.value);
                              setRoomNumberError("");
                            }}
                            className={roomNumberError ? "border-red-500" : ""}
                          />
                          {roomNumberError && (
                            <p className="text-sm text-red-500">
                              {roomNumberError}
                            </p>
                          )}
                        </div>
                        <DialogClose asChild>
                          <Button onClick={handleAddRoom}>Add Room</Button>
                        </DialogClose>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-2">
                  {roomNumbers.map((room) => (
                    <Badge
                      key={room}
                      variant="secondary"
                      className="text-sm flex items-center gap-1"
                    >
                      Room {room}
                      <button
                        onClick={() => handleDeleteRoom(room)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description Section */}
              <div className="space-y-2">
                <Label htmlFor="description">Room Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full ${
                    errors.description ? "border-red-500" : ""
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>

              {/* Amenities Section */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <Label>Available Amenities</Label>
                    {errors.amenities && (
                      <p className="text-sm text-red-500 mt-1">
                        {errors.amenities}
                      </p>
                    )}
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Amenity
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Amenity</DialogTitle>
                      </DialogHeader>
                      <DialogDescription></DialogDescription>
                      <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                          <Label>Select Amenity</Label>
                          <Select onValueChange={handleAddAmenity}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select an amenity" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableAmenities.map((amenity) => (
                                <SelectItem
                                  key={amenity.id}
                                  value={amenity.id.toString()}
                                  disabled={selectedAmenities.some(
                                    (a) => a.id === amenity.id
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    {amenity.icon}
                                    {amenity.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="flex flex-wrap gap-4">
                  {selectedAmenities.map((amenity) => (
                    <Badge
                      key={amenity.id}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {amenity.icon}
                      {amenity.name}
                      <button
                        onClick={() => handleDeleteAmenity(amenity.id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Discount Section */}
              <div className="space-y-4">
                <Label>Discount</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="discountType">Type</Label>
                    <Select
                      value={discountType}
                      onValueChange={setDiscountType}
                    >
                      <SelectTrigger id="discountType">
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.discountType && (
                      <p className="text-sm text-red-500">
                        {errors.discountType}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountCode">Code</Label>
                    <Input
                      id="discountCode"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className={errors.discountCode ? "border-red-500" : ""}
                    />
                    {errors.discountCode && (
                      <p className="text-sm text-red-500">
                        {errors.discountCode}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discountAmount">Amount</Label>
                    <Input
                      id="discountAmount"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className={errors.discountAmount ? "border-red-500" : ""}
                    />
                    {errors.discountAmount && (
                      <p className="text-sm text-red-500">
                        {errors.discountAmount}
                      </p>
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

              {/* Action Buttons */}
              <div className="flex justify-between pt-4">
                <div className="flex gap-2">
                  <Button variant="outline">Cancel</Button>
                  {/* <Button variant="outline">Add More</Button> */}
                </div>
                <Button onClick={handleSubmit}>
                  Next
                  <span className="ml-2">→</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default HotelOverview;
