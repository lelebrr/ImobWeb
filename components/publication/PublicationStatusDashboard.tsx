"use client";

import React, { useState, useEffect } from "react";
import {
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  ExternalLink,
  MoreVertical,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Card } from "@/components/design-system/card";
import { Badge } from "@/components/design-system/badge";
import { Button } from "@/components/design-system/button";
import { cn } from "@/lib/responsive/tailwind-utils";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PortalAnnouncement {
  id: string;
  portalId: string;
  portalName: string;
  status:
    | "NOT_PUBLISHED"
    | "PENDING"
    | "PUBLISHED"
    | "ERROR"
    | "BLOCKED"
    | "DELETED";
  url?: string;
  errorMessage?: string;
  publishedAt?: Date;
  lastSyncAt?: Date;
}

interface Publication {
  id: string;
  propertyId: string;
  status:
    | "DRAFT"
    | "PUBLISHING"
    | "PUBLISHED"
    | "SYNCING"
    | "ERROR"
    | "BLOCKED"
    | "EXPIRED";
  publishedAt?: Date;
  expiresAt?: Date;
  lastSyncAt?: Date;
  announcements: PortalAnnouncement[];
}

interface PublicationStatusDashboardProps {
  propertyId: string;
  propertyTitle?: string;
}

const PORTAL_LOGOS: Record<string, string> = {
  ZAP: "🟠",
  VIVA_REAL: "🟢",
  OLX: "🟡",
  IMOVELWEB: "🔵",
  CHAVES_NAMAO: "🔑",
};

const STATUS_CONFIG: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  PUBLISHED: {
    color: "text-green-400 bg-green-400/10",
    icon: <CheckCircle className="w-4 h-4" />,
    label: "Publicado",
  },
  PENDING: {
    color: "text-yellow-400 bg-yellow-400/10",
    icon: <Clock className="w-4 h-4" />,
    label: "Pendente",
  },
  ERROR: {
    color: "text-red-400 bg-red-400/10",
    icon: <XCircle className="w-4 h-4" />,
    label: "Erro",
  },
  BLOCKED: {
    color: "text-orange-400 bg-orange-400/10",
    icon: <AlertTriangle className="w-4 h-4" />,
    label: "Bloqueado",
  },
  NOT_PUBLISHED: {
    color: "text-gray-400 bg-gray-400/10",
    icon: <Clock className="w-4 h-4" />,
    label: "Não publicado",
  },
  DELETED: {
    color: "text-gray-400 bg-gray-400/10",
    icon: <XCircle className="w-4 h-4" />,
    label: "Removido",
  },
};

const MOCK_PUBLICATION: Publication = {
  id: "pub_123",
  propertyId: "prop_123",
  status: "PUBLISHED",
  publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  expiresAt: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000),
  lastSyncAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  announcements: [
    {
      id: "1",
      portalId: "ZAP",
      portalName: "Zap Imóveis",
      status: "PUBLISHED",
      url: "https://zap.com.br/i/123",
      publishedAt: new Date(),
      lastSyncAt: new Date(),
    },
    {
      id: "2",
      portalId: "VIVA_REAL",
      portalName: "Viva Real",
      status: "PUBLISHED",
      url: "https://vivareal.com.br/i/123",
      publishedAt: new Date(),
      lastSyncAt: new Date(),
    },
    {
      id: "3",
      portalId: "OLX",
      portalName: "OLX",
      status: "PUBLISHED",
      url: "https://olx.com.br/i/123",
      publishedAt: new Date(),
      lastSyncAt: new Date(),
    },
    {
      id: "4",
      portalId: "IMOVELWEB",
      portalName: "Imovelweb",
      status: "ERROR",
      errorMessage: "Preço inválido para o portal",
      publishedAt: undefined,
      lastSyncAt: new Date(),
    },
    {
      id: "5",
      portalId: "CHAVES_NAMAO",
      portalName: "Chaves na Mão",
      status: "NOT_PUBLISHED",
      publishedAt: undefined,
      lastSyncAt: undefined,
    },
  ],
};

export function PublicationStatusDashboard({
  propertyId,
  propertyTitle,
}: PublicationStatusDashboardProps) {
  const [publication, setPublication] = useState<Publication | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setPublication(MOCK_PUBLICATION);
      setLoading(false);
    }, 500);
  }, [propertyId]);

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setSyncing(false);
  };

  const handleRepublish = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 3000));
    setPublication(MOCK_PUBLICATION);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/10 rounded w-1/4" />
          <div className="grid grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-white/10 rounded" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!publication) {
    return (
      <Card className="p-6 text-center">
        <Globe className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="font-bold text-lg mb-2">Imóvel não publicado</h3>
        <p className="text-muted-foreground mb-4">
          Choose a package to publish on portals
        </p>
        <Button>
          <Zap className="w-4 h-4 mr-2" />
          Publicar Agora
        </Button>
      </Card>
    );
  }

  const stats = {
    total: publication.announcements.length,
    published: publication.announcements.filter((a) => a.status === "PUBLISHED")
      .length,
    pending: publication.announcements.filter((a) => a.status === "PENDING")
      .length,
    error: publication.announcements.filter((a) => a.status === "ERROR").length,
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold">{propertyTitle || "Imóvel"}</h3>
            <p className="text-sm text-muted-foreground">
              {publication.publishedAt &&
                `Publicado há ${formatDistanceToNow(publication.publishedAt, { addSuffix: true, locale: ptBR })}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSync}
              disabled={syncing}
            >
              <RefreshCw
                className={cn("w-4 h-4 mr-2", syncing && "animate-spin")}
              />
              {syncing ? "Sincronizando..." : "Sincronizar"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRepublish}>
              <Zap className="w-4 h-4 mr-2" />
              Republicar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center p-3 glass rounded-lg">
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </div>
          <div className="text-center p-3 glass rounded-lg bg-green-400/10">
            <p className="text-2xl font-bold text-green-400">
              {stats.published}
            </p>
            <p className="text-xs text-muted-foreground">Publicado</p>
          </div>
          <div className="text-center p-3 glass rounded-lg bg-yellow-400/10">
            <p className="text-2xl font-bold text-yellow-400">
              {stats.pending}
            </p>
            <p className="text-xs text-muted-foreground">Pendente</p>
          </div>
          <div className="text-center p-3 glass rounded-lg bg-red-400/10">
            <p className="text-2xl font-bold text-red-400">{stats.error}</p>
            <p className="text-xs text-muted-foreground">Erro</p>
          </div>
        </div>

        <div className="space-y-2">
          {publication.announcements.map((announcement) => {
            const config =
              STATUS_CONFIG[announcement.status] || STATUS_CONFIG.NOT_PUBLISHED;
            const logo = PORTAL_LOGOS[announcement.portalId] || "🌐";

            return (
              <div
                key={announcement.id}
                className="flex items-center justify-between p-3 glass rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{logo}</span>
                  <div>
                    <p className="font-medium">{announcement.portalName}</p>
                    {announcement.url && (
                      <a
                        href={announcement.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        Ver no portal <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {announcement.lastSyncAt && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(announcement.lastSyncAt, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  )}
                  <Badge className={cn("gap-1", config.color)}>
                    {config.icon}
                    {config.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>

        {publication.expiresAt && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Expira em{" "}
              {formatDistanceToNow(publication.expiresAt, {
                addSuffix: true,
                locale: ptBR,
              })}
            </span>
            <Button variant="outline" size="sm">
              Renovar Publicação
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
