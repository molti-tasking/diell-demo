import { getOrganizations } from "@/actions/organization";
import { CreateOrganizationDialog } from "@/components/admin/CreateOrganizationDialog";
import { OrganizationDataTable } from "@/components/admin/OrganizationDataTable";
import { getTranslations } from "next-intl/server";

export default async function AdminOrganizationPage() {
  const t = await getTranslations();
  const { data: organizations, error } = await getOrganizations();
  if (error) console.log("Error loading organizations: ", error);

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
            <OrganizationDataTable data={organizations} />
          ) : (
            <p>No orgs</p>
          )}
        </div>
      </div>
    </div>
  );
}
