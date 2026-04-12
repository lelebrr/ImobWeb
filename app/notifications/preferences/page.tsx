'use client';

import { useState } from 'react';
import { Bell, Mail, Smartphone, MessageCircle, Moon, Sun, Save, RotateCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/design-system/card';
import { Button } from '@/components/design-system/button';
import { cn } from '@/lib/utils';

interface NotificationPreferencesProps {
  userId: string;
  onSave?: (preferences: Preferences) => void;
}

interface Preferences {
  channels: {
    inApp: boolean;
    push: boolean;
    email: boolean;
    sms: boolean;
    whatsapp: boolean;
  };
  types: {
    newLead: boolean;
    propertyUpdate: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
    reminders: boolean;
    payments: boolean;
    leadsFromPortals: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const DEFAULT_PREFERENCES: Preferences = {
  channels: {
    inApp: true,
    push: true,
    email: true,
    sms: false,
    whatsapp: true
  },
  types: {
    newLead: true,
    propertyUpdate: true,
    systemAlerts: true,
    weeklyReports: true,
    reminders: true,
    payments: true,
    leadsFromPortals: true
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00'
  }
};

function NotificationPreferencesCenter({ userId, onSave }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleToggle = (category: 'channels' | 'types', key: string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key as keyof typeof prev[typeof category]]
      }
    }));
    setSaved(false);
  };

  const handleQuietHoursToggle = () => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours.enabled
      }
    }));
    setSaved(false);
  };

  const handleTimeChange = (field: 'start' | 'end', value: string) => {
    setPreferences(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        [field]: value
      }
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    onSave?.(preferences);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setPreferences(DEFAULT_PREFERENCES);
    setSaved(false);
  };

  const channelItems = [
    { key: 'inApp', label: 'Notificações no App', icon: Bell, description: 'Receba notificações dentro do imobWeb' },
    { key: 'push', label: 'Push Notifications', icon: Smartphone, description: 'Notificações mesmo quando o app está fechado' },
    { key: 'email', label: 'E-mail', icon: Mail, description: 'Receba notificações por e-mail' },
    { key: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, description: 'Mensagens instantâneas no WhatsApp' },
    { key: 'sms', label: 'SMS', icon: Smartphone, description: 'Mensagens de texto (custo adicional)' }
  ];

  const typeItems = [
    { key: 'newLead', label: 'Novos Leads', description: 'Quando você recebe um novo lead' },
    { key: 'leadsFromPortals', label: 'Leads dos Portais', description: 'Contatos dos portais (Zap, Viva, OLX)' },
    { key: 'propertyUpdate', label: 'Atualizações de Imóveis', description: 'Alterações nos imóveis cadastrados' },
    { key: 'reminders', label: 'Lembretes', description: 'Visitas, tarefas e eventos agendados' },
    { key: 'weeklyReports', label: 'Relatório Semanal', description: 'Resumo semanal de performance' },
    { key: 'payments', label: 'Pagamentos', description: 'Confirmações e alertas de pagamento' },
    { key: 'systemAlerts', label: 'Alertas do Sistema', description: 'Avisos importantes e atualizações' }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Preferências de Notificações</h2>
          <p className="text-gray-500">Escolha como e quando deseja receber notificações</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Canais de Notificação
          </CardTitle>
          <CardDescription>Selecione os canais que deseja utilizar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {channelItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <item.icon className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-500">{item.description}</p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('channels', item.key)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  preferences.channels[item.key as keyof typeof preferences.channels] ? 'bg-blue-600' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                    preferences.channels[item.key as keyof typeof preferences.channels] && 'translate-x-5'
                  )}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tipos de Notificação
          </CardTitle>
          <CardDescription>Escolha quais notificações deseja receber</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {typeItems.map((item) => (
            <div key={item.key} className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.description}</p>
              </div>
              <button
                onClick={() => handleToggle('types', item.key)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  preferences.types[item.key as keyof typeof preferences.types] ? 'bg-blue-600' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                    preferences.types[item.key as keyof typeof preferences.types] && 'translate-x-5'
                  )}
                />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {preferences.quietHours.enabled ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            Horário Silencioso
          </CardTitle>
          <CardDescription>Desative notificações durante o período de descanso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <p className="font-medium text-gray-900">Ativar horário silencioso</p>
              <p className="text-sm text-gray-500">Notificações serão silenciadas no período definido</p>
            </div>
            <button
              onClick={handleQuietHoursToggle}
              className={cn(
                'relative h-6 w-11 rounded-full transition-colors',
                preferences.quietHours.enabled ? 'bg-blue-600' : 'bg-gray-300'
              )}
            >
              <span
                className={cn(
                  'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                  preferences.quietHours.enabled && 'translate-x-5'
                )}
              />
            </button>
          </div>

          {preferences.quietHours.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Início</label>
                <input
                  type="time"
                  value={preferences.quietHours.start}
                  onChange={(e) => handleTimeChange('start', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fim</label>
                <input
                  type="time"
                  value={preferences.quietHours.end}
                  onChange={(e) => handleTimeChange('end', e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-2 h-4 w-4" />
          Restaurar Padrão
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className={cn('mr-2 h-4 w-4', saving && 'animate-spin')} />
          {saving ? 'Salvando...' : saved ? 'Salvo!' : 'Salvar Alterações'}
        </Button>
      </div>
    </div>
  );
}

export default function NotificationPreferencesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl py-8">
        <NotificationPreferencesCenter userId="current-user" />
      </div>
    </div>
  );
}
