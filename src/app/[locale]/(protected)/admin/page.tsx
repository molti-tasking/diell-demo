import { getOrganizations } from "@/actions/organization";
import { CreateInviteDialog } from "@/components/admin/CreateInviteDialog";
import { CreateOrganizationDialog } from "@/components/admin/CreateOrganizationDialog";
import { getTranslations } from "next-intl/server";

export default async function AdminPage() {
  const t = await getTranslations();
  const { data: organizations, error } = await getOrganizations();

  console.log(organizations, error);
  return (
    <div className="min-h-screen">
      <div>
        <div className="flex flex-row justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-800">
            {t("organizations")}
          </h1>
          <div className="flex flex-row items-center gap-2">
            <CreateOrganizationDialog />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {organizations?.length ? (
            organizations?.map((org) => (
              <div key={org.id} className="py-8 px-4 bg-slate-200 rounded-xl">
                <div className="flex flex-row items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {org.name}
                  </h3>
                </div>
                <div className="flex flex-row justify-between items-center">
                  <h3 className="font-semibold text-gray-900">Users:</h3>
                  <CreateInviteDialog
                    organizationId={org.id!}
                    organizationName={org.name!}
                  />
                </div>
              </div>
            ))
          ) : (
            <p>{t("organizations-none")}</p>
          )}
        </div>
      </div>
    </div>
  );
}
