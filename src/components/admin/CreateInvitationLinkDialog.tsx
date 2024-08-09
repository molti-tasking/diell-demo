"use client";
import { createInvitationLink } from "@/actions/invitation";
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
import { CommandLoading } from "cmdk";
import { LinkIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "../ui/use-toast";

export const CreateInvitationLinkDialog = ({
  organizationId,
  children,
}: {
  organizationId: string;
  children?: React.ReactNode;
}) => {
  const t = useTranslations();
  const [open, setIsOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant={"outline"}>
            <LinkIcon />
            {t("create-invitation-link")}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <CreateInvitationLinkDialogButton organizationId={organizationId} />
      </DialogContent>
    </Dialog>
  );
};

const CreateInvitationLinkDialogButton = ({
  organizationId,
}: {
  organizationId: string;
}) => {
  const t = useTranslations();

  const { mutate, isPending, data } = useMutation({
    mutationFn: () => createInvitationLink(organizationId),

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

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast({ title: t("copied-to-clipboard") }))
      .catch((error) => {
        console.log("Error sharing", error);
      });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t("organization-invite-create")}</DialogTitle>
        <DialogDescription>
          {t("organization-invite-create-info")}
        </DialogDescription>
      </DialogHeader>

      <div>
        {data?.data?.link ? (
          <div>
            <div className="my-2">{t("invite-link-copy-text")}</div>
            <div className="overflow-scroll w-full">
              <pre
                className="overflow-scroll bg-muted text-foreground p-2 whitespace-pre-wrap cursor-copy"
                onClick={() => copyToClipboard(data.data.link)}
              >
                {data.data.link}
              </pre>
            </div>
          </div>
        ) : (
          <Button onClick={() => mutate()} disabled={isPending}>
            {t("create-invitation-link")}
          </Button>
        )}
        {isPending && <CommandLoading />}
      </div>
    </>
  );
};
