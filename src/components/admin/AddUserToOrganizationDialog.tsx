"use client";
import { addUserToOrganization } from "@/actions/organization";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizations } from "@/lib/hooks/query";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "../ui/use-toast";

export const AddUserToOrganizationDialog = ({
  userId,
  name,
  children,
}: {
  userId: string;
  name: string;
  children: React.ReactNode;
}) => {
  const [open, setIsOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant={"outline"}>
            <PlusIcon />
            Invite user to organization
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <AddUserToOrganizationDialogContent
          userId={userId}
          name={name}
          close={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
};

const FormSchema = z.object({
  orgId: z.string(),
});

const AddUserToOrganizationDialogContent = ({
  userId,
  name,
  close,
}: {
  userId: string;
  name: string;
  close: () => void;
}) => {
  const t = useTranslations();
  const { data } = useOrganizations();
  const organizations = data?.data;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log("addUserToOrganization: ", data, userId);
    try {
      const res = await addUserToOrganization(userId, data.orgId);
      if (res.error) {
        toast({
          variant: "destructive",
          title: t("error-occured"),
          description: res.error.message,
        });
      } else {
        toast({
          title: "Successfully created organization.",
          description: "Please reload page.",
        });
        close();
      }
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert(`Unknown error: ${error}`);
      }
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <DialogHeader>
          <DialogTitle>Add user to organization</DialogTitle>
          <DialogDescription>
            Choose the organization you want to add the following user to:{" "}
            {name}
          </DialogDescription>
        </DialogHeader>
        <FormField
          control={form.control}
          name="orgId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an organization for the user" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {organizations?.map((org) => (
                    <SelectItem key={org.id!} value={org.id!}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <FormMessage />
            </FormItem>
          )}
        />

        <DialogFooter>
          <Button>Add user</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
