"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./auth-provider";

interface Organization {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  plan?: string;
  status: string;
  logo?: string;
  settings?: Record<string, any>;
}

interface OrganizationContextType {
  organization: Organization | null;
  loading: boolean;
  setOrganization: (org: Organization | null) => void;
  updateOrganization: (data: Partial<Organization>) => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined,
);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadOrganization();
    } else {
      setOrganization(null);
      setLoading(false);
    }
  }, [user]);

  const loadOrganization = async () => {
    try {
      const response = await fetch("/api/organizations/me");
      if (response.ok) {
        const data = await response.json();
        setOrganization(data.organization);
      }
    } catch (error) {
      console.error("Failed to load organization:", error);
      setOrganization({
        id: "demo-org",
        name: "Imobiliária Demo",
        email: "demo@imobweb.com.br",
        phone: "(11) 99999-9999",
        whatsapp: "(11) 99999-9999",
        plan: "enterprise",
        status: "active",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOrganization = async (data: Partial<Organization>) => {
    const response = await fetch("/api/organizations/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      const updated = await response.json();
      setOrganization(updated.organization);
    }
  };

  const refreshOrganization = async () => {
    await loadOrganization();
  };

  return (
    <OrganizationContext.Provider
      value={{
        organization,
        loading,
        setOrganization,
        updateOrganization,
        refreshOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    return {
      organization: {
        id: "demo-org",
        name: "Imobiliária Demo",
        email: "demo@imobweb.com.br",
        phone: "(11) 99999-9999",
        plan: "enterprise",
        status: "active",
      },
      loading: false,
      setOrganization: () => {},
      updateOrganization: async () => {},
      refreshOrganization: async () => {},
    };
  }
  return context;
}
