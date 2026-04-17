/**
 * ============================================
 * COMPONENT PERMISSION GUARD
 * ============================================
 * Componente React para proteger elementos de UI
 * baseado nas permissões do usuário.
 */

"use client";

import React, { useEffect, useState } from "react";
import { can, hasPermission } from "@/lib/permissions";
import type { PermissionCheck } from "@/types/permissions";
import { PermissionAction, ResourceType } from "@/types/permissions";

interface PermissionGuardProps {
  children: React.ReactNode;
  requiredPermissions: Array<{
    action: PermissionAction;
    resource: ResourceType;
  }>;
  fallback?: React.ReactNode;
  userId?: string;
  organizationId?: string;
  showFallback?: boolean;
}

export function PermissionGuard({
  children,
  requiredPermissions,
  fallback = null,
  userId,
  organizationId,
  showFallback = false,
}: PermissionGuardProps) {
  const [hasAccess, setHasAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkPermissions() {
      if (!userId || requiredPermissions.length === 0) {
        setHasAccess(true);
        setIsLoading(false);
        return;
      }

      for (const perm of requiredPermissions) {
        const check: PermissionCheck = {
          userId,
          action: perm.action,
          resource: perm.resource,
          organizationId,
        };

        const result = await hasPermission(check);
        if (result.allowed) {
          setHasAccess(true);
          setIsLoading(false);
          return;
        }
      }

      setHasAccess(false);
      setIsLoading(false);
    }

    checkPermissions();
  }, [userId, organizationId, requiredPermissions]);

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-20" />
      </div>
    );
  }

  if (!hasAccess) {
    return showFallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

interface PermissionButtonProps {
  children: React.ReactNode;
  action: PermissionAction;
  resource: ResourceType;
  userId?: string;
  organizationId?: string;
  onClick?: () => void;
  className?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function PermissionButton({
  children,
  action,
  resource,
  userId,
  organizationId,
  onClick,
  className = "",
  variant = "primary",
  size = "md",
  disabled = false,
}: PermissionButtonProps) {
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (!userId) return;

      const check: PermissionCheck = {
        userId,
        action,
        resource,
        organizationId,
      };

      const result = await hasPermission(check);
      setHasAccess(result.allowed);
    }

    checkPermission();
  }, [userId, organizationId, action, resource]);

  const variantClasses = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    danger: "bg-red-600 text-white hover:bg-red-700",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  if (!hasAccess) return null;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        rounded-lg font-medium transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  );
}

interface PermissionLinkProps {
  children: React.ReactNode;
  action: PermissionAction;
  resource: ResourceType;
  userId?: string;
  organizationId?: string;
  href: string;
  className?: string;
}

export function PermissionLink({
  children,
  action,
  resource,
  userId,
  organizationId,
  href,
  className = "",
}: PermissionLinkProps) {
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (!userId) return;

      const check: PermissionCheck = {
        userId,
        action,
        resource,
        organizationId,
      };

      const result = await hasPermission(check);
      setHasAccess(result.allowed);
    }

    checkPermission();
  }, [userId, organizationId, action, resource]);

  if (!hasAccess) return null;

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

interface PermissionNavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  action: PermissionAction;
  resource: ResourceType;
  userId?: string;
  organizationId?: string;
  badge?: number;
}

export function PermissionNavItem({
  icon,
  label,
  href,
  action,
  resource,
  userId,
  organizationId,
  badge,
}: PermissionNavItemProps) {
  const [hasAccess, setHasAccess] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (!userId) {
        setHasAccess(true);
        return;
      }

      const check: PermissionCheck = {
        userId,
        action,
        resource,
        organizationId,
      };

      const result = await hasPermission(check);
      setHasAccess(result.allowed);
    }

    checkPermission();
  }, [userId, organizationId, action, resource]);

  if (!hasAccess) return null;

  return (
    <a
      href={href}
      className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
    >
      {icon}
      <span>{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </a>
  );
}

export default PermissionGuard;
