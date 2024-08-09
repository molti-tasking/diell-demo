"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { CreateProductForm } from "../dashboard/CreateProductForm";

interface CreateProductDialogFormProps {
  organizationId: string;
}
export const CreateProductDialog = ({
  organizationId,
}: CreateProductDialogFormProps) => {
  const [open, setIsOpen] = useState(false);
  const t = useTranslations();
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <PlusIcon />
          {t("create-product")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <CreateProductForm
          organizationId={organizationId}
          onCreated={(productId) => {
            console.log("Created product with id: " + productId);
            setIsOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
