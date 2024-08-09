import { getProductById } from "@/actions/product";
import Breadcrumbs from "@/components/ui/breadcrumbs";

type Params = {
  params: {
    productId: string;
    organizationId: string;
  };
};

export default async function ProductPage({
  params: { productId, organizationId },
}: Params) {
  const { data: product } = await getProductById(productId);
  const links = [
    {
      label: "Home",
      asChild: true,
      link: `/dashboard/${organizationId}`,
    },
  ];

  if (!product) {
    return <p>Product not found</p>;
  }

  return (
    <div>
      <Breadcrumbs links={links} />
      <div className="my-2">
        <h1 className="text-3xl font-bold text-gray-800">{product.title}</h1>
      </div>
      <p>Product details</p>
    </div>
  );
}
