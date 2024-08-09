"use client";

import { acceptInvitation } from "@/actions/invitation";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "../ui/button";
import { toast } from "../ui/use-toast";

export const AcceptInviteButton = ({ token }: { token: string }) => {
  const t = useTranslations();
  const { push } = useRouter();
  const acceptInvite = async () => {
    try {
      const res = await acceptInvitation(token);

      if (res?.error) {
        toast({
          variant: "destructive",
          title: t("error-occured"),
          description: res.error.message,
        });
      } else {
        toast({
          title: t("invitation-successfully-joined-organization"),
          description: t("invitation-member-of-org-message", {
            role: res.data.account_role,
          }),
        });
        push(`/dashboard/${res?.data.organization_id}`);
      }

      res.data?.organization_id;
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: t("error-occured"),
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: t("error-occured"),
          description: String(error),
        });
      }
    }
  };
  return (
    <Button onClick={acceptInvite} variant={"subtle"}>
      {t("accept")}
    </Button>
  );
};
