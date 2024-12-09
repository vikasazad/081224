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
import { MdOutlineDryCleaning } from "react-icons/md";

const Laundry = ({ data }: { data: any }) => {
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

      // New validation for minTime using hours and minutes
      if (!service.minTime?.hours && !service.minTime?.minutes) {
        newErrors[index].minTime = "Minimum time is required";
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
    // Transform the minTime string into hours and minutes object
    const details = data[value].map((item: any) => ({
      ...item,
      minTime: {
        hours: 0,
        minutes: 0,
      },
    }));
    setSelectedDetails(details);
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
            <MdOutlineDryCleaning className="h-6 w-6 text-primary" />
            <CardTitle>Laundry</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service">Select Laundry Service</Label>
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
                  <Label>Minimum Time Required</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        placeholder="Hours"
                        value={service.minTime?.hours || ""}
                        onChange={(e) =>
                          updateServiceDetail(index, "minTime", {
                            ...service.minTime,
                            hours: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="24"
                        className={
                          errors[index]?.minTime ? "border-red-500" : ""
                        }
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Minutes"
                        value={service.minTime?.minutes || ""}
                        onChange={(e) =>
                          updateServiceDetail(index, "minTime", {
                            ...service.minTime,
                            minutes: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="59"
                        className={
                          errors[index]?.minTime ? "border-red-500" : ""
                        }
                      />
                    </div>
                  </div>
                  {errors[index]?.minTime && (
                    <p className="text-red-500 text-sm">
                      {errors[index].minTime}
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
            <Button
              onClick={handleNext}
              className="bg-primary hover:bg-primary/90"
            >
              Next
              <span className="ml-2">→</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Laundry;
