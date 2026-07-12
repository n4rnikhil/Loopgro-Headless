import { Suspense } from "react";

import { CartProducts } from "@/components/cart";
import { SVGLoadingIcon } from "@/components/ui/loader";

export async function generateMetadata() {
  return {
    title: "Cart | Ecommerce Template",
    description: "View the products saved in your shopping cart.",
  };
}

const CartPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-91px)]">
          <SVGLoadingIcon height={30} width={30} />
        </div>
      }
    >
      <CartProducts />
    </Suspense>
  );
};

export default CartPage;
