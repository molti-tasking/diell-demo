"use client";
import { createOrganization } from "@/actions/organization";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "../ui/use-toast";

interface CreateOrganizationDialogProps {
  reload?: () => void;
}

export const CreateOrganizationDialog = ({
  reload,
}: CreateOrganizationDialogProps) => {
  const t = useTranslations();
  const [open, setIsOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <PlusIcon />
          {t("create-organization")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <CreateOrganizationDialogForm
          close={() => {
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
  name: z.string().min(1, "validation-title-required"),
});

// TypeScript interface for the form data based on the schema
type FormData = z.infer<typeof formSchema>;

const CreateOrganizationDialogForm = ({ close }: { close: () => void }) => {
  const t = useTranslations();
  const { push } = useRouter();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data);
    try {
      const res = await createOrganization({ name: data.name });
      if (res.error) {
        toast({
          variant: "destructive",
          title: t("error-occured"),
          description: res.error.message,
        });
      } else {
        toast({ title: t("successfully-updated") });
        close();
        const orgId = res.data?.[0]?.id;
        if (orgId) {
          push(`/dashboard/${orgId}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
        toast({
          variant: "destructive",
          title: t("error-occured"),
          description: error.message,
        });
      } else {
        toast({
          variant: "destructive",
          title: t("error-unknown"),
          description: String(error),
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
          <DialogTitle>{t("create-organization")}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("name")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("name")} {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <DialogFooter>
          <Button type="submit">{t("create-organization")}</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
