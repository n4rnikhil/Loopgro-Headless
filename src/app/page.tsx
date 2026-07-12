import { Suspense } from "react";
import { getAllProducts } from "./actions";
import {
  ProductsSkeleton,
  GridProducts,
  ProductItem,
} from "@/components/products";
import { HeroSlider } from "@/components/ui/HeroSlider";

const Home = async () => {
  return (
    <section className="pt-6 pb-24">
      <HeroSlider />

      <div className="pt-16 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-border-primary pb-5 mb-10 gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-wider uppercase text-white">
              FEATURED PRODUCTS
            </h2>
            <p className="text-sm text-color-secondary mt-1">
              Handpicked snowboards and custom winter accessories from our warehouse.
            </p>
          </div>
          <span className="text-xs font-semibold text-color-secondary uppercase tracking-[0.2em]">
            Shopify Storefront API Live
          </span>
        </div>

        <Suspense fallback={<ProductsSkeleton items={18} />}>
          <AllProducts />
        </Suspense>
      </div>
    </section>
  );
};

const AllProducts = async () => {
  const products = await getAllProducts();

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <h2 className="text-xl font-bold">No products available</h2>
        <p className="mt-2 text-gray-600">
          Check back later to see our products
        </p>
      </div>
    );
  }

  return (
    <GridProducts>
      {products.map((product) => (
        <ProductItem key={product.id} product={product} />
      ))}
    </GridProducts>
  );
};

export default Home;
