"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { onMessage, Unsubscribe } from "firebase/messaging";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchToken, messaging } from "@/config/db/firebase";
import NotificationPopup from "@/components/NotificationPopup";
import { useNotificationPopup } from "./useNotificationPopup";

interface NotificationContextType {
  token: string | null;
  notificationPermissionStatus: NotificationPermission | null;
  notificationPayload: Record<string, any> | null; // Add payload here
  setNotificationPayload: (payload: Record<string, any> | null) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a GlobalNotificationProvider"
    );
  }
  return context;
};

const getNotificationPermissionAndToken = async (): Promise<string | null> => {
  if (!("Notification" in window)) {
    console.info("This browser does not support desktop notification");
    return null;
  }

  if (Notification.permission === "granted") {
    return await fetchToken();
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      return await fetchToken();
    }
  }

  console.info("Notification permission not granted.");
  return null;
};

const GlobalNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // let callCounter = 0;
  const router = useRouter();
  const [notificationPermissionStatus, setNotificationPermissionStatus] =
    useState<NotificationPermission | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const retryLoadToken = useRef(0);
  const isLoading = useRef(false);
  const { showPopup, openPopup, closePopup } = useNotificationPopup();
  const [notificationPayload, setNotificationPayload] = useState<Record<
    string,
    any
  > | null>(null);

  const loadToken = async () => {
    if (isLoading.current) return;

    isLoading.current = true;
    if (!("Notification" in window)) {
      isLoading.current = false;
      return;
    }
    const fetchedToken = await getNotificationPermissionAndToken();

    if (Notification.permission === "denied") {
      setNotificationPermissionStatus("denied");
      isLoading.current = false;
      return;
    }

    if (!fetchedToken) {
      if (retryLoadToken.current >= 3) {
        alert("Unable to load token, refresh the browser");
        isLoading.current = false;
        return;
      }
      retryLoadToken.current += 1;
      isLoading.current = false;
      await loadToken();
      return;
    }

    setNotificationPermissionStatus(Notification.permission);
    setToken(fetchedToken);
    isLoading.current = false;
  };

  const setupListener = async () => {
    const m = await messaging();
    if (!m) return;

    const unsubscribe = onMessage(m, (payload: any) => {
      if (Notification.permission !== "granted") return;

      console.log("Foreground push notification received:", payload);
      const link = payload.fcmOptions?.link || payload.data?.link;
      setNotificationPayload(payload.notification);
      toast.info(
        `${payload.notification?.title}: ${payload.notification?.body}`,
        {
          action: link
            ? {
                label: "Visit",
                onClick: () => router.push(link),
              }
            : undefined,
        }
      );

      if (Notification.permission === "granted") {
        const n = new Notification(
          payload.notification?.title || "New Notification",
          {
            body: payload.notification?.body || "You have a new message",
            data: { url: link },
          }
        );

        n.onclick = (event) => {
          event.preventDefault();
          const link = (event.target as any)?.data?.url;
          if (link) {
            router.push(link);
          }
        };
      }
    });

    return unsubscribe;
  };

  // const requestPermission = async () => {
  //   if ("Notification" in window) {
  //     const permission = await Notification.requestPermission();
  //     setNotificationPermissionStatus(permission);
  //     if (permission === "granted") {
  //       const newToken = await fetchToken();
  //       setToken(newToken);
  //     }
  //   }
  //   closePopup();
  // };

  useEffect(() => {
    if ("Notification" in window) {
      loadToken();
    }
  }, []);

  useEffect(() => {
    let unsubscribe: Unsubscribe | null = null;

    setupListener().then((unsub) => {
      if (unsub) {
        unsubscribe = unsub;
      }
    });

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [token]);

  // Keep popup open until permission is granted
  useEffect(() => {
    if (!("Notification" in window)) return;

    if (notificationPermissionStatus === "granted") {
      // console.log("closePopup");
      closePopup();
    } else if (
      notificationPermissionStatus === "denied" ||
      notificationPermissionStatus === "default"
    ) {
      console.log("openPopup");
      openPopup();
    }
  }, [notificationPermissionStatus, openPopup, closePopup]);

  return (
    <NotificationContext.Provider
      value={{
        token,
        notificationPermissionStatus,
        notificationPayload,
        setNotificationPayload,
      }}
    >
      {children}
      {showPopup && <NotificationPopup />}
    </NotificationContext.Provider>
  );
};

export default GlobalNotificationProvider;
