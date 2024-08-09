"use client";

import { cn } from "@/lib/util/cn";
import { Link, usePathname } from "@/navigation";
import { Badge } from "../ui/badge";

export interface MenuItem {
  href?: string;
  label: string;
  icon: JSX.Element;
  badge?: number;
  childItems?: Omit<MenuItem, "childItems">[];
}

export default function DashboardSidebar({
  menuItems,
}: {
  menuItems?: MenuItem[];
}) {
  const path = usePathname();

  return (
    <>
      {menuItems?.map((item, index) => {
        const active = path === item.href;
        const activeClass = active
          ? "bg-primary text-primary-foreground hover:text-primary-foreground/70"
          : "text-primary hover:bg-primary/20";

        if (item.childItems?.length) {
          return (
            <div key={item.href + String(index)}>
              <div
                className={
                  "text-primary flex items-center gap-3 rounded-lg px-3 py-2 transition-all opacity-70"
                }
              >
                {item.icon}
                {item.label}
                {!!item.badge && (
                  <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                    {item.badge}
                  </Badge>
                )}
              </div>

              <div className="pl-4">
                {item.childItems.map((item, index) => {
                  const active = path === item.href;
                  const activeClass = active
                    ? "bg-primary text-primary-foreground hover:text-primary-foreground/70"
                    : "text-primary hover:bg-primary/20";

                  return (
                    <Link
                      key={item.href + String(index)}
                      href={item.href ?? "#"}
                      className={cn(
                        activeClass,
                        " flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
                      )}
                    >
                      {item.icon}
                      {item.label}
                      {!!item.badge && (
                        <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.href + String(index)}
            href={item.href ?? "#"}
            className={cn(
              activeClass,
              " flex items-center gap-3 rounded-lg px-3 py-2 transition-all"
            )}
          >
            {item.icon}
            {item.label}
            {!!item.badge && (
              <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                {item.badge}
              </Badge>
            )}
          </Link>
        );
      })}
    </>
  );
}
