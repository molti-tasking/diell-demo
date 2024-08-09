import { getOrganization } from "@/actions/organization";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";

type Params = {
  params: {
    organizationId: string;
  };
};

export default async function OrganizationPage({
  params: { organizationId },
}: Params) {
  const t = await getTranslations();
  const { data: organization, error } = await getOrganization(organizationId);

  if (error || !organization.id) {
    return <p>Error: {error?.message}</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">
        Welcome at {organization.name}
      </h2>
      <div>Go to your products: </div>
      <Button asChild>
        <Link href={`/dashboard/${organization.id}/products`}>
          {t("your-products")}
        </Link>
      </Button>
      <div>Go to your users: </div>
      <Button asChild>
        <Link href={`/dashboard/${organization.id}/users`}>
          {t("your-users")}
        </Link>
      </Button>
    </div>
  );
}
