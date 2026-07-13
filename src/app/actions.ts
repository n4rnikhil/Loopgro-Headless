"use server";

import { cacheLife, cacheTag, updateTag } from "next/cache";
import {
  getProducts,
  getCollections,
  getCollectionProducts,
  getProductByHandle,
  type ProductWithVariants,
  createCart,
  getCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  updateCartDiscount,
  type Cart,
} from "@/lib/shopify";

export async function getShopifyCollections(): Promise<{ handle: string; title: string }[]> {
  "use cache";
  cacheTag("collections");
  cacheLife("hours");

  try {
    return await getCollections();
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}

/**
 * Fetch all products with caching
 */
export async function getAllProducts(): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products");
  cacheLife("hours");

  try {
    const products = await getProducts();
    return products.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

/**
 * Fetch products by category/collection with caching
 */
export async function getCategoryProducts(
  category: string
): Promise<ProductWithVariants[]> {
  "use cache";
  cacheTag("products", `category-${category}`);
  cacheLife("hours");

  try {
    const products = category === "products"
      ? await getProducts()
      : await getCollectionProducts(category);
    return products.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error fetching category products:", error);
    return [];
  }
}

/**
 * Fetch a single product by Handle with caching
 */
export async function getProduct(
  handle: string
): Promise<ProductWithVariants | null> {
  "use cache";
  cacheTag("products", `product-${handle}`);
  cacheLife("hours");

  try {
    return await getProductByHandle(handle);
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

/**
 * Fetch random products excluding a specific product
 */
export async function getRandomProducts(
  handleToExclude: string
): Promise<ProductWithVariants[]> {
  try {
    const allProducts = await getAllProducts();
    const filtered = allProducts.filter((p) => p.handle !== handleToExclude);
    const shuffled = filtered.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 6);
  } catch (error) {
    console.error("Error fetching random products:", error);
    return [];
  }
}

/**
 * Invalidates all product caches immediately
 */
export async function revalidateProducts(handle?: string): Promise<void> {
  updateTag("products");
  if (handle) {
    updateTag(`product-${handle}`);
  }
}

// Cart Server Actions
export async function getShopifyCart(cartId: string): Promise<Cart | null> {
  try {
    return await getCart(cartId);
  } catch (error) {
    console.error("Error in getShopifyCart:", error);
    return null;
  }
}

export async function createShopifyCart(
  variantId: string,
  quantity: number
): Promise<Cart> {
  return await createCart(variantId, quantity);
}

export async function addToShopifyCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<Cart> {
  return await addToCart(cartId, variantId, quantity);
}

export async function removeFromShopifyCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  return await removeFromCart(cartId, lineIds);
}

export async function updateShopifyCartItem(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  return await updateCartItem(cartId, lineId, quantity);
}

export async function applyShopifyCartDiscount(
  cartId: string,
  discountCodes: string[]
): Promise<Cart> {
  return await updateCartDiscount(cartId, discountCodes);
}

import { createAdminOrder } from "@/lib/shopify";

export interface CheckoutInput {
  email: string;
  firstName: string;
  lastName: string;
  address1: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
}

export async function submitCheckoutAction(
  cartId: string,
  shippingAddress: CheckoutInput
): Promise<{ success: boolean; orderName?: string; error?: string }> {
  try {
    const cart = await getCart(cartId);
    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Cart is empty or not found." };
    }

    const lineItems = cart.items.map((item) => ({
      variantId: item.variant.id,
      quantity: item.quantity,
    }));

    const orderResult = await createAdminOrder(
      lineItems,
      shippingAddress,
      shippingAddress.email
    );

    return {
      success: true,
      orderName: orderResult.orderName,
    };
  } catch (error: any) {
    console.error("Checkout server action error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during checkout.",
    };
  }
}
