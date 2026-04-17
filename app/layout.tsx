import "./globals.css";
import React from "react";
import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { RootProvider } from "@/providers/root-provider";
import { Analytics } from "@vercel/analytics/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Função utilitária local para evitar dependência circular se necessário
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b5bd3",
};

export const metadata: Metadata = {
  title: {
    default: "ImobWeb | CRM Imobiliário Elite",
    template: "%s | ImobWeb",
  },
  description: "A plataforma definitiva para corretores de alta performance. Gestão autônoma com IA.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
  },
  keywords: ["crm imobiliario", "gestao de imoveis", "saas imobiliario", "imobiliaria digital"],
  authors: [{ name: "ImobWeb Team" }],
  creator: "ImobWeb",
  metadataBase: new URL("https://imobweb.com.br"), // Ajustar para URL real
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://imobweb.com.br",
    title: "ImobWeb | CRM Imobiliário Avançado",
    description: "Gerenciamento completo para imobiliárias com total White-label.",
    siteName: "ImobWeb",
  },
  twitter: {
    card: "summary_large_image",
    title: "ImobWeb | CRM Imobiliário Avançado",
    description: "A plataforma definitiva para imobiliárias de alto desempenho.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { PostHogPageView } from "@/components/analytics/PostHogPageView"
import { Suspense } from "react"

import { PWAHandler } from "@/components/pwa/PWAHandler"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          outfit.variable
        )}
      >
        <RootProvider>
          <PWAHandler />
          <Suspense fallback={null}>
            <PostHogPageView />
          </Suspense>
          <main className="relative flex min-h-screen flex-col">
            {children}
          </main>
        </RootProvider>
        <Analytics />
      </body>
    </html>
  );
}
