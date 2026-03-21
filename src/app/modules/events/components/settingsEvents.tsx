"use client";

import React, { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
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
import { Icons } from "@/components/icons";
import {
  Plus,
  Pencil,
  Trash2,
  Building2,
  TreePine,
  IndianRupee,
  Ruler,
} from "lucide-react";
import {
    saveEventSettings,

} from "../utils/eventsApi";
import { EventSettings, SettingsVenue } from "../utils/eventTypes";

type Venue = SettingsVenue;


const eventTypes = [
    { id: "wedding", name: "Wedding" },
  { id: "corporate", name: "Corporate Event" },
  { id: "birthday", name: "Birthday Party" },
  { id: "anniversary", name: "Anniversary" },
  { id: "conference", name: "Conference" },
  { id: "engagement", name: "Engagement" },
  { id: "sangeet", name: "Sangeet" },
  { id: "reception", name: "Reception" },
  { id: "other", name: "Other" },
];

const foodNatureOptions = [
  { id: "veg", name: "Vegetarian" },
  { id: "nonveg", name: "Non-Vegetarian" },
  { id: "mixed", name: "Mixed (Veg & Non-Veg)" },
];

  const SettingsEvents = ({ settings }: { settings: EventSettings }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [enabledEventTypes, setEnabledEventTypes] = useState<string[]>(settings.enabledEventTypes || eventTypes.map((t) => t.id));
  const [enabledFoodOptions, setEnabledFoodOptions] = useState<string[]>(settings.enabledFoodOptions || foodNatureOptions.map((f) => f.id));
  const [venues, setVenues] = useState<Venue[]>(settings.venues as Venue[] || []);
  const [venueDialogOpen, setVenueDialogOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [venueForm, setVenueForm] = useState<Omit<Venue, "id">>({
    name: "",
    type: "indoor",
    area: "",
    price: 0,
  });

  // Toggle event type
  const toggleEventType = (id: string) => {
    setEnabledEventTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // Toggle food option
  const toggleFoodOption = (id: string) => {
    setEnabledFoodOptions((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  // Open venue dialog for new venue
  const openNewVenueDialog = () => {
    setEditingVenue(null);
    setVenueForm({ name: "", type: "indoor", area: "", price: 0 });
    setVenueDialogOpen(true);
  };

  // Open venue dialog for editing
  const openEditVenueDialog = (venue: Venue) => {
    setEditingVenue(venue);
    setVenueForm({
      name: venue.name,
      type: venue.type,
      area: venue.area,
      price: venue.price,
    });
    setVenueDialogOpen(true);
  };

  // Save venue (add or update)
  const saveVenue = () => {
    if (!venueForm.name.trim()) {
      toast.error("Please enter venue name");
      return;
    }
    if (!venueForm.area.trim()) {
      toast.error("Please enter venue area");
      return;
    }
    if (venueForm.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    if (editingVenue) {
      // Update existing
      setVenues((prev) =>
        prev.map((v) =>
          v.id === editingVenue.id ? { ...venueForm, id: editingVenue.id } : v
        )
      );
      toast.success("Venue updated");
    } else {
      // Add new
      const newVenue: Venue = {
        ...venueForm,
        id: `venue-${Date.now()}`,
      };
      setVenues((prev) => [...prev, newVenue]);
      toast.success("Venue added");
    }

    setVenueDialogOpen(false);
    setEditingVenue(null);
    setVenueForm({ name: "", type: "indoor", area: "", price: 0 });
  };

  // Delete venue
  const deleteVenue = (id: string) => {
    setVenues((prev) => prev.filter((v) => v.id !== id));
    toast.success("Venue removed");
  };

  // Save all settings
  const handleSave = async () => {
    setIsLoading(true);
    if (enabledEventTypes.length === 0) {
      toast.error("Please enable at least one event type");
      setIsLoading(false);
      return;
    }
    if (enabledFoodOptions.length === 0) {
      toast.error("Please enable at least one food option");
      setIsLoading(false);
      return;
    }

    setIsSaving(true);
    try {
      const settings: EventSettings = {
        enabledEventTypes,
        enabledFoodOptions,
        venues,
      };

      const success = await saveEventSettings(settings);
      if (success) {
        toast.success("Settings saved successfully");
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("An error occurred while saving");
    } finally {
      setIsSaving(false);
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Icons.spinner className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="pb-6 px-8 ">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Event Settings</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure the types of events, food options, and venues you offer
        </p>
      </div>

      <div className="space-y-5">
        {/* Event Types Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Event Types</h2>
            <p className="text-sm text-gray-500">
              Select the types of events you host
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {eventTypes.map((type) => (
              <div
                key={type.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  enabledEventTypes.includes(type.id)
                    ? "bg-gray-50 border-gray-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <span className="text-sm font-medium text-gray-700">
                  {type.name}
                </span>
                <Switch
                  checked={enabledEventTypes.includes(type.id)}
                  onCheckedChange={() => toggleEventType(type.id)}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">
              {enabledEventTypes.length} of {eventTypes.length} enabled
            </span>
          </div>
        </section>

        {/* Food Options Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Food Options</h2>
            <p className="text-sm text-gray-500">
              Select the food types you can cater
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {foodNatureOptions.map((option) => (
              <div
                key={option.id}
                className={`flex items-center justify-between gap-4 p-3 rounded-lg border transition-colors ${
                  enabledFoodOptions.includes(option.id)
                    ? "bg-gray-50 border-gray-300"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      option.id === "veg"
                        ? "bg-green-500"
                        : option.id === "nonveg"
                        ? "bg-red-500"
                        : "bg-orange-500"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {option.name}
                  </span>
                </div>
                <Switch
                  checked={enabledFoodOptions.includes(option.id)}
                  onCheckedChange={() => toggleFoodOption(option.id)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Venues Section */}
        <section className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Venues</h2>
              <p className="text-sm text-gray-500">
                Manage your event venues
              </p>
            </div>
            <Dialog open={venueDialogOpen} onOpenChange={setVenueDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openNewVenueDialog}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Venue
                </Button>
              </DialogTrigger>
              <DialogDescription></DialogDescription>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingVenue ? "Edit Venue" : "Add New Venue"}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Venue Name</Label>
                    <Input
                      placeholder="e.g., Grand Ballroom"
                      value={venueForm.name}
                      onChange={(e) =>
                        setVenueForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={venueForm.type}
                      onValueChange={(value: "indoor" | "outdoor") =>
                        setVenueForm((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indoor">Indoor</SelectItem>
                        <SelectItem value="outdoor">Outdoor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Area</Label>
                    <Input
                      placeholder="e.g., 5000 sq ft"
                      value={venueForm.area}
                      onChange={(e) =>
                        setVenueForm((prev) => ({ ...prev, area: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                        <IndianRupee className="h-4 w-4" />
                      </span>
                      <Input
                        type="number"
                        placeholder="Enter price"
                        className="pl-8"
                        value={venueForm.price || ""}
                        onChange={(e) =>
                          setVenueForm((prev) => ({
                            ...prev,
                            price: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setVenueDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={saveVenue}>
                      {editingVenue ? "Update" : "Add"} Venue
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {venues.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg">
              <Building2 className="h-10 w-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No venues added yet</p>
              <p className="text-xs text-gray-400">
                Click &quot;Add Venue&quot; to get started
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        venue.type === "indoor"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-green-50 text-green-600"
                      }`}
                    >
                      {venue.type === "indoor" ? (
                        <Building2 className="h-5 w-5" />
                      ) : (
                        <TreePine className="h-5 w-5" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{venue.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {venue.type === "indoor" ? "Indoor" : "Outdoor"}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Ruler className="h-3 w-3" />
                          {venue.area}
                        </span>
                        <span className="text-xs font-medium text-gray-700 flex items-center gap-0.5">
                          <IndianRupee className="h-3 w-3" />
                          {venue.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditVenueDialog(venue)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-4 w-4 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteVenue(venue.id)}
                      className="h-8 w-8 p-0 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="px-8"
          >
            {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsEvents;
