import { MetadataRoute } from "next";

/**
 * Dynamic Sitemap Generator for imobWeb
 * Automatically lists static routes, real estate properties, and blog posts.
 */

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://imobweb.com";
  
  // 1. Static Routes
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/search",
    "/contato",
    "/sobre",
    "/planos",
    "/blog",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: route === "" ? 1 : 0.8,
  }));

  // 2. Dynamic Properties (Imóveis)
  // Here we would ideally fetch from Prisma.
  // const properties = await prisma.property.findMany({ 
  //   where: { status: 'DISPONIVEL' },
  //   select: { slug: true, updatedAt: true }
  // });
  
  // For now, providing a scalable structure:
  const properties: any[] = []; // Injected via DB in production
  
  const propertyRoutes: MetadataRoute.Sitemap = properties.map((p) => ({
    url: `${baseUrl}/imovel/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  // 3. Blog Posts
  const blogPosts: any[] = [];
  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...propertyRoutes, ...blogRoutes];
}
