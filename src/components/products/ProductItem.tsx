/** COMPONENTS */
import { ProductImage } from "./ProductImage";
import Link from "next/link";
/** FUNCTIONALITY */
import { cn } from "@/lib/utils";
/** TYPES */
import type { ProductWithVariants } from "@/lib/shopify";

interface ProductItemProps {
  product: ProductWithVariants;
}

export const ProductItem = ({ product }: ProductItemProps) => {
  const { name, handle, img, price, category, variants } = product;

  const colorQuery = variants[0]?.color ? `?variant=${encodeURIComponent(variants[0].color)}` : "";
  const productLink = `/${category}/${handle}${colorQuery}`;

  return (
    <div className="flex flex-col justify-between border border-solid border-border-primary rounded-md overflow-hidden">
      <Link href={productLink} className={cn("hover:scale-105 transition-all")}>
        <ProductImage
          image={img}
          name={name}
          width={280}
          height={425}
          sizes="(max-width: 640px) 100vw, (max-width: 1154px) 33vw, (max-width: 1536px) 25vw, 20vw"
        />
      </Link>
      <div className="flex justify-between flex-col gap-2.5 p-3.5 bg-background-secondary z-10">
        <div className="flex justify-between w-full">
          <Link href={productLink} className="w-10/12">
            <h2 className="text-sm font-semibold truncate">{name}</h2>
          </Link>
        </div>
        <div className="text-sm">{price.toFixed(2)} €</div>
      </div>
    </div>
  );
};
