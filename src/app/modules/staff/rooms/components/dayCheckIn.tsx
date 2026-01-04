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
  ImageIcon,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { fetchCheckInImages } from "@/app/modules/staff/utils/clientside";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const DayCheckIn = ({ data }: { data: any; status: string }) => {
  console.log("DATA", data);
  const [roomData, setRoomData] = useState([]);
  const [images, setImages] = useState<Record<string, string[]>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>(
    {}
  );
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    setRoomData(data);
  }, [data]);

  useEffect(() => {
    const fetchAllImages = async () => {
      if (!roomData || roomData.length === 0) return;

      for (const item of roomData as any[]) {
        const reservationId = item.bookingId || item.id || item.reservationId;
        if (reservationId && !images[reservationId]) {
          setLoadingImages((prev) => ({ ...prev, [reservationId]: true }));

          const imageUrls = await fetchCheckInImages(reservationId);

          setImages((prev) => ({ ...prev, [reservationId]: imageUrls }));
          setLoadingImages((prev) => ({ ...prev, [reservationId]: false }));
        }
      }
    };

    fetchAllImages();
  }, [roomData]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  return (
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
                          <span className="text-xl font-bold">
                            {item.bookingId}
                          </span>
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
                                "en-GB"
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
                                "en-GB"
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

                      {(() => {
                        const reservationId =
                          item.bookingId || item.id || item.reservationId;
                        const reservationImages = images[reservationId] || [];
                        const isLoading = loadingImages[reservationId];

                        if (isLoading || reservationImages.length > 0) {
                          return (
                            <>
                              <Separator className="my-2" />
                              <div className="space-y-3">
                                <h3 className="text-sm font-medium flex items-center gap-2">
                                  <ImageIcon size={16} />
                                  Check-in Images
                                </h3>
                                {isLoading ? (
                                  <div className="text-sm text-muted-foreground">
                                    Loading images...
                                  </div>
                                ) : reservationImages.length > 0 ? (
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {reservationImages.map(
                                      (imageUrl, index) => (
                                        <div
                                          key={index}
                                          onClick={() =>
                                            handleImageClick(imageUrl)
                                          }
                                          className="relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer"
                                        >
                                          <Image
                                            src={imageUrl}
                                            alt={`Check-in image ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 50vw, 33vw"
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : null}
                              </div>
                            </>
                          );
                        }
                        return null;
                      })()}

                      <Button variant="default" className="w-full mt-5 ">
                        Create Check-in
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

      {selectedImage && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-7xl max-h-[90vh] w-full h-full"
          >
            <Image
              src={selectedImage}
              alt="Expanded check-in image"
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DayCheckIn;
