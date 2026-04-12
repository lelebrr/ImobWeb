'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'

/**
 * Provider de Tema
 * Gerencia o tema claro/escuro da aplicação
 */
export function ThemeProvider({ children, ...props }: any) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

/**
 * Hook para acessar o tema atual
 */
export function useTheme() {
    return useNextTheme()
}
