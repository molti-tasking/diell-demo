import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { FAQSection } from "./FAQSection";

export default async function Home() {
  const t = await getTranslations();
  return (
    <div className="container">
      <div className="mb-8 flex flex-row gap-4">
        <Button asChild>
          <Link href={"/products"}>{t("browse-products")}</Link>
        </Button>

        <Button asChild>
          <Link href={"/auth/login"}>{t("go-to-sign-in")}</Link>
        </Button>
      </div>
      <FAQSection />
    </div>
  );
}
