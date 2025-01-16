import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BedDouble } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { getAvailableRooms, saveRoomUpgrades } from "../../utils/hotelDataApi";

interface Room {
  id: string;
  name: string;
  currentPrice: number;
}

const RoomUpgrades = ({ data, flag }: any) => {
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [upgradePrices, setUpgradePrices] = useState<{ [key: string]: number }>(
    {}
  );
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});
  useEffect(() => {
    getAvailableRooms().then((room: any) => {
      const _availableRooms: any = Object.values(room).map(
        (el: any, id: number) => {
          return {
            id: id,
            name: el[0].roomType,
            currentPrice: el[0].price,
          };
        }
      );

      // Populate upgradePrices and selectedRooms with data from props if names match
      const initialUpgradePrices: { [key: string]: number } = {};
      const initialSelectedRooms: string[] = [];

      if (data?.roomupgrades?.availableOptions) {
        data.roomupgrades.availableOptions.forEach((option: any) => {
          const match = _availableRooms.find(
            (room: any) => room.name === option.name
          );
          if (match) {
            initialUpgradePrices[option.name] = option.updatedPrice;
            initialSelectedRooms.push(option.name); // Add matching room name to selectedRooms
          }
        });
      }

      setAvailableRooms(_availableRooms);
      setUpgradePrices(initialUpgradePrices);
      setSelectedRooms(initialSelectedRooms); // Preselect checkboxes for matching rooms
    });
  }, [data]);

  const handleRoomSelection = (roomName: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomName)
        ? prev.filter((name) => name !== roomName)
        : [...prev, roomName]
    );
  };

  const handlePriceChange = (roomName: string, price: string) => {
    setUpgradePrices((prev) => ({
      ...prev,
      [roomName]: parseFloat(price) || 0,
    }));
  };

  const handleSubmit = () => {
    const newErrors: { [key: string]: boolean } = {};
    const upgrades = selectedRooms.map((roomName) => {
      const room = availableRooms.find((r) => r.name === roomName);
      const price = upgradePrices[roomName];

      if (!price || price <= 0) {
        newErrors[roomName] = true;
      }

      return {
        name: room?.name || "",
        currentPrice: room?.currentPrice || 0,
        updatedPrice: price || 0,
      };
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({
        title: "Validation Error",
        description:
          "Please provide a valid upgrade price for all selected rooms.",
        variant: "destructive",
      });
      return;
    }

    setErrors({}); // Clear errors if validation passes
    console.log("Room upgrades:", upgrades);
    saveRoomUpgrades(upgrades);
    flag(false);
    toast({
      title: "Upgrades Saved",
      description: `Successfully saved upgrades for ${upgrades.length} rooms.`,
    });
  };

  return (
    <div>
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <BedDouble className="h-6 w-6 text-primary" />
            <CardTitle>Room upgrades</CardTitle>
          </div>
        </CardHeader>
        {availableRooms.length > 0 ? (
          <>
            <CardContent className="space-y-4">
              {availableRooms.map((room, id: number) => (
                <div key={id}>
                  <div className="flex items-center space-x-4">
                    <Checkbox
                      id={`room-${room.name}`}
                      checked={selectedRooms.includes(room.name)}
                      onCheckedChange={() => handleRoomSelection(room.name)}
                    />
                    <Label htmlFor={`room-${room.name}`} className="flex-grow">
                      {room.name} (Current price: ₹{room.currentPrice}/night)
                    </Label>
                    <Input
                      type="number"
                      placeholder="Upgrade price"
                      className={`w-40 ${
                        errors[room.name] ? "border-red-500" : ""
                      }`}
                      value={upgradePrices[room.name] || ""}
                      onChange={(e) =>
                        handlePriceChange(room.name, e.target.value)
                      }
                      disabled={!selectedRooms.includes(room.name)}
                    />
                  </div>
                  {errors[room.name] && (
                    <p className="text-sm text-red-500">
                      Upgrade price required
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => flag(false)}
                variant="outline"
                className="mr-4"
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} variant="default">
                Save Upgrades
              </Button>
            </CardFooter>
          </>
        ) : (
          <div className="mx-4 py-2"> No rooms are available.</div>
        )}
      </Card>
    </div>
  );
};

export default RoomUpgrades;
