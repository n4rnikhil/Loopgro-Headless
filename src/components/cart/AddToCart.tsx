"use client";

import { useRef } from "react";

import { useThrottleFn } from "ahooks";

import { useCartMutation } from "@/hooks/cart";
import { type ProductVariantGroup, type ProductWithVariants } from "@/lib/shopify";

import { Button } from "@/components/ui/button";

import { Colors } from "./Colors";
import { Sizes, type SizesRef } from "./Sizes";

interface BaseAddToCartProps {
  product: ProductWithVariants;
  selectedVariant?: ProductVariantGroup;
}

function useAddToCartAction(product: ProductWithVariants, selectedVariant?: ProductVariantGroup) {
  const { add: addToCart } = useCartMutation();
  const sizesRef = useRef<SizesRef>(null!);

  const { run: throttledAddToCart } = useThrottleFn(
    () => {
      if (!selectedVariant) return;

      const selectedSize = sizesRef.current.selectedSize;
      const variantId = selectedVariant.sizeToVariantId[selectedSize] || selectedVariant.id;

      addToCart({
        variantId,
        quantity: 1,
      });
    },
    { wait: 300 },
  );

  return {
    sizesRef,
    throttledAddToCart,
    isDisabled: !selectedVariant,
  };
}

export function AddToCart({
  product,
  selectedVariant,
}: BaseAddToCartProps) {
  const { sizesRef, throttledAddToCart, isDisabled } =
    useAddToCartAction(product, selectedVariant);

  return (
    <>
      <div className="p-5">
        <Sizes ref={sizesRef} productSizes={selectedVariant?.sizes ?? []} />
        <Colors
          variants={product.variants}
          selectedVariantColor={selectedVariant?.color}
        />
      </div>

      <div className="border-t border-solid border-border-primary">
        <Button
          type="button"
          variant="default"
          disabled={isDisabled}
          onClick={() => throttledAddToCart()}
          className="w-full rounded-none bg-background-secondary p-2 text-13 transition duration-150 ease hover:bg-background-tertiary"
        >
          Add to cart
        </Button>
      </div>
    </>
  );
}

export function MobileAddToCart({
  product,
  selectedVariant,
}: BaseAddToCartProps) {
  const { sizesRef, throttledAddToCart, isDisabled } =
    useAddToCartAction(product, selectedVariant);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3.5">
        <Sizes
          ref={sizesRef}
          productSizes={selectedVariant?.sizes ?? []}
          compact
        />
        <Colors
          variants={product.variants}
          selectedVariantColor={selectedVariant?.color}
          compact
        />
      </div>

      <Button
        type="button"
        variant="default"
        disabled={isDisabled}
        onClick={() => throttledAddToCart()}
        className="w-full rounded-md bg-white py-3 text-sm font-medium text-black transition-colors hover:bg-gray-100"
      >
        Add to cart
      </Button>
    </div>
  );
}
