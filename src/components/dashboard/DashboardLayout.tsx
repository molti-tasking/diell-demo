import UserAccountButton from "@/components/UserAccountButton";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@/navigation";
import { Menu } from "lucide-react";
import Image from "next/image";
import DashboardSidebar, { MenuItem } from "./DashboardSidebar";

export function DashboardLayout({
  menuItems,
  children,
}: Readonly<{
  menuItems?: MenuItem[];
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden md:block">
        <div className="flex h-full bg-secondary max-h-screen flex-col gap-2 ">
          <div className="flex h-14 items-center bg-primary border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Image
                src={"/company-logo.png"}
                width={100}
                height={100}
                alt="Company Logo"
              />
            </Link>
          </div>
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            <DashboardSidebar menuItems={menuItems} />
          </nav>
        </div>
      </div>
      <div className="flex flex-col overflow-scroll w-full">
        <header className="flex flex-row h-14 items-center gap-4 border-b bg-primary px-4 lg:h-[60px] lg:px-6 justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden rounded-sm"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-secondary">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/"
                  className="flex items-center gap-2 font-semibold"
                >
                  <Image
                    src={"/company-logo.png"}
                    width={100}
                    height={100}
                    alt="Company Logo"
                  />
                </Link>
                <DashboardSidebar menuItems={menuItems} />
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1" />

          <UserAccountButton />
        </header>
        <main className="flex flex-1 flex-col sm:gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
