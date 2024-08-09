import { getIsAdmin, getUser } from "@/actions/auth";
import { getOrganizations } from "@/actions/organization";
import { INVITATION_TOKEN_KEY } from "@/lib/util/invitation";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getUser();

  const userInvitationToken: string | undefined =
    user.data.user?.user_metadata[INVITATION_TOKEN_KEY];

  if (!!userInvitationToken) {
    return redirect(
      `/dashboard/claim-invitation?${INVITATION_TOKEN_KEY}=${userInvitationToken}`
    );
  }

  const { data: isAdmin } = await getIsAdmin();
  if (isAdmin) {
    return redirect("/admin");
  }
  const { data, error: orgError } = await getOrganizations();
  if (orgError) {
    console.log("Get organizations error: ", orgError);
  }
  const orgs = data;
  if (orgs?.length === 1) {
    return redirect("/dashboard/" + orgs[0].id);
  }
  return redirect("/dashboard/select-org");
}
