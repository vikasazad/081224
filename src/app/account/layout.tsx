import { Header } from "@/components/header";
import { Metadata } from "next";

// app/dashboard/layout.tsx
export const metadata: Metadata = {
  title: "Account",
  description: "Account",
};
export default function AccountLayout({
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
