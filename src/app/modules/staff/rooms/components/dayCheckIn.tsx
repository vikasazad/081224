"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import StatusChip from "@/components/ui/StatusChip";
import {
  Calendar,
  Clock,
  Coffee,
  Users,
  Wifi,
  // ImageIcon,
  // X,
  // Upload,
  // Camera,
  // Image as ImageLucide,
  // Trash2,
  // Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
// import { fetchCheckInImages } from "@/app/modules/staff/utils/clientside";
// import Image from "next/image";
import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { storage } from "@/config/db/firebase";
// import {
//   ref,
//   uploadBytes,
//   getDownloadURL,
//   deleteObject,
// } from "firebase/storage";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { authPhoneOtp, resendOtp, verifyOtp } from "@/lib/auth/handleOtp";
// import { toast } from "sonner";
import { setCheckInData } from "@/lib/features/checkInSlice";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";

const DayCheckIn = ({ data }: { data: any; status: string }) => {
  console.log("DATA", data);
  const [roomData, setRoomData] = useState([]);
  const dispatch = useDispatch();
  const router = useRouter();
  useEffect(() => {
    setRoomData(data);
  }, [data]);

  return (
    <>
      <div className="space-y-4">
        {roomData.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.values(roomData).map((item: any, main) => (
              <Card key={main}>
                <CardContent className="px-4 py-0">
                  <Accordion type="single" collapsible>
                    <AccordionItem value="item-1">
                      <AccordionTrigger>
                        <div className="flex justify-between items-center w-full">
                          <div className="flex flex-col items-start">
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold">
                                {item.bookingId}
                              </span>
                              <Badge variant="outline">
                                {item.roomCategory}
                              </Badge>
                            </div>
                            <div className="flex">
                              <span className="text-sm text-muted-foreground">
                                Guest: {item.name}
                              </span>
                              <Badge
                                variant="secondary"
                                className="flex items-center gap-1"
                              >
                                <Users size={14} />
                                {item.numberOfGuests} Guests
                              </Badge>
                            </div>
                          </div>
                          <StatusChip status={item?.status || "available"} />
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock size={16} />
                              Check In
                            </div>
                            <div>
                              <p className="font-medium">
                                {new Date(item.checkIn).toLocaleDateString(
                                  "en-GB",
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock size={16} />
                              Check Out
                            </div>
                            <div>
                              <p className="font-medium">
                                {new Date(item.checkOut).toLocaleDateString(
                                  "en-GB",
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <Separator className="my-2" />
                        {item?.specialRequirements && (
                          <>
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium">
                                Special Requirement
                              </h3>
                              <Badge variant="outline">
                                {item?.specialRequirements}
                              </Badge>
                            </div>

                            <Separator className="my-2" />
                          </>
                        )}

                        {/* inclusions has to an array to make it and array and make this section dynamix */}

                        <div className="space-y-3">
                          <h3 className="text-sm font-medium">Inclusions</h3>
                          <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar size={16} />
                              <span>Taxes</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Wifi size={16} />
                              <span>WiFi</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Coffee size={16} />
                              <span>Breakfast</span>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="default"
                          className="w-full mt-5"
                          onClick={() => {
                            dispatch(setCheckInData(item));
                            router.push("/checkin/" + item.bookingId);
                          }}
                        >
                          Complete Check-in
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <span className="text-gray-500 text-sm">No room data found</span>
          </div>
        )}
      </div>
    </>
  );
};

export default DayCheckIn;
