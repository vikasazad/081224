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

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>();
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
        <Provider store={storeRef.current}>
          <AuthWrapper>
            <GlobalNotificationProvider>
              <Toaster />
              {children}
            </GlobalNotificationProvider>
          </AuthWrapper>
        </Provider>
      </body>
    </html>
  );
}
