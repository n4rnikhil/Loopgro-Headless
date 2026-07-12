import { cache } from "react";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const accessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

async function shopifyFetch<T>({
  query,
  variables = {},
  cache = "force-cache",
  tags = [],
}: {
  query: string;
  variables?: any;
  cache?: RequestCache;
  tags?: string[];
}): Promise<{ status: number; body: T }> {
  if (!domain || !accessToken) {
    throw new Error("Missing Shopify Storefront API credentials.");
  }
  const endpoint = `https://${domain}/api/2025-01/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": accessToken,
      },
      body: JSON.stringify({ query, variables }),
      cache,
      next: tags.length ? { tags } : undefined,
    });

    const body = await result.json();

    if (body.errors) {
      throw new Error(body.errors[0].message);
    }

    return {
      status: result.status,
      body,
    };
  } catch (e) {
    console.error("Shopify fetch error:", e);
    throw e;
  }
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: number;
  availableForSale: boolean;
  selectedOptions: {
    name: string;
    value: string;
  }[];
  image?: string;
}

export interface ProductVariantGroup {
  id: string;
  color: string;
  sizes: string[];
  price: number;
  img: string;
  sizeToVariantId: Record<string, string>;
}

export interface ProductWithVariants {
  id: string;
  name: string;
  handle: string;
  description: string;
  img: string;
  images: string[];
  price: number;
  category: string;
  variants: ProductVariantGroup[];
  rawVariants: ShopifyVariant[];
}

// Fallback Product used when keys are not configured or request fails (to allow building without API credentials)
const fallbackProduct: ProductWithVariants = {
  id: "gid://shopify/Product/mock-tshirt",
  name: "Premium Cotton T-Shirt",
  handle: "premium-cotton-t-shirt",
  description: "A premium headless storefront t-shirt mock product. Connect your Shopify Storefront API credentials in the environment variables to load your store's live catalog.",
  img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
  images: [
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800"
  ],
  price: 29.99,
  category: "t-shirts",
  variants: [
    {
      id: "gid://shopify/ProductVariant/mock-variant-black",
      color: "Black",
      sizes: ["S", "M", "L", "XL"],
      price: 29.99,
      img: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800",
      sizeToVariantId: {
        "S": "gid://shopify/ProductVariant/mock-variant-black-s",
        "M": "gid://shopify/ProductVariant/mock-variant-black-m",
        "L": "gid://shopify/ProductVariant/mock-variant-black-l",
        "XL": "gid://shopify/ProductVariant/mock-variant-black-xl",
      }
    },
    {
      id: "gid://shopify/ProductVariant/mock-variant-white",
      color: "White",
      sizes: ["S", "M", "L"],
      price: 27.99,
      img: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800",
      sizeToVariantId: {
        "S": "gid://shopify/ProductVariant/mock-variant-white-s",
        "M": "gid://shopify/ProductVariant/mock-variant-white-m",
        "L": "gid://shopify/ProductVariant/mock-variant-white-l",
      }
    }
  ],
  rawVariants: [
    {
      id: "gid://shopify/ProductVariant/mock-variant-black-s",
      title: "Black / S",
      price: 29.99,
      availableForSale: true,
      selectedOptions: [{ name: "Color", value: "Black" }, { name: "Size", value: "S" }],
      image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800"
    },
    {
      id: "gid://shopify/ProductVariant/mock-variant-white-s",
      title: "White / S",
      price: 27.99,
      availableForSale: true,
      selectedOptions: [{ name: "Color", value: "White" }, { name: "Size", value: "S" }],
      image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800"
    }
  ]
};

const fallbackPants: ProductWithVariants = {
  ...fallbackProduct,
  id: "gid://shopify/Product/mock-pants",
  name: "Slim Fit Chino Pants",
  handle: "slim-fit-chino-pants",
  description: "Classic slim-fit chino trousers ideal for daily lifestyle and casual wear.",
  img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
  images: ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800"],
  price: 49.99,
  category: "pants"
};

const fallbackSweatshirt: ProductWithVariants = {
  ...fallbackProduct,
  id: "gid://shopify/Product/mock-sweatshirt",
  name: "Heavyweight Crewneck Sweatshirt",
  handle: "heavyweight-crewneck-sweatshirt",
  description: "Super soft fleece sweatshirt designed to last.",
  img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
  images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"],
  price: 39.99,
  category: "sweatshirts"
};

const allFallbackProducts = [fallbackProduct, fallbackPants, fallbackSweatshirt];

function mapShopifyProduct(node: any): ProductWithVariants {
  const variants = node.variants?.edges?.map((edge: any) => edge.node) || [];
  const images = node.images?.edges?.map((edge: any) => edge.node?.url).filter(Boolean) || [];
  
  const variantGroups: Record<string, ProductVariantGroup> = {};
  
  variants.forEach((v: any) => {
    const colorOption = v.selectedOptions?.find(
      (opt: any) =>
        opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour"
    );
    const sizeOption = v.selectedOptions?.find(
      (opt: any) => opt.name.toLowerCase() === "size"
    );
    
    const color = colorOption ? colorOption.value : "Default";
    const size = sizeOption ? sizeOption.value : "Default";
    const price = parseFloat(v.price?.amount || v.price || "0");
    const img = v.image?.url || node.images?.edges?.[0]?.node?.url || "";

    if (!variantGroups[color]) {
      variantGroups[color] = {
        id: v.id,
        color,
        sizes: [],
        price,
        img,
        sizeToVariantId: {},
      };
    }
    
    if (!variantGroups[color].sizes.includes(size)) {
      variantGroups[color].sizes.push(size);
    }
    variantGroups[color].sizeToVariantId[size] = v.id;
  });

  const category = node.collections?.edges?.[0]?.node?.handle || "products";

  return {
    id: node.id,
    name: node.title,
    handle: node.handle,
    description: node.description,
    img: node.images?.edges?.[0]?.node?.url || "",
    images: images.length > 0 ? images : [node.images?.edges?.[0]?.node?.url].filter(Boolean),
    price: parseFloat(node.priceRange?.minVariantPrice?.amount || "0"),
    category,
    variants: Object.values(variantGroups),
    rawVariants: variants.map((v: any) => ({
      id: v.id,
      title: v.title,
      price: parseFloat(v.price?.amount || v.price || "0"),
      availableForSale: v.availableForSale,
      selectedOptions: v.selectedOptions || [],
      image: v.image?.url,
    })),
  };
}

// Product Queries
export const getCollections = cache(async (): Promise<{ handle: string; title: string }[]> => {
  const query = `
    query getCollections {
      collections(first: 20) {
        edges {
          node {
            handle
            title
          }
        }
      }
    }
  `;
  try {
    const res = await shopifyFetch<any>({ query, tags: ["collections"] });
    const edges = res.body.data?.collections?.edges || [];
    if (edges.length === 0) {
      return [
        { handle: "t-shirts", title: "T-Shirts" },
        { handle: "pants", title: "Pants" },
        { handle: "sweatshirts", title: "Sweatshirts" }
      ];
    }
    return edges.map((edge: any) => ({
      handle: edge.node.handle,
      title: edge.node.title,
    }));
  } catch (error) {
    console.warn("Failed to fetch collections, using fallbacks:", error);
    return [
      { handle: "t-shirts", title: "T-Shirts" },
      { handle: "pants", title: "Pants" },
      { handle: "sweatshirts", title: "Sweatshirts" }
    ];
  }
});

export const getProducts = cache(async (): Promise<ProductWithVariants[]> => {
  const query = `
    query getProducts {
      products(first: 50) {
        edges {
          node {
            id
            title
            handle
            description
            priceRange {
              minVariantPrice {
                amount
              }
            }
            images(first: 5) {
              edges {
                node {
                  url
                }
              }
            }
            variants(first: 100) {
              edges {
                node {
                  id
                  title
                  availableForSale
                  price {
                    amount
                  }
                  image {
                    url
                  }
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
            collections(first: 1) {
              edges {
                node {
                  handle
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await shopifyFetch<any>({ query, tags: ["products"] });
    const edges = res.body.data?.products?.edges || [];
    if (edges.length === 0) return allFallbackProducts;
    return edges.map((edge: any) => mapShopifyProduct(edge.node));
  } catch (error) {
    console.warn("Failed to fetch products, using fallbacks:", error);
    return allFallbackProducts;
  }
});

export const getProductByHandle = cache(async (
  handle: string
): Promise<ProductWithVariants | null> => {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
          }
        }
        images(first: 10) {
          edges {
            node {
              url
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
              }
              image {
                url
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
        collections(first: 1) {
          edges {
            node {
              handle
            }
          }
        }
      }
    }
  `;

  try {
    const res = await shopifyFetch<any>({
      query,
      variables: { handle },
      tags: [`product-${handle}`],
    });
    const product = res.body.data?.product;
    return product ? mapShopifyProduct(product) : null;
  } catch (error) {
    console.warn(`Failed to fetch product for ${handle}, resolving from mock items:`, error);
    const mock = allFallbackProducts.find((p) => p.handle === handle);
    return mock || null;
  }
});

export const getCollectionProducts = cache(async (
  collectionHandle: string
): Promise<ProductWithVariants[]> => {
  const query = `
    query getCollectionProducts($handle: String!) {
      collection(handle: $handle) {
        products(first: 50) {
          edges {
            node {
              id
              title
              handle
              description
              priceRange {
                minVariantPrice {
                  amount
                }
              }
              images(first: 5) {
                edges {
                  node {
                    url
                  }
                }
              }
              variants(first: 100) {
                edges {
                  node {
                    id
                    title
                    availableForSale
                    price {
                      amount
                    }
                    image {
                      url
                    }
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
              collections(first: 1) {
                edges {
                  node {
                    handle
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await shopifyFetch<any>({
      query,
      variables: { handle: collectionHandle },
      tags: [`collection-${collectionHandle}`],
    });
    const edges = res.body.data?.collection?.products?.edges || [];
    if (edges.length === 0) {
      return allFallbackProducts.filter((p) => p.category === collectionHandle);
    }
    return edges.map((edge: any) => mapShopifyProduct(edge.node));
  } catch (error) {
    console.warn(`Failed to fetch collection for ${collectionHandle}, using mock items:`, error);
    return allFallbackProducts.filter((p) => p.category === collectionHandle);
  }
});

// Cart Queries & Mutations
export interface CartItem {
  id: string;
  quantity: number;
  size: string;
  color: string;
  variant: {
    id: string;
    title: string;
    price: number;
    img: string;
  };
  product: {
    id: string;
    name: string;
    handle: string;
    price: number;
    description: string;
    category: string;
  };
}

export interface Cart {
  id: string;
  checkoutUrl: string;
  totalPrice: number;
  totalQuantity: number;
  items: CartItem[];
  discountCodes?: {
    code: string;
    applicable: boolean;
  }[];
}

function mapShopifyCart(cart: any): Cart {
  const lines = cart?.lines?.edges?.map((edge: any) => edge.node) || [];
  
  const items = lines.map((line: any) => {
    const variant = line.merchandise;
    const product = variant.product;
    
    const colorOption = variant.selectedOptions?.find(
      (opt: any) =>
        opt.name.toLowerCase() === "color" || opt.name.toLowerCase() === "colour"
    );
    const sizeOption = variant.selectedOptions?.find(
      (opt: any) => opt.name.toLowerCase() === "size"
    );
    
    return {
      id: line.id,
      quantity: line.quantity,
      size: sizeOption ? sizeOption.value : "Default",
      color: colorOption ? colorOption.value : "Default",
      variant: {
        id: variant.id,
        title: variant.title,
        price: parseFloat(variant.price?.amount || "0"),
        img: variant.image?.url || product.images?.edges?.[0]?.node?.url || "",
      },
      product: {
        id: product.id,
        name: product.title,
        handle: product.handle,
        price: parseFloat(product.priceRange?.minVariantPrice?.amount || "0"),
        description: product.description,
        category: product.collections?.edges?.[0]?.node?.handle || "products",
      },
    };
  });

  return {
    id: cart.id,
    checkoutUrl: cart.checkoutUrl,
    totalPrice: parseFloat(cart.cost?.totalAmount?.amount || "0"),
    totalQuantity: items.reduce((acc: number, item: any) => acc + item.quantity, 0),
    items,
    discountCodes: cart.discountCodes?.map((d: any) => ({
      code: d.code,
      applicable: d.applicable,
    })) || [],
  };
}

export async function createCart(variantId: string, quantity: number): Promise<Cart> {
  const mutation = `
    mutation cartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart {
          id
          checkoutUrl
          cost {
            totalAmount {
              amount
            }
          }
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                    }
                    image {
                      url
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      id
                      title
                      handle
                      description
                      priceRange {
                        minVariantPrice {
                          amount
                        }
                      }
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                      collections(first: 1) {
                        edges {
                          node {
                            handle
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await shopifyFetch<any>({
    query: mutation,
    variables: {
      input: {
        lines: [
          {
            merchandiseId: variantId,
            quantity,
          },
        ],
      },
    },
    cache: "no-store",
  });

  return mapShopifyCart(res.body.data?.cartCreate?.cart);
}

export async function getCart(cartId: string): Promise<Cart | null> {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        discountCodes {
          code
          applicable
        }
        cost {
          totalAmount {
            amount
          }
        }
        lines(first: 100) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  price {
                    amount
                  }
                  image {
                    url
                  }
                  selectedOptions {
                    name
                    value
                  }
                  product {
                    id
                    title
                    handle
                    description
                    priceRange {
                      minVariantPrice {
                        amount
                      }
                    }
                    images(first: 1) {
                      edges {
                        node {
                          url
                        }
                      }
                    }
                    collections(first: 1) {
                      edges {
                        node {
                          handle
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await shopifyFetch<any>({
      query,
      variables: { cartId },
      cache: "no-store",
    });
    const cart = res.body.data?.cart;
    return cart ? mapShopifyCart(cart) : null;
  } catch (error) {
    console.error(`Failed to get cart ${cartId}:`, error);
    return null;
  }
}

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number
): Promise<Cart> {
  const mutation = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          cost {
            totalAmount {
              amount
            }
          }
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                    }
                    image {
                      url
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      id
                      title
                      handle
                      description
                      priceRange {
                        minVariantPrice {
                          amount
                        }
                      }
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                      collections(first: 1) {
                        edges {
                          node {
                            handle
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await shopifyFetch<any>({
    query: mutation,
    variables: {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity,
        },
      ],
    },
    cache: "no-store",
  });

  return mapShopifyCart(res.body.data?.cartLinesAdd?.cart);
}

export async function removeFromCart(
  cartId: string,
  lineIds: string[]
): Promise<Cart> {
  const mutation = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
          cost {
            totalAmount {
              amount
            }
          }
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                    }
                    image {
                      url
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      id
                      title
                      handle
                      description
                      priceRange {
                        minVariantPrice {
                          amount
                        }
                      }
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                      collections(first: 1) {
                        edges {
                          node {
                            handle
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await shopifyFetch<any>({
    query: mutation,
    variables: {
      cartId,
      lineIds,
    },
    cache: "no-store",
  });

  return mapShopifyCart(res.body.data?.cartLinesRemove?.cart);
}

export async function updateCartItem(
  cartId: string,
  lineId: string,
  quantity: number
): Promise<Cart> {
  const mutation = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          cost {
            totalAmount {
              amount
            }
          }
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                    }
                    image {
                      url
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      id
                      title
                      handle
                      description
                      priceRange {
                        minVariantPrice {
                          amount
                        }
                      }
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                      collections(first: 1) {
                        edges {
                          node {
                            handle
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await shopifyFetch<any>({
    query: mutation,
    variables: {
      cartId,
      lines: [
        {
          id: lineId,
          quantity,
        },
      ],
    },
    cache: "no-store",
  });

  return mapShopifyCart(res.body.data?.cartLinesUpdate?.cart);
}

export async function updateCartDiscount(
  cartId: string,
  discountCodes: string[]
): Promise<Cart> {
  const mutation = `
    mutation cartDiscountCodesUpdate($cartId: ID!, $discountCodes: [String!]) {
      cartDiscountCodesUpdate(cartId: $cartId, discountCodes: $discountCodes) {
        cart {
          id
          checkoutUrl
          discountCodes {
            code
            applicable
          }
          cost {
            totalAmount {
              amount
            }
          }
          lines(first: 100) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    price {
                      amount
                    }
                    image {
                      url
                    }
                    selectedOptions {
                      name
                      value
                    }
                    product {
                      id
                      title
                      handle
                      description
                      priceRange {
                        minVariantPrice {
                          amount
                        }
                      }
                      images(first: 1) {
                        edges {
                          node {
                            url
                          }
                        }
                      }
                      collections(first: 1) {
                        edges {
                          node {
                            handle
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const res = await shopifyFetch<any>({
    query: mutation,
    variables: {
      cartId,
      discountCodes,
    },
    cache: "no-store",
  });

  return mapShopifyCart(res.body.data?.cartDiscountCodesUpdate?.cart);
}
