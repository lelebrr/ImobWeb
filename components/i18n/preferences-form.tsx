'use client';

import * as React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { commonTimezones } from '@/lib/i18n/timezone-helper';

/**
 * Advanced Preferences Form for i18n.
 * Manages Timezone, Number Format, and Currency preferences.
 */
export function I18nPreferencesForm() {
  const t = useTranslations('Settings');
  const locale = useLocale();
  const [loading, setLoading] = React.useState(false);

  async function handleSave() {
    setLoading(true);
    // Simulate API call to save preferences to Supabase/Prisma
    await new Promise(resolve => setTimeout(resolve, 800));
    setLoading(false);
    toast.success('Preferências de localização salvas com sucesso!');
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="timezone">{t('timezone')}</Label>
        <Select defaultValue="America/Sao_Paulo">
          <SelectTrigger className="border-white/10 bg-black/20">
            <SelectValue placeholder="Selecione seu fuso horário" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-black/90 backdrop-blur-xl">
            {commonTimezones.map(tz => (
              <SelectItem key={tz} value={tz}>{tz}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency_display">Formato de Moeda Preferencial</Label>
        <Select defaultValue="default">
          <SelectTrigger className="border-white/10 bg-black/20">
            <SelectValue placeholder="Selecione o formato" />
          </SelectTrigger>
          <SelectContent className="border-white/10 bg-black/90 backdrop-blur-xl">
            <SelectItem value="default">Padrão do Idioma (Auto)</SelectItem>
            <SelectItem value="european">Europeu (1.234,56 €)</SelectItem>
            <SelectItem value="american">Americano ($1,234.56)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
        <div className="space-y-0.5">
          <Label className="text-base">Tradução Automática por IA</Label>
          <p className="text-sm text-muted-foreground">
            Traduzir automaticamente descrições de imóveis não cadastradas no seu idioma.
          </p>
        </div>
        <Switch defaultChecked />
      </div>

      <Button 
        onClick={handleSave} 
        disabled={loading}
        className="w-full bg-primary hover:bg-primary/80 text-white font-bold"
      >
        {loading ? 'Salvando...' : 'Salvar Alterações'}
      </Button>
    </div>
  );
}
