import { auth } from "@/auth";
import { Header } from "@/components/header";

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  let staff: boolean = false;
  if (session) {
    if (session?.user?.role === "staff") {
      staff = true;
    }
  }
  //   console.log("first", staff);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header staff={staff} />
      {children}
    </div>
  );
}
