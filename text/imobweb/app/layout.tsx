import "./globals.css";
import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ImobWeb | Avançado CRM Imobiliário",
  description: "Gerenciamento completo para imobiliárias com total White-label.",
  // Ponto critico para garantir que touch/safari/mobile não destrave zoom em formulários
  // E evite comportamentos indesejados no app
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0"
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-background text-foreground tracking-tight selection:bg-primary/20">
         {/* Providers globais (Themes, Auth, etc) encaixam aqui */}
         {children}
      </body>
    </html>
  );
}
