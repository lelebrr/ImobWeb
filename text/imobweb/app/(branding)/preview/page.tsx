"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Layout, Palette, Image as ImageIcon, Eye } from "lucide-react";

/**
 * BRANDING PREVIEW PAGE - imobWeb
 * 2026 - White Label Real-time Customization
 */

export default function BrandingPreviewPage() {
  const [primaryColor, setPrimaryColor] = useState("#3b82f6");
  const [secondaryColor, setSecondaryColor] = useState("#1e293b");
  const [logoUrl, setLogoUrl] = useState("/logo-default.png");

  return (
    <div className="container mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Coluna de Configuração */}
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personalização de Marca</h1>
          <p className="text-muted-foreground">Configure a identidade visual da sua imobiliária no sistema.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" /> Cores e Estilos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input 
                    id="primary" 
                    type="color" 
                    className="w-12 p-1" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                  <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} maxLength={7} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondary">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input 
                    id="secondary" 
                    type="color" 
                    className="w-12 p-1" 
                    value={secondaryColor} 
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                  <Input value={secondaryColor} onChange={(e) => setSecondaryColor(e.target.value)} maxLength={7} />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">URL do Logotipo (PNG/SVG)</Label>
              <div className="flex gap-2">
                <Input id="logo" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://..." />
                <Button size="icon" variant="outline"><ImageIcon className="h-4 w-4" /></Button>
              </div>
            </div>
            
            <Button className="w-full mt-4" style={{ backgroundColor: primaryColor }}>
              Salvar Identidade Visual
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Coluna de Preview */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Eye className="h-5 w-5" /> Visualização em Tempo Real
          </h2>
          <Badge variant="outline">Modo Preview</Badge>
        </div>

        <div className="border rounded-xl bg-slate-50 overflow-hidden shadow-2xl scale-95 origin-top transition-all duration-300">
          {/* Header Simulado */}
          <header className="bg-white border-b px-6 py-4 flex justify-between items-center">
            <img src={logoUrl} alt="Logo" className="h-8 w-auto grayscale-0" />
            <nav className="flex gap-4">
              <div className="h-4 w-12 rounded bg-slate-100" />
              <div className="h-4 w-12 rounded bg-slate-100" />
            </nav>
          </header>

          {/* Conteúdo Simulado */}
          <main className="p-8 space-y-6">
            <div className="space-y-2">
              <div className="h-8 w-48 rounded bg-slate-200" />
              <div className="h-4 w-64 rounded bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-t-4" style={{ borderTopColor: primaryColor }}>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full mb-4" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                    <Layout className="m-auto h-6 w-6" />
                  </div>
                  <div className="h-4 w-24 rounded bg-slate-200 mb-2" />
                  <div className="h-3 w-32 rounded bg-slate-100" />
                </CardContent>
              </Card>
              <Card className="border-t-4" style={{ borderTopColor: secondaryColor }}>
                <CardContent className="pt-6">
                  <div className="h-10 w-10 rounded-full mb-4" style={{ backgroundColor: `${secondaryColor}20`, color: secondaryColor }}>
                    <Palette className="m-auto h-6 w-6" />
                  </div>
                  <div className="h-4 w-24 rounded bg-slate-200 mb-2" />
                  <div className="h-3 w-32 rounded bg-slate-100" />
                </CardContent>
              </Card>
            </div>

            <Button className="w-full text-white" style={{ backgroundColor: primaryColor }}>
              Ação Primária de Exemplo
            </Button>
          </main>
        </div>
      </div>
    </div>
  );
}

function Badge({ children, variant }: { children: React.ReactNode, variant?: string }) {
  return <span className="px-2 py-1 text-xs font-medium border rounded-full">{children}</span>;
}
