"use client";
import { verifyOrganization } from "@/actions/organization-verification";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { Switch } from "../ui/switch";
import { toast } from "../ui/use-toast";

interface VerifyOrganizationDialogFormProps {
  organizationId: string;
  verified: boolean | null | undefined;
  reload?: () => void;
  children?: React.ReactNode;
}
export const VerifyOrganizationDialog = ({
  organizationId,
  verified,
  reload,
  children,
}: VerifyOrganizationDialogFormProps) => {
  const t = useTranslations();
  const [open, setIsOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children ?? (
          <Button variant={"link"}>{t("verify-organization")}</Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <VerifyOrganizationForm
          organizationId={organizationId}
          verified={!!verified}
          close={() => {
            console.log(
              "Changed verified of organization with ID: ",
              organizationId
            );
            setIsOpen(false);
            reload?.();
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

// Define the form schema using Zod
const formSchema = z.object({
  verified: z.boolean(),
});

// TypeScript interface for the form data based on the schema
type FormData = z.infer<typeof formSchema>;

interface VerifyOrganizationFormProps {
  organizationId: string;
  verified: boolean;
  close: () => void;
}
const VerifyOrganizationForm = ({
  organizationId,
  verified,
  close,
}: VerifyOrganizationFormProps) => {
  const t = useTranslations();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { verified },
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data);
    try {
      const res = await verifyOrganization({
        organizationId,
        verified: data.verified,
      });
      console.log(res);
      if (res.error) {
        toast({
          variant: "destructive",
          title: t("error-occured"),
          description: res.error.message,
        });
      } else {
        close();
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          variant: "destructive",
          title: t("error-occured"),
          description: error.message,
        });
      } else {
        const e = String(error);
        toast({
          variant: "destructive",
          title: t("error-unknown", { error: e }),
        });
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <DialogHeader>
          <DialogTitle>{t("verify-organization")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name={"verified"}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    {t("verify-organization")}
                  </FormLabel>
                  <FormDescription>
                    {t("verify-organization-text")}
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="submit">{t("save")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
