import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Link } from "@/navigation";
import { SlashIcon } from "@radix-ui/react-icons";
import React from "react";

interface BreadcrumbLink {
  label: string;
  link?: string;
}

export default function Breadcrumbs({ links }: { links: BreadcrumbLink[] }) {
  return (
    <Breadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {links.map((link, index) => (
          <React.Fragment key={String(link.label) + String(link.link)}>
            <BreadcrumbItem key={link.label}>
              <BreadcrumbLink asChild>
                {link.link ? (
                  <Link href={link.link}>{link.label}</Link>
                ) : (
                  <BreadcrumbPage>{link.label}</BreadcrumbPage>
                )}
              </BreadcrumbLink>
            </BreadcrumbItem>
            {index < links.length - 1 && (
              <BreadcrumbSeparator>
                <SlashIcon />
              </BreadcrumbSeparator>
            )}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
