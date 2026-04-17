"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface Portal {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected" | "error" | "syncing";
  health?: {
    status: "healthy" | "warning" | "error";
    message?: string;
    lastCheck?: Date;
  };
  icon: any;
  stats?: {
    activeProperties: number;
    totalProperties: number;
    totalViews: number;
    totalLeads: number;
    lastSync?: Date;
  };
  settings?: Record<string, any>;
  syncStatus?: {
    lastSync: Date;
    nextSync: Date;
    status: "idle" | "syncing" | "success" | "error";
    progress?: number;
  };
}

interface PortalContextType {
  portals: Portal[];
  loading: boolean;
  loadingPortals: boolean;
  error: string | null;
  connectPortal: (
    portalId: string,
    settings?: Record<string, any>,
  ) => Promise<void>;
  disconnectPortal: (portalId: string) => Promise<void>;
  syncPortal: (portalId: string) => Promise<void>;
  syncAllPortals: () => Promise<void>;
  refreshPortals: () => Promise<void>;
}

const PortalContext = createContext<PortalContextType | undefined>(undefined);

export function PortalProvider({ children }: { children: ReactNode }) {
  const [portals, setPortals] = useState<Portal[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPortals, setLoadingPortals] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPortals();
  }, []);

  const loadPortals = async () => {
    try {
      const response = await fetch("/api/integrations/portals");
      if (response.ok) {
        const data = await response.json();
        setPortals(data.portals || []);
      }
    } catch (err) {
      setPortals(getDefaultPortals());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultPortals = (): Portal[] => [
    {
      id: "zap",
      name: "ZAP Imóveis",
      type: "ZAP",
      status: "connected",
      health: { status: "healthy", lastCheck: new Date() },
      icon: "🏠",
      stats: {
        activeProperties: 45,
        totalProperties: 50,
        totalViews: 12500,
        totalLeads: 128,
        lastSync: new Date(),
      },
      syncStatus: {
        lastSync: new Date(Date.now() - 1000 * 60 * 15),
        nextSync: new Date(Date.now() + 1000 * 60 * 45),
        status: "idle",
      },
    },
    {
      id: "vivareal",
      name: "Viva Real",
      type: "VIVAREAL",
      status: "connected",
      health: { status: "healthy", lastCheck: new Date() },
      icon: "🏡",
      stats: {
        activeProperties: 42,
        totalProperties: 50,
        totalViews: 8900,
        totalLeads: 95,
        lastSync: new Date(),
      },
      syncStatus: {
        lastSync: new Date(Date.now() - 1000 * 60 * 20),
        nextSync: new Date(Date.now() + 1000 * 60 * 40),
        status: "idle",
      },
    },
    {
      id: "olx",
      name: "OLX",
      type: "OLX",
      status: "connected",
      health: {
        status: "warning",
        message: "Limite de anúncios próximo",
        lastCheck: new Date(),
      },
      icon: "📦",
      stats: {
        activeProperties: 30,
        totalProperties: 30,
        totalViews: 5600,
        totalLeads: 45,
        lastSync: new Date(),
      },
      syncStatus: {
        lastSync: new Date(Date.now() - 1000 * 60 * 30),
        nextSync: new Date(Date.now() + 1000 * 60 * 30),
        status: "idle",
      },
    },
    {
      id: "imovelweb",
      name: "ImovelWeb",
      type: "IMOVELWEB",
      status: "disconnected",
      icon: "🌐",
      stats: {
        activeProperties: 0,
        totalProperties: 0,
        totalViews: 0,
        totalLeads: 0,
      },
    },
    {
      id: "mercado-livre",
      name: "Mercado Livre",
      type: "MERCADO_LIVRE",
      status: "error",
      health: {
        status: "error",
        message: "Credenciais expiradas",
        lastCheck: new Date(),
      },
      icon: "🛒",
      stats: {
        activeProperties: 0,
        totalProperties: 0,
        totalViews: 0,
        totalLeads: 0,
      },
      syncStatus: {
        lastSync: new Date(Date.now() - 1000 * 60 * 60 * 24),
        nextSync: new Date(),
        status: "error",
      },
    },
  ];

  const connectPortal = async (
    portalId: string,
    settings?: Record<string, any>,
  ) => {
    setLoadingPortals(true);
    try {
      const response = await fetch("/api/integrations/portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalId, action: "connect", settings }),
      });
      if (response.ok) {
        await loadPortals();
      }
    } finally {
      setLoadingPortals(false);
    }
  };

  const disconnectPortal = async (portalId: string) => {
    setLoadingPortals(true);
    try {
      const response = await fetch("/api/integrations/portals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalId, action: "disconnect" }),
      });
      if (response.ok) {
        await loadPortals();
      }
    } finally {
      setLoadingPortals(false);
    }
  };

  const syncPortal = async (portalId: string) => {
    setPortals((prev) =>
      prev.map((p) =>
        p.id === portalId ? { ...p, status: "syncing" as const } : p,
      ),
    );
    try {
      const response = await fetch(
        `/api/integrations/portals/${portalId}/sync`,
        { method: "POST" },
      );
      if (response.ok) {
        await loadPortals();
      }
    } catch (err) {
      await loadPortals();
    }
  };

  const syncAllPortals = async () => {
    setLoadingPortals(true);
    try {
      for (const portal of portals.filter((p) => p.status === "connected")) {
        await syncPortal(portal.id);
      }
    } finally {
      setLoadingPortals(false);
    }
  };

  const refreshPortals = async () => {
    await loadPortals();
  };

  return (
    <PortalContext.Provider
      value={{
        portals,
        loading,
        loadingPortals,
        error,
        connectPortal,
        disconnectPortal,
        syncPortal,
        syncAllPortals,
        refreshPortals,
      }}
    >
      {children}
    </PortalContext.Provider>
  );
}

export function usePortals() {
  const context = useContext(PortalContext);
  if (context === undefined) {
    return {
      portals: [
        {
          id: "zap",
          name: "ZAP Imóveis",
          type: "ZAP",
          status: "connected" as const,
          icon: "🏠",
          syncStatus: {
            lastSync: new Date(),
            nextSync: new Date(Date.now() + 1000 * 60 * 60),
            status: "idle" as const,
          },
        },
        {
          id: "vivareal",
          name: "Viva Real",
          type: "VIVAREAL",
          status: "connected" as const,
          icon: "🏡",
          syncStatus: {
            lastSync: new Date(),
            nextSync: new Date(Date.now() + 1000 * 60 * 60),
            status: "idle" as const,
          },
        },
        {
          id: "olx",
          name: "OLX",
          type: "OLX",
          status: "connected" as const,
          icon: "📦",
          syncStatus: {
            lastSync: new Date(),
            nextSync: new Date(Date.now() + 1000 * 60 * 60),
            status: "idle" as const,
          },
        },
      ],
      loading: false,
      loadingPortals: false,
      error: null,
      connectPortal: async () => {},
      disconnectPortal: async () => {},
      syncPortal: async () => {},
      syncAllPortals: async () => {},
      refreshPortals: async () => {},
    };
  }
  return context;
}
