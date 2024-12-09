import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Info } from "lucide-react";

interface NotificationPopupProps {
  onProceedAnyway: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  onProceedAnyway,
}) => {
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
          <p>
            To provide you with valuable information of your business in
            real-time, we need your permission to send notifications. Please
            enable notifications by clicking on the
            <Info className="h-4 w-4 inline-block mx-2" />
            icon on the top of browser.
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={onProceedAnyway}>
            Proceed Anyway
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificationPopup;
