"use client";
import { useState, useCallback } from "react";

export const useNotificationPopup = () => {
  const [showPopup, setShowPopup] = useState(false);

  const openPopup = useCallback(() => setShowPopup(true), []);
  const closePopup = useCallback(() => setShowPopup(false), []);

  return { showPopup, openPopup, closePopup };
};
