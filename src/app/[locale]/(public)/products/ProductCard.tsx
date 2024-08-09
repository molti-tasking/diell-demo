import { Product } from "@/actions/product";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@/navigation";
import { getFormatter } from "next-intl/server";

export const ProductCard = async ({ product }: { product: Product }) => {
  const f = await getFormatter();

  const href = `/products/${product.slug}`;
  return (
    <Link href={href}>
      <Card>
        <CardHeader>
          <CardTitle>{product.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardTitle>{product.title}</CardTitle>
          {f.dateTime(new Date(product.created_at), {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </CardContent>
      </Card>
    </Link>
  );
};
