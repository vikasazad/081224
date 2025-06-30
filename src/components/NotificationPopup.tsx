import React from "react";
import { Info } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface NotificationPopupProps {
  warning?: string | null;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ warning }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-[450px]">
        <CardHeader>
          <CardTitle>Enable Notifications</CardTitle>
          <CardDescription>
            Stay updated with real-time information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {warning && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded text-sm font-semibold">
              {warning}
            </div>
          )}
          <p>
            To provide you with valuable information of your business in
            real-time, we need your permission to send notifications. Please
            enable notifications by clicking on the
            <Info className="h-4 w-4 inline-block mx-2" />
            icon on the top of browser.
          </p>
        </CardContent>
        {/* No CardFooter or button */}
      </Card>
    </div>
  );
};

export default NotificationPopup;
