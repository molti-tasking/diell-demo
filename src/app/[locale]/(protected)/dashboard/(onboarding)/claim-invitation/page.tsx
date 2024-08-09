import { lookupInvitation } from "@/actions/invitation";
import { AcceptInviteButton } from "@/components/admin/AcceptInviteButton";
import { INVITATION_TOKEN_KEY } from "@/lib/util/invitation";
import { getTranslations } from "next-intl/server";
import { RemoveInvitationTokenButton } from "./RemoveInvitationTokenButton";

type Params = {
  searchParams: {
    [INVITATION_TOKEN_KEY]?: string;
  };
};

export default async function ClaimInvitationPage({ searchParams }: Params) {
  const t = await getTranslations();
  if (!searchParams[INVITATION_TOKEN_KEY]) {
    return (
      <div className="h-screen flex flex-col items-center content-center">
        <p>{t("invitation-no-token")}</p>
      </div>
    );
  }

  const { data, error } = await lookupInvitation(
    searchParams[INVITATION_TOKEN_KEY]
  );
  console.log(data, error);

  if (data?.active) {
    return (
      <div>
        <h1 className="text-3xl">{t("invitation-you-have-one")}</h1>

        <div className="flex flex-col mt-8">
          <div className="rounded-md bg-slate-100 p-4 flex flex-col gap-4">
            <p>{t("invitation-join-organizazion")}</p>
            <p className="font-bold">{data?.account_name}</p>
            <div className="flex flex-row gap-2">
              <RemoveInvitationTokenButton />
              <AcceptInviteButton token={searchParams[INVITATION_TOKEN_KEY]} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col justify-center gap-4 items-center content-center">
      <p>{t("invitation-expired-info")}</p>
      <RemoveInvitationTokenButton />
    </div>
  );
}
