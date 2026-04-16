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
} from "lucide-react";

const FEATURES = [
  {
    icon: "🏠",
    title: "Gestão de Imóveis",
    description: "Cadastre e gerencie todos os seus imóveis em um só lugar",
  },
  {
    icon: "👥",
    title: "Gestão de Clientes",
    description: "Organize leads, proprietários e clientes",
  },
  {
    icon: "📊",
    title: "Analytics",
    description: "Dashboards executivos com métricas em tempo real",
  },
  {
    icon: "💬",
    title: "WhatsApp Integrado",
    description: "Comunicação direta com clientes pelo WhatsApp",
  },
];

const STEPS = [
  {
    number: 1,
    title: "Cadastre-se",
    description: "Crie sua conta gratuitamente em segundos",
  },
  {
    number: 2,
    title: "Adicione seus imóveis",
    description: "Import ou cadastre seus imóveis manualmente",
  },
  {
    number: 3,
    title: "Publique nos portais",
    description: "Um clique para publicar em todos os portais",
  },
  {
    number: 4,
    title: "Gerencie leads",
    description: "Acompanhe e converta seus prospects em clientes",
  },
];

export default function AboutPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Imóveis
            </Link>
            <Link href="/about" className="text-sm font-medium text-blue-600">
              Sobre
            </Link>
            <Link
              href="/contact"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Contato
            </Link>
          </nav>

          <button
            onClick={() => router.push("/login")}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Comece Grátis
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-6 text-5xl font-bold text-gray-900">
            A Plataforma de Gestão Imobiliária
            <span className="text-blue-600"> Mais Completa do Brasil</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            O imobWeb unifica gestão de imóveis, clientes, documentos e
            komunicações em uma única plataforma. Aumente suas vendas e
            simplifique sua operação.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => router.push("/login")}
              className="rounded-lg bg-blue-600 px-6 py-3 text-lg font-medium text-white hover:bg-blue-700"
            >
              Comece Grátis <ArrowRight className="ml-2 inline h-5 w-5" />
            </button>
            <button
              onClick={() => router.push("/contact")}
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-lg font-medium text-gray-700 hover:bg-gray-50"
            >
              Fale Conosco
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-8 text-center text-white md:grid-cols-4">
            <div>
              <div className="text-4xl font-bold">+5.000</div>
              <div className="text-blue-200">Imobiliárias</div>
            </div>
            <div>
              <div className="text-4xl font-bold">+50.000</div>
              <div className="text-blue-200">Imóveis</div>
            </div>
            <div>
              <div className="text-4xl font-bold">+200.000</div>
              <div className="text-blue-200">Leads/mês</div>
            </div>
            <div>
              <div className="text-4xl font-bold">40%</div>
              <div className="text-blue-200">Aumento em vendas</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Por que escolher o imobWeb?
            </h2>
            <p className="text-lg text-gray-600">
              Tudo que você precisa para gestionar seu negócio
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Como funciona
            </h2>
            <p className="text-lg text-gray-600">
              Comece a usar em menos de 5 minutos
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                  {step.number}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center text-white">
          <h2 className="mb-6 text-3xl font-bold">
            Pronto para transformar seu negócio?
          </h2>
          <p className="mb-8 text-lg text-blue-100">
            Comece gratuitamente hoje mesmo. Sem cartão de crédito.
          </p>
          <button
            onClick={() => router.push("/login")}
            className="rounded-lg bg-white px-8 py-4 text-lg font-medium text-blue-600 hover:bg-blue-50"
          >
            Criar conta grátis <ArrowRight className="ml-2 inline h-5 w-5" />
          </button>
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
