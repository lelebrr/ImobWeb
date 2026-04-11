import React from "react";
import { 
  Code2, 
  Webhook, 
  Terminal, 
  Zap, 
  Cpu, 
  Layout, 
  BookOpen, 
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import Link from "next/link";

/**
 * Portal do Desenvolvedor - Home Page
 * 2026 imobWeb Engineering
 */
export default function DeveloperPortal() {
  const cards = [
    {
      title: "Documentação da API",
      desc: "Referência completa de todos os endpoints REST e tRPC v11.",
      icon: <BookOpen className="text-blue-500" />,
      href: "/developers/docs"
    },
    {
      title: "API Playground",
      desc: "Teste requisições em tempo real usando nosso explorador interativo.",
      icon: <Terminal className="text-indigo-500" />,
      href: "/developers/playground"
    },
    {
      title: "Webhooks Externos",
      desc: "Receba notificações em tempo real sobre leads e imóveis.",
      icon: <Webhook className="text-emerald-500" />,
      href: "/developers/webhooks"
    },
    {
      title: "Gestão de Chaves",
      desc: "Crie e gerencie suas API Keys com controle granular de scopes.",
      icon: <ShieldCheck className="text-purple-500" />,
      href: "/developers/keys"
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <header className="relative isolate overflow-hidden bg-slate-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="rounded-full bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
                <Cpu size={24} />
              </div>
              <span className="text-sm font-semibold text-indigo-400 uppercase tracking-widest">Developer Hub</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              Construa o futuro do mercado imobiliário
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Integre o imobWeb ao seu ecossistema. Use nossa API robusta, webhooks e ferramentas de no-code para automatizar fluxos de trabalho e criar experiências exclusivas.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                href="/developers/docs"
                className="rounded-lg bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 transition-all"
              >
                Começar Agora
              </Link>
              <Link href="/developers/playground" className="text-sm font-semibold leading-6 text-white flex items-center gap-2 group">
                Explorar Playground <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Grid Section */}
      <main className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, idx) => (
            <Link 
              key={idx} 
              href={card.href}
              className="group relative flex flex-col rounded-2xl border border-slate-200 p-8 transition-all hover:border-indigo-500 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
            >
              <div className="mb-6 rounded-xl bg-white p-3 shadow-sm dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                {card.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex-grow">
                {card.desc}
              </p>
              <div className="mt-6 flex items-center text-xs font-bold text-indigo-500 uppercase tracking-wider">
                Ver mais <ArrowRight size={12} className="ml-1" />
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Example Section */}
        <section className="mt-32 overflow-hidden rounded-3xl bg-slate-900 shadow-2xl lg:flex">
          <div className="px-8 py-16 lg:w-1/2 lg:px-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Integração em 2 minutos</h2>
            <p className="mt-6 text-lg text-slate-300">
              Nossa API rest foi desenhada para desenvolvedores. Com exemplos nativos em Node.js e Python, você pode começar a ler dados de imóveis instantaneamente.
            </p>
            <div className="mt-10 space-y-4 text-slate-400">
              <div className="flex items-center gap-3">
                <Zap size={20} className="text-indigo-400" />
                <span>Autenticação simplificada via Bearer Token</span>
              </div>
              <div className="flex items-center gap-3">
                <Layout size={20} className="text-indigo-400" />
                <span>Payloads JSON semânticos e documentação OpenAPI</span>
              </div>
            </div>
          </div>
          <div className="bg-slate-800/50 lg:w-1/2 p-4">
            <div className="h-full rounded-2xl bg-slate-950 p-6 font-mono text-sm text-slate-300 overflow-x-auto shadow-inner border border-slate-800">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <span className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs uppercase text-slate-500 font-sans">curl --example</span>
              </div>
              <pre>
                <code className="language-bash">{`curl -X GET "https://api.imobweb.app/v1/properties" \\
  -H "X-API-KEY: YOUR_KEY" \\
  -H "Content-Type: application/json"`}</code>
              </pre>
              <div className="mt-4 pt-4 border-t border-slate-900/50">
                <p className="text-indigo-400"># Response</p>
                <pre className="text-xs text-slate-500 mt-2">
{`{
  "id": "prop_8F2A...",
  "title": "Cobertura em Pinheiros",
  "price": 2450000,
  "status": "DISPONIVEL"
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
