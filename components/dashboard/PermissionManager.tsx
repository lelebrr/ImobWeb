'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Settings, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Lock,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PERMISSIONS, ROLE_TEMPLATES, PermissionKey } from '@/lib/rbac/constants';

interface PermissionManagerProps {
  userRole: string;
  userPermissions: { denied: string[]; granted: string[] };
  onUpdatePermissions: (newPermissions: { denied: string[]; granted: string[] }) => void;
  isAdmin?: boolean;
}

/**
 * PERMISSION MANAGER - "THE GIANT"
 * A professional UI for granular RBAC control with individual overrides.
 */
export const PermissionManager: React.FC<PermissionManagerProps> = ({
  userRole,
  userPermissions,
  onUpdatePermissions,
  isAdmin = false
}) => {
  const [expandedModules, setExpandedModules] = useState<string[]>(['PROPERTIES', 'LEADS']);
  
  // Group permissions by category for the UI
  const permissionModules = [
    { 
      id: 'PROPERTIES', 
      name: 'Imóveis', 
      icon: <Settings className="w-5 h-5 text-indigo-400" />,
      keys: Object.entries(PERMISSIONS).filter(([k]) => k.startsWith('PROPERTIES_'))
    },
    { 
      id: 'LEADS', 
      name: 'Leads & Funis', 
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      keys: Object.entries(PERMISSIONS).filter(([k]) => k.startsWith('LEADS_'))
    },
    { 
      id: 'FINANCIAL', 
      name: 'Financeiro & Faturamento', 
      icon: <Shield className="w-5 h-5 text-emerald-400" />,
      keys: Object.entries(PERMISSIONS).filter(([k]) => k.startsWith('FINANCIAL_'))
    },
    { 
      id: 'WHATSAPP', 
      name: 'Comunicação WhatsApp', 
      icon: <Zap className="w-5 h-5 text-green-400" />,
      keys: Object.entries(PERMISSIONS).filter(([k]) => k.startsWith('WHATSAPP_'))
    }
  ];

  const defaultRolePerms = ROLE_TEMPLATES[userRole] || [];

  const togglePermission = (key: string) => {
    if (!isAdmin) return;

    const isDenied = userPermissions.denied.includes(key);
    const isGranted = userPermissions.granted.includes(key);
    const isDefault = defaultRolePerms.includes(key as PermissionKey);

    let newDenied = [...userPermissions.denied];
    let newGranted = [...userPermissions.granted];

    if (isDefault) {
      // Toggle to Denied
      if (isDenied) {
        newDenied = newDenied.filter(k => k !== key);
      } else {
        newDenied.push(key);
      }
    } else {
      // Toggle to Granted
      if (isGranted) {
        newGranted = newGranted.filter(k => k !== key);
      } else {
        newGranted.push(key);
      }
    }

    onUpdatePermissions({ denied: newDenied, granted: newGranted });
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId]
    );
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-[2rem] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="p-8 border-b border-slate-800 bg-gradient-to-r from-indigo-600/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600/20 rounded-2xl text-indigo-400">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white italic tracking-tighter">Matriz de Privilégios Elite</h2>
            <p className="text-slate-500 text-sm">Controle granular de acessos e overrides por usuário.</p>
          </div>
        </div>
      </div>

      {/* Modules */}
      <div className="p-4 space-y-4">
        {permissionModules.map(module => (
          <div key={module.id} className="border border-slate-800 rounded-3xl overflow-hidden bg-slate-900/30">
            <button 
              onClick={() => toggleModule(module.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                {module.icon}
                <span className="text-lg font-bold text-white italic">{module.name}</span>
              </div>
              {expandedModules.includes(module.id) ? <ChevronUp className="text-slate-500" /> : <ChevronDown className="text-slate-500" />}
            </button>

            {expandedModules.includes(module.id) && (
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/50">
                {module.keys.map(([name, key]) => {
                  const isRoleDefault = defaultRolePerms.includes(key as PermissionKey);
                  const isDenied = userPermissions.denied.includes(key);
                  const isGranted = userPermissions.granted.includes(key);
                  const hasAccess = (isRoleDefault && !isDenied) || isGranted;

                  return (
                    <div 
                      key={key}
                      onClick={() => togglePermission(key)}
                      className={cn(
                        "group flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                        hasAccess 
                          ? "bg-indigo-600/5 border-indigo-500/30 hover:border-indigo-500" 
                          : "bg-slate-900 border-slate-800 opacity-60 hover:opacity-100"
                      )}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">
                          {name.replace(/_/g, ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "text-sm font-bold",
                             hasAccess ? "text-white" : "text-slate-400"
                           )}>
                             {hasAccess ? "Habilitado" : "Bloqueado"}
                           </span>
                           {isDenied && <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">Override Ativo</span>}
                           {isGranted && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">Extra Ativo</span>}
                        </div>
                      </div>
                      
                      <div className={cn(
                        "p-2 rounded-xl transition-all",
                        hasAccess ? "bg-indigo-600 text-white shadow-lg" : "bg-slate-800 text-slate-500"
                      )}>
                        {hasAccess ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer / Explanation */}
      <div className="p-8 bg-slate-950/80 border-t border-slate-800 text-[10px] text-slate-600 uppercase font-black tracking-widest flex items-center gap-4">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-indigo-500" />
          Default do Role
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          Bloqueio Forçado
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          Liberação Extra
        </div>
      </div>
    </div>
  );
};
