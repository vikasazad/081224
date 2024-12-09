import React, { useState } from "react";
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
import { Printer } from "lucide-react";
const Business = ({ data }: { data: any }) => {
  const [selectedService, setSelectedService] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("");
  console.log(data);
  return (
    <div>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Printer className="h-6 w-6 text-primary" />
            <CardTitle>Business</CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="service">Select Wellness Service</Label>
            <Select
              value={selectedService}
              onValueChange={(value) => {
                setSelectedService(value);
                setSelectedFacility(""); // Reset facility when service changes
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relaxationLounges">
                  Relaxation Lounges
                </SelectItem>
                <SelectItem value="massage">Massage Therapy</SelectItem>
                <SelectItem value="meditation">Meditation Sessions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedService && (
            <div className="space-y-1.5">
              <Label htmlFor="facility">Select Facility</Label>
              <Select
                value={selectedFacility}
                onValueChange={setSelectedFacility}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a facility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Stress Reduction Workshop</SelectItem>
                  <SelectItem value="1">Mindfulness Center</SelectItem>
                  <SelectItem value="2">Yoga Studio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedService && selectedFacility && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Name of Service</Label>
                  <Input id="name" defaultValue="Stress Reduction Workshop" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" type="number" defaultValue="75" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  defaultValue="Group workshop teaching various stress management techniques"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Available Time Slot</Label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input type="time" defaultValue="14:00" />
                  </div>
                  <span className="text-muted-foreground">to</span>
                  <div className="flex-1">
                    <Input type="time" defaultValue="17:00" />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>

        {selectedService && selectedFacility && (
          <div className="flex justify-between pt-4">
            <div className="flex gap-2">
              <Button variant="outline">Cancel</Button>
              {/* <Button variant="outline">Add More</Button> */}
            </div>
            <Button>
              Next
              <span className="ml-2">→</span>
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Business;
