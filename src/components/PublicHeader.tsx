import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link } from "@/navigation";
import { Menu } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import UserAccountButton, {
  UserAccountButtonDrawerSheet,
} from "./UserAccountButton";

export const PublicHeader = async () => {
  const t = await getTranslations();
  const HeaderLinks: { href: string; title: string }[] = [
    { href: "/", title: t("home") },
    { href: "/products", title: t("browse-products") },
    { href: "/about", title: t("about") },
  ];
  return (
    <header className="sticky top-0 flex bg-background z-50">
      <div className="flex items-center gap-4 py-5 justify-between container">
        {/* <div className="h-12 relative w-36"> */}
        <Link href={"/"}>
          <Image
            src={"/company-logo.png"}
            alt="Company Logo"
            height={48}
            width={148}
          />
        </Link>

        <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
          {HeaderLinks.map(({ href, title }) => (
            <Link
              key={title}
              href={href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {title}
            </Link>
          ))}
        </nav>
        <div>
          <div className="hidden md:flex w-full items-center gap-4 md:ml-auto">
            <UserAccountButton />
          </div>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="default"
              size="icon"
              className="shrink-0 md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="max-w-[80vw]">
            <nav className="grid gap-6 text-lg font-medium">
              {HeaderLinks.map(({ href, title }) => (
                <Link
                  key={title}
                  href={href}
                  className="text-muted-foreground hover:text-foreground"
                >
                  {title}
                </Link>
              ))}
              <UserAccountButtonDrawerSheet />
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};
