"use client";
import { signUpWithPassword } from "@/actions/auth";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "@/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../ui/button";

const registerFormSchema = z.object({
  // name: z.string().default(""),
  email: z.string().default(""),
  password: z.string().default(""),
});

type RegisterFormValues = z.infer<typeof registerFormSchema>;

type RegisterFormProps = {
  invitationToken?: string;
};

/**
 * This register form registers a user on submit. If an invitation token is given, the user will still only be registered, but he will be forwarded appropriately afterwards.
 *
 * @param invitationToken string
 * @returns
 */
export const RegisterForm = ({ invitationToken }: RegisterFormProps) => {
  const t = useTranslations();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { email: "", password: "" },
  });
  const { push } = useRouter();

  async function onSubmit(data: RegisterFormValues) {
    try {
      const res = await signUpWithPassword({ ...data, invitationToken });
      console.log("Sign up res: ", res);
      if (res.error) {
        toast({
          title: t("error-occured"),
          variant: "destructive",
          description: res.error.message,
        });
      } else {
        if (res.data.user?.email_confirmed_at) {
          push("/dashboard");
        } else {
          push(`/auth/verify-email?email=${data.email}`);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: t("error-occured"),
          variant: "destructive",
          description: error.message,
        });
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          {/* <FormField
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
          /> */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("email")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("email")} {...field} />
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
                  <Input placeholder="password" type="password" {...field} />
                </FormControl>
                <FormDescription>{t("choose-password")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button className="mt-4" variant={"outline"}>
            {t("register")}
          </Button>
        </div>
      </form>
    </Form>
  );
};
