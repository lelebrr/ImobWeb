import { Metadata } from "next";

/**
 * SEO & Metadata Framework for imobWeb
 * Optimized for Next.js 16 and Real Estate SEO best practices.
 */

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  noIndex?: boolean;
  canonical?: string;
  type?: "website" | "article" | "realestate.listing";
  ogData?: Record<string, string>;
}

export function constructMetadata({
  title = "imobWeb - CRM Imobiliário de Alta Performance",
  description = "A plataforma definitiva para imobiliárias que buscam escala, automação com IA e performance extrema.",
  image = "/og-main.png",
  noIndex = false,
  canonical,
  type = "website",
  ogData = {},
}: MetadataProps = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://imobweb.com";
  
  return {
    title: {
      default: title,
      template: `%s | imobWeb`,
    },
    description,
    keywords: [
      "crm imobiliário",
      "gestão de imóveis",
      "automação imobiliária",
      "nextjs 16",
      "performance imobiliária",
      "leads imobiliários",
    ],
    authors: [{ name: "imobWeb Team" }],
    creator: "imobWeb",
    publisher: "imobWeb Corp",
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: canonical || "/",
    },
    openGraph: {
      title,
      description,
      url: baseUrl,
      siteName: "imobWeb",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: "pt_BR",
      type: type as any,
      ...ogData,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@imobweb",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/shortcut-icon.png",
      apple: "/apple-touch-icon.png",
    },
    manifest: `${baseUrl}/manifest.json`,
  };
}

/**
 * Generates JSON-LD Structured Data for a Real Estate Listing
 */
export function generateRealEstateSchema(property: any) {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "name": property.title,
    "description": property.description,
    "url": `${process.env.NEXT_PUBLIC_APP_URL}/property/${property.slug}`,
    "image": property.images?.[0]?.url || "",
    "datePosted": property.publishedAt,
    "offers": {
      "@type": "Offer",
      "price": property.price,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
    },
    "address": {
      "@type": "PostalAddress",
      "addressLocality": property.city,
      "addressRegion": property.state,
      "postalCode": property.cep,
      "streetAddress": property.address,
    },
  };
}
