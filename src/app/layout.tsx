"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthWrapper from "@/components/auth-wrapper";
import { Toaster } from "@/components/ui/sonner";
import GlobalNotificationProvider from "@/hooks/useFcmToken";
import { Provider } from "react-redux";
import { useRef, useEffect } from "react";
import { AppStore } from "@/lib/store";
import store from "@/lib/store";
import { PersistGate } from "redux-persist/integration/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
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

  return (
    <html lang="en">
      <body className={inter.className}>
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
      </body>
    </html>
  );
}
