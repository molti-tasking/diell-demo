import { getOrganizationMembers } from "@/actions/organization-users";
import Breadcrumbs from "@/components/ui/breadcrumbs";

type Params = {
  params: {
    organizationId: string;
  };
};

export default async function UsersPage({
  params: { organizationId },
}: Params) {
  const { data: members } = await getOrganizationMembers(organizationId);
  const links = [
    {
      label: "Home",
      asChild: true,
      link: `/dashboard/${organizationId}`,
    },
  ];

  return (
    <div>
      <Breadcrumbs links={links} />

      <div className="flex flex-row items-center justify-between">
        <h3 className="text-2xl font-bold my-4">Your Users</h3>
      </div>
      <div>
        {members?.map((member) => (
          <div key={member.email} className="p-4 my-4 bg-slate-400 rounded-xl">
            {member.email}
          </div>
        ))}
      </div>
    </div>
  );
}
