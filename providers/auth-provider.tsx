'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
// @ts-ignore
import { createBrowserClient } from '@supabase/ssr'
// Importar tipos genéricos do Supabase
type User = any
type Session = any
import { UserRole } from '@prisma/client'

/**
 * Contexto de Autenticação
 * Gerencia o estado da sessão do usuário e seus dados
 */
interface AuthContextType {
    user: User | null
    session: Session | null
    loading: boolean
    role: UserRole | null
    organizationId: string | null
    isAuthenticated: boolean
    refreshSession: () => Promise<void>
    signIn: (credentials: { email: string; password: string }) => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Provider de Autenticação
 * Deve envolver toda a aplicação
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)
    const [organizationId, setOrganizationId] = useState<string | null>(null)

    const [supabase] = useState(() => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'
        return createBrowserClient(url, key)
    })

    /**
     * Atualizar sessão
     */
    const refreshSession = async () => {
        try {
            // 1. Tentar obter a sessão atual através do endpoint nativo /api/auth/me
            const response = await fetch('/api/auth/me', {
                credentials: 'include',
                headers: { 'Cache-Control': 'no-cache' },
            })
            if (response.ok) {
                const data = await response.json()
                if (data.user) {
                    setUser(data.user)
                    setSession({ user: data.user })
                    setOrganizationId(data.organizationId || data.user.user_metadata?.organizationId || null)
                    return
                }
            }

            // 2. Fallback para Supabase se houver URL válida
            const isSupabaseConfigured =
                process.env.NEXT_PUBLIC_SUPABASE_URL &&
                !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

            if (isSupabaseConfigured) {
                const { data: { session }, error } = await supabase.auth.getSession()
                if (!error && session?.user) {
                    setSession(session)
                    setUser(session.user)
                    if (session.user.user_metadata) {
                        setOrganizationId(session.user.user_metadata.organizationId || null)
                    }
                    return
                }
            }

            setUser(null)
            setSession(null)
            setOrganizationId(null)
        } catch (error) {
            console.error('Erro ao atualizar sessão:', error)
            setUser(null)
            setSession(null)
            setOrganizationId(null)
        } finally {
            setLoading(false)
        }
    }

    /**
     * Inicializar sessão e monitorar mudanças
     */
    useEffect(() => {
        let mounted = true
        refreshSession()

        const isSupabaseConfigured =
            process.env.NEXT_PUBLIC_SUPABASE_URL &&
            !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

        if (isSupabaseConfigured) {
            const {
                data: { subscription },
            } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
                if (!mounted) return
                if (session?.user) {
                    setSession(session)
                    setUser(session.user)
                    if (session.user.user_metadata) {
                        setOrganizationId(session.user.user_metadata.organizationId || null)
                    }
                }
            })

            return () => {
                mounted = false
                subscription.unsubscribe()
            }
        }
    }, [supabase])

    /**
     * Determinar papel do usuário
     */
    const role = (user?.user_metadata?.role as UserRole) || (user?.role as UserRole) || null

    /**
     * Fazer login
     */
    const signIn = async ({ email, password }: any) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        })
        if (!response.ok) {
            const err = await response.json()
            throw new Error(err.error || 'Falha no login')
        }
        await refreshSession()
    }

    /**
     * Fazer logout
     */
    const signOut = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            const isSupabaseConfigured =
                process.env.NEXT_PUBLIC_SUPABASE_URL &&
                !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
            if (isSupabaseConfigured) {
                await supabase.auth.signOut()
            }
        } catch (error) {
            console.error('Erro na chamada de signOut:', error)
        } finally {
            setUser(null)
            setSession(null)
            setOrganizationId(null)
            setLoading(false)
            window.location.href = '/login'
        }
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                role,
                organizationId,
                isAuthenticated: !!user,
                refreshSession,
                signIn,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

/**
 * Hook para acessar o contexto de autenticação
 */
export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider')
    }
    return context
}

/**
 * Hook para verificar se o usuário tem uma role específica
 */
export function useHasRole(requiredRole: UserRole): boolean {
    const { role } = useAuth()
    if (!role) return false

    const roleHierarchy: Record<UserRole, number> = {
        // PLATORMA (MASTER CONTROL)
        [UserRole.PLATFORM_MASTER]: 1000,
        [UserRole.PLATFORM_FINANCE]: 900,
        [UserRole.PLATFORM_MARKETING]: 800,
        [UserRole.PLATFORM_SUPPORT]: 700,

        // AGÊNCIA (ADMIN)
        [UserRole.AGENCY_MASTER]: 100,
        [UserRole.ADMIN]: 100, // Legado

        // AGÊNCIA (DEPARTAMENTOS / GESTÃO)
        [UserRole.AGENCY_FINANCE]: 80,
        [UserRole.AGENCY_MARKETING]: 70,
        [UserRole.AGENCY_HR]: 60,
        [UserRole.GERENTE]: 50, // Legado

        // AGÊNCIA (OPERACIONAL)
        [UserRole.AGENCY_SUPPORT]: 40,
        [UserRole.AGENCY_SALES]: 20,
        [UserRole.CORRETOR]: 20, // Legado
        [UserRole.ASSISTENTE]: 10, // Legado
    }

    return (roleHierarchy[role] ?? 0) >= (roleHierarchy[requiredRole] ?? 0)
}

/**
 * Hook para verificar se o usuário é admin
 */
export function useIsAdmin(): boolean {
    return useHasRole(UserRole.ADMIN)
}

/**
 * Hook para verificar se o usuário é gerente
 */
export function useIsManager(): boolean {
    return useHasRole(UserRole.GERENTE)
}

/**
 * Hook para verificar se o usuário é corretor
 */
export function useIsAgent(): boolean {
    return useHasRole(UserRole.CORRETOR)
}
