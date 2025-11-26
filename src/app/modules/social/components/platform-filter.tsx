"use client";

import { Button } from "@/components/ui/button";
import { Facebook, Instagram, Twitter, Youtube, Globe } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

interface PlatformFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function PlatformFilter({ value, onValueChange }: PlatformFilterProps) {
  const platforms = [
    { id: "all", name: "All Platforms", icon: Globe },
    { id: "instagram", name: "Instagram", icon: Instagram },
    { id: "facebook", name: "Facebook", icon: Facebook },
    { id: "twitter", name: "Twitter", icon: Twitter },
    { id: "youtube", name: "YouTube", icon: Youtube },
    { id: "googlemaps", name: "Google Maps", icon: FcGoogle },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {platforms.map((platform) => (
        <Button
          key={platform.id}
          variant={value === platform.id ? "default" : "outline"}
          size="sm"
          onClick={() => onValueChange(platform.id)}
          className="flex items-center gap-2"
        >
          <platform.icon className="h-4 w-4" />
          <span className="hidden sm:inline">{platform.name}</span>
        </Button>
      ))}
    </div>
  );
}
