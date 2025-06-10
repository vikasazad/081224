"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthWrapper from "@/components/auth-wrapper";
import { Toaster } from "@/components/ui/sonner";
import GlobalNotificationProvider from "@/hooks/useFcmToken";
import { Provider } from "react-redux";
import { useRef } from "react";
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
