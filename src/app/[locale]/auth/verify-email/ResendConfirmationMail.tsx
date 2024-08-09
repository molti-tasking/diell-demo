"use client";

import { resendConfirmationMail } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

export const ResendConfirmationMail = ({ email }: { email: string }) => {
  const t = useTranslations();
  const { mutateAsync, isPending } = useMutation({
    mutationFn: () => resendConfirmationMail(email),
  });

  const resendEmail = async () => {
    const res = await mutateAsync();
    console.log("RES : ", res);
    const { error, data } = res;
    if (data) {
      toast({ title: t("successfully-updated") });
    } else if (error) {
      console.log("Failed to send with error: ", error);
      try {
        toast({
          variant: "destructive",
          description: error.message,
          title: error.code + " " + error.name,
        });
      } catch (e) {
        if (e instanceof Error) {
          toast({
            variant: "destructive",
            description: e.message,
            title: e.name,
          });
        } else {
          console.error("Error: ", error);
        }
      }
    }
  };

  return (
    <Button
      onClick={resendEmail}
      className="mt-4"
      disabled={isPending}
      variant={"outline"}
    >
      {isPending ? t("load") : t("sign-up-resend-confirmation", { email })}
    </Button>
  );
};
