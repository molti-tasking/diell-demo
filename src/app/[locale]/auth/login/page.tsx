import { LoginForm } from "@/components/auth/LoginForm";
import { Link } from "@/navigation";
import { getTranslations } from "next-intl/server";

export default async function Login() {
  const t = await getTranslations();
  return (
    <div className="flex-1 flex flex-col w-80 justify-center">
      <h2 className="text-2xl text-center mb-8">{t("sign-in")}</h2>

      <LoginForm />

      <div className="mt-4 text-center text-sm">
        {t("no-account-question")}{" "}
        <Link href="/auth/register" className="underline">
          {t("go-to-sign-up")}
        </Link>
      </div>
    </div>
  );
}
