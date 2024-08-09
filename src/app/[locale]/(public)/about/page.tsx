import { getTranslations } from "next-intl/server";
import { FAQSection } from "../FAQSection";

export default async function WeAreFamilyPage() {
  const t = await getTranslations();
  return (
    <>
      <div className="container py-16 text-lg">
        <h1 className="text-4xl mt-8 mb-4 font-bold text-primary">
          {t("about")}
        </h1>

        <FAQSection />
      </div>
    </>
  );
}
