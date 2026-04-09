"use client";

import { useEffect, useState } from "react";
import Joyride, { Step } from "react-joyride";
import { useTheme } from "next-themes";

/**
 * COMPONENTE DE TOUR GUIADO - imobWeb
 * 2026 - UX First Onboarding
 */

export function GuidedTour() {
  const [run, setRun] = useState(false);
  const { theme } = useTheme();

  const steps: Step[] = [
    {
      target: "#dashboard-stats",
      content: "Aqui você acompanha o desempenho geral da sua imobiliária em tempo real.",
      placement: "bottom",
    },
    {
      target: "#properties-menu",
      content: "Gerencie seu inventário de imóveis e publique nos principais portais com um clique.",
      placement: "right",
    },
    {
      target: "#leads-kanban",
      content: "Organize seus prospects neste funil de vendas integrado ao WhatsApp.",
      placement: "top",
    },
    {
      target: "#user-settings",
      content: "Personalize sua marca, cores e domínio aqui nas configurações de White Label.",
      placement: "left",
    },
  ];

  useEffect(() => {
    // Inicia o tour apenas na primeira visita ao dashboard
    const hasSeenTour = localStorage.getItem("@imobweb/has-seen-tour");
    if (!hasSeenTour) {
      setRun(true);
    }
  }, []);

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    if (status === "finished" || status === "skipped") {
      localStorage.setItem("@imobweb/has-seen-tour", "true");
      setRun(false);
    }
  };

  return (
    <Joyride
      run={run}
      steps={steps}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: theme === "dark" ? "#60a5fa" : "#2563eb",
          backgroundColor: theme === "dark" ? "#1e293b" : "#ffffff",
          textColor: theme === "dark" ? "#f8fafc" : "#1e293b",
          arrowColor: theme === "dark" ? "#1e293b" : "#ffffff",
        },
      }}
      locale={{
        back: "Voltar",
        close: "Fechar",
        last: "Finalizar",
        next: "Próximo",
        skip: "Pular Tour",
      }}
    />
  );
}
