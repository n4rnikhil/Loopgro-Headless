import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getCategoryProducts, getShopifyCollections } from "@/app/actions";
import { getCollections } from "@/lib/shopify";
import {
  ProductsSkeleton,
  GridProducts,
  ProductItem,
} from "@/components/products";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";

interface Props {
  params: Promise<{
    category: string;
  }>;
}

export async function generateStaticParams() {
  const collections = await getCollections();
  return [
    { category: "products" },
    ...collections.map((col) => ({ category: col.handle })),
  ];
}

export async function generateMetadata({ params }: Props) {
  const { category } = await params;
  const capitalizedCategory = capitalizeFirstLetter(category.replace("-", " "));

  return {
    title: capitalizedCategory,
    description: `Shop our premium selection of ${capitalizedCategory} at Loopgro Store.`,
  };
}

async function DynamicCategoryContent({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  
  const collections = await getShopifyCollections();
  const allowedCategories = ["products", ...collections.map((col) => col.handle)];
  if (!allowedCategories.includes(category)) {
    notFound();
  }

  return <CategoryProducts category={category} />;
}

const CategoryPage = async ({ params }: Props) => {
  return (
    <section className="pt-14">
      <Suspense fallback={<ProductsSkeleton items={6} />}>
        <DynamicCategoryContent params={params} />
      </Suspense>
    </section>
  );
};

const CategoryProducts = async ({
  category,
}: {
  category: string;
}) => {
  const products = await getCategoryProducts(category);

  return (
    <GridProducts>
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </GridProducts>
  );
};

export default CategoryPage;
