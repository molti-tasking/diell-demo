"use client";

import { setNewPassword } from "@/actions/auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Link } from "@/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";

const setNewPasswordFormSchema = z
  .object({
    newPassword: z.string().min(4),
    confirmPassword: z.string().min(4),
  })
  .refine(
    ({ confirmPassword, newPassword }) => confirmPassword === newPassword,
    { message: "Passwords do not match.", path: ["confirmPassword"] }
  );

type SetNewPasswordFormValues = z.infer<typeof setNewPasswordFormSchema>;

export const SetNewPasswordForm = ({ code }: { code: string }) => {
  const t = useTranslations();
  const { push } = useRouter();
  const form = useForm<SetNewPasswordFormValues>({
    resolver: zodResolver(setNewPasswordFormSchema),
  });
  const [isPending, startTransition] = useTransition();
  async function onSubmit(data: SetNewPasswordFormValues) {
    startTransition(async () => {
      try {
        const res = await setNewPassword(code, data.newPassword);
        if (res.error) {
          toast({
            title: t("error-occured"),
            variant: "destructive",
            description: res.error.message,
          });
        } else {
          push("/dashboard");
        }
      } catch (error) {
        console.log("Throws: ", error);
        if (error instanceof Error) {
          toast({
            title: t("error-occured"),
            variant: "destructive",
            description: error.message,
          });
        }
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit, console.log)}>
        <div className="grid gap-2">
          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="New password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="mt-4">{isPending ? "Load" : "Reset"}</Button>
        </div>
      </form>
      <div className="mt-4 text-center text-sm">
        You want to sign in?{" "}
        <Link href="/auth/login" className="underline">
          Sign in
        </Link>
      </div>
    </Form>
  );
};
