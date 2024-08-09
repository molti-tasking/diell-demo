import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

const emailRecipientForm = z.object({
  emailRecipients: z.array(
    z.object({
      email: z.string().email(),
    })
  ),
});

type EmailFormValues = z.infer<typeof emailRecipientForm>;

export const SendEmailInviteForm = ({
  emails,
  onSubmitRecipients,
}: {
  emails: string[];
  onSubmitRecipients: (recipients: string[]) => void;
}) => {
  const t = useTranslations();

  const defaultValues: EmailFormValues = {
    emailRecipients: emails.map((email) => ({ email })) ?? [],
  };

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailRecipientForm),
    defaultValues,
  });
  async function onSubmit(data: EmailFormValues) {
    try {
      onSubmitRecipients(data.emailRecipients.map(({ email }) => email));
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

  const { fields, append, remove } = useFieldArray({
    name: "emailRecipients",
    control: form.control,
  });

  return (
    <Form {...form}>
      <strong className="text-lg">Recipients</strong>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2">
          {fields.map((field, index) => (
            <div key={field.id}>
              <FormField
                control={form.control}
                name={`emailRecipients.${index}.email`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex flex-row gap-4 items-center">
                        <Input
                          className="flex-1"
                          type="email"
                          placeholder={t("email")}
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          {t("remove")}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ))}
        </div>
        <div className="mt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => append({ email: "" })}
          >
            {t("add-item")}
          </Button>
        </div>
        <div className="mt-2 flex flex-row-reverse">
          <Button>{t("send-invite-email")}</Button>
        </div>
      </form>
    </Form>
  );
};
