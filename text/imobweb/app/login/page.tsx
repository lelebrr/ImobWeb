'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/design-system/button'
import { Input } from '@/components/design-system/input'
import { Label } from '@/components/design-system/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/design-system/card'
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react'
import { useAuth } from '@/providers'

/**
 * Página de Login
 * Permite login com email/senha, Google e Magic Link
 */
export default function LoginPage() {
    const router = useRouter()
    const { signIn, loading: authLoading } = useAuth()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [showMagicLink, setShowMagicLink] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            await signIn({ email, password })
            router.push('/dashboard')
            router.refresh()
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleLogin = async () => {
        setIsLoading(true)
        setError('')

        try {
            const supabase = (await import('@supabase/supabase-js')).createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`,
                },
            })
        } catch (err: any) {
            setError(err.message || 'Erro ao fazer login com Google')
        } finally {
            setIsLoading(false)
        }
    }

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError('')

        try {
            const supabase = (await import('@supabase/supabase-js')).createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            )

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            })

            if (error) throw error

            setShowMagicLink(false)
            alert('Link mágico enviado para seu email!')
        } catch (err: any) {
            setError(err.message || 'Erro ao enviar link mágico')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4">
            <Card className="w-full max-w-md shadow-2xl border-slate-200 dark:border-slate-700">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Bem-vindo ao imobWeb</CardTitle>
                    <CardDescription className="text-sm">
                        Cadastro 1x. Publica em todos os portais. WhatsApp automático para proprietários.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {!showMagicLink ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={isLoading || authLoading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">Senha</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={isLoading || authLoading}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || authLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        Entrar
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-200 dark:border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-800 px-2 text-muted-foreground">
                                        Ou continue com
                                    </span>
                                </div>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                className="w-full"
                                onClick={handleGoogleLogin}
                                disabled={isLoading || authLoading}
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
                                    aria-hidden="true"
                                    focusable="false"
                                    data-prefix="fab"
                                    data-icon="google"
                                    role="img"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 488 512"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
                                    ></path>
                                </svg>
                                Google
                            </Button>

                            <div className="text-center space-y-2 pt-4">
                                <p className="text-sm text-muted-foreground">
                                    Não tem uma conta?{' '}
                                    <Link href="/register" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                                        Criar conta
                                    </Link>
                                </p>
                                <p className="text-sm">
                                    <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">
                                        Esqueceu sua senha?
                                    </Link>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleMagicLink} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="magic-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="magic-email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10"
                                        required
                                        disabled={isLoading || authLoading}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading || authLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    <>
                                        Enviar link mágico
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>

                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full"
                                onClick={() => setShowMagicLink(false)}
                                disabled={isLoading || authLoading}
                            >
                                Voltar
                            </Button>
                        </form>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col space-y-2 text-xs text-muted-foreground">
                    <p>🔒 Seus dados estão protegidos com criptografia de ponta a ponta</p>
                    <p>🤖 Powered by AI para máxima eficiência</p>
                </CardFooter>
            </Card>
        </div>
    )
}
