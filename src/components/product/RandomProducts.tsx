import { getRandomProducts } from "@/app/actions";
import { GridProducts } from "../products/GridProducts";
import { ProductItem } from "../products/ProductItem";
import { ProductsSkeleton } from "../products/ProductsSkeleton";
import { Suspense } from "react";

export const RandomProducts = async ({
  handleToExclude,
  showTitle = true,
}: {
  handleToExclude: string;
  showTitle?: boolean;
}) => {
  const randomProducts = await getRandomProducts(handleToExclude);

  return (
    <>
      {showTitle && (
        <h2 className="mt-24 mb-5 text-xl font-bold sm:text-2xl">
          YOU MIGHT ALSO LIKE...
        </h2>
      )}
      <GridProducts className="grid-cols-auto-fill-110">
        {randomProducts.map((p) => (
          <ProductItem key={p.id} product={p} />
        ))}
      </GridProducts>
    </>
  );
};

export const SuspenseRandomProducts = async ({
  handleToExclude,
  showTitle = true,
}: {
  handleToExclude: string;
  showTitle?: boolean;
}) => {
  return (
    <Suspense
      fallback={
        <>
          {showTitle && (
            <h2 className="mt-24 mb-5 text-xl font-bold sm:text-2xl">
              YOU MIGHT ALSO LIKE...
            </h2>
          )}
          <ProductsSkeleton extraClassname={"colums-mobile"} items={6} />
        </>
      }
    >
      <RandomProducts
        handleToExclude={handleToExclude}
        showTitle={showTitle}
      />
    </Suspense>
  );
};
