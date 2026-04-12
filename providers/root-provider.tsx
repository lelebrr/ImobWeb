'use client'

import React from 'react'
import { ThemeProvider, AuthProvider, AIProvider, MobileProvider } from './index'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@radix-ui/react-tooltip'

/**
 * RootProvider
 * Centraliza todos os providers da aplicação para manter o layout limpo.
 */
export function RootProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <AIProvider>
          <MobileProvider>
            <TooltipProvider delayDuration={0}>
              {children}
            </TooltipProvider>
            <Toaster richColors position="top-right" closeButton />
          </MobileProvider>
        </AIProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
