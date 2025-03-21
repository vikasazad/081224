import { Header } from "@/components/header";
import { Metadata } from "next";

// app/dashboard/layout.tsx
export const metadata: Metadata = {
  title: "Hotel",
  description: "Hotel",
};
export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      {children}
    </div>
  );
}
