import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BadgeCheck,
  Bell,
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
  BatteryCharging,
  Save,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { FaElevator } from "react-icons/fa6";
import { GiVacuumCleaner } from "react-icons/gi";
import { TbFireExtinguisher } from "react-icons/tb";
import { GrStepsOption } from "react-icons/gr";
import { GiPowerGenerator } from "react-icons/gi";

const SixSeat = ({ data }: { data: any }) => {
  console.log(data);
  const [selectedAmenities, setSelectedAmenities] = useState<any[]>([]);
  const [errors, setErrors] = useState<any>({});
  const [tableNumbers, setTableNumbers] = useState<string[]>([]);
  const [newRoomNumber, setNewRoomNumber] = useState("");
  const [roomNumberError, setRoomNumberError] = useState("");
  const [formData, setFormData] = useState({
    tableNumber: "",
    reservationPrice: "",
    minReservation: "",
    maxReservation: "",
    location: "indoor",
    isAccessible: false,
    weekdayReservation: {
      start: "09:00",
      end: "17:00",
    },
    weekendReservation: {
      start: "10:00",
      end: "18:00",
    },
  });

  useEffect(() => {
    setFormData({
      tableNumber: "",
      reservationPrice: data[0].minimum_reservation_time,
      minReservation: data[0].maximum_reservation_time,
      maxReservation: data[0].reservation_price,
      location: data[0].location,
      isAccessible: data[0].accessibility,
      weekdayReservation: {
        start: data[0].reservation_timings.weekday[0],
        end: data[0].reservation_timings.weekday[0],
      },
      weekendReservation: {
        start: data[0].reservation_timings.weekend[0],
        end: data[0].reservation_timings.weekend[0],
      },
    });
    setInitialAmenities(data[0].amenities);
  }, [data]);

  const setInitialAmenities = (amenities: string[]) => {
    console.log("here");
    const availableAmenities = [
      { id: 1, name: "wifi", icon: <Wifi className="h-4 w-4" /> },
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
      {
        id: 11,
        name: "24/7 check-in",
        icon: <BadgeCheck className="h-4 w-4" />,
      },
      { id: 12, name: "Fire extinguisher", icon: <TbFireExtinguisher /> },
      { id: 13, name: "Step free access", icon: <GrStepsOption /> },
      {
        id: 14,
        name: "Attached bathroom",
        icon: <ShowerHead className="h-4 w-4" />,
      },
      { id: 15, name: "Security", icon: <ShieldCheck className="h-4 w-4" /> },
      { id: 16, name: "Power backup", icon: <GiPowerGenerator /> },
      { id: 17, name: "charger", icon: <BatteryCharging /> },
      {
        id: 18,
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
    const arr: typeof availableAmenities = []; // Declare arr with the same type as availableAmenities

    amenities.forEach((itm: string) => {
      // Use forEach for iterating
      availableAmenities.forEach((item) => {
        // Iterate over availableAmenities
        if (itm === item.name) {
          arr.push(item); // Push the matching item into arr
        }
      });
    });

    setSelectedAmenities(arr);
  };

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
    {
      id: 11,
      name: "24/7 check-in",
      icon: <BadgeCheck className="h-4 w-4" />,
    },
    { id: 12, name: "Fire extinguisher", icon: <TbFireExtinguisher /> },
    { id: 13, name: "Step free access", icon: <GrStepsOption /> },
    {
      id: 14,
      name: "Attached bathroom",
      icon: <ShowerHead className="h-4 w-4" />,
    },
    { id: 15, name: "Security", icon: <ShieldCheck className="h-4 w-4" /> },
    { id: 16, name: "Power backup", icon: <GiPowerGenerator /> },
    { id: 17, name: "Power backup", icon: <BatteryCharging /> },
    {
      id: 18,
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

    // Price validation
    if (!formData.reservationPrice) {
      newErrors.reservationPrice = "Reservation price is required";
    } else if (Number(formData.reservationPrice) <= 0) {
      newErrors.reservationPrice = "Price must be greater than 0";
    }

    // Reservation time validation
    if (!formData.minReservation) {
      newErrors.minReservation = "Minimum reservation time is required";
    } else if (Number(formData.minReservation) < 30) {
      newErrors.minReservation =
        "Minimum reservation must be at least 30 minutes";
    }

    if (!formData.maxReservation) {
      newErrors.maxReservation = "Maximum reservation time is required";
    } else if (
      Number(formData.maxReservation) <= Number(formData.minReservation)
    ) {
      newErrors.maxReservation =
        "Maximum time must be greater than minimum time";
    }

    // Table numbers validation
    if (tableNumbers.length === 0) {
      newErrors.tableNumbers = "At least one table number is required";
    }

    // Amenities validation
    if (selectedAmenities.length === 0) {
      newErrors.amenities = "At least one amenity is required";
    }

    // Reservation timing validation
    const validateTimeRange = (start: string, end: string) => {
      const startTime = new Date(`2000-01-01T${start}`);
      const endTime = new Date(`2000-01-01T${end}`);
      return endTime > startTime;
    };

    if (
      !validateTimeRange(
        formData.weekdayReservation.start,
        formData.weekdayReservation.end
      )
    ) {
      newErrors.weekdayReservation = "End time must be after start time";
    }

    if (
      !validateTimeRange(
        formData.weekendReservation.start,
        formData.weekendReservation.end
      )
    ) {
      newErrors.weekendReservation = "End time must be after start time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Form submitted:", {
        ...formData,
        tableNumbers,
        amenities: selectedAmenities,
      });
      toast.success("Table information saved successfully!");
    } else {
      toast.error("Please fix the errors before submitting");
    }
  };

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
  const handleDeleteAmenity = (amenityId: any) => {
    setSelectedAmenities(
      selectedAmenities.filter((amenity) => amenity.id !== amenityId)
    );
    const amenity: any = availableAmenities.find((a) => a.id === amenityId);
    toast.success("Amenity Removed", {
      description: `${amenity.name} has been removed from amenities.`,
    });
  };

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

    if (tableNumbers.includes(roomNum)) {
      setRoomNumberError("Room number already exists");
      toast.error("Room number already exists");
      return;
    }

    setTableNumbers([...tableNumbers, roomNum]);
    setNewRoomNumber("");
    toast.success("Room Added", {
      description: `Room ${roomNum} has been added successfully.`,
    });
  };

  const handleDeleteRoom = (roomToDelete: any) => {
    setTableNumbers(tableNumbers.filter((room) => room !== roomToDelete));
    toast.success("Room Removed", {
      description: `Room ${roomToDelete} has been removed.`,
    });
  };

  const handleTimeChange = (
    period: "weekday" | "weekend",
    type: "start" | "end",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [`${period}Reservation`]: {
        ...prev[`${period}Reservation`],
        [type]: value,
      },
    }));
    // Clear related error when user changes time
    if (errors[`${period}Reservation`]) {
      setErrors((prev: any) => ({
        ...prev,
        [`${period}Reservation`]: undefined,
      }));
    }
  };
  return (
    <div className="px-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Reservation Price</label>
          <Input
            type="number"
            placeholder="25"
            name="reservationPrice"
            value={formData.reservationPrice}
            onChange={handleInputChange}
            className={`w-full ${
              errors.reservationPrice ? "border-red-500" : ""
            }`}
          />
          {errors.reservationPrice && (
            <span className="text-sm text-red-500">
              {errors.reservationPrice}
            </span>
          )}
        </div>
      </div>
      {/* Reservation Times */}
      <div className="grid grid-cols-2 gap-4 py-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Min. Reservation (minutes)
          </label>
          <Input
            type="number"
            placeholder="30"
            name="minReservation"
            value={formData.minReservation}
            onChange={handleInputChange}
            className={`w-full ${
              errors.minReservation ? "border-red-500" : ""
            }`}
          />
          {errors.minReservation && (
            <span className="text-sm text-red-500">
              {errors.minReservation}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Max. Reservation (minutes)
          </label>
          <Input
            type="number"
            placeholder="120"
            name="maxReservation"
            value={formData.maxReservation}
            onChange={handleInputChange}
            className={`w-full ${
              errors.maxReservation ? "border-red-500" : ""
            }`}
          />
          {errors.maxReservation && (
            <span className="text-sm text-red-500">
              {errors.maxReservation}
            </span>
          )}
        </div>
      </div>
      {/* Location & Accessibility */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg py-4">
        <div className="flex gap-4">
          <Button
            variant={formData.location === "indoor" ? "outline" : "ghost"}
            className={formData.location === "indoor" ? "bg-white" : ""}
            onClick={() =>
              setFormData((prev) => ({ ...prev, location: "indoor" }))
            }
          >
            Indoor
          </Button>
          <Button
            variant={formData.location === "outdoor" ? "outline" : "ghost"}
            className={formData.location === "outdoor" ? "bg-white" : ""}
            onClick={() =>
              setFormData((prev) => ({ ...prev, location: "outdoor" }))
            }
          >
            Outdoor
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Accessibility</span>
          <Switch
            checked={formData.isAccessible}
            onCheckedChange={(checked) =>
              setFormData((prev) => ({ ...prev, isAccessible: checked }))
            }
          />
        </div>
      </div>
      {/* Room Numbers Section */}
      <div className="space-y-2 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Label>Table Numbers</Label>
            {errors.tableNumbers && (
              <p className="text-sm text-red-500 mt-1">{errors.tableNumbers}</p>
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
                    placeholder="Enter room number"
                    value={newRoomNumber}
                    onChange={(e) => {
                      setNewRoomNumber(e.target.value);
                      setRoomNumberError("");
                    }}
                    className={roomNumberError ? "border-red-500" : ""}
                  />
                  {roomNumberError && (
                    <p className="text-sm text-red-500">{roomNumberError}</p>
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
          {tableNumbers.map((room) => (
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
      {/* Updated Reservation Timings Section */}
      <div className="space-y-4 py-4">
        <h3 className="font-medium">Reservation Timings</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <label className="text-sm font-medium">Weekday Hours</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Start Time</label>
                <Input
                  type="time"
                  value={formData.weekdayReservation.start}
                  onChange={(e) =>
                    handleTimeChange("weekday", "start", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600">End Time</label>
                <Input
                  type="time"
                  value={formData.weekdayReservation.end}
                  onChange={(e) =>
                    handleTimeChange("weekday", "end", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>
            {errors.weekdayReservation && (
              <p className="text-sm text-red-500">
                {errors.weekdayReservation}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <label className="text-sm font-medium">Weekend Hours</label>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-sm text-gray-600">Start Time</label>
                <Input
                  type="time"
                  value={formData.weekendReservation.start}
                  onChange={(e) =>
                    handleTimeChange("weekend", "start", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm text-gray-600">End Time</label>
                <Input
                  type="time"
                  value={formData.weekendReservation.end}
                  onChange={(e) =>
                    handleTimeChange("weekend", "end", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>
            {errors.weekendReservation && (
              <p className="text-sm text-red-500">
                {errors.weekendReservation}
              </p>
            )}
          </div>
        </div>
      </div>
      {/* Amenities Section */}
      <div className="space-y-2 py-4">
        <div className="flex justify-between items-center">
          <div>
            <Label>Available Amenities</Label>
            {errors.amenities && (
              <p className="text-sm text-red-500 mt-1">{errors.amenities}</p>
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
          {selectedAmenities.map((amenity, i) => (
            <Badge
              key={i}
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
      <div className="flex justify-end space-x-4 mt-6 py-4">
        <Button variant="outline">Cancel</Button>
        <Button onClick={handleSubmit} className="bg-primary">
          <Save className="h-4 w-4 mr-2" /> Save Table Information
        </Button>
      </div>
    </div>
  );
};

export default SixSeat;
