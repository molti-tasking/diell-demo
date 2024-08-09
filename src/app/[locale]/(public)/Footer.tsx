import { SelectLanguage } from "@/components/SelectLanguage";
import { Link } from "@/navigation";
import { HomeIcon, MailIcon, PhoneIcon } from "lucide-react";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export const Footer = async () => {
  const categories = [
    ["Emergency", "Cardiology", "Another"],
    ["Emergency", "Cardiology", "Another"],
    ["Emergency", "Cardiology", "Another"],
  ];
  const t = await getTranslations();
  return (
    <footer className="flex flex-col items-center bg-secondary text-secondary-foreground">
      <div className="container text-left py-10">
        <div className="flex flex-col md:flex-row gap-16 md:gap-4 justify-between">
          <div className="flex-1 flex flex-col gap-4 justify-between">
            <Image
              src={"/company-logo.png"}
              alt="Our Company Logo"
              height={48}
              width={148}
            />
          </div>
          <div className="flex flex-row gap-4 w-full flex-[2]">
            <div className="flex-1">
              <h6 className="mb-4 flex font-semibold justify-start">
                {t("useful-links")}
              </h6>
              <div>
                <ul className="mb-0 list-none space-y-1">
                  <li>
                    <Link href="/">{t("home")}</Link>
                  </li>

                  <li>
                    <Link href="/about">{t("about")}</Link>
                  </li>

                  <li>
                    <Link href="/products">{t("browse-products")}</Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex-1">
              <h6 className="mb-4 flex font-semibold justify-start">
                {t("legal")}
              </h6>
              <div>
                <ul className="mb-0 list-none space-y-1">
                  <li>
                    <Link href="/datenschutz">{t("privacy")}</Link>
                  </li>
                  {/* <li>
              <Link href="/terms">{t("terms")}</Link>
            </li> */}
                  <li>
                    <Link href="/impressum">{t("imprint")}</Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="flex-1">
            <h6 className="mb-4 flex font-semibold">{t("contact")}</h6>

            <p className="mb-4 flex items-center gap-4">
              <HomeIcon size="1rem" />
              Street 12, 1234 City
            </p>
            <p className="mb-4 flex items-center gap-4">
              <MailIcon size="1rem" />
              kontakt@email.com
            </p>
            <p className="mb-4 flex items-center gap-4">
              <PhoneIcon size="1rem" />
              +12 1234 123456
            </p>
            <SelectLanguage />
          </div>
        </div>
      </div>
      {/* Divider */}
      <div className="border-b border-secondary-foreground/50 my-12 w-full"></div>
      {/* Seo Links Section */}

      <div className="container">
        <h6 className="my-4 font-semibold">{t("categories")}</h6>
        {/* <div className="grid md:grid-cols-2 lg:grid-cols-4 mb-8"> */}
        <div className="grid-1 grid gap-8 grid-cols-2 lg:grid-cols-4">
          {categories.map((categoryList) => (
            <div className="mb-6" key={categoryList.join("-")}>
              <ul className="mb-0 list-none space-y-1">
                {categoryList.map((category) => (
                  <li key={category}>
                    <a href="#!">{category}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full p-4 text-center">
        <p className="my-2 text-sm">
          {t("company-all-rights-reserved", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
};
