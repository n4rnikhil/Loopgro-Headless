"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getShopifyCart,
  createShopifyCart,
  addToShopifyCart,
  removeFromShopifyCart,
  updateShopifyCartItem,
  applyShopifyCartDiscount,
} from "@/app/actions";
import type { Cart, CartItem } from "@/lib/shopify";

const CART_ID_KEY = "shopify_cart_id";

export function getLocalCartId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CART_ID_KEY);
}

export function setLocalCartId(id: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_ID_KEY, id);
}

export function clearLocalCartId() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CART_ID_KEY);
}

export const useCartDetails = () => {
  const query = useQuery({
    queryKey: ["shopify-cart"],
    queryFn: async (): Promise<Cart> => {
      const cartId = getLocalCartId();
      if (!cartId) {
        return {
          id: "",
          checkoutUrl: "",
          totalPrice: 0,
          totalQuantity: 0,
          items: [],
        };
      }

      const cart = await getShopifyCart(cartId);
      if (!cart) {
        // If cart expired or invalid in Shopify, clear local state
        clearLocalCartId();
        return {
          id: "",
          checkoutUrl: "",
          totalPrice: 0,
          totalQuantity: 0,
          items: [],
        };
      }

      return cart;
    },
  });

  return {
    ...query,
    items: query.data?.items ?? [],
    checkoutUrl: query.data?.checkoutUrl,
    totalPrice: query.data?.totalPrice ?? 0,
    totalQuantity: query.data?.totalQuantity ?? 0,
    discountCodes: query.data?.discountCodes ?? [],
  };
};

export const useCart = () => {
  const { items, isFetching, refetch } = useCartDetails();

  return {
    items,
    isFetching,
    refetch,
  };
};

export const useCartMutation = () => {
  const queryClient = useQueryClient();

  const addMutation = useMutation({
    mutationFn: async (params: { variantId: string; quantity: number }) => {
      const { variantId, quantity } = params;
      const cartId = getLocalCartId();

      if (!cartId) {
        const newCart = await createShopifyCart(variantId, quantity);
        setLocalCartId(newCart.id);
        return newCart;
      } else {
        return await addToShopifyCart(cartId, variantId, quantity);
      }
    },
    onSuccess: () => {
      toast.success("Added to cart");
      void queryClient.invalidateQueries({ queryKey: ["shopify-cart"] });
    },
    onError: (error) => {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (params: { itemId: string; quantity: number }) => {
      const { itemId, quantity } = params;
      const cartId = getLocalCartId();
      if (!cartId) throw new Error("Cart not found");

      return await updateShopifyCartItem(cartId, itemId, quantity);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shopify-cart"] });
    },
    onError: (error) => {
      console.error("Error updating cart:", error);
      toast.error("Failed to update cart quantity");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (params: { itemId: string }) => {
      const { itemId } = params;
      const cartId = getLocalCartId();
      if (!cartId) throw new Error("Cart not found");

      return await removeFromShopifyCart(cartId, [itemId]);
    },
    onSuccess: () => {
      toast.success("Removed from cart");
      void queryClient.invalidateQueries({ queryKey: ["shopify-cart"] });
    },
    onError: (error) => {
      console.error("Error removing from cart:", error);
      toast.error("Failed to remove item from cart");
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      clearLocalCartId();
      return true;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["shopify-cart"] });
    },
  });

  const discountMutation = useMutation({
    mutationFn: async (params: { discountCodes: string[] }) => {
      const { discountCodes } = params;
      const cartId = getLocalCartId();
      if (!cartId) throw new Error("Cart not found");

      return await applyShopifyCartDiscount(cartId, discountCodes);
    },
    onSuccess: (data) => {
      const code = data.discountCodes?.[0];
      if (code && code.applicable) {
        toast.success(`Discount "${code.code}" applied!`);
      } else if (code && !code.applicable) {
        toast.error(`Discount code "${code.code}" is invalid or does not apply.`);
      } else {
        toast.success("Discount code updated");
      }
      void queryClient.invalidateQueries({ queryKey: ["shopify-cart"] });
    },
    onError: (error) => {
      console.error("Error applying discount:", error);
      toast.error("Failed to update discount");
    },
  });

  return {
    add: addMutation.mutate,
    update: updateMutation.mutate,
    remove: removeMutation.mutate,
    clear: clearMutation.mutate,
    applyDiscount: discountMutation.mutate,
    isAdding: addMutation.isPending,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    isApplyingDiscount: discountMutation.isPending,
  };
};
