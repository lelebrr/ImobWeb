# i18n Development Guide - imobWeb

Este documento serve como guia para as outras IAs e desenvolvedores integrarem novos recursos ao sistema de internacionalização do imobWeb.

## 1. Como traduzir componentes

### Client Components
```tsx
'use client';
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('Namespace');
  return <h1>{t('key')}</h1>;
}
```

### Server Components
```tsx
import { getTranslations } from 'next-intl/server';

export default async function Page() {
  const t = await getTranslations('Namespace');
  return <div>{t('key')}</div>;
}
```

## 2. Formatação Localizada

Sempre use os formatadores em `lib/` em vez de métodos nativos genéricos:

- **Moeda**: `formatCurrency(valor, locale)`
- **Data**: `formatDate(data, 'short', locale)`
- **Telefone**: `formatPhoneNumber(tel, locale)`
- **Área**: `formatArea(m2, locale)` -> Converte automaticamente para ft² se necessário.

## 3. Tradução Dinâmica por IA

Se você estiver lidando com conteúdo gerado pelo usuário (ex: descrições de imóveis) que precisa de tradução instantânea:

```tsx
import { useAITranslation } from '@/lib/i18n/use-ai-translation';

const { translate, isTranslating } = useAITranslation();
const translated = await translate("Texto longo em português", "en-US");
```

## 4. SEO e Metadados

Para garantir que as páginas sejam indexadas corretamente em vários idiomas:

```tsx
export async function generateMetadata({ params: { locale } }) {
  // Use o seo-helper para gerar hreflang e canonical automaticamente
  return getI18nMetadata('/caminho-da-pagina', locale);
}
```

## 5. Estrutura de Dicionários

Os arquivos JSON estão em `lib/locales/`. Mantenha a hierarquia organizada por módulos (Auth, RealEstate, Finance, etc.).
