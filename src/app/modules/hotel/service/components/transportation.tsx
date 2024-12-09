import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CarTaxiFront } from "lucide-react";

const Transportation = ({ data }: { data: any }) => {
  const [selectedService, setSelectedService] = useState("");
  const [selectedServiceList, setSelectedServiceList] = useState<string[]>([]);
  const [selectedDetails, setSelectedDetails] = useState<any[]>([]);
  const [errors, setErrors] = useState<{
    [key: string]: { [key: string]: string };
  }>({});

  useEffect(() => {
    setSelectedServiceList(Object.keys(data));
  }, [data]);

  const validateForm = () => {
    const newErrors: { [key: string]: { [key: string]: string } } = {};
    let isValid = true;

    selectedDetails.forEach((service, index) => {
      newErrors[index] = {};

      if (!service.typeName?.trim()) {
        newErrors[index].typeName = "Service name is required";
        isValid = false;
      }

      if (!service.price || service.price <= 0) {
        newErrors[index].price = "Valid price is required";
        isValid = false;
      }

      if (!service.description?.trim()) {
        newErrors[index].description = "Description is required";
        isValid = false;
      }

      if (!service.bookingPolicy?.trim()) {
        newErrors[index].bookingPolicy = "Booking policy is required";
        isValid = false;
      }

      if (selectedService === "Airport Shuttle") {
        if (!service.airportList || service.airportList.length === 0) {
          newErrors[index].airportList =
            "At least one airport must be selected";
          isValid = false;
        }
      }

      if (!service.duration?.trim()) {
        newErrors[index].duration = "Duration is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateForm()) {
      toast.success("Form submitted successfully!");
      console.log("Form data:", selectedDetails);
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    setSelectedDetails(data[value]);
    setErrors({});
  };

  const updateServiceDetail = (index: number, field: string, value: any) => {
    const updatedDetails = [...selectedDetails];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value,
    };
    setSelectedDetails(updatedDetails);
  };

  return (
    <div className="p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CarTaxiFront className="h-6 w-6 text-primary" />
            <CardTitle>Transportation</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service">Select Transportation Service</Label>
            <Select value={selectedService} onValueChange={handleServiceChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose a service category" />
              </SelectTrigger>
              <SelectContent>
                {selectedServiceList.map((service) => (
                  <SelectItem key={service} value={service}>
                    {service}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedService &&
            selectedDetails.map((service, index) => (
              <div
                key={index}
                className="space-y-6 p-6 border rounded-lg bg-white"
              >
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Name of Service</Label>
                    <Input
                      id={`name-${index}`}
                      value={service.typeName}
                      onChange={(e) =>
                        updateServiceDetail(index, "typeName", e.target.value)
                      }
                      className={
                        errors[index]?.typeName ? "border-red-500" : ""
                      }
                    />
                    {errors[index]?.typeName && (
                      <p className="text-red-500 text-sm">
                        {errors[index].typeName}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`price-${index}`}>Price ($)</Label>
                    <Input
                      id={`price-${index}`}
                      type="number"
                      value={service.price}
                      onChange={(e) =>
                        updateServiceDetail(
                          index,
                          "price",
                          Number(e.target.value)
                        )
                      }
                      className={errors[index]?.price ? "border-red-500" : ""}
                    />
                    {errors[index]?.price && (
                      <p className="text-red-500 text-sm">
                        {errors[index].price}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${index}`}>Description</Label>
                  <Textarea
                    id={`description-${index}`}
                    value={service.description}
                    onChange={(e) =>
                      updateServiceDetail(index, "description", e.target.value)
                    }
                    className={
                      errors[index]?.description ? "border-red-500" : ""
                    }
                  />
                  {errors[index]?.description && (
                    <p className="text-red-500 text-sm">
                      {errors[index].description}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`bookingPolicy-${index}`}>
                    Booking Policy
                  </Label>
                  <Textarea
                    id={`bookingPolicy-${index}`}
                    value={service.bookingPolicy}
                    onChange={(e) =>
                      updateServiceDetail(
                        index,
                        "bookingPolicy",
                        e.target.value
                      )
                    }
                    className={
                      errors[index]?.bookingPolicy ? "border-red-500" : ""
                    }
                  />
                  {errors[index]?.bookingPolicy && (
                    <p className="text-red-500 text-sm">
                      {errors[index].bookingPolicy}
                    </p>
                  )}
                </div>

                {selectedService === "Airport Shuttle" && (
                  <div className="space-y-2">
                    <Label htmlFor={`airports-${index}`}>Airport List</Label>
                    <Input
                      id={`airports-${index}`}
                      value={service.airportList?.join(", ") || ""}
                      placeholder="Enter airport codes separated by commas"
                      onChange={(e) =>
                        updateServiceDetail(
                          index,
                          "airportList",
                          e.target.value.split(",").map((item) => item.trim())
                        )
                      }
                      className={
                        errors[index]?.airportList ? "border-red-500" : ""
                      }
                    />
                    {errors[index]?.airportList && (
                      <p className="text-red-500 text-sm">
                        {errors[index].airportList}
                      </p>
                    )}
                  </div>
                )}

                {selectedService === "Bicycle Rental" && (
                  <div className="space-y-2">
                    <Label htmlFor={`includedItems-${index}`}>
                      Included Items
                    </Label>
                    <Input
                      id={`includedItems-${index}`}
                      value={service.includedItems}
                      onChange={(e) =>
                        updateServiceDetail(
                          index,
                          "includedItems",
                          e.target.value
                        )
                      }
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor={`duration-${index}`}>Duration</Label>
                  <Input
                    id={`duration-${index}`}
                    value={service.duration}
                    onChange={(e) =>
                      updateServiceDetail(index, "duration", e.target.value)
                    }
                    className={errors[index]?.duration ? "border-red-500" : ""}
                  />
                  {errors[index]?.duration && (
                    <p className="text-red-500 text-sm">
                      {errors[index].duration}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </CardContent>

        {selectedService && (
          <div className="flex justify-between p-6 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedService("");
                setSelectedDetails([]);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleNext}>
              Next
              <span className="ml-2">→</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transportation;
