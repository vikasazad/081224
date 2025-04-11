"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus } from "lucide-react";

interface QuickReplyTemplatesProps {
  onSelect: (template: string) => void;
}

export function QuickReplyTemplates({ onSelect }: QuickReplyTemplatesProps) {
  const [newTemplate, setNewTemplate] = useState({ title: "", content: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // This would be fetched from Firestore in a real app
  const templates = [
    {
      id: "1",
      title: "Thank you for your feedback",
      content:
        "Thank you for your feedback! We appreciate you taking the time to share your experience with us.",
    },
    {
      id: "2",
      title: "Reservation confirmation",
      content:
        "Yes, we'd be happy to accommodate your reservation. Please let us know the date, time, and number of guests, and we'll confirm availability.",
    },
    {
      id: "3",
      title: "Apology for inconvenience",
      content:
        "We're very sorry to hear about your experience. We strive to provide excellent service, and we clearly fell short. Please accept our sincere apologies. We'd like to make this right - could you please provide more details so we can address this properly?",
    },
    {
      id: "4",
      title: "Lost and found",
      content:
        "We've located your item in our lost and found. You can pick it up at the front desk anytime between 8am and 10pm. Please bring ID for verification.",
    },
  ];

  const handleSaveTemplate = () => {
    // In a real app, this would save to Firestore
    console.log("Saving template:", newTemplate);
    setNewTemplate({ title: "", content: "" });
    setIsDialogOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-between">
            <span>Quick Replies</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[300px]">
          {templates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => onSelect(template.content)}
            >
              {template.title}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Quick Reply Template</DialogTitle>
            <DialogDescription>
              Create a new template for frequently used responses
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Template Name</Label>
              <Input
                id="title"
                value={newTemplate.title}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, title: e.target.value })
                }
                placeholder="e.g., Thank you response"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Template Content</Label>
              <Textarea
                id="content"
                value={newTemplate.content}
                onChange={(e) =>
                  setNewTemplate({ ...newTemplate, content: e.target.value })
                }
                placeholder="Type your template message here..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>Save Template</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
