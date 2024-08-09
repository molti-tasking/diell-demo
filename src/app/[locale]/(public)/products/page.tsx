import { getProducts } from "@/actions/product";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import { getTranslations } from "next-intl/server";
import { ProductCard } from "./ProductCard";

type Params = {
  searchParams: {
    category?: string;
  };
};

export default async function KindergardenSearchPage({ searchParams }: Params) {
  const t = await getTranslations();

  const { data: products, error } = await getProducts({
    category: searchParams.category,
  });
  if (error) {
    console.log("Error to load products: ", error);
  }
  const links = [
    {
      label: t("home"),
      asChild: true,
      link: "/",
    },
    {
      label: t("search-results"),
      asChild: false,
    },
  ];
  return (
    <div>
      <div className="mb-16 container">
        <Breadcrumbs links={links} />

        {error && <p>{error.message}</p>}

        {products?.length ? (
          <div className="flex flex-row flex-wrap">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p>No products found</p>
        )}
      </div>
    </div>
  );
}
