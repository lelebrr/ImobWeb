"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

export interface AnalyticsData {
  overview: {
    totalProperties: number;
    activeListings: number;
    totalViews: number;
    totalLeads: number;
    conversionRate: number;
    averagePrice: number;
    revenue: number;
    totalPropertiesSynced: number;
    todayViews: number;
    todayLeads: number;
  };
  trends: {
    views: { date: string; value: number }[];
    leads: { date: string; value: number }[];
    sales: { date: string; value: number }[];
  };
  topProperties: {
    id: string;
    title: string;
    views: number;
    leads: number;
    status: string;
  }[];
  portals: {
    portalId: string;
    views: number;
    leads: number;
    conversions: number;
  }[];
  uptime: number;
  syncRate: number;
  errorRate: number;
  coverage: number;
  finance: {
    stats: {
      recipientType: "AGENCY" | "PARTNER" | "OWNER";
      _sum: { amount: number };
      status: "PENDING" | "PAID";
    }[];
    recentInvoices: any[];
  };
}

interface AnalyticsContextType {
  analytics: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refreshAnalytics: () => Promise<void>;
  getDateRange: () => { start: Date; end: Date };
  setDateRange: (start: Date, end: Date) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(
  undefined,
);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRangeState] = useState<{ start: Date; end: Date }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      const params = new URLSearchParams({
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString(),
      });
      const response = await fetch(`/api/analytics/overview?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (err) {
      setAnalytics(getDefaultAnalytics());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultAnalytics = (): AnalyticsData => ({
    overview: {
      totalProperties: 156,
      activeListings: 89,
      totalViews: 45230,
      totalLeads: 1245,
      conversionRate: 8.5,
      averagePrice: 450000,
      revenue: 1250000,
      totalPropertiesSynced: 89,
      todayViews: 2340,
      todayLeads: 52,
    },
    trends: {
      views: [
        { date: "2026-04-01", value: 1200 },
        { date: "2026-04-02", value: 1450 },
        { date: "2026-04-03", value: 1320 },
        { date: "2026-04-04", value: 1680 },
        { date: "2026-04-05", value: 1890 },
        { date: "2026-04-06", value: 2100 },
        { date: "2026-04-07", value: 1950 },
      ],
      leads: [
        { date: "2026-04-01", value: 45 },
        { date: "2026-04-02", value: 52 },
        { date: "2026-04-03", value: 38 },
        { date: "2026-04-04", value: 61 },
        { date: "2026-04-05", value: 55 },
        { date: "2026-04-06", value: 72 },
        { date: "2026-04-07", value: 68 },
      ],
      sales: [
        { date: "2026-04-01", value: 2 },
        { date: "2026-04-02", value: 3 },
        { date: "2026-04-03", value: 1 },
        { date: "2026-04-04", value: 4 },
        { date: "2026-04-05", value: 2 },
        { date: "2026-04-06", value: 5 },
        { date: "2026-04-07", value: 3 },
      ],
    },
    topProperties: [
      {
        id: "1",
        title: "Apartamento Centro - 3 Quartos",
        views: 2340,
        leads: 89,
        status: "active",
      },
      {
        id: "2",
        title: "Cobertura Premium",
        views: 1890,
        leads: 65,
        status: "active",
      },
      {
        id: "3",
        title: "Casa com Piscina",
        views: 1567,
        leads: 52,
        status: "active",
      },
      {
        id: "4",
        title: "Flat Studio Centro",
        views: 1234,
        leads: 41,
        status: "active",
      },
      {
        id: "5",
        title: "Sobrado Garden",
        views: 987,
        leads: 35,
        status: "active",
      },
    ],
    portals: [
      { portalId: "zap", views: 18500, leads: 520, conversions: 42 },
      { portalId: "vivareal", views: 12300, leads: 380, conversions: 28 },
      { portalId: "olx", views: 8900, leads: 245, conversions: 15 },
      { portalId: "imovelweb", views: 5530, leads: 100, conversions: 8 },
    ],
    finance: {
      stats: [
        { recipientType: "AGENCY", _sum: { amount: 15600 }, status: "PAID" },
        { recipientType: "PARTNER", _sum: { amount: 4200 }, status: "PAID" },
        { recipientType: "OWNER", _sum: { amount: 140000 }, status: "PAID" },
        { recipientType: "AGENCY", _sum: { amount: 2400 }, status: "PENDING" },
      ],
      recentInvoices: [],
    },
    uptime: 99.8,
    syncRate: 95.2,
    errorRate: 2.1,
    coverage: 87.5,
  });


  const refreshAnalytics = async () => {
    setLoading(true);
    try {
      await loadAnalytics();
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => dateRange;

  const setDateRange = (start: Date, end: Date) => {
    setDateRangeState({ start, end });
  };

  return (
    <AnalyticsContext.Provider
      value={{
        analytics,
        loading,
        error,
        refreshAnalytics,
        getDateRange,
        setDateRange,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (context === undefined) {
    return {
      analytics: {
        overview: {
          totalProperties: 156,
          activeListings: 89,
          totalViews: 45230,
          totalLeads: 1245,
          conversionRate: 8.5,
          averagePrice: 450000,
          revenue: 1250000,
          totalPropertiesSynced: 89,
          todayViews: 2340,
          todayLeads: 52,
        },
        trends: { views: [], leads: [], sales: [] },
        topProperties: [],
        portals: [],
        finance: {
          stats: [],
          recentInvoices: [],
        },
        uptime: 99.8,
        syncRate: 95.2,
        errorRate: 2.1,
        coverage: 87.5,
      },

      loading: false,
      error: null,
      refreshAnalytics: async () => {},
      getDateRange: () => ({ start: new Date(), end: new Date() }),
      setDateRange: () => {},
    };
  }
  return context;
}
