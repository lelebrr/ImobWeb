import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/i18n/LanguageSwitcher';
import { I18nPreferencesForm } from '@/components/i18n/preferences-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Language Settings Page
 * Allows the user to configure global application language and preferences.
 */
export default function I18nSettingsPage() {
  const t = useTranslations('Settings');

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          {t('i18n')}
        </h1>
        <p className="text-muted-foreground mt-2">
          Personalize como o imobWeb se comporta para você e sua equipe global.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-white/10 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>{t('language')}</CardTitle>
              <CardDescription>
                Selecione o idioma principal da interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between">
              <span className="text-sm font-medium">Idioma Atual</span>
              <LanguageSwitcher />
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-black/40 backdrop-blur-md">
            <CardHeader>
              <CardTitle>Adaptação Cultural</CardTitle>
              <CardDescription>
                Informações detectadas automaticamente.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm py-2 border-b border-white/5">
                <span className="text-muted-foreground">Unidade</span>
                <span className="font-medium">m² / Km</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-muted-foreground">Data</span>
                <span className="font-medium">DD/MM/YYYY</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="border-white/10 bg-black/40 backdrop-blur-md h-full">
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>
                Ajuste fuso horário, moedas e tradução inteligente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <I18nPreferencesForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
