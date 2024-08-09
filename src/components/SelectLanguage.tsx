"use client";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Locale, locales } from "@/i18n";
import { usePathname, useRouter } from "@/navigation";
import { useLocale, useTranslations } from "next-intl";

const options: Locale[] = locales;

export function SelectLanguage() {
  const locale = useLocale() as Locale;
  const t = useTranslations();

  const { push } = useRouter();
  const path = usePathname();

  const onChangeLanguage = (newLocale: Locale) => {
    push(path, { locale: newLocale });
  };

  return (
    <div className="text-foreground">
      <Select defaultValue={locale} onValueChange={onChangeLanguage}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={t("i18n.select")} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {options?.map((lang) => (
              <SelectItem key={lang} value={lang}>
                {t(`i18n.${lang}`)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
