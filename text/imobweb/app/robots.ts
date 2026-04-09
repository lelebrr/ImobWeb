/**
 * Robots.txt for imobWeb
 * Optimized for Real Estate SEO and crawling efficiency.
 */

export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://imobweb.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin/",
          "/dashboard/",
          "/onboarding/",
          "/branding/",
          "/settings/",
          "/private/",
          "/*?*", // Bloquear parâmetros de busca redundantes para evitar conteúdo duplicado
        ],
      },
      {
        userAgent: "GPTBot",
        allow: ["/blog/", "/imovel/"], // Permitir que IAs indexem conteúdo público
        disallow: ["/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
