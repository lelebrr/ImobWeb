import Link from "next/link";
import {
  Building2,
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  ShieldCheck,
  Mail,
  MapPin,
} from "lucide-react";
import { useMarketingLanguage } from "@/lib/i18n/MarketingLanguageContext";

/**
 * Footer - Psicologia de Design:
 * - Profundidade e Solidez: O fundo mais escuro do site transmite "final de jornada" e estabilidade.
 * - Confian\u00e7a (Esq): Logo e miss\u00e3o refor\u00e7am a marca.
 * - Navega\u00e7\u00e3o (Dir): Transmitir que a empresa \u00e9 grande e organizada.
 * - Indicador de Status: Prova técnica de confiabilidade.
 */
const Footer = () => {
  const { t } = useMarketingLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-24">
          {/* Brand Section */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-8 group">
              <div className="bg-brand-growth text-brand-deep p-2.5 rounded-2xl shadow-glow-growth rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Building2 className="h-7 w-7" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter">
                imob<span className="text-brand-growth">Web</span>
              </span>
            </Link>
            <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm font-medium">
              {t.footer.desc}
            </p>
            <div className="flex items-center gap-5">
              <Link
                href="#"
                aria-label="Seguir imobWeb no Instagram"
                className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:bg-brand-growth hover:text-brand-deep transition-all duration-500 hover:-translate-y-1 shadow-sm"
              >
                <Instagram className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                aria-label="Seguir imobWeb no Facebook"
                className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:bg-brand-growth hover:text-brand-deep transition-all duration-500 hover:-translate-y-1 shadow-sm"
              >
                <Facebook className="h-6 w-6" />
              </Link>
              <Link
                href="#"
                aria-label="Seguir imobWeb no LinkedIn"
                className="p-3 bg-white/5 rounded-2xl text-slate-400 hover:bg-brand-growth hover:text-brand-deep transition-all duration-500 hover:-translate-y-1 shadow-sm"
              >
                <Linkedin className="h-6 w-6" />
              </Link>
            </div>
          </div>

          {/* Links Sections */}
          <div className="col-span-1 lg:pl-8">
            <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-8">
              {t.footer.product}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="#features"
                  className="text-base text-slate-400 hover:text-brand-growth transition-colors font-medium"
                >
                  {t.footer.features}
                </Link>
              </li>
              <li>
                <Link
                  href="#pricing"
                  className="text-base text-slate-400 hover:text-brand-growth transition-colors font-medium"
                >
                  {t.footer.pricing}
                </Link>
              </li>
              <li>
                <Link
                  href="/marketplace"
                  className="text-base text-slate-400 hover:text-brand-growth transition-colors font-medium"
                >
                  Marketplace
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-8">
              {t.footer.resources}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/blog"
                  className="text-base text-slate-400 hover:text-brand-growth transition-colors font-medium"
                >
                  {t.footer.blog}
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-base text-slate-400 hover:text-brand-growth transition-colors font-medium"
                >
                  {t.footer.helpCenter}
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-8">
              {t.footer.company}
            </h3>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/about"
                  className="text-base text-slate-400 hover:text-brand-growth transition-colors font-medium"
                >
                  {t.footer.aboutUs}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-base text-slate-400 hover:text-brand-growth transition-colors font-medium"
                >
                  {t.footer.contact}
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-8">
              Segurança
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-brand-growth" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none">
                  Dados Criptografados
                </span>
              </div>
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3 text-slate-400">
                <MapPin className="h-5 w-5" />
                <span className="text-[10px] font-bold uppercase leading-none">
                  Handcrafted in SP - Brasil
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:row justify-between items-center gap-8">
          <div className="flex flex-col md:flex-row items-center gap-8 text-sm font-medium text-slate-400">
            <p>
              © {currentYear} imobWeb. {t.footer.rights}
            </p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacidade
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Termos
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 px-5 py-2.5 bg-brand-growth/5 border border-brand-growth/10 rounded-full">
              <div className="h-2 w-2 bg-brand-growth rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]"></div>
              <span className="text-[10px] font-black text-brand-growth uppercase tracking-[0.2em]">
                Sistemas 100% Online
              </span>
            </div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              v 3.0.0-PRO
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
