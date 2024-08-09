"use client";
import { sendInviteLink } from "@/actions/invitation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "../ui/use-toast";
import { SendEmailInviteForm } from "./SendEmailInviteForm";

export const CreateInviteDialog = ({
  organizationId,
  organizationName,
  children,
}: {
  organizationId: string;
  organizationName: string;
  children?: React.ReactNode;
}) => {
  const t = useTranslations();
  const [open, setIsOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant={"outline"}>
            <PlusIcon />
            {t("invite-user")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <CreateInviteDialogButton
          organizationId={organizationId}
          organizationName={organizationName}
          close={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

const CreateInviteDialogButton = ({
  organizationId,
  organizationName,
  close,
}: {
  organizationId: string;
  organizationName: string;
  close: () => void;
}) => {
  const t = useTranslations();

  const { mutate } = useMutation({
    mutationFn: (recipients: string[]) =>
      sendInviteLink(organizationId, organizationName, recipients),
    onSuccess: (...args) => {
      console.log(args);
      toast({ title: t("successfully-updated") });
      close();
    },
    onError: (error, ...args) => {
      console.log(args);
      if (error) {
        console.log("error: ", error);
        toast({
          title: t("error-occured"),
          description: error.message,
          variant: "destructive",
        });
      }
    },
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("organization-invite-create")}</DialogTitle>
        <DialogDescription>
          {t("organization-invite-create-info")}
        </DialogDescription>
      </DialogHeader>

      <SendEmailInviteForm emails={[]} onSubmitRecipients={mutate} />
    </>
  );
};
