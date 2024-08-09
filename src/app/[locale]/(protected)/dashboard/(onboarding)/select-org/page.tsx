import { getOrganizations } from "@/actions/organization";
import { CreateOrganizationDialog } from "@/components/admin/CreateOrganizationDialog";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { ArrowRightIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage() {
  const { data: organizations, error } = await getOrganizations();
  const t = await getTranslations();
  if (error) {
    console.log(error);
  }
  if (!organizations?.length) {
    return (
      <>
        <h1 className="text-3xl">{t("no-organization-found")}</h1>
        <p className="my-4 w-5/6 sm:w-8/12 text-center">
          {t("no-organization-found-text")}
        </p>
        <div>
          <CreateOrganizationDialog />
        </div>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl">{t("your-organizations")}</h1>
      <p className="my-4">{t("choose-one-organization")}</p>
      <div className="flex flex-col gap-4 mt-8 w-full">
        {!!organizations?.length &&
          organizations.map((org) => (
            <div
              key={org.id}
              className="rounded-md bg-slate-100 p-4 gap-4 flex flex-row justify-between items-center flex-wrap"
            >
              <strong>{org.name}</strong>
              <Link href={`/dashboard/${org.id}`}>
                <Button variant={"outline"}>
                  <ArrowRightIcon />
                </Button>
              </Link>
            </div>
          ))}
      </div>
    </>
  );
}
