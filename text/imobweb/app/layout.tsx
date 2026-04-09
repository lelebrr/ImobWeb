'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/design-system/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/design-system/card'
import { Sidebar } from '@/components/sidebar'
import { useAuth } from '@/providers'
import { UserRole } from '@/prisma/schema'

/**
 * Layout principal da aplicação
 * Contém o sidebar e o conteúdo principal
 */
export default function Layout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth()
    const [sidebarOpen, setSidebarOpen] = useState(true)

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                    <p className="text-slate-600 dark:text-slate-400">Carregando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <Sidebar
                userRole={user.user_metadata?.role as UserRole}
                onToggle={() => setSidebarOpen(!sidebarOpen)}
                isOpen={sidebarOpen}
            />

            {/* Main Content */}
            <div className="flex-1">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    )
}