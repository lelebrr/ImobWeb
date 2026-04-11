'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User, Session } from '@supabase/supabase-js'
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

    const [supabase] = useState(() => createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    ))

    /**
     * Atualizar sessão
     */
    const refreshSession = async () => {
        try {
            const { data: { session }, error } = await supabase.auth.getSession()
            if (error) throw error

            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user.user_metadata) {
                setOrganizationId(session.user.user_metadata.organizationId || null)
            }
        } catch (error) {
            console.error('Erro ao atualizar sessão:', error)
        }
    }

    /**
     * Inicializar sessão
     */
    useEffect(() => {
        refreshSession()

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user.user_metadata) {
                setOrganizationId(session.user.user_metadata.organizationId || null)
            }
        })

        return () => subscription.unsubscribe()
    }, [supabase])

    /**
     * Determinar papel do usuário
     */
    const role = (user?.user_metadata?.role as UserRole) || null

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
        [UserRole.ADMIN]: 4,
        [UserRole.GERENTE]: 3,
        [UserRole.CORRETOR]: 2,
        [UserRole.ASSISTENTE]: 1,
    }

    return roleHierarchy[role] >= roleHierarchy[requiredRole]
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
