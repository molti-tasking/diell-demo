"use client";
import { signInWithPassword } from "@/actions/auth";
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

const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export const LoginForm = () => {
  const t = useTranslations();
  const { push } = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });
  const [isPending, startTransition] = useTransition();

  async function onSubmit(data: LoginFormValues) {
    startTransition(async () => {
      try {
        const res = await signInWithPassword(data);
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("your-email")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("password")}</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder={t("password")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <Link
              href="/auth/reset-password"
              className="ml-auto inline-block text-sm underline"
            >
              {t("forgot-your-password")}
            </Link>
          </div>
          <Button className="mt-4" disabled={isPending} variant={"outline"}>
            {isPending ? t("load") : t("sign-in")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
