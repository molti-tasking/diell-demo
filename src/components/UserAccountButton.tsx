import { getIsAdmin, getUser, signOut } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CircleUser } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { redirect } from "next/navigation";

export async function UserAccountButtonDrawerSheet() {
  const t = await getTranslations();
  const {
    data: { user },
  } = await getUser();

  if (!user) {
    return (
      <div className="space-x-2 whitespace-nowrap">
        <Link href={"/auth/login"}>
          <Button variant={"outlinePrimary"}>{t("sign-in")}</Button>
        </Link>
        <Link href={"/auth/register"}>
          <Button variant={"default"}>{t("register")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <Link href="/dashboard">
      <Button variant="outline">
        <div className="flex flex-row gap-4">
          <CircleUser className="h-5 w-5" />
          {user?.email}
        </div>
        <span className="sr-only">Toggle user menu</span>
      </Button>
    </Link>
  );
}

export default async function UserAccountButton() {
  const t = await getTranslations();
  const {
    data: { user },
  } = await getUser();
  const { data: isAdmin } = await getIsAdmin();

  if (!user) {
    return (
      <div>
        <div className="space-x-2 whitespace-nowrap hidden xl:block">
          <Link href={"/auth/login"}>
            <Button variant={"outlinePrimary"}>{t("sign-in")}</Button>
          </Link>
          <Link href={"/auth/register"}>
            <Button variant={"default"}>{t("register")}</Button>
          </Link>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild className="block xl:hidden">
            <Button variant="secondary">
              <CircleUser className="h-5 w-5" />
              <span className="sr-only">Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/auth/login">{t("sign-in")}</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/auth/register">{t("register")}</Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  const signOutAction = async () => {
    "use server";
    revalidatePath("/");
    await signOut();
    return redirect("/");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <div className="flex flex-row gap-4">
            <CircleUser className="h-5 w-5" />
            {user?.email}
          </div>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{t("hello")}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {!!isAdmin && (
            <>
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link href="/admin">Admin</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem asChild className="cursor-pointer">
            <Link href="/dashboard">{t("dashboard")}</Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <form action={signOutAction}>
            <button>{t("sign-out")}</button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
