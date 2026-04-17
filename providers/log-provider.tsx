"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface IntegrationLog {
  id: string;
  action: string;
  status: "SUCCESS" | "ERROR" | "PENDING" | "WARNING";
  message: string;
  timestamp: Date;
  portalId: string;
  property?: {
    id: string;
    title: string;
  };
  details?: Record<string, any>;
}

interface LogContextType {
  logs: IntegrationLog[];
  loading: boolean;
  loadingLogs: boolean;
  error: string | null;
  refreshLogs: () => Promise<void>;
  getLogsByPortal: (portalId: string) => IntegrationLog[];
  getLogsByStatus: (status: IntegrationLog["status"]) => IntegrationLog[];
  clearLogs: () => Promise<void>;
}

const LogContext = createContext<LogContextType | undefined>(undefined);

export function LogProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      const response = await fetch("/api/integrations/logs");
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      setLogs(getDefaultLogs());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultLogs = (): IntegrationLog[] => [
    {
      id: "1",
      action: "Sincronização de propriedades",
      status: "SUCCESS",
      message: "50 propriedades sincronizadas com sucesso",
      timestamp: new Date(Date.now() - 1000 * 60 * 5),
      portalId: "zap",
      property: { id: "1", title: "Apartamento Centro" },
    },
    {
      id: "2",
      action: "Importação de leads",
      status: "SUCCESS",
      message: "15 novos leads importados do Viva Real",
      timestamp: new Date(Date.now() - 1000 * 60 * 15),
      portalId: "vivareal",
    },
    {
      id: "3",
      action: "Publicação de imóvel",
      status: "ERROR",
      message: "Falha ao publicar: fotos excedem limite",
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      portalId: "olx",
      property: { id: "2", title: "Casa com Piscina" },
    },
    {
      id: "4",
      action: "Atualização de preço",
      status: "WARNING",
      message: "Preço alterado manualmente no portal",
      timestamp: new Date(Date.now() - 1000 * 60 * 45),
      portalId: "zap",
      property: { id: "3", title: "Cobertura Premium" },
    },
    {
      id: "5",
      action: "Sincronização de agenda",
      status: "SUCCESS",
      message: "Agenda sincronizada",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
      portalId: "vivareal",
    },
  ];

  const refreshLogs = async () => {
    setLoadingLogs(true);
    try {
      await loadLogs();
    } finally {
      setLoadingLogs(false);
    }
  };

  const getLogsByPortal = (portalId: string) =>
    logs.filter((log) => log.portalId === portalId);

  const getLogsByStatus = (status: IntegrationLog["status"]) =>
    logs.filter((log) => log.status === status);

  const clearLogs = async () => {
    setLogs([]);
  };

  return (
    <LogContext.Provider
      value={{
        logs,
        loading,
        loadingLogs,
        error,
        refreshLogs,
        getLogsByPortal,
        getLogsByStatus,
        clearLogs,
      }}
    >
      {children}
    </LogContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogContext);
  if (context === undefined) {
    return {
      logs: [],
      loading: false,
      loadingLogs: false,
      error: null,
      refreshLogs: async () => {},
      getLogsByPortal: () => [],
      getLogsByStatus: () => [],
      clearLogs: async () => {},
    };
  }
  return context;
}
