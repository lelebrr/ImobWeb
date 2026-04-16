"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Building2,
  Users,
  BarChart3,
  MessageCircle,
  Info,
  Phone,
  ArrowRight,
  CheckCircle,
  Star,
  TrendingUp,
  Search,
  Filter,
  Heart,
  Eye,
} from "lucide-react";
import { Button } from "@/components/design-system/button";
import { Input } from "@/components/design-system/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/design-system/card";

const FEATURES = [
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "Gestão de Imóveis",
    description: "Cadastre e gerencie todos os seus imóveis em um só lugar",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Gestão de Clientes",
    description: "Organize leads, proprietários e的历史 clientes",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: "Analytics",
    description: "Dashboards executivos com métricas em tempo real",
  },
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "WhatsApp Integrado",
    description: "Comunicação direta com clientes pelo WhatsApp",
  },
];

const PLANS = [
  {
    name: "Iniciante",
    price: "R$ 97",
    period: "/mês",
    features: [
      "até 50 imóveis",
      "2 corretores",
      "Portal Zap",
      "Suporte básico",
    ],
    popular: false,
  },
  {
    name: "Profissional",
    price: "R$ 197",
    period: "/mês",
    features: [
      "até 200 imóveis",
      "5 corretores",
      "Todos os portais",
      "WhatsApp API",
      "Analytics",
    ],
    popular: true,
  },
  {
    name: "Corporativo",
    price: "R$ 497",
    period: "/mês",
    features: [
      "Imóveis ilimitados",
      "Corretores ilimitados",
      "Franquias",
      "API completa",
      "Suporte dedicado",
    ],
    popular: false,
  },
];

const TESTIMONIALS = [
  {
    name: "Carlos Silva",
    role: "Imobiliária Silva",
    text: "O imobWeb transformou nossa gestão. Aumentamos as vendas em 40%!",
    rating: 5,
  },
  {
    name: "Maria Santos",
    role: "Corretora",
    text: "Interface intuitiva e extremamente útil. Recomendo!",
    rating: 5,
  },
  {
    name: "João Lima",
    role: "Diretor da Imobiliária XYZ",
    text: "Melhor investimento que fizemos para o negócio.",
    rating: 5,
  },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPrice, setFilterPrice] = useState("all");

  const properties = [
    {
      id: 1,
      title: "Apartamento Moderno",
      address: "Rua das Flores, 123 - São Paulo",
      price: 450000,
      type: "apartment",
      beds: 2,
      baths: 2,
      area: 85,
      image:
        "https://images.unsplash.com/photo-1502672260269-1c1ef2d936f0?w=400",
    },
    {
      id: 2,
      title: "Casa Espaçosa",
      address: "Av. Paulista, 500 - São Paulo",
      price: 850000,
      type: "house",
      beds: 4,
      baths: 3,
      area: 250,
      image:
        "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400",
    },
    {
      id: 3,
      title: "Sala Comercial",
      address: "Rua Augusta, 200 - São Paulo",
      price: 350000,
      type: "commercial",
      beds: 0,
      baths: 1,
      area: 45,
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c1?w=400",
    },
    {
      id: 4,
      title: "Cobertura de Luxo",
      address: "Av. Brigadeiro, 300 - São Paulo",
      price: 1200000,
      type: "apartment",
      beds: 3,
      baths: 3,
      area: 180,
      image:
        "https://images.unsplash.com/photo-1512917774089-9991f1c4c750?w=400",
    },
    {
      id: 5,
      title: "Terreno Prime",
      address: "Zona Oeste - São Paulo",
      price: 280000,
      type: "land",
      beds: 0,
      baths: 0,
      area: 500,
      image:
        "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400",
    },
    {
      id: 6,
      title: "Flat Executivo",
      address: "Av. Faria Lima - São Paulo",
      price: 380000,
      type: "apartment",
      beds: 1,
      baths: 1,
      area: 45,
      image:
        "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
              iW
            </div>
            <span className="text-xl font-bold text-gray-900">imobWeb</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/marketplace"
              className="text-sm font-medium text-blue-600"
            >
              Imóveis
            </Link>
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sobre
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Contato
            </Link>
          </nav>

          <Button onClick={() => router.push("/login")}>Comece Grátis</Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Encontre o Imóvel dos Seus Sonhos
          </h1>
          <p className="mb-8 text-xl text-gray-600">
            Miles de imóveis disponíveis para compra e locação
          </p>

          <div className="mx-auto max-w-2xl flex gap-2 rounded-xl bg-white p-2 shadow-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por endereço, bairro ou cidade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="all">Tipo</option>
              <option value="apartment">Apartamento</option>
              <option value="house">Casa</option>
              <option value="commercial">Comercial</option>
              <option value="land">Terreno</option>
            </select>
            <select
              value={filterPrice}
              onChange={(e) => setFilterPrice(e.target.value)}
              className="rounded-lg border border-gray-300 px-4 py-2"
            >
              <option value="all">Preço</option>
              <option value="0-300000">Até R$ 300mil</option>
              <option value="300000-600000">R$ 300mil - 600mil</option>
              <option value="600000-1000000">R$ 600mil - 1M</option>
              <option value="1000000+">Acima de R$ 1M</option>
            </select>
            <Button>Buscar</Button>
          </div>
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {properties.length} Imóveis encontrados
            </h2>
            <select className="rounded-lg border border-gray-300 px-4 py-2">
              <option>Ordenar por: Mais recentes</option>
              <option>Preço: Menor para maior</option>
              <option>Preço: Maior para menor</option>
            </select>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button className="rounded-full bg-white p-2 shadow">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-3 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                    {property.type === "apartment" && "Apartamento"}
                    {property.type === "house" && "Casa"}
                    {property.type === "commercial" && "Comercial"}
                    {property.type === "land" && "Terreno"}
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="mb-1 font-semibold text-gray-900">
                    {property.title}
                  </h3>
                  <p className="mb-3 text-sm text-gray-500">
                    {property.address}
                  </p>
                  <div className="mb-3 flex items-center gap-4 text-sm text-gray-500">
                    {property.beds > 0 && <span>{property.beds} Quartos</span>}
                    {property.baths > 0 && (
                      <span>{property.baths} Banheiros</span>
                    )}
                    <span>{property.area} m²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-blue-600">
                      R$ {property.price.toLocaleString("pt-BR")}
                    </span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm">Detalhes</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">
            Pronto para encontrar seu imóvel ideal?
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Cadastre-se gratuitamente e tenha acesso a todos os imóveis
          </p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push("/login")}
          >
            Criar conta grátis <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                  iW
                </div>
                <span className="text-xl font-bold text-white">imobWeb</span>
              </div>
              <p className="text-sm text-gray-400">
                O CRM imobiliário mais completo do Brasil
              </p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/marketplace" className="hover:text-white">
                    Imóveis
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:text-white">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Termos de Uso
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Privacidade
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">Contato</h4>
              <p className="text-sm text-gray-400">contato@imobweb.com.br</p>
              <p className="text-sm text-gray-400">(11) 99999-9999</p>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            © 2026 imobWeb. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
