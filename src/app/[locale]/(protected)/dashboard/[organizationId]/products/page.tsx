import { getProductsByOrg } from "@/actions/product";
import { CreateProductDialog } from "@/components/admin/CreateProductDialog";
import Breadcrumbs from "@/components/ui/breadcrumbs";
import Link from "next/link";

type Params = {
  params: {
    organizationId: string;
  };
};

export default async function ProductsPage({
  params: { organizationId },
}: Params) {
  const { data: products } = await getProductsByOrg(organizationId);
  const links = [
    {
      label: "Home",
      asChild: true,
      link: `/dashboard/${organizationId}`,
    },
  ];

  return (
    <div>
      <Breadcrumbs links={links} />

      <div className="flex flex-row items-center justify-between">
        <h3 className="text-2xl font-bold my-4">Your products</h3>
        <CreateProductDialog organizationId={organizationId} />
      </div>
      <div>
        {products?.map((product) => (
          <div key={product.id} className="p-4 my-4 bg-slate-400 rounded-xl">
            <Link href={`/dashboard/${organizationId}/products/${product.id}`}>
              {product.title}
            </Link>
          </div>
        ))}
      </div>
      <p>Product details</p>
    </div>
  );
}
