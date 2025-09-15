"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import { Notifications } from "@/components/notifications";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface HeaderProps {
  staff?: boolean;
  manager?: boolean;
}

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/staff", label: "Staff" },
  { href: "/hotel", label: "Hotel" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/account", label: "Account" },
  { href: "/inventory", label: "Inventory" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/social", label: "Social" },
];

const staffNavItems = [
  { href: "/staff", label: "Staff" },
  { href: "/hotel", label: "Hotel" },
  { href: "/restaurant", label: "Restaurant" },
  { href: "/kitchen", label: "Kitchen" },
  { href: "/social", label: "Social" },
];

export function Header({ staff }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Function to check if the route is active
  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === path;
    }
    return pathname.startsWith(path);
  };

  // Merge base items with staff or manager items depending on the props
  const navItems = [...(staff ? staffNavItems : baseNavItems)];

  return (
    <div className="no-print top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-8">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Image
          src="/Blogo.svg"
          alt="Brand Logo"
          width={35}
          height={35}
          className="h-10 w-10"
          priority
          onClick={() => router.push("/dashboard")}
        />
        {/* <span className="sr-only">Acme Inc</span> */}

        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "transition-colors hover:text-foreground ",
              isActive(item.href)
                ? "text-foreground font-medium"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle className="hidden">Navigation Menu</SheetTitle>
            <SheetDescription className="hidden">
              Access primary navigation links and features
            </SheetDescription>
          </SheetHeader>
          <nav className="grid gap-6 text-lg font-medium mt-4">
            <Image
              src="/Blogo.svg"
              alt="Brand Logo"
              width={35}
              height={35}
              className="h-10 w-10"
              priority
              onClick={() => router.push("/dashboard")}
            />

            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground",
                  isActive(item.href)
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial">
          <div className="relative">
            {/* <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /> */}
            {/* <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            /> */}
          </div>
        </form>
        <Notifications />
        <UserNav />
      </div>
    </div>
  );
}
