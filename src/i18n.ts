import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export type Locale = "en";
// Can be imported from a shared config
export const locales: Locale[] = ["en"];

export default getRequestConfig(async (props) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(props.locale as Locale)) notFound();

  return {
    messages: { ...(await import(`../messages/${props.locale}.json`)).default },
  };
});
