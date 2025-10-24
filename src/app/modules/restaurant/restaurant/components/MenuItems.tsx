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
import { ImagePlus, X, ArrowLeft } from "lucide-react";
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
import {
  saveMenuData,
  createNewMenuCategory,
} from "../../utils/restaurantDataApi";
import { uploadImageToFirebase } from "@/app/modules/hotel/hotel/utils/hotelApi";
import { Icons } from "@/components/icons";

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

interface MenuItemsProps {
  data: any;
  isCreatingNew?: boolean;
  onBack?: () => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({
  data,
  isCreatingNew = false,
  onBack,
}) => {
  // console.log("9389389", data);
  const [isLoading, setIsLoading] = useState(false);
  const [menuItems, setMenuItems] = useState<any>([]);
  console.log("9389389", menuItems);
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
    setCategoryName(data?.name || "");
    setCategoryLogo({ url: data?.categoryLogo });
    const menuArr: any = [];
    const imgArr: any = [];
    data?.menuItems.map((data: any) => {
      let price = {};
      if (data?.portion === "Single") {
        price = { Single: data?.price?.Single || "" };
      } else if (data?.portion === "Half") {
        price = { Half: data?.price?.Half || "" };
      } else if (data?.portion === "Full") {
        price = { Full: data?.price?.Full || "" };
      } else if (data?.portion === "Half/Full") {
        price = {
          Half: data?.price?.Half || "",
          Full: data?.price?.Full || "",
        };
      }
      menuArr.push({
        available: data?.available || true,
        categoryName: data?.categoryName || "",
        cuisineName: data?.cuisineName || "",
        description: data?.description || "",
        discountType: data?.discountType || "",
        discountAmount: data?.discountAmount || "",
        id: data?.id || "",
        name: data?.name || "",
        nature: data?.nature || "",
        portion: data?.portion || "",
        position: data?.position || "",
        price: price,
        tags: data?.tags || [],
      });
      imgArr.push(data?.images || []);
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
      if (item.portion === "Single") {
        if (!item.price?.Single) {
          itemErrors.price.Single = "Price for single portion is required";
        }
      }
      if (item.portion === "Half" || item.portion === "Half/Full") {
        if (!item.price?.Half) {
          itemErrors.price.Half = "Price for half portion is required";
        }
      }

      if (item.portion === "Full" || item.portion === "Half/Full") {
        if (!item.price?.Full) {
          itemErrors.price.Full = "Price for full portion is required";
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
        categoryName: "",
        name: "",
        description: "",
        cuisineName: "",
        nature: "",
        portion: "Half",
        position: "",
        id: "",
        price: { Half: "" },
        tags: [],
        discountType: "",
        discountAmount: "",
        available: true,
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
      const lastIndex = menuItems.length - 1;
      const newMenuItems = menuItems.slice(0, -1);
      const newDishImages = dishImages.slice(0, -1);
      const newErrors = errors.slice(0, -1);

      // Clean up the last item's image URLs
      if (dishImages[dishImages.length - 1]) {
        dishImages[dishImages.length - 1].forEach((image: any) => {
          URL.revokeObjectURL(image.url);
        });
      }

      // Reset the file input for the deleted item
      if (fileInputRefs.current[lastIndex]) {
        fileInputRefs.current[lastIndex].value = "";
      }

      setMenuItems(newMenuItems);
      setDishImages(newDishImages);
      setErrors(newErrors);
      setCurrentItemIndex(Math.max(0, currentItemIndex - 1));

      toast.success("Last item deleted successfully");
    }
  };

  // Handle form submission
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    if (
      validateCategory("categoryName", categoryName) &&
      validateCategory("categoryLogo", categoryLogo) &&
      validateForm()
    ) {
      // Create final data structure with items and their images
      const finalData = menuItems.map((item: any, index: number) => ({
        ...item,
        id: index + 1,
        images: dishImages[index],
      }));

      let res;
      if (isCreatingNew) {
        console.log("finalData", finalData);
        const uploadedImages = await Promise.all(
          finalData.map(async (item: any) => {
            if (!item.images || item.images.length === 0) return [];

            const urls = await Promise.all(
              item.images.map(async (img: any) => {
                const path = `menu/${categoryName}/${img.id}`;
                const downloadURL = await uploadImageToFirebase(img.file, path);
                return downloadURL;
              })
            );

            return urls; // This will be an array of URLs for this item
          })
        );

        const logo = await uploadImageToFirebase(
          categoryLogo.file,
          `menu/${categoryName}/${categoryLogo.id}`
        );

        // console.log("uploadedImages", uploadedImages);
        if (uploadedImages.length > 0) {
          finalData.categoryLogo = logo;
          for (let i = 0; i < finalData.length; i++) {
            finalData[i].images = uploadedImages[i];
          }
        }

        // Create new category
        console.log("called-2", categoryName, finalData);
        res = await createNewMenuCategory(categoryName, logo, finalData);
        console.log("res", res);
        if (res) {
          toast.success("New category created successfully!");
          // Go back to categories view after successful creation
          setTimeout(() => {
            onBack?.();
          }, 1500);
          setIsLoading(false);
        } else {
          toast.error("Failed to create new category");
          setIsLoading(false);
        }
      } else {
        // Update existing category
        res = await saveMenuData(finalData, categoryName);
        if (res) {
          toast.success("Menu items updated successfully!");
          setIsLoading(false);
        } else {
          toast.error("Failed to update menu items");
          setIsLoading(false);
        }
      }

      // console.log("res", res);
    } else {
      toast.error("Please fill in all required fields", {
        description: "Some menu items have missing or invalid information.",
      });
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: any, index: number) => {
    // console.log("called-3");
    const { name, value } = e.target;
    console.log(name, value);
    const updatedMenuItems = [...menuItems];

    // Handle price fields specially
    if (name === "Half" || name === "Full" || name === "Single") {
      updatedMenuItems[index] = {
        ...updatedMenuItems[index],
        price: {
          ...updatedMenuItems[index].price,
          [name]: value,
        },
      };
    } else {
      // Handle regular fields
      updatedMenuItems[index] = {
        ...updatedMenuItems[index],
        [name]: value,
      };
    }

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
    if (name === "portion") {
      if (value === "Half/Full") {
        updatedMenuItems[index].price = { Half: "", Full: "" };
      } else {
        updatedMenuItems[index].price = { [value]: "" };
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

    const fileArray = Array.from(files);
    const validFiles: any[] = [];

    // Validate each file
    for (const file of fileArray) {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    }

    if (validFiles.length === 0) return;

    const currentImageCount = dishImages[index]?.length || 0;
    const remainingSlots = 3 - currentImageCount;

    if (remainingSlots <= 0) {
      toast.error("Maximum images reached", {
        description: "You can only upload up to 3 images.",
      });
      return;
    }

    // Take only the files that fit within the remaining slots
    const filesToAdd = validFiles.slice(0, remainingSlots);

    if (filesToAdd.length < validFiles.length) {
      toast.warning("Some files not uploaded", {
        description: `Only ${filesToAdd.length} files uploaded. Maximum 3 images allowed.`,
      });
    }

    setDishImages((prevImages: any) => {
      const newImages = [...prevImages];
      if (!newImages[index]) {
        newImages[index] = [];
      }

      const newImageObjects = filesToAdd.map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));

      newImages[index] = [...newImages[index], ...newImageObjects];
      return newImages;
    });

    if (filesToAdd.length > 0) {
      toast.success(`${filesToAdd.length} image(s) uploaded successfully`);
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

  const handleDrop = (e: any, index: number) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileUpload(files, index);
    }
  };

  const handleDeleteLogo = () => {
    // console.log("called-9");
    if (categoryLogo) {
      URL.revokeObjectURL(categoryLogo.url);
      setCategoryLogo(null);
    }
    // Reset the file input to allow re-uploading the same file
    if (categoryLogoInputRef.current) {
      categoryLogoInputRef.current.value = "";
    }
    toast.success("Logo deleted successfully");
  };

  const handleDeleteImage = (id: any, index: number) => {
    // console.log(id, index);
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

    // Reset the file input to allow re-uploading the same file
    if (fileInputRefs.current[index]) {
      fileInputRefs.current[index].value = "";
    }

    toast.success("Dish image deleted successfully");
  };

  return (
    <Card className="w-full max-w-4xl ">
      <CardHeader>
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <CardTitle>
            {isCreatingNew ? "Create New Menu Category" : "Edit Menu Category"}
          </CardTitle>
        </div>
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
            <div className="flex   space-x-4">
              <div className="flex items-start  space-x-4">
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

              {categoryLogo && categoryLogo.url && (
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
            {categoryErrors.logo && (
              <p className="text-sm text-red-500">{categoryErrors.logo}</p>
            )}
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          {menuItems.map((item: any, index: number) => {
            // console.log("first", item);
            return (
              <div key={index}>
                <Separator className="my-4" />
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Name</Label>
                    <Input
                      id={`name-${index}`}
                      name="name"
                      value={item?.name}
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
                      value={item.nature}
                      onValueChange={(value) =>
                        handleSelectChange("nature", value, index)
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
                      value={item.portion}
                      onValueChange={(value) =>
                        handleSelectChange("portion", value, index)
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
                  {item.portion === "Single" && (
                    <div className="space-y-2">
                      <Label htmlFor={`priceForHalf-${index}`}>
                        Price for Single
                      </Label>
                      <Input
                        type="number"
                        id={`Single-${index}`}
                        name="Single"
                        value={item.price.Single}
                        onChange={(e) => handleInputChange(e, index)}
                        className={
                          errors[index]?.price?.Single ? "border-red-500" : ""
                        }
                      />
                      {errors[index]?.price?.Single && (
                        <p className="text-sm text-red-500">
                          {errors[index].price?.Single}
                        </p>
                      )}
                    </div>
                  )}

                  {item.portion !== "Single" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`priceForHalf-${index}`}>
                          Price for Half
                        </Label>
                        <Input
                          type="number"
                          id={`Half-${index}`}
                          name="Half"
                          value={item.price?.Half}
                          onChange={(e) => handleInputChange(e, index)}
                          disabled={item.portion === "Full"}
                          className={
                            errors[index]?.price?.Half ? "border-red-500" : ""
                          }
                        />
                        {errors[index]?.price?.Half && (
                          <p className="text-sm text-red-500">
                            {errors[index].price?.Half}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`priceForFull-${index}`}>
                          Price for Full
                        </Label>
                        <Input
                          type="number"
                          id={`Full-${index}`}
                          name="Full"
                          value={item.price?.Full}
                          onChange={(e) => handleInputChange(e, index)}
                          disabled={item.portion === "Half"}
                          className={
                            errors[index]?.price?.Full ? "border-red-500" : ""
                          }
                        />
                        {errors[index]?.price?.Full && (
                          <p className="text-sm text-red-500">
                            {errors[index].price?.Full}
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
                        const imageSrc = image.url || image;
                        // Only render if we have a valid image source
                        if (!imageSrc || imageSrc === "") return null;

                        return (
                          <div key={i} className="relative group">
                            <div className="relative w-full h-32">
                              <Image
                                src={imageSrc}
                                alt={`Dish image ${i + 1}`}
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
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="mr-4"
                onClick={() => {
                  if (onBack) {
                    onBack();
                  }
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-1"
              >
                {isLoading && <Icons.spinner className="w-4 h-4 mr-2" />}
                {isCreatingNew ? "Create Category" : "Update Category"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
};

export default MenuItems;
