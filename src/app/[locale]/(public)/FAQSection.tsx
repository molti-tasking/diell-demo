import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

const questionKeys = [
  1 as const,
  2 as const,
  3 as const,
  4 as const,
  5 as const,
  6 as const,
];

export const FAQSection = async () => {
  const t = await getTranslations();

  return (
    <div className="container flex flex-col md:flex-row items-stretch justify-center gap-8 mt-32 mb-16">
      <div className="flex-[2] flex flex-col-reverse md:flex-col gap-8 md:gap-24">
        <div>
          <h2 className="text-4xl font-bold text-primary mb-4">
            {t("frequent-questions")}
          </h2>

          <div>
            {t("frequent-questions-text")}{" "}
            <a className="text-primary" href="mailto:info@company.com">
              info@company.com
            </a>
          </div>
        </div>

        <div className="relative aspect-square max-h-72">
          <Image
            src={"/landing-page-img/fragen.png"}
            alt="FAQ - Häufige Fragen"
            fill
            objectFit="contain"
          />
        </div>
      </div>

      <div className="flex-[3] flex flex-col gap-4">
        <Accordion type="single" collapsible>
          {questionKeys.map((question) => (
            <div key={question}>
              <AccordionItem
                value={String(question)}
                className="[&[data-state=open]]:bg-primary [&[data-state=open]]:text-primary-foreground"
              >
                <AccordionTrigger>
                  <span className="text-left">{t(`question-${question}`)}</span>
                </AccordionTrigger>
                <AccordionContent>
                  {t(`question-${question}-answer`)}
                </AccordionContent>
              </AccordionItem>
            </div>
          ))}
        </Accordion>
      </div>
    </div>
  );
};
