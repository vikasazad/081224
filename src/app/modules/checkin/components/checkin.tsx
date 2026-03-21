"use client";
import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

import StatusChip from "@/components/ui/StatusChip";
import {
  Calendar,
  Clock,
  Coffee,
  Users,
  Wifi,
  X,
  Upload,
  Camera,
  Image as ImageLucide,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { convertToWebP } from "@/app/modules/hotel/hotel/utils/hotelApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { storage } from "@/config/db/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { authPhoneOtp, resendOtp, verifyOtp } from "@/lib/auth/handleOtp";
import { toast } from "sonner";
import { RootState } from "@/lib/store";
import { useSelector } from "react-redux";
import { getCheckInData } from "@/lib/features/checkInSlice";
import router from "next/router";
import { reservationToBooking } from "../../staff/utils/staffData";

// ID proof types with their required sides
const ID_PROOF_TYPES = {
  aadhar: { label: "Aadhar Card", sides: 2 },
  voter: { label: "Voter ID", sides: 2 },
  passport: { label: "Passport", sides: 2 },
  driver: { label: "Driver's Licence", sides: 1 },
  other: { label: "Other", sides: 2 },
};

interface GuestIdProof {
  guestId: string;
  guestName: string;
  idProofType: string;
  images: {
    front: string | null;
    back: string | null;
  };
  files: {
    front: File | null;
    back: File | null;
  };
  uploading: {
    front: boolean;
    back: boolean;
  };
}

interface CheckinProps {
  bookingId: string;
}

const Checkin = ({ bookingId }: CheckinProps) => {
  const bookingData = useSelector((state: RootState) =>
    getCheckInData(state, bookingId),
  );
  console.log(bookingData);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ID Proof Upload States
  const [guestIdProofs, setGuestIdProofs] = useState<GuestIdProof[]>([]);
  const [showUploadOptions, setShowUploadOptions] = useState<{
    guestId: string;
    side: "front" | "back";
  } | null>(null);
  // OTP Verification States
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [guestPhone, setGuestPhone] = useState<string>("");
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verificationId, setVerificationId] = useState("");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);

  // Helper function to check if a URL is a blob URL (local preview)
  const isBlobUrl = (url: string | null): boolean => {
    return url !== null && url.startsWith("blob:");
  };

  // Helper function to check if all guests have pre-existing ID proof images
  const hasAllPreExistingIdProofs = (guests: any[]): boolean => {
    return guests.every((guest: any) => {
      // Check if guest has at least front image (back is optional for some ID types)
      return guest?.frontIdUrl !== null && guest?.frontIdUrl !== undefined;
    });
  };

  // Initialize guest ID proofs when bookingData loads
  useEffect(() => {
    // Check if bookingData exists and has guests array
    if (
      !bookingData ||
      !bookingData.guests ||
      bookingData.guests.length === 0
    ) {
      return;
    }

    const initialProofs = bookingData.guests.map((guest: any) => {
      const hasExistingtype = guest?.frontIdUrl ? "other" : "";

      return {
        guestId: guest.id,
        guestName: guest.name,
        idProofType: hasExistingtype || "",
        images: {
          front: guest?.frontIdUrl || null,
          back: guest?.backIdUrl || null,
        },
        files: {
          front: null,
          back: null,
        },
        uploading: {
          front: false,
          back: false,
        },
      };
    });

    setGuestIdProofs(initialProofs);
    setGuestPhone(bookingData.phone || "");

    // If all guests already have pre-existing ID proofs, open OTP dialog directly
    if (hasAllPreExistingIdProofs(bookingData.guests)) {
      setShowOtpDialog(true);
      setOtpSent(false);
      setOtp("");
      setIsEditingPhone(false);
      setTimer(30);
      setCanResend(false);
    }
  }, [bookingData]);

  // Timer logic for OTP resend
  useEffect(() => {
    let interval: any;
    if (otpSent && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, timer]);

  // Cleanup blob URLs on unmount (only revoke blob URLs, not Firebase URLs)
  useEffect(() => {
    return () => {
      guestIdProofs.forEach((guest) => {
        if (guest.images.front && isBlobUrl(guest.images.front)) {
          URL.revokeObjectURL(guest.images.front);
        }
        if (guest.images.back && isBlobUrl(guest.images.back)) {
          URL.revokeObjectURL(guest.images.back);
        }
      });
    };
  }, [guestIdProofs]);

  const handleImageClick = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleIdProofTypeChange = (guestId: string, idProofType: string) => {
    setGuestIdProofs((prev) => {
      const updatedProofs = [...prev];
      const guestIndex = updatedProofs.findIndex((g) => g.guestId === guestId);
      if (guestIndex !== -1) {
        // Revoke existing blob URLs only (not Firebase URLs)
        if (
          updatedProofs[guestIndex].images.front &&
          isBlobUrl(updatedProofs[guestIndex].images.front)
        ) {
          URL.revokeObjectURL(updatedProofs[guestIndex].images.front!);
        }
        if (
          updatedProofs[guestIndex].images.back &&
          isBlobUrl(updatedProofs[guestIndex].images.back)
        ) {
          URL.revokeObjectURL(updatedProofs[guestIndex].images.back!);
        }
        updatedProofs[guestIndex] = {
          ...updatedProofs[guestIndex],
          idProofType,
          images: { front: null, back: null },
          files: { front: null, back: null },
        };
      }
      return updatedProofs;
    });
  };

  const handleImageUpload = async (
    guestId: string,
    side: "front" | "back",
    file: File,
  ) => {
    try {
      // Set uploading state
      setGuestIdProofs((prev) => {
        const updatedProofs = [...prev];
        const guestIndex = updatedProofs.findIndex(
          (g) => g.guestId === guestId,
        );
        if (guestIndex !== -1) {
          updatedProofs[guestIndex] = {
            ...updatedProofs[guestIndex],
            uploading: {
              ...updatedProofs[guestIndex].uploading,
              [side]: true,
            },
          };
        }
        return updatedProofs;
      });

      // Convert to WebP format in background
      const webpFile = await convertToWebP(file);

      // Create blob URL for preview
      const blobUrl = URL.createObjectURL(webpFile);

      // Update state with webp file and blob URL for preview
      setGuestIdProofs((prev) => {
        const updatedProofs = [...prev];
        const guestIndex = updatedProofs.findIndex(
          (g) => g.guestId === guestId,
        );
        if (guestIndex !== -1) {
          // Revoke old blob URL if exists (only blob URLs, not Firebase URLs)
          if (
            updatedProofs[guestIndex].images[side] &&
            isBlobUrl(updatedProofs[guestIndex].images[side])
          ) {
            URL.revokeObjectURL(updatedProofs[guestIndex].images[side]!);
          }

          updatedProofs[guestIndex] = {
            ...updatedProofs[guestIndex],
            images: {
              ...updatedProofs[guestIndex].images,
              [side]: blobUrl,
            },
            files: {
              ...updatedProofs[guestIndex].files,
              [side]: webpFile,
            },
            uploading: {
              ...updatedProofs[guestIndex].uploading,
              [side]: false,
            },
          };
        }
        return updatedProofs;
      });

      toast.success("Image converted successfully");
    } catch (error) {
      console.error("Error converting image:", error);
      toast.error("Failed to convert image. Please try again.");

      // Reset uploading state on error
      setGuestIdProofs((prev) => {
        const updatedProofs = [...prev];
        const guestIndex = updatedProofs.findIndex(
          (g) => g.guestId === guestId,
        );
        if (guestIndex !== -1) {
          updatedProofs[guestIndex] = {
            ...updatedProofs[guestIndex],
            uploading: {
              ...updatedProofs[guestIndex].uploading,
              [side]: false,
            },
          };
        }
        return updatedProofs;
      });
    }
  };

  const handleDeleteImage = async (guestId: string, side: "front" | "back") => {
    try {
      const guest = guestIdProofs.find((g) => g.guestId === guestId);
      const imageUrl = guest?.images[side];

      // Revoke blob URL only (not Firebase URLs)
      if (imageUrl && isBlobUrl(imageUrl)) {
        URL.revokeObjectURL(imageUrl);
      }

      // Update state
      setGuestIdProofs((prev) => {
        const updatedProofs = [...prev];
        const guestIndex = updatedProofs.findIndex(
          (g) => g.guestId === guestId,
        );
        if (guestIndex !== -1) {
          updatedProofs[guestIndex] = {
            ...updatedProofs[guestIndex],
            images: {
              ...updatedProofs[guestIndex].images,
              [side]: null,
            },
            files: {
              ...updatedProofs[guestIndex].files,
              [side]: null,
            },
          };
        }
        return updatedProofs;
      });

      toast.success("Image removed successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image. Please try again.");
    }
  };

  const handleFileInputChange = (
    guestId: string,
    side: "front" | "back",
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageUpload(guestId, side, file);
    }
    setShowUploadOptions(null);
  };

  const isAllGuestsComplete = (): boolean => {
    return guestIdProofs.every((guest) => {
      if (!guest.idProofType) return false;
      const requiredSides =
        ID_PROOF_TYPES[guest.idProofType as keyof typeof ID_PROOF_TYPES]
          ?.sides || 2;
      if (requiredSides === 1) {
        return guest.images.front !== null;
      }
      return guest.images.front !== null && guest.images.back !== null;
    });
  };

  // OTP Handler Functions
  const handleSendOtp = async () => {
    setIsOtpLoading(true);
    try {
      const formattedNumber = `+91${guestPhone}`;
      const phoneOtpRes: any = await authPhoneOtp(formattedNumber);
      setVerificationId(phoneOtpRes.verificationId);
      setOtpSent(true);
      setTimer(30);
      setCanResend(false);
      setIsOtpLoading(false);
    } catch (error) {
      setIsOtpLoading(false);
      toast.error("Failed to send OTP");
      console.error("Error sending OTP:", error);
    }
  };

  const handleResendOtp = async () => {
    setIsOtpLoading(true);
    try {
      const formattedNumber = `+91${guestPhone}`;
      const phoneOtpRes: any = await resendOtp(formattedNumber);
      setVerificationId(phoneOtpRes.verificationId);
      setTimer(30);
      setCanResend(false);
      setIsOtpLoading(false);
      toast.success("OTP resent successfully");
    } catch (error) {
      setIsOtpLoading(false);
      toast.error("Failed to resend OTP");
      console.error("Error resending OTP:", error);
    }
  };

  const handleVerifyOtp = async () => {
    setIsOtpLoading(true);
    try {
      const phoneVerified = await verifyOtp(verificationId, otp);
      if (!phoneVerified) {
        toast.error("Invalid OTP");
        setIsOtpLoading(false);
        return;
      }

      toast.success("Verification successful! Uploading images...");

      // Upload all WebP images to Firebase Storage (or use existing URLs)
      const uploadedIdProofs = await Promise.all(
        guestIdProofs.map(async (guest) => {
          const uploadedImages: {
            front: string | null;
            back: string | null;
          } = {
            front: null,
            back: null,
          };

          // Handle front image - upload if file exists, otherwise use existing URL
          if (guest.files.front) {
            const fileName = `${guest.idProofType}_front_${Date.now()}.webp`;
            const storageRef = ref(
              storage,
              `checkIn/${bookingId.replaceAll("%3A", ":")}/${
                guest.guestId
              }/${fileName}`,
            );
            await uploadBytes(storageRef, guest.files.front);
            uploadedImages.front = await getDownloadURL(storageRef);
          } else if (guest.images.front && !isBlobUrl(guest.images.front)) {
            // Use pre-existing Firebase URL
            uploadedImages.front = guest.images.front;
          }

          // Handle back image - upload if file exists, otherwise use existing URL
          if (guest.files.back) {
            const fileName = `${guest.idProofType}_back_${Date.now()}.webp`;
            const storageRef = ref(
              storage,
              `checkIn/${bookingId.replaceAll("%3A", ":")}/${
                guest.guestId
              }/${fileName}`,
            );
            await uploadBytes(storageRef, guest.files.back);
            uploadedImages.back = await getDownloadURL(storageRef);
          } else if (guest.images.back && !isBlobUrl(guest.images.back)) {
            // Use pre-existing Firebase URL
            uploadedImages.back = guest.images.back;
          }

          // Revoke blob URLs only (not Firebase URLs)
          if (guest.images.front && isBlobUrl(guest.images.front)) {
            URL.revokeObjectURL(guest.images.front);
          }
          if (guest.images.back && isBlobUrl(guest.images.back)) {
            URL.revokeObjectURL(guest.images.back);
          }

          // Return in format {id, name, frontIdUrl, backIdUrl}
          return {
            id: guest.guestId,
            name: guest.guestName,
            frontIdUrl: uploadedImages.front,
            backIdUrl: uploadedImages.back,
          };
        }),
      );

      // Prepare final check-in data
      const checkInData = {
        bookingId: bookingData.bookingId,
        bookingData,
        phone: guestPhone,
        guests: uploadedIdProofs,
        verifiedAt: new Date().toISOString(),
      };

      // Console log the complete data
      console.log("Check-in completed:", checkInData);

      // Convert reservation to booking
      const result = await reservationToBooking(checkInData);
      console.log("-------------------", result);

      if (result) {
        toast.success(`Check-in completed! Room assigned.`);
        router.push("/staff");
      } else {
        toast.error("Failed to complete check-in");
        setIsOtpLoading(false);
        return;
      }

      // Reset states and close dialog
      setShowOtpDialog(false);
      setOtpSent(false);
      setOtp("");
      setVerificationId("");
      setTimer(30);
      setCanResend(false);
      setIsEditingPhone(false);
      setIsOtpLoading(false);
    } catch (error) {
      setIsOtpLoading(false);
      toast.error("Upload failed. Please try again.");
      console.error("Error uploading images:", error);
    }
  };

  const handleChangePhone = () => {
    setIsEditingPhone(!isEditingPhone);
  };

  const handleUpdatePhone = () => {
    if (!/^\d{10}$/.test(guestPhone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    setIsEditingPhone(false);
    toast.success("Phone number updated");
  };

  const handleCancelPhoneEdit = () => {
    // Reset to original phone from booking data
    if (bookingData) {
      setGuestPhone(bookingData.phone || "");
    }
    setIsEditingPhone(false);
  };

  return (
    <>
      <div id="recaptcha-container" />
      <div className="container mx-auto px-4 py-8 space-y-4">
        {bookingData ? (
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="px-4 py-4">
                <div>
                  <div>
                    <div>
                      <div className="flex justify-between items-center w-full">
                        <div className="flex flex-col items-start">
                          <span className="text-xl font-bold">
                            {bookingData.bookingId}
                          </span>
                          <div className="flex gap-2 items-center">
                            <span className="text-sm text-muted-foreground">
                              Guest: {bookingData.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              <Users size={14} />
                              {bookingData.numberOfGuests} Guests
                            </Badge>
                          </div>
                        </div>
                        <StatusChip
                          status={bookingData?.status || "available"}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock size={16} />
                            Check In
                          </div>
                          <div>
                            <p className="font-medium">
                              {new Date(bookingData.checkIn).toLocaleDateString(
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
                              {new Date(
                                bookingData.checkOut,
                              ).toLocaleDateString("en-GB")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-2" />
                      {bookingData?.specialRequirements && (
                        <>
                          <div className="space-y-4">
                            <h3 className="text-sm font-medium">
                              Special Requirement
                            </h3>
                            <Badge variant="outline">
                              {bookingData?.specialRequirements}
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

                      {/* ID Proof Upload Section */}
                      <>
                        <Separator className="my-4" />
                        <div className="space-y-4">
                          <h3 className="text-sm font-medium">
                            Guest ID Proof Upload
                          </h3>
                          {guestIdProofs.map((guest, idx) => (
                            <Card key={guest.guestId} className="p-4">
                              <div className="space-y-3">
                                <h4 className="text-sm font-semibold">
                                  Guest {idx + 1}: {guest.guestName}
                                </h4>

                                {/* ID Proof Type Dropdown */}
                                <div className="space-y-2">
                                  <label className="text-xs text-muted-foreground">
                                    Select ID Proof Type
                                  </label>
                                  <Select
                                    value={guest.idProofType}
                                    onValueChange={(value) =>
                                      handleIdProofTypeChange(
                                        guest.guestId,
                                        value,
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select ID Proof" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Object.entries(ID_PROOF_TYPES).map(
                                        ([key, value]) => (
                                          <SelectItem key={key} value={key}>
                                            {value.label}
                                          </SelectItem>
                                        ),
                                      )}
                                    </SelectContent>
                                  </Select>
                                </div>

                                {/* Image Upload Buttons */}
                                {guest.idProofType && (
                                  <div className="space-y-3">
                                    {/* Front Image */}
                                    <div className="space-y-2">
                                      <label className="text-xs text-muted-foreground">
                                        Front Side
                                      </label>
                                      {guest.images.front ? (
                                        <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                                          <Image
                                            src={guest.images.front}
                                            alt="Front side"
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                          />
                                          <button
                                            onClick={() =>
                                              handleDeleteImage(
                                                guest.guestId,
                                                "front",
                                              )
                                            }
                                            className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                          >
                                            <Trash2 size={16} />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="space-y-2">
                                          {showUploadOptions?.guestId ===
                                            guest.guestId &&
                                          showUploadOptions?.side ===
                                            "front" ? (
                                            <div className="flex gap-2">
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                  const input =
                                                    document.createElement(
                                                      "input",
                                                    );
                                                  input.type = "file";
                                                  input.accept = "image/*";
                                                  input.onchange = (e) =>
                                                    handleFileInputChange(
                                                      guest.guestId,
                                                      "front",
                                                      e as any,
                                                    );
                                                  input.click();
                                                }}
                                                disabled={guest.uploading.front}
                                              >
                                                <ImageLucide
                                                  size={16}
                                                  className="mr-2"
                                                />
                                                Gallery
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => {
                                                  const input =
                                                    document.createElement(
                                                      "input",
                                                    );
                                                  input.type = "file";
                                                  input.accept = "image/*";
                                                  input.capture = "environment";
                                                  input.onchange = (e) =>
                                                    handleFileInputChange(
                                                      guest.guestId,
                                                      "front",
                                                      e as any,
                                                    );
                                                  input.click();
                                                }}
                                                disabled={guest.uploading.front}
                                              >
                                                <Camera
                                                  size={16}
                                                  className="mr-2"
                                                />
                                                Camera
                                              </Button>
                                              <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                  setShowUploadOptions(null)
                                                }
                                              >
                                                <X size={16} />
                                              </Button>
                                            </div>
                                          ) : (
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="w-full"
                                              onClick={() =>
                                                setShowUploadOptions({
                                                  guestId: guest.guestId,
                                                  side: "front",
                                                })
                                              }
                                              disabled={guest.uploading.front}
                                            >
                                              {guest.uploading.front ? (
                                                <>
                                                  <Loader2
                                                    size={16}
                                                    className="mr-2 animate-spin"
                                                  />
                                                  Uploading...
                                                </>
                                              ) : (
                                                <>
                                                  <Upload
                                                    size={16}
                                                    className="mr-2"
                                                  />
                                                  Upload Front Side
                                                </>
                                              )}
                                            </Button>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Back Image - Only if required */}
                                    {ID_PROOF_TYPES[
                                      guest.idProofType as keyof typeof ID_PROOF_TYPES
                                    ]?.sides === 2 && (
                                      <div className="space-y-2">
                                        <label className="text-xs text-muted-foreground">
                                          Back Side
                                        </label>
                                        {guest.images.back ? (
                                          <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-border">
                                            <Image
                                              src={guest.images.back}
                                              alt="Back side"
                                              fill
                                              className="object-cover"
                                              sizes="(max-width: 768px) 100vw, 50vw"
                                            />
                                            <button
                                              onClick={() =>
                                                handleDeleteImage(
                                                  guest.guestId,
                                                  "back",
                                                )
                                              }
                                              className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                            >
                                              <Trash2 size={16} />
                                            </button>
                                          </div>
                                        ) : (
                                          <div className="space-y-2">
                                            {showUploadOptions?.guestId ===
                                              guest.guestId &&
                                            showUploadOptions?.side ===
                                              "back" ? (
                                              <div className="flex gap-2">
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  className="flex-1"
                                                  onClick={() => {
                                                    const input =
                                                      document.createElement(
                                                        "input",
                                                      );
                                                    input.type = "file";
                                                    input.accept = "image/*";
                                                    input.onchange = (e) =>
                                                      handleFileInputChange(
                                                        guest.guestId,
                                                        "back",
                                                        e as any,
                                                      );
                                                    input.click();
                                                  }}
                                                  disabled={
                                                    guest.uploading.back
                                                  }
                                                >
                                                  <ImageLucide
                                                    size={16}
                                                    className="mr-2"
                                                  />
                                                  Gallery
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="outline"
                                                  className="flex-1"
                                                  onClick={() => {
                                                    const input =
                                                      document.createElement(
                                                        "input",
                                                      );
                                                    input.type = "file";
                                                    input.accept = "image/*";
                                                    input.capture =
                                                      "environment";
                                                    input.onchange = (e) =>
                                                      handleFileInputChange(
                                                        guest.guestId,
                                                        "back",
                                                        e as any,
                                                      );
                                                    input.click();
                                                  }}
                                                  disabled={
                                                    guest.uploading.back
                                                  }
                                                >
                                                  <Camera
                                                    size={16}
                                                    className="mr-2"
                                                  />
                                                  Camera
                                                </Button>
                                                <Button
                                                  type="button"
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                    setShowUploadOptions(null)
                                                  }
                                                >
                                                  <X size={16} />
                                                </Button>
                                              </div>
                                            ) : (
                                              <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full"
                                                onClick={() =>
                                                  setShowUploadOptions({
                                                    guestId: guest.guestId,
                                                    side: "back",
                                                  })
                                                }
                                                disabled={guest.uploading.back}
                                              >
                                                {guest.uploading.back ? (
                                                  <>
                                                    <Loader2
                                                      size={16}
                                                      className="mr-2 animate-spin"
                                                    />
                                                    Uploading...
                                                  </>
                                                ) : (
                                                  <>
                                                    <Upload
                                                      size={16}
                                                      className="mr-2"
                                                    />
                                                    Upload Back Side
                                                  </>
                                                )}
                                              </Button>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </Card>
                          ))}
                        </div>
                      </>

                      <Button
                        variant="default"
                        className="w-full mt-5"
                        onClick={() => {
                          if (isAllGuestsComplete()) {
                            // Open OTP dialog
                            setShowOtpDialog(true);
                            setOtpSent(false);
                            setOtp("");
                            setIsEditingPhone(false);
                            setTimer(30);
                            setCanResend(false);
                            // handleVerifyOtp();
                          }
                        }}
                        disabled={!isAllGuestsComplete()}
                      >
                        {isAllGuestsComplete()
                          ? "Send OTP"
                          : "Complete ID Proof Upload"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex justify-center items-center min-h-[60vh]">
            <div className="text-center space-y-2">
              <span className="text-gray-500 text-lg">
                No booking data found
              </span>
              <p className="text-sm text-muted-foreground">
                Booking ID: {bookingId}
              </p>
              <Button
                variant="outline"
                className="hidden"
                onClick={() =>
                  handleImageClick("https://via.placeholder.com/150")
                }
              >
                View Image
              </Button>
            </div>
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

      {/* OTP Verification Dialog */}
      <Dialog
        open={showOtpDialog}
        onOpenChange={(open) => {
          if (!open) {
            setShowOtpDialog(false);
            setOtpSent(false);
            setOtp("");
            setVerificationId("");
            setTimer(30);
            setCanResend(false);
            setIsEditingPhone(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Check-in Verification</DialogTitle>
            <DialogDescription>
              {!otpSent
                ? `OTP will be sent to ${guestPhone}`
                : "Enter the OTP sent to your phone"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Phone Number Section */}
            {!otpSent && (
              <>
                {isEditingPhone ? (
                  <div className="space-y-3">
                    <Input
                      value={guestPhone}
                      onChange={(e) => {
                        if (/^\d{0,10}$/.test(e.target.value)) {
                          setGuestPhone(e.target.value);
                        }
                      }}
                      maxLength={10}
                      placeholder="Enter 10-digit phone number"
                      className="text-base"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUpdatePhone}
                        className="flex-1"
                        disabled={isOtpLoading}
                      >
                        Change
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancelPhoneEdit}
                        className="flex-1"
                        disabled={isOtpLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleChangePhone}
                      className="flex-1"
                      disabled={isOtpLoading}
                    >
                      Change Number
                    </Button>
                    <Button
                      onClick={handleSendOtp}
                      className="flex-1"
                      disabled={isOtpLoading || !guestPhone}
                    >
                      {isOtpLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send"
                      )}
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* OTP Input Section */}
            {otpSent && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Enter OTP</label>
                  <Input
                    value={otp}
                    onChange={(e) => {
                      if (/^\d{0,6}$/.test(e.target.value)) {
                        setOtp(e.target.value);
                      }
                    }}
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    className="text-base text-center tracking-widest"
                  />
                </div>

                {/* Resend OTP Section */}
                <div className="flex items-center justify-center gap-2 text-sm">
                  <span className="text-muted-foreground">
                    Didn&apos;t receive OTP?
                  </span>
                  {canResend ? (
                    <button
                      onClick={handleResendOtp}
                      disabled={isOtpLoading}
                      className="text-primary font-medium hover:underline disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  ) : (
                    <span className="text-muted-foreground">
                      Resend in {timer}s
                    </span>
                  )}
                </div>

                {/* Complete Check-in Button */}
                <Button
                  onClick={handleVerifyOtp}
                  className="w-full"
                  disabled={isOtpLoading || otp.length !== 6}
                >
                  {isOtpLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Complete Check-in"
                  )}
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Checkin;
