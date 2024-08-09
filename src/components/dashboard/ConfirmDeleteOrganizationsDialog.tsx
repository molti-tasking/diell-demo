"use client";
import { deleteOrganization } from "@/actions/organization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useIsAdmin } from "@/lib/hooks/query";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ConfirmDeleteOrganizationDialogFormProps {
  organizationId: string;
  children: React.ReactNode;
}

/**
 * This component should only be shown for an admin because only admin can do this
 * @returns
 */
export const ConfirmDeleteOrganizationDialog = ({
  organizationId,
  children,
}: ConfirmDeleteOrganizationDialogFormProps) => {
  const onConfirmedDeletion = async () => {
    await deleteOrganization(organizationId);
  };
  const [open, setIsOpen] = useState(false);
  const t = useTranslations();

  const { data } = useIsAdmin();
  if (!data?.data) {
    return <></>;
  }

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("delete-organization-confirm-question")}</DialogTitle>
          <DialogDescription>{t("delete-organization-text")}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-row-reverse gap-4">
          <Button
            type="button"
            variant={"destructiveSubtle"}
            onClick={() => onConfirmedDeletion()}
          >
            {t("delete")}
          </Button>
          <Button
            type="button"
            variant={"default"}
            onClick={() => setIsOpen(false)}
          >
            {t("cancel")}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
