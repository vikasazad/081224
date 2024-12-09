import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthWrapper from "@/components/auth-wrapper";
import { Toaster } from "@/components/ui/sonner";
import GlobalNotificationProvider from "@/hooks/useFcmToken";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  manifest: "/manifest.json",

  title: "Dashboard",
  description: "Admin dashboard",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthWrapper>
          <GlobalNotificationProvider>
            <Toaster />
            {children}
          </GlobalNotificationProvider>
        </AuthWrapper>
      </body>
    </html>
  );
}
