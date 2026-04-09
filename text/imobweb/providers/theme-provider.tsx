'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider } from 'next-themes'
import { type ThemeProviderProps } from 'next-themes/dist/types'

/**
 * Provider de Tema
 * Gerencia o tema claro/escuro da aplicação
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

/**
 * Hook para acessar o tema atual
 */
export function useTheme() {
    const context = React.useContext(NextThemesProvider)
    if (context === undefined) {
        throw new Error('useTheme deve ser usado dentro de um ThemeProvider')
    }
    return context
}
