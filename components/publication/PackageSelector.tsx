"use client";

import React, { useState } from "react";
import {
  Package,
  Check,
  Zap,
  Home,
  Star,
  Crown,
  Globe,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/design-system/button";
import { Card } from "@/components/design-system/card";
import { Badge } from "@/components/design-system/badge";
import { cn } from "@/lib/responsive/tailwind-utils";

interface PublicationPackage {
  id: string;
  name: string;
  description: string;
  type: string;
  portalNames: string[];
  durationDays: number;
  isHighlight: boolean;
  price: number;
}

interface PackageSelectorProps {
  packages: PublicationPackage[];
  selectedPackageId?: string;
  onSelect: (packageId: string) => void;
  currentPrice?: number;
}

const DEFAULT_PACKAGES: PublicationPackage[] = [
  {
    id: "basic",
    name: "Básico",
    description: "Publicação em portais essenciais",
    type: "BASIC",
    portalNames: ["Zap Imóveis", "Viva Real"],
    durationDays: 30,
    isHighlight: false,
    price: 0,
  },
  {
    id: "highlight",
    name: "Destaque",
    description: "Destaque nos principais portais",
    type: "HIGHLIGHT",
    portalNames: ["Zap Imóveis", "Viva Real", "OLX"],
    durationDays: 30,
    isHighlight: true,
    price: 49,
  },
  {
    id: "super",
    name: "Super Destaque",
    description: "Máxima visibilidade",
    type: "SUPER_HIGHLIGHT",
    portalNames: ["Zap Imóveis", "Viva Real", "OLX", "Imovelweb"],
    durationDays: 60,
    isHighlight: true,
    price: 99,
  },
  {
    id: "premium",
    name: "Premium",
    description: "Tudo + Redes Sociais",
    type: "PREMIUM",
    portalNames: [
      "Zap",
      "Viva Real",
      "OLX",
      "Imovelweb",
      "Chaves na Mão",
      "Instagram",
      "Facebook",
    ],
    durationDays: 90,
    isHighlight: true,
    price: 149,
  },
];

const PACKAGE_ICONS: Record<string, React.ReactNode> = {
  BASIC: <Home className="w-5 h-5" />,
  HIGHLIGHT: <Star className="w-5 h-5" />,
  SUPER_HIGHLIGHT: <Crown className="w-5 h-5" />,
  PREMIUM: <Crown className="w-5 h-5" />,
  CUSTOM: <Package className="w-5 h-5" />,
};

const PACKAGE_COLORS: Record<string, string> = {
  BASIC: "border-gray-500 bg-gray-500/10",
  HIGHLIGHT: "border-yellow-500 bg-yellow-500/10",
  SUPER_HIGHLIGHT: "border-orange-500 bg-orange-500/10",
  PREMIUM: "border-purple-500 bg-purple-500/10",
  CUSTOM: "border-blue-500 bg-blue-500/10",
};

export function PackageSelector({
  packages = DEFAULT_PACKAGES,
  selectedPackageId,
  onSelect,
  currentPrice = 0,
}: PackageSelectorProps) {
  const [customMode, setCustomMode] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Escolha o Pacote</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCustomMode(!customMode)}
        >
          <Package className="w-4 h-4 mr-2" />
          Montar Pacote
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => {
          const isSelected = selectedPackageId === pkg.id;
          const Icon = PACKAGE_ICONS[pkg.type] || Package;

          return (
            <Card
              key={pkg.id}
              onClick={() => onSelect(pkg.id)}
              className={cn(
                "cursor-pointer transition-all hover:scale-[1.02]",
                isSelected
                  ? `ring-2 ring-primary ${PACKAGE_COLORS[pkg.type]}`
                  : "border-white/10 hover:border-white/20",
                isSelected && "bg-primary/10",
              )}
            >
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      PACKAGE_COLORS[pkg.type].split(" ")[1],
                    )}
                  >
                    {Icon}
                  </div>
                  {isSelected && (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  )}
                </div>

                <div>
                  <h4 className="font-bold">{pkg.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {pkg.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1">
                  {pkg.portalNames.slice(0, 3).map((portal) => (
                    <Badge
                      key={portal}
                      variant="outline"
                      className="text-[10px]"
                    >
                      {portal}
                    </Badge>
                  ))}
                  {pkg.portalNames.length > 3 && (
                    <Badge variant="outline" className="text-[10px]">
                      +{pkg.portalNames.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {pkg.durationDays} dias
                  </div>
                  <div className="font-bold text-lg">
                    {pkg.price === 0 ? (
                      "Grátis"
                    ) : (
                      <>
                        R$ {pkg.price}
                        <span className="text-xs font-normal">/mês</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {selectedPackageId && (
        <div className="flex items-center justify-between p-4 glass rounded-xl">
          <div>
            <p className="text-sm text-muted-foreground">Total a pagar</p>
            <p className="text-2xl font-bold">
              R$ {packages.find((p) => p.id === selectedPackageId)?.price || 0}
            </p>
          </div>
          <Button size="lg">
            <Zap className="w-4 h-4 mr-2" />
            Publicar Agora
          </Button>
        </div>
      )}
    </div>
  );
}
