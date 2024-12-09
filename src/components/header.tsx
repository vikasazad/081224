"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Menu, Package2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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
];

const staffNavItems = [
  { href: "/staff", label: "Staff" },
  { href: "/hotel", label: "Hotel" },
  { href: "/restaurant", label: "Restaurant" },
];

export function Header({ staff }: HeaderProps) {
  const pathname = usePathname();

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
    <div className=" top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-lg font-semibold md:text-base"
        >
          <Package2 className="h-6 w-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
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
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-lg font-semibold"
            >
              <Package2 className="h-6 w-6" />
              <span className="sr-only">Acme Inc</span>
            </Link>
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
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search products..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
            />
          </div>
        </form>
        <Notifications />
        <UserNav />
      </div>
    </div>
  );
}
