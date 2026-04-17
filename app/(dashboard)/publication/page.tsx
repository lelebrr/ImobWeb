"use client";

import React, { useState } from "react";
import { PackageSelector } from "@/components/publication/PackageSelector";
import { PublicationStatusDashboard } from "@/components/publication/PublicationStatusDashboard";
import { Globe, Home, Search, Filter, Plus } from "lucide-react";
import { Button } from "@/components/design-system/button";
import { Input } from "@/components/design-system/input";
import { Card } from "@/components/design-system/card";

interface Property {
  id: string;
  title: string;
  address: string;
  price: number;
  status: string;
  published?: boolean;
}

const MOCK_PROPERTIES: Property[] = [
  {
    id: "1",
    title: "Apartamento Itaim Bibi",
    address: "Rua Amauri, 450",
    price: 1250000,
    status: "ATIVO",
    published: true,
  },
  {
    id: "2",
    title: "Cobertura Paulista",
    address: "Av. Paulista, 1000",
    price: 2800000,
    status: "ATIVO",
    published: true,
  },
  {
    id: "3",
    title: "Casa Vila Madalena",
    address: "Rua Harmonia, 250",
    price: 950000,
    status: "RASCUNHO",
    published: false,
  },
  {
    id: "4",
    title: "Studio Centro",
    address: "Rua Augusta, 500",
    price: 450000,
    status: "ATIVO",
    published: false,
  },
];

export default function PublicationPage() {
  const [selectedPackage, setSelectedPackage] = useState<string | undefined>();
  const [selectedProperty, setSelectedProperty] = useState<string>("1");
  const [search, setSearch] = useState("");

  const filteredProperties = MOCK_PROPERTIES.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.address.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            Publicação
          </h1>
          <p className="text-muted-foreground">
            Publique seu imóvel em múltiplos portais com 1 Clique
          </p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-4 h-4" />
              <h2 className="font-bold">Selecione o Imóvel</h2>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar imóvel..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredProperties.map((property) => (
                <div
                  key={property.id}
                  onClick={() => setSelectedProperty(property.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedProperty === property.id
                      ? "bg-primary/20 border border-primary"
                      : "bg-white/5 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-sm">{property.title}</h3>
                    {property.published && (
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded">
                        Publicado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {property.address}
                  </p>
                  <p className="text-sm font-bold mt-1">
                    R$ {property.price.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <Card className="p-6">
            <PackageSelector
              packages={[]}
              onSelect={setSelectedPackage}
              selectedPackageId={selectedPackage}
            />
          </Card>

          <PublicationStatusDashboard
            propertyId={selectedProperty}
            propertyTitle={
              MOCK_PROPERTIES.find((p) => p.id === selectedProperty)?.title
            }
          />
        </div>
      </div>
    </div>
  );
}
