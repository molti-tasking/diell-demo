"use client";
import { COOKIE_CONSENT_KEY } from "@/lib/util/tracking";
import { useTranslations } from "next-intl";
import Link from "next/link";
import CookieConsent from "react-cookie-consent";
import { Button } from "./ui/button";

export const CookieConsentBanner = () => {
  const t = useTranslations();
  return (
    <CookieConsent
      cookieName={COOKIE_CONSENT_KEY}
      containerClasses={
        "rounded-3xl overflow-hidden fixed z-40 flex flex-col justify-between bg-primary/20 text-[#828282] text-lg mx-4 md:mx-0 shadow-[0_0_16px_4px_rgba(0,0,0,0.1)] bottom-2.5 sm:m-0 p-4 sm:left-1/2 sm:transform sm:translate-x-[-50%]"
      }
      buttonText={t("alright")}
      buttonWrapperClasses={"flex flex-row-reverse"}
      disableStyles
      location="none"
      ButtonComponent={Button}
    >
      <span>{t("cookie-banner-text")}</span>

      <span className="md:pl-4 block md:inline">
        <Link
          href="/datenschutz"
          target="_blank"
          className="text-sm text-primary hover:underline text-pretty"
        >
          {t("go-to-privacy-notice")}
        </Link>
      </span>
    </CookieConsent>
  );
};
