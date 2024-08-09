import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { HomeIcon, ListBulletIcon, PersonIcon } from "@radix-ui/react-icons";
import { getTranslations } from "next-intl/server";

export default async function Dashboard({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const t = await getTranslations();
  const menuItems = [
    {
      href: "/admin",
      label: t("dashboard"),
      icon: <HomeIcon className="h-4 w-4" />,
    },
    {
      href: "/admin/organizations",
      label: t("organizations"),
      icon: <ListBulletIcon className="h-4 w-4" />,
    },
    {
      href: "/admin/users",
      label: t("users"),
      icon: <PersonIcon className="h-4 w-4" />,
    },
  ];
  return <DashboardLayout menuItems={menuItems}>{children}</DashboardLayout>;
}
