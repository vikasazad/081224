import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MdAdd, MdLightbulb } from "react-icons/md";
import { ShoppingBag } from "lucide-react";

const sampleTour = {
  typeName: "Local Culinary Experience Tour",
  description: "Guided tour of local cuisine and wine tasting",
  price: 85,
  duration: {
    hours: 3,
    minutes: 0,
  },
  bookingPolicy:
    "Cancellations made within 24 hours of the scheduled service will incur a 50% cancellation fee. No-shows will be charged the full price",
  benefits:
    "Taste local specialties, wine pairing, culinary history and culture insights",
  timeline: "Tuesday, Thursday, and Saturday",
  startTime: "18:00",
  endTime: "21:00",
};

const PersonalShopping = ({ data }: { data: any }) => {
  const [selectedService, setSelectedService] = useState("");
  const [selectedServiceList, setSelectedServiceList] = useState<string[]>([]);
  const [tours, setTours] = useState<any[]>([]);
  const [errors, setErrors] = useState<{
    [key: string]: { [key: string]: string };
  }>({});

  useEffect(() => {
    setSelectedServiceList(Object.keys(data));
    console.log("first", JSON.stringify(data));
  }, [data]);
  const validateForm = () => {
    const newErrors: { [key: string]: { [key: string]: string } } = {};
    let isValid = true;

    tours.forEach((tour, index) => {
      newErrors[index] = {};

      if (!tour.typeName?.trim()) {
        newErrors[index].typeName = "Tour name is required";
        isValid = false;
      }

      if (!tour.description?.trim()) {
        newErrors[index].description = "Description is required";
        isValid = false;
      }

      if (!tour.price || tour.price <= 0) {
        newErrors[index].price = "Valid price is required";
        isValid = false;
      }

      if (!tour.bookingPolicy?.trim()) {
        newErrors[index].bookingPolicy = "Booking policy is required";
        isValid = false;
      }

      if (!tour.benefits?.trim()) {
        newErrors[index].benefits = "Benefits are required";
        isValid = false;
      }

      if (!tour.timeline?.trim()) {
        newErrors[index].timeline = "Timeline is required";
        isValid = false;
      }

      if (!tour.duration?.hours && !tour.duration?.minutes) {
        newErrors[index].duration = "Duration is required";
        isValid = false;
      }

      if (!tour.startTime) {
        newErrors[index].startTime = "Start time is required";
        isValid = false;
      }

      if (!tour.endTime) {
        newErrors[index].endTime = "End time is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateForm()) {
      toast.success("Tours saved successfully!");
      console.log("Submitted tours:", tours);
    } else {
      toast.error("Please fix the errors in the form");
    }
  };
  const handleServiceChange = (value: string) => {
    setSelectedService(value);
    const details = data[value].map((item: any) => ({
      typeName: item.typeName,
      description: item.description,
      price: parseFloat(item.pricingPerPerson) || 0,
      duration: {
        hours: parseInt(item.duration)
          ? parseInt(item.duration.split(" ")[0])
          : 0,
        minutes: 0,
      },
      bookingPolicy: item.bookingAndCancellationPolicy,
      benefits: item.keyBenefits,
      timeline: item.timeline,
      startTime: item.timeline
        ? item.timeline.split("at ")[1]?.trim() || ""
        : "",
      endTime: "", // You might want to calculate this based on duration
    }));
    setTours(details); // Set the tours state with the formatted data
    setErrors({});
  };

  const addNewTour = () => {
    setTours([
      ...tours,
      {
        typeName: "",
        description: "",
        price: "",
        duration: { hours: "", minutes: "" },
        bookingPolicy: "",
        benefits: "",
        timeline: "",
        startTime: "",
        endTime: "",
      },
    ]);
  };

  const updateTour = (index: number, field: string, value: any) => {
    const updatedTours = [...tours];
    updatedTours[index] = {
      ...updatedTours[index],
      [field]: value,
    };
    setTours(updatedTours);
  };

  const loadSampleData = () => {
    setTours([{ ...sampleTour }]);
    setErrors({});
    toast.success("Sample data loaded!");
  };

  return (
    <div className="p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-6 w-6 text-primary" />
              <CardTitle>Personal Shopping</CardTitle>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <MdLightbulb className="h-5 w-5" />
                    View Sample
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Sample Tour Data</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg text-sm">
                      {JSON.stringify(sampleTour, null, 2)}
                    </pre>
                    <Button onClick={loadSampleData}>Load Sample Data</Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Button onClick={addNewTour} className="gap-2">
                <MdAdd className="h-5 w-5" />
                Add Tour
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="service">Select Personal Shopping Service</Label>
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
          {tours.map((tour, index) => (
            <div
              key={index}
              className="space-y-6 p-6 border rounded-lg bg-white"
            >
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor={`name-${index}`}>Tour Name</Label>
                  <Input
                    id={`name-${index}`}
                    value={tour.typeName}
                    onChange={(e) =>
                      updateTour(index, "typeName", e.target.value)
                    }
                    className={errors[index]?.typeName ? "border-red-500" : ""}
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
                    value={tour.price}
                    onChange={(e) => updateTour(index, "price", e.target.value)}
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
                  value={tour.description}
                  onChange={(e) =>
                    updateTour(index, "description", e.target.value)
                  }
                  className={errors[index]?.description ? "border-red-500" : ""}
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
                      value={tour.duration?.hours}
                      onChange={(e) =>
                        updateTour(index, "duration", {
                          ...tour.duration,
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
                      value={tour.duration?.minutes}
                      onChange={(e) =>
                        updateTour(index, "duration", {
                          ...tour.duration,
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
                <Label htmlFor={`timeline-${index}`}>Timeline</Label>
                <Input
                  id={`timeline-${index}`}
                  value={tour.timeline}
                  onChange={(e) =>
                    updateTour(index, "timeline", e.target.value)
                  }
                  className={errors[index]?.timeline ? "border-red-500" : ""}
                  placeholder="e.g., Tuesday, Thursday, and Saturday"
                />
                {errors[index]?.timeline && (
                  <p className="text-red-500 text-sm">
                    {errors[index].timeline}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Available Time Slot</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      type="time"
                      value={tour.startTime}
                      onChange={(e) =>
                        updateTour(index, "startTime", e.target.value)
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
                      value={tour.endTime}
                      onChange={(e) =>
                        updateTour(index, "endTime", e.target.value)
                      }
                      className={errors[index]?.endTime ? "border-red-500" : ""}
                    />
                    {errors[index]?.endTime && (
                      <p className="text-red-500 text-sm">
                        {errors[index].endTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`benefits-${index}`}>Key Benefits</Label>
                <Textarea
                  id={`benefits-${index}`}
                  value={tour.benefits}
                  onChange={(e) =>
                    updateTour(index, "benefits", e.target.value)
                  }
                  className={errors[index]?.benefits ? "border-red-500" : ""}
                />
                {errors[index]?.benefits && (
                  <p className="text-red-500 text-sm">
                    {errors[index].benefits}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor={`policy-${index}`}>
                  Booking & Cancellation Policy
                </Label>
                <Textarea
                  id={`policy-${index}`}
                  value={tour.bookingPolicy}
                  onChange={(e) =>
                    updateTour(index, "bookingPolicy", e.target.value)
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

              {tours.length > 1 && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    const updatedTours = tours.filter((_, i) => i !== index);
                    setTours(updatedTours);
                    const updatedErrors = { ...errors };
                    delete updatedErrors[index];
                    setErrors(updatedErrors);
                  }}
                >
                  Remove Tour
                </Button>
              )}
            </div>
          ))}

          {tours.length > 0 && (
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setTours([]);
                  setErrors({});
                }}
              >
                Clear All
              </Button>
              <Button
                onClick={handleNext}
                className="bg-primary hover:bg-primary/90"
              >
                Save Tours
                <span className="ml-2">→</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalShopping;
