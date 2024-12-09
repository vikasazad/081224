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
import { toast } from "sonner";
import { MdSelfImprovement } from "react-icons/md";

const Wellness = ({ data }: { data: any }) => {
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

      if (!service.duration?.hours && !service.duration?.minutes) {
        newErrors[index].duration = "Duration is required";
        isValid = false;
      }

      if (!service.startTime) {
        newErrors[index].startTime = "Start time is required";
        isValid = false;
      }

      if (!service.endTime) {
        newErrors[index].endTime = "End time is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateForm()) {
      toast.success("Form submitted successfully!");
      // Handle your form submission logic here
    } else {
      toast.error("Please fix the errors in the form");
    }
  };

  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    const details = data[value].map((item: any) => ({
      ...item,
      duration: {
        hours: Math.floor(parseInt(item.duration) / 60),
        minutes: parseInt(item.duration) % 60,
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
            <MdSelfImprovement className="h-6 w-6 text-primary" />
            <CardTitle>Wellness</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service">Select Wellness Service</Label>
            <Select value={selectedService} onValueChange={handleServiceChange}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Choose a service category" />
              </SelectTrigger>
              <SelectContent>
                {selectedServiceList.map((ser, i) => (
                  <SelectItem value={ser} key={i}>
                    {ser}
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
                        updateServiceDetail(index, "price", e.target.value)
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
                  <Input
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
                  <Label>Duration</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="number"
                        placeholder="Hours"
                        value={service.duration?.hours || ""}
                        onChange={(e) =>
                          updateServiceDetail(index, "duration", {
                            ...service.duration,
                            hours: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="24"
                        className={
                          errors[index]?.duration ? "border-red-500" : ""
                        }
                      />
                    </div>
                    <div>
                      <Input
                        type="number"
                        placeholder="Minutes"
                        value={service.duration?.minutes || ""}
                        onChange={(e) =>
                          updateServiceDetail(index, "duration", {
                            ...service.duration,
                            minutes: parseInt(e.target.value) || 0,
                          })
                        }
                        min="0"
                        max="59"
                        className={
                          errors[index]?.duration ? "border-red-500" : ""
                        }
                      />
                    </div>
                  </div>
                  {errors[index]?.duration && (
                    <p className="text-red-500 text-sm">
                      {errors[index].duration}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Available Time Slot</Label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={service.startTime}
                        onChange={(e) =>
                          updateServiceDetail(
                            index,
                            "startTime",
                            e.target.value
                          )
                        }
                        className={
                          errors[index]?.startTime ? "border-red-500" : ""
                        }
                      />
                      {errors[index]?.startTime && (
                        <p className="text-red-500 text-sm">
                          {errors[index].startTime}
                        </p>
                      )}
                    </div>
                    <span className="text-muted-foreground">to</span>
                    <div className="flex-1">
                      <Input
                        type="time"
                        value={service.endTime}
                        onChange={(e) =>
                          updateServiceDetail(index, "endTime", e.target.value)
                        }
                        className={
                          errors[index]?.endTime ? "border-red-500" : ""
                        }
                      />
                      {errors[index]?.endTime && (
                        <p className="text-red-500 text-sm">
                          {errors[index].endTime}
                        </p>
                      )}
                    </div>
                  </div>
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

export default Wellness;
