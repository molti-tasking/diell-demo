import { getProductBySlug } from "@/actions/product";
import { getTranslations } from "next-intl/server";

type Params = {
  params: {
    slug: string;
  };
};
export default async function ProductDetailPage({ params }: Readonly<Params>) {
  const t = await getTranslations();
  const { data, error } = await getProductBySlug(params.slug);
  if (error) {
    console.log("Error to load product: ", error);
  }
  return (
    <div>
      <h1 className="text-3xl">{t("product-detail")}</h1>
      <p>{data?.title}</p>
    </div>
  );
}
