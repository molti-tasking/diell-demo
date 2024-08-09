import { getOrganization } from "@/actions/organization";
import {
  getOrganizationMembers,
  OrganizationMember,
} from "@/actions/organization-users";
import { CreateInviteDialog } from "@/components/admin/CreateInviteDialog";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";

type Params = {
  params: {
    organizationId: string;
  };
};

export default async function OrganizationUserPage({
  params: { organizationId },
}: Params) {
  const { data: organization, error } = await getOrganization(organizationId);
  const { data: members } = await getOrganizationMembers(organizationId);

  if (error || !organization.id || !organization.name) {
    return <p>Error: {error?.message}</p>;
  }
  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">{organization.name} </h2>

      <MemberSection
        orgId={organization.id}
        orgName={organization.name}
        users={members ?? []}
      />
    </div>
  );
}

const MemberSection = async ({
  users,
  orgId,
  orgName,
}: {
  users: OrganizationMember[];
  orgName: string;
  orgId: string;
}) => {
  const t = await getTranslations();

  if (!users) {
    return <p>{t("error-occured")} No user data</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row items-center justify-between">
        <h3 className="text-2xl font-bold my-4">Users</h3>
        <CreateInviteDialog organizationId={orgId} organizationName={orgName} />
      </div>
      <div className="flex flex-row flex-wrap gap-4">
        {users.map((user) => (
          <Badge key={user.user_id} variant={"outline"} className={"text-md"}>
            {user.email} ({user.account_role})
          </Badge>
        ))}
      </div>
    </div>
  );
};
