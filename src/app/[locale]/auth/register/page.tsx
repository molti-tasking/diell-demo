import { lookupInvitation } from "@/actions/invitation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { INVITATION_TOKEN_KEY } from "@/lib/util/invitation";
import { Link } from "@/navigation";
import { TicketCheckIcon, TicketXIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";

type Params = {
  searchParams: {
    [INVITATION_TOKEN_KEY]?: string;
  };
};

export default async function Register({ searchParams }: Params) {
  const t = await getTranslations();

  return (
    <div className="flex-1 flex flex-col w-80 justify-center">
      <h2 className="text-2xl text-center mb-8">{t("register")}</h2>

      {searchParams[INVITATION_TOKEN_KEY] && (
        <InvitationInfoSection
          invitationToken={searchParams[INVITATION_TOKEN_KEY]}
        />
      )}

      <RegisterForm invitationToken={searchParams[INVITATION_TOKEN_KEY]} />

      <div className="mt-8 text-center text-sm">
        {t("has-account-question")}{" "}
        <Link href="/auth/login" className="underline">
          {t("go-to-sign-in")}
        </Link>
      </div>
    </div>
  );
}

const InvitationInfoSection = async ({
  invitationToken,
}: {
  invitationToken: string;
}) => {
  const { data } = await lookupInvitation(invitationToken);
  const t = await getTranslations();
  if (data?.active) {
    return (
      <Alert variant={"subtle"} className="mb-8">
        <TicketCheckIcon className="h-4 w-4" />
        <AlertTitle>
          {t("invitation-received", { organization: data.account_name })}{" "}
        </AlertTitle>
        <AlertDescription>
          {t("invitation-received-info", { organization: data.account_name })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant={"destructive"} className="mb-8">
      <TicketXIcon className="h-4 w-4" />
      <AlertTitle>{t("invitation-invalid")}</AlertTitle>
      <AlertDescription>{t("invitation-invalid-info")}</AlertDescription>
    </Alert>
  );
};
