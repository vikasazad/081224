import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export default function MenuItems({ data }: { data: any }) {
  console.log("9389389", data);
  const [menuItems, setMenuItems] = useState<any>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [categoryName, setCategoryName] = useState("");
  const [categoryLogo, setCategoryLogo] = useState<any>(null);
  const [categoryErrors, setCategoryErrors] = useState({
    name: "",
    logo: "",
  });
  const [dishImages, setDishImages] = useState<any>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<any>({});
  const fileInputRefs = useRef<any>([]);
  const categoryLogoInputRef: any = useRef(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  useEffect(() => {
    setCategoryName(data.name);
    setCategoryLogo({ url: data.categoryLogo });
    const menuArr: any = [];
    const imgArr: any = [];
    data.menuItems.map((data: any) => {
      menuArr.push({
        name: data.name,
        description: data.description,
        cuisineName: data.cuisineName,
        natureOfFood: data.nature,
        portionType: data.portion,
        priceForSingle: data?.price?.Single,
        priceForHalf: data.price?.Half,
        priceForFull: data.price?.Full,
        discountType: data.discountType,
        discountAmount: data.discountAmount,
      });
      imgArr.push(data.images);
    });
    setMenuItems(menuArr);
    setDishImages(imgArr);
  }, [data]);

  const validateCategory = (type: string, value: any) => {
    console.log(type, value);
    const newErrors = { name: "", logo: "" };
    let isValid = true;

    if (type === "categoryName") {
      if (!value.trim()) {
        newErrors.name = "Category name is required";
        isValid = false;
      }
    }
    if (type === "categoryLogo") {
      if (!value) {
        newErrors.logo = "Category logo is required";
        isValid = false;
      }
    }

    setCategoryErrors(newErrors);
    return isValid;
  };

  // Validate form fields
  const validateForm = () => {
    let isValid = true;
    const newErrors = menuItems.map((item: any, index: number) => {
      const itemErrors: any = {};

      // Required fields validation
      if (!item.name.trim()) itemErrors.name = "Name is required";
      if (!item.description.trim())
        itemErrors.description = "Description is required";
      if (!item.cuisineName.trim())
        itemErrors.cuisineName = "Cuisine name is required";

      // Portion type and price validation
      if (item.portionType === "Single") {
        if (!item.priceForSingle) {
          itemErrors.priceForSingle = "Price for single portion is required";
        }
      }
      if (item.portionType === "Half" || item.portionType === "Half/Full") {
        if (!item.priceForHalf) {
          itemErrors.priceForHalf = "Price for half portion is required";
        }
      }

      if (item.portionType === "Full" || item.portionType === "Half/Full") {
        if (!item.priceForFull) {
          itemErrors.priceForFull = "Price for full portion is required";
        }
      }

      // Discount validation (optional fields)
      if (item.discountType && !item.discountAmount) {
        itemErrors.discountAmount =
          "Discount amount is required when discount type is selected";
      }

      // Image validation
      if (!dishImages[index] || dishImages[index].length === 0) {
        itemErrors.images = "At least one dish image is required";
      }

      if (Object.keys(itemErrors).length > 0) {
        isValid = false;
      }

      return itemErrors;
    });

    setErrors(newErrors);
    return isValid;
  };

  // Handle adding another item
  const handleAddAnotherItem = () => {
    if (
      validateCategory("categoryName", categoryName) &&
      validateCategory("categoryLogo", categoryLogo) &&
      validateForm()
    ) {
      const emptyItem = {
        name: "",
        description: "",
        cuisineName: "",
        natureOfFood: "Non-Veg",
        portionType: "Half",
        priceForSingle: "",
        priceForHalf: "",
        priceForFull: "",
        discountType: "",
        discountAmount: "",
      };

      setMenuItems([...menuItems, emptyItem]);
      setDishImages((prevImages: any) => [...prevImages, []]);
      setErrors((prevErrors: any) => [...prevErrors, {}]);
      toast.success("New menu item added successfully");
    } else {
      toast.error("Cannot add new item", {
        description:
          "Please fill in all required fields in the current menu items first.",
      });
    }
  };

  // Handle deleting last item
  const handleDeleteLastItem = () => {
    if (menuItems.length > 1) {
      setIsDeleteAlertOpen(true);
      const newMenuItems = menuItems.slice(0, -1);
      const newDishImages = dishImages.slice(0, -1);
      const newErrors = errors.slice(0, -1);

      // Clean up the last item's image URLs
      if (dishImages[dishImages.length - 1]) {
        dishImages[dishImages.length - 1].forEach((image: any) => {
          URL.revokeObjectURL(image.url);
        });
      }

      setMenuItems(newMenuItems);
      setDishImages(newDishImages);
      setErrors(newErrors);
      setCurrentItemIndex(Math.max(0, currentItemIndex - 1));

      toast.success("Last item deleted successfully");
    }
  };

  // Handle form submission
  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (
      validateCategory("categoryName", categoryName) &&
      validateCategory("categoryLogo", categoryLogo) &&
      validateForm()
    ) {
      // Create final data structure with items and their images
      const finalData = menuItems.map((item: any, index: number) => ({
        ...item,
        images: dishImages[index],
      }));

      console.log("Final Form Data:", finalData);
      toast.success("All menu items saved successfully!");
    } else {
      toast.error("Please fill in all required fields", {
        description: "Some menu items have missing or invalid information.",
      });
    }
  };

  const handleInputChange = (e: any, index: number) => {
    console.log("called-3");
    const { name, value } = e.target;
    const updatedMenuItems = [...menuItems];
    updatedMenuItems[index] = {
      ...updatedMenuItems[index],
      [name]: value,
    };
    setMenuItems(updatedMenuItems);
  };

  const handleSelectChange = (name: string, value: string, index: number) => {
    console.log("called-4");
    const updatedMenuItems = [...menuItems];
    updatedMenuItems[index] = {
      ...updatedMenuItems[index],
      [name]: value,
    };

    // Handle portion type changes
    if (name === "portionType") {
      if (value === "Half") {
        updatedMenuItems[index].priceForFull = "";
      } else if (value === "Full") {
        updatedMenuItems[index].priceForHalf = "";
      }
    }

    setMenuItems(updatedMenuItems);
  };

  const validateFile = (file: any) => {
    console.log("called-5");
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large", {
        description: "Please upload an image smaller than 2MB.",
      });
      return false;
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Invalid file type", {
        description: "Please upload a JPEG, PNG, or WebP image.",
      });
      return false;
    }

    return true;
  };

  const createImageFile = (file: any) => ({
    id: Math.random().toString(36).substr(2, 9),
    file,
    url: URL.createObjectURL(file), // This URL will be used for displaying the uploaded image
    name: file.name,
  });

  const handleLogoUpload = (files: any) => {
    console.log("called-7");
    if (!files) return;

    const file = files[0];
    if (!file || !validateFile(file)) return;

    if (categoryLogo) {
      URL.revokeObjectURL(categoryLogo.url);
    }
    setCategoryLogo(createImageFile(file));
  };

  const handleFileUpload = (files: any, index: number) => {
    if (!files) return;

    const file = files[0];
    if (!file || !validateFile(file)) return;

    setDishImages((prevImages: any) => {
      const newImages = [...prevImages];
      if (!newImages[index]) {
        newImages[index] = [];
      }
      if (newImages[index].length >= 3) {
        toast.error("Maximum images reached", {
          description: "You can only upload up to 3 images.",
        });
        return prevImages;
      }
      newImages[index] = [
        ...newImages[index],
        {
          id: Math.random().toString(36).substr(2, 9),
          file,
          url: URL.createObjectURL(file),
          name: file.name,
        }, // Use createImageFile to standardize the image object structure
      ];
      return newImages;
    });
  };

  const handleDragOver = (e: any) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: any) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: any, index: number) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files, index);
  };

  const handleDeleteLogo = () => {
    console.log("called-9");
    if (categoryLogo) {
      URL.revokeObjectURL(categoryLogo.url);
      setCategoryLogo(null);
    }
    toast.success("Logo deleted successfully");
  };

  const handleDeleteImage = (id: any, index: number) => {
    console.log(id, index);
    setDishImages((prevImages: any) => {
      const newImages = [...prevImages];

      if (typeof id === "object" && id.id) {
        // Case for object with id
        const imageToDelete = newImages[index].find(
          (img: any) => img.id === id.id
        );
        if (imageToDelete) {
          URL.revokeObjectURL(imageToDelete.url);
        }
        newImages[index] = newImages[index].filter(
          (img: any) => img.id !== id.id
        );
      } else {
        // Case for string URL
        newImages[index] = newImages[index].filter((img: any) => img !== id);
      }

      return newImages;
    });

    toast.success("Dish image deleted successfully");
  };

  return (
    <Card className="w-full max-w-4xl ">
      <CardHeader>
        <CardTitle>Add Appetizer Menu Item</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="categoryName">Category Name</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                validateCategory("categoryName", e.target.value);
              }}
              className={categoryErrors.name ? "border-red-500" : ""}
            />

            {categoryErrors.name && (
              <p className="text-sm text-red-500">{categoryErrors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category Logo</Label>
            <div className="flex items-start space-x-4">
              <Input
                ref={categoryLogoInputRef}
                type="file"
                className="hidden"
                onChange={(e) => {
                  handleLogoUpload(e.target.files);
                  validateCategory("categoryLogo", e.target.files);
                }}
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => categoryLogoInputRef.current?.click()}
              >
                <ImagePlus className="mr-2 h-4 w-4" /> Upload Logo
              </Button>
            </div>
            {categoryErrors.logo && (
              <p className="text-sm text-red-500">{categoryErrors.logo}</p>
            )}
            {categoryLogo && (
              <div className="relative w-20 h-20 mx-auto">
                <Image
                  src={categoryLogo.url}
                  alt="Category Logo"
                  fill
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteLogo()}
                  className="absolute -top-2 -right-2 p-1 bg-black/50 rounded-full"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {menuItems.map((item: any, index: number) => {
            console.log("first", item);
            return (
              <div key={index}>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Name</Label>
                    <Input
                      id={`name-${index}`}
                      name="name"
                      value={item.name}
                      onChange={(e) => handleInputChange(e, index)}
                      className={errors[index]?.name ? "border-red-500" : ""}
                    />
                    {errors[index]?.name && (
                      <p className="text-sm text-red-500">
                        {errors[index].name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`cuisineName-${index}`}>Cuisine Name</Label>
                    <Input
                      id={`cuisineName-${index}`}
                      name="cuisineName"
                      value={item.cuisineName}
                      onChange={(e) => handleInputChange(e, index)}
                      className={
                        errors[index]?.cuisineName ? "border-red-500" : ""
                      }
                    />
                    {errors[index]?.cuisineName && (
                      <p className="text-sm text-red-500">
                        {errors[index].cuisineName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    name="description"
                    value={item.description}
                    onChange={(e) => handleInputChange(e, index)}
                    className={
                      errors[index]?.description ? "border-red-500" : ""
                    }
                  />
                  {errors[index]?.description && (
                    <p className="text-sm text-red-500">
                      {errors[index].description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label>Nature of Food</Label>
                    <Select
                      value={item.natureOfFood}
                      onValueChange={(value) =>
                        handleSelectChange("natureOfFood", value, index)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Veg">Veg</SelectItem>
                        <SelectItem value="Non-Veg">Non-Veg</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Portion Type</Label>
                    <Select
                      value={item.portionType}
                      onValueChange={(value) =>
                        handleSelectChange("portionType", value, index)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Half">Half</SelectItem>
                        <SelectItem value="Full">Full</SelectItem>
                        <SelectItem value="Half/Full">Half/Full</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mt-4">
                  {item.portionType === "Single" && (
                    <div className="space-y-2">
                      <Label htmlFor={`priceForHalf-${index}`}>
                        Price for Single
                      </Label>
                      <Input
                        type="number"
                        id={`priceForSingle-${index}`}
                        name="priceForSingle"
                        value={item.priceForSingle}
                        onChange={(e) => handleInputChange(e, index)}
                        className={
                          errors[index]?.priceForSingle ? "border-red-500" : ""
                        }
                      />
                      {errors[index]?.priceForSingle && (
                        <p className="text-sm text-red-500">
                          {errors[index].priceForSingle}
                        </p>
                      )}
                    </div>
                  )}

                  {item.portionType != "Single" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`priceForHalf-${index}`}>
                          Price for Half
                        </Label>
                        <Input
                          type="number"
                          id={`priceForHalf-${index}`}
                          name="priceForHalf"
                          value={item.priceForHalf}
                          onChange={(e) => handleInputChange(e, index)}
                          disabled={item.portionType === "Full"}
                          className={
                            errors[index]?.priceForHalf ? "border-red-500" : ""
                          }
                        />
                        {errors[index]?.priceForHalf && (
                          <p className="text-sm text-red-500">
                            {errors[index].priceForHalf}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`priceForFull-${index}`}>
                          Price for Full
                        </Label>
                        <Input
                          type="number"
                          id={`priceForFull-${index}`}
                          name="priceForFull"
                          value={item.priceForFull}
                          onChange={(e) => handleInputChange(e, index)}
                          disabled={item.portionType === "Half"}
                          className={
                            errors[index]?.priceForFull ? "border-red-500" : ""
                          }
                        />
                        {errors[index]?.priceForFull && (
                          <p className="text-sm text-red-500">
                            {errors[index].priceForFull}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div className="space-y-2">
                    <Label>Discount Type</Label>
                    <Select
                      value={item.discountType}
                      onValueChange={(value) =>
                        handleSelectChange("discountType", value, index)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select discount type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Percentage">Percentage</SelectItem>
                        <SelectItem value="Fixed Amount">
                          Fixed Amount
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`discountAmount-${index}`}>
                      Discount Amount
                    </Label>
                    <Input
                      type="number"
                      id={`discountAmount-${index}`}
                      name="discountAmount"
                      value={item.discountAmount}
                      onChange={(e) => handleInputChange(e, index)}
                      className={
                        errors[index]?.discountAmount ? "border-red-500" : ""
                      }
                    />
                    {errors[index]?.discountAmount && (
                      <p className="text-sm text-red-500">
                        {errors[index].discountAmount}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <Label>Dish Images</Label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/10"
                        : "border-muted-foreground/20"
                    } ${errors[index]?.images ? "border-red-500" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <input
                      type="file"
                      ref={(el: any) => (fileInputRefs.current[index] = el)}
                      onChange={(e) => handleFileUpload(e.target.files, index)}
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      className="hidden"
                      multiple
                    />
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop your images here or
                        <Button
                          type="button"
                          variant="link"
                          className="px-1"
                          onClick={() => fileInputRefs.current[index]?.click()}
                        >
                          browse files
                        </Button>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Maximum 3 images, 2MB each
                      </p>
                    </div>
                  </div>
                  {errors[index]?.images && (
                    <p className="text-sm text-red-500 mt-2">
                      {errors[index].images}
                    </p>
                  )}

                  {dishImages[index] && dishImages[index].length > 0 && (
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      {dishImages[index].map((image: any, i: number) => {
                        return (
                          <div key={i} className="relative group">
                            <div className="relative w-full h-32">
                              <Image
                                src={
                                  image.url ? image.url : image // Use image.url directly for user-uploaded images
                                }
                                alt={image.url ? image.url : image}
                                fill
                                className="object-cover rounded-lg"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteImage(image, index)}
                              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4 text-white" />
                            </button>
                            <Badge
                              variant="secondary"
                              className="absolute bottom-2 left-2 opacity-75"
                            >
                              Dish Image {dishImages[index].indexOf(image) + 1}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <AlertDialog
            open={isDeleteAlertOpen}
            onOpenChange={setIsDeleteAlertOpen}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the
                  last menu item and all its associated data including images.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    handleDeleteLastItem();
                    setIsDeleteAlertOpen(false);
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <CardFooter className="flex justify-between px-0">
            <div className="flex space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddAnotherItem}
              >
                Add Another Item
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteLastItem}
                disabled={menuItems.length === 1}
                className="text-destructive"
              >
                Delete Last Item
              </Button>
            </div>
            <div>
              <Button
                type="button"
                variant="outline"
                className="mr-4"
                onClick={() => {
                  setMenuItems([
                    {
                      name: "",
                      description: "",
                      cuisineName: "",
                      natureOfFood: "Non-Veg",
                      portionType: "Half",
                      priceForHalf: "",
                      priceForFull: "",
                      discountType: "",
                      discountAmount: "",
                    },
                  ]);
                  setDishImages([]);
                  setErrors({});
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Finish & Save</Button>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
