import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { ReactQueryClientProvider } from "@/components/ReactQueryClientProvider";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/util/cn";
import { COOKIE_CONSENT_KEY } from "@/lib/util/tracking";
import { GoogleTagManager } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";
import { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { radioCanada } from "./fonts";
import "./globals.css";

const hasCookieConsent = () => {
  const cookieConsentValue = cookies().get(COOKIE_CONSENT_KEY)?.value;
  return cookieConsentValue !== "false";
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations();
  const title = t("seo-title");
  const description = t("seo-description");
  return { title, description };
}

export default async function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  const hasTrackingConsent = hasCookieConsent();

  const googleTagManagerId = process.env.GOOGLE_TAG;

  return (
    <ReactQueryClientProvider>
      <html lang={locale}>
        {/* <body className="min-h-screen flex flex-col items-center bg-gray-50"> */}

        {hasTrackingConsent && googleTagManagerId && (
          <GoogleTagManager gtmId={googleTagManagerId} />
        )}
        <body className={cn(radioCanada.className, "text-muted-foreground")}>
          <NextIntlClientProvider messages={messages}>
            <CookieConsentBanner />
            {children}
            <Toaster />
            <Analytics />
          </NextIntlClientProvider>
        </body>
      </html>
    </ReactQueryClientProvider>
  );
}
