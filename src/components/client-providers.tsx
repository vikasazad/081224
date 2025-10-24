"use client";

import { useRef, useEffect } from "react";
import AuthWrapper from "@/components/auth-wrapper";
import { Toaster } from "@/components/ui/sonner";
import GlobalNotificationProvider from "@/hooks/useFcmToken";
import { Provider } from "react-redux";
import { AppStore } from "@/lib/store";
import store from "@/lib/store";
import { PersistGate } from "redux-persist/integration/react";
import KitchenTimerService from "@/services/kitchen-timer-service";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<{ store: AppStore; persistor: any }>();
  if (!storeRef.current) {
    storeRef.current = store();
  }

  // Add viewport meta tag to prevent iOS zoom on input focus
  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
      );
    } else {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content =
        "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0";
      document.head.appendChild(meta);
    }
  }, []);

  // Initialize the global kitchen timer service
  useEffect(() => {
    const timerService = KitchenTimerService.getInstance();
    timerService.start();

    // Cleanup on unmount (though this component rarely unmounts)
    return () => {
      timerService.stop();
    };
  }, []);

  return (
    <Provider store={storeRef.current.store}>
      <PersistGate
        loading={
          <div className="flex justify-center items-center h-screen">
            <div className="text-lg font-medium">Loading...</div>
          </div>
        }
        persistor={storeRef.current.persistor}
      >
        <AuthWrapper>
          <GlobalNotificationProvider>
            <Toaster />
            {children}
          </GlobalNotificationProvider>
        </AuthWrapper>
      </PersistGate>
    </Provider>
  );
}
