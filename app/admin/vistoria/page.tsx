'use client';

import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useVistoriaController } from './_lib/useVistoriaController';
import { HomeView } from './_views/HomeView';
import { OfflineBanner } from './_components/OfflineBanner';

// Telas pesadas carregam sob demanda (o wizard concentra a maior parte do código)
const Loading = () => <div className="min-h-dvh bg-[#0a0a0f] animate-pulse" aria-busy="true" />;
const LibraryView = dynamic(() => import('./_views/LibraryView').then((m) => m.LibraryView), { loading: Loading });
const CompareView = dynamic(() => import('./_views/CompareView').then((m) => m.CompareView), { loading: Loading });
const StatsView = dynamic(() => import('./_views/StatsView').then((m) => m.StatsView), { loading: Loading });
const ConfigView = dynamic(() => import('./_views/ConfigView').then((m) => m.ConfigView), { loading: Loading });
const WizardView = dynamic(() => import('./_views/WizardView').then((m) => m.WizardView), { loading: Loading });

export default function AdminVistoriaPage() {
  const v = useVistoriaController();
  const { view, setView } = v;
  const away = view !== 'home';

  // Botão "voltar" do celular fecha a tela atual (em vez de sair do app)
  useEffect(() => {
    if (!away) return;
    let popped = false;
    window.history.pushState({ vistoria: true }, '');
    const onPop = () => { popped = true; setView('home'); };
    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (!popped && (window.history.state as { vistoria?: boolean } | null)?.vistoria) window.history.back();
    };
  }, [away, setView]);

  let screen: React.ReactNode;
  switch (v.view) {
    case 'library': screen = <LibraryView v={v} />; break;
    case 'compare': screen = <CompareView v={v} />; break;
    case 'stats': screen = <StatsView v={v} />; break;
    case 'config': screen = <ConfigView v={v} />; break;
    case 'wizard': screen = <WizardView v={v} />; break;
    default: screen = <HomeView v={v} />;
  }
  return (
    <>
      <OfflineBanner />
      {screen}
    </>
  );
}
