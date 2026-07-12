"use client";

import Link from "next/link";
import { useState } from "react";

import { useCartDetails, useCartMutation } from "@/hooks/cart";
import { SVGLoadingIcon } from "@/components/ui/loader";

import { ButtonCheckout } from "./ButtonCheckout";
import { CartProduct } from "./CartProduct";
import { GridProducts } from "../products/GridProducts";

export const CartProducts = () => {
  const { items, isPending, checkoutUrl, totalPrice, discountCodes } = useCartDetails();
  const { applyDiscount, isApplyingDiscount } = useCartMutation();
  const [discountInput, setDiscountInput] = useState("");

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discountInput.trim()) return;
    applyDiscount({ discountCodes: [discountInput.trim()] });
    setDiscountInput("");
  };

  const handleRemoveDiscount = () => {
    applyDiscount({ discountCodes: [] });
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-91px)]">
        <SVGLoadingIcon height={30} width={30} />
      </div>
    );
  }

  if (items && items.length > 0) {
    const formattedTotalPrice = totalPrice ? totalPrice.toFixed(2) : "0.00";

    return (
      <div className="pt-12 px-4 max-w-[1200px] mx-auto pb-32">
        <h2 className="mb-5 text-xl font-bold sm:text-2xl uppercase tracking-wider">
          YOUR SHOPPING CART
        </h2>
        <GridProducts className="grid-cols-1">
          {items.map(({ id, product, size, quantity, variant }) => (
            <CartProduct
              key={id}
              product={product}
              cartItemId={id}
              size={size}
              quantity={quantity}
              variant={variant}
            />
          ))}
        </GridProducts>

        {/* Promo Discount Code Area */}
        <div className="mt-8 max-w-md bg-background-secondary border border-solid border-border-primary rounded-xl p-5">
          <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">Promotional Discount</h3>
          
          <form onSubmit={handleApplyDiscount} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter code (e.g. WELCOME10)"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              disabled={isApplyingDiscount}
              className="flex-1 bg-background-tertiary border border-border-primary px-3 py-2 text-sm text-white rounded-md focus:outline-none focus:border-gray-500 placeholder-color-secondary"
            />
            <button
              type="submit"
              disabled={isApplyingDiscount || !discountInput.trim()}
              className="bg-white text-black px-4 py-2 text-sm font-semibold rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              {isApplyingDiscount ? "Applying..." : "Apply"}
            </button>
          </form>

          {discountCodes && discountCodes.length > 0 && (
            <div className="mt-4 space-y-2">
              <span className="text-xs text-color-secondary block uppercase tracking-wider font-semibold">Active Discounts:</span>
              {discountCodes.map((discount) => (
                <div 
                  key={discount.code} 
                  className={`flex items-center justify-between text-xs p-2.5 rounded border border-solid ${
                    discount.applicable 
                      ? "bg-green-950/20 border-green-800 text-green-400" 
                      : "bg-red-950/20 border-red-900 text-red-400"
                  }`}
                >
                  <span className="font-semibold">{discount.code} {discount.applicable ? "(Applied)" : "(Invalid)"}</span>
                  <button 
                    type="button" 
                    onClick={handleRemoveDiscount} 
                    className="text-color-secondary hover:text-white transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fixed bottom-4 left-[50%] z-10 flex h-min w-[90%] translate-x-[-50%] overflow-hidden rounded-xl border border-solid border-border-primary bg-background-primary sm:w-[360px]">
          <div className="flex w-1/2 flex-col justify-center gap-2 p-2.5 text-center">
            <div className="flex justify-center gap-2.5 text-sm">
              <span>Total:</span>
              <span className="font-bold">{formattedTotalPrice} EUR</span>
            </div>
            <span className="text-xs text-color-secondary">+ TAX INCL.</span>
          </div>
          <div className="w-1/2 border-l border-solid border-border-primary bg-background-secondary">
            <ButtonCheckout checkoutUrl={checkoutUrl} disabled={items.length === 0} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-91px)] w-full flex-col items-center justify-center gap-2 px-4">
      <h1 className="mb-6 text-4xl font-bold tracking-wider">YOUR CART IS EMPTY</h1>
      <p className="mb-4 text-sm text-color-secondary">
        When you have added something to your cart, it will appear here. Want to get started?
      </p>
      <Link
        className="flex h-[40px] min-w-[160px] max-w-[160px] items-center justify-center rounded-md border border-solid border-[#2E2E2E] bg-[#0C0C0C] px-[10px] text-sm font-medium transition-all hover:border-[#454545] hover:bg-background-tertiary"
        href="/"
      >
        Start Shopping
      </Link>
    </div>
  );
};
