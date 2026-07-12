import { MetadataRoute } from "next";
import { getAllProducts, getShopifyCollections } from "./actions";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/products",
    "/blogs",
    "/faqs",
    "/cart"
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    const products = await getAllProducts();
    const productRoutes = products.map((p) => ({
      url: `${baseUrl}/${p.category}/${p.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
    staticRoutes.push(...productRoutes);
  } catch (e) {
    console.error("Sitemap product fetch error:", e);
  }

  try {
    const collections = await getShopifyCollections();
    const collectionRoutes = collections.map((c) => ({
      url: `${baseUrl}/${c.handle}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    staticRoutes.push(...collectionRoutes);
  } catch (e) {
    console.error("Sitemap collection fetch error:", e);
  }

  return staticRoutes;
}
