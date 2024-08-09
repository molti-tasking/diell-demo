"use server";
import { getTranslations } from "next-intl/server";
import { ResendConfirmationMail } from "./ResendConfirmationMail";

type Params = {
  searchParams: {
    email?: string;
  };
};

export default async function VerifyMailPage({ searchParams }: Params) {
  const t = await getTranslations();
  return (
    <div className="flex-1 flex flex-col justify-center items-center">
      <div className="w-80">
        <p className="text-center">{t("verify-email-text")}</p>
      </div>
      {!!searchParams.email && (
        <div className="flex-1 flex flex-col justify-center my-4">
          <ResendConfirmationMail email={searchParams.email} />
        </div>
      )}
    </div>
  );
}
