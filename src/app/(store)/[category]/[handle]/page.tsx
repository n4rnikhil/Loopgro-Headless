import { Suspense } from "react";
import { notFound } from "next/navigation";

import {
  SingleProduct,
  SingleProductSkeleton,
  SuspenseRandomProducts,
} from "@/components/product";
import { getAllProducts, getProduct } from "@/app/actions";
import { pickFirst } from "@/utils/pickFirst";
import { capitalizeFirstLetter } from "@/utils/capitalizeFirstLetter";

type PageProps = {
  params: Promise<{ handle: string; category: string }>;
  searchParams: Promise<{ variant: string | undefined }>;
};

export async function generateStaticParams() {
  const products = await getAllProducts();

  return products.map((product) => ({
    category: product.category,
    handle: product.handle,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { handle } = await params;
  const product = await getProduct(handle);

  if (!product) {
    return {
      title: "Product not found",
      description: "The requested product is not available.",
    };
  }

  return {
    title: capitalizeFirstLetter(product.name),
    description: product.description,
  };
}

async function DynamicProductContent({
  params,
  searchParams,
}: {
  params: Promise<{ handle: string; category: string }>;
  searchParams: Promise<{ variant: string | undefined }>;
}) {
  const [{ handle, category }, sp] = await Promise.all([params, searchParams]);
  const selectedVariantColor = pickFirst(sp, "variant");

  return (
    <>
      <SingleProduct
        handle={handle}
        category={category}
        selectedVariantColor={selectedVariantColor}
      />
      <SuspenseRandomProducts handleToExclude={handle} />
    </>
  );
}

export default async function ProductPage({ params, searchParams }: PageProps) {
  return (
    <section className="pt-14">
      <Suspense fallback={<SingleProductSkeleton />}>
        <DynamicProductContent params={params} searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
