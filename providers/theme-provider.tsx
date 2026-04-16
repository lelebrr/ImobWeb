'use client'

import * as React from 'react'
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes'

import { type ThemeProviderProps } from 'next-themes'

/**
 * Theme Provider
 * Manages light/dark theme throughout the application
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

/**
 * Hook para acessar o tema atual
 */
export function useTheme() {
    return useNextTheme()
}
