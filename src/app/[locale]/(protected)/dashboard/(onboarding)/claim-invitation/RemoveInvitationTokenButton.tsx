"use client";
import { removeInvitationToken } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "@/navigation";
import { useTranslations } from "next-intl";

export const RemoveInvitationTokenButton = () => {
  const t = useTranslations();
  const { push } = useRouter();
  const removeToken = async () => {
    await removeInvitationToken();
    push("/dashboard");
  };

  return (
    <Button onClick={() => removeToken()} variant={"destructiveSubtle"}>
      {t("invitation-hide-error-message")}
    </Button>
  );
};
