import Link from "next/link";
import { Building2, Facebook, Instagram, Linkedin, ShieldCheck, MapPin, Zap } from "lucide-react";
import { useMarketingLanguage } from "@/lib/i18n/MarketingLanguageContext";

const Footer = () => {
  const { t } = useMarketingLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#08080c] border-t border-white/5 pt-20 pb-8 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 mb-16">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-6 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-all">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                imob<span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Web</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 max-w-sm font-medium">
              {t.footer.desc}
            </p>
            <div className="flex items-center gap-3">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <Link key={i} href="#" className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all duration-300 border border-white/5 hover:border-indigo-500/20">
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="col-span-1 lg:pl-4">
            <h3 className="font-bold text-white text-[10px] uppercase tracking-[0.2em] mb-5">{t.footer.product}</h3>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{t.footer.features}</Link></li>
              <li><Link href="#pricing" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{t.footer.pricing}</Link></li>
              <li><Link href="/marketplace" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">Marketplace</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-bold text-white text-[10px] uppercase tracking-[0.2em] mb-5">{t.footer.resources}</h3>
            <ul className="space-y-3">
              <li><Link href="/blog" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{t.footer.blog}</Link></li>
              <li><Link href="/help" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{t.footer.helpCenter}</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-bold text-white text-[10px] uppercase tracking-[0.2em] mb-5">{t.footer.company}</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{t.footer.aboutUs}</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-500 hover:text-white transition-colors font-medium">{t.footer.contact}</Link></li>
            </ul>
          </div>

          <div className="col-span-1">
            <h3 className="font-bold text-white text-[10px] uppercase tracking-[0.2em] mb-5">Segurança</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-indigo-400" />
                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Dados Criptografados</span>
              </div>
              <div className="p-3 bg-white/[0.03] rounded-xl border border-white/5 flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase">Handcrafted in SP</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6 text-xs font-medium text-slate-500">
            <p>© {currentYear} imobWeb. {t.footer.rights}</p>
            <div className="flex items-center gap-5">
              <Link href="/privacy" className="hover:text-white transition-colors">Privacidade</Link>
              <Link href="/terms" className="hover:text-white transition-colors">Termos</Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] border border-white/5 rounded-full">
              <div className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Sistemas Online</span>
            </div>
            <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">v 3.0.0-PRO</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
