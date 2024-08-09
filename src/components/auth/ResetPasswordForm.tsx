"use client";
import { resetPassword } from "@/actions/auth";
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
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";

const resetPasswordFormSchema = z.object({ email: z.string().email() });

type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

export const ResetPasswordForm = ({
  initialEmail,
}: {
  initialEmail?: string;
}) => {
  const t = useTranslations();
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    values: { email: initialEmail ?? "" },
  });
  const [isPending, startTransition] = useTransition();

  async function onSubmit(data: ResetPasswordFormValues) {
    startTransition(async () => {
      try {
        const res = await resetPassword(data.email);
        if (res.error) {
          toast({
            title: t("error-occured"),
            variant: "destructive",
            description: res.error.message,
          });
        } else {
          toast({
            title: "Please check your mails...",
            variant: "default",
          });
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Your Email"
                    {...field}
                    disabled={!!initialEmail}
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
