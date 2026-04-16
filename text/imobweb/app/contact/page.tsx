"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  MessageCircle,
} from "lucide-react";

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSending(false);
    setSent(true);
  };

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
            <Link
              href="/about"
              className="text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Sobre
            </Link>
            <Link href="/contact" className="text-sm font-medium text-blue-600">
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
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Fale Conosco
          </h1>
          <p className="text-xl text-gray-600">
            Estamos prontos para ajudar você a crecer seu negócio
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Info */}
            <div>
              <h2 className="mb-8 text-2xl font-bold text-gray-900">
                Entre em contato
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">E-mail</h3>
                    <p className="text-gray-600">contato@imobweb.com.br</p>
                    <p className="text-sm text-gray-500">
                      Respondemos em até 24h
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                    <p className="text-gray-600">(11) 99999-9999</p>
                    <p className="text-sm text-gray-500">Seg-Sex: 9h-18h</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                    <MapPin className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Endereço</h3>
                    <p className="text-gray-600">Av. Paulista, 1000</p>
                    <p className="text-sm text-gray-500">São Paulo, SP</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 rounded-xl bg-blue-50 p-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Precisa de ajuda rápida?
                </h3>
                <p className="mb-4 text-gray-600">
                  Acesse nossa central de ajuda ou assista aos tutoriais
                </p>
                <div className="flex gap-4">
                  <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                    Central de Ajuda
                  </button>
                  <button className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50">
                    Ver Tutoriais
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="rounded-xl border bg-white p-8 shadow-lg">
              {sent ? (
                <div className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900">
                    Mensagem enviada!
                  </h3>
                  <p className="text-gray-600">
                    Obrigado pelo contato. Responderemos em breve.
                  </p>
                  <button
                    onClick={() => setSent(false)}
                    className="mt-6 text-blue-600 hover:underline"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="mb-6 text-xl font-semibold text-gray-900">
                    Envie uma mensagem
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Nome
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        placeholder="Seu nome"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        E-mail
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        placeholder="seu@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Telefone
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Assunto
                      </label>
                      <select
                        required
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      >
                        <option value="">Selecione</option>
                        <option value="sales">Quero comprar</option>
                        <option value="demo">Quero uma demo</option>
                        <option value="support">Suporte técnico</option>
                        <option value="partnership">Parceria</option>
                        <option value="other">Outro</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Mensagem
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                      placeholder="Como podemos ajudar?"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sending ? "Enviando..." : "Enviar mensagem"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="bg-gray-50 py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex h-64 items-center justify-center rounded-xl border bg-gray-200">
            <div className="text-center text-gray-500">
              <MapPin className="mx-auto mb-2 h-8 w-8" />
              <p>Mapa será carregado aqui</p>
              <p className="text-sm">Av. Paulista, 1000 - São Paulo</p>
            </div>
          </div>
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
