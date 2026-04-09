import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Painel Admin - imobWeb',
    description: 'Painel de administração global da imobWeb',
    keywords: 'painel admin imobweb, administração imobweb',
}

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR">
            <body className={inter.className}>
                <div className="min-h-screen bg-gray-50">
                    <div className="flex h-screen">
                        {/* Sidebar */}
                        <div className="hidden md:flex md:w-64 md:flex-col">
                            <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto border-r">
                                <div className="flex items-center flex-shrink-0 px-4">
                                    <div className="h-8 w-8 rounded bg-blue-500"></div>
                                    <span className="ml-2 text-xl font-bold">imobWeb</span>
                                </div>

                                <div className="mt-8 flex-grow flex flex-col">
                                    <nav className="flex-1 px-2 pb-4 space-y-1">
                                        <a
                                            href="/admin"
                                            className="bg-blue-50 text-blue-700 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                        >
                                            Dashboard
                                        </a>
                                        <a
                                            href="/admin/organizations"
                                            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                        >
                                            Organizações
                                        </a>
                                        <a
                                            href="/admin/subscriptions"
                                            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                        >
                                            Assinaturas
                                        </a>
                                        <a
                                            href="/admin/analytics"
                                            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                        >
                                            Analytics
                                        </a>
                                        <a
                                            href="/admin/broadcast"
                                            className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                        >
                                            Broadcast
                                        </a>
                                    </nav>

                                    <div className="mt-auto px-2">
                                        <a
                                            href="/"
                                            className="group flex items-center px-2 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
                                        >
                                            Sair
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main content */}
                        <div className="flex flex-col flex-1 overflow-hidden">
                            {/* Top navigation */}
                            <header className="bg-white shadow-sm border-b border-gray-200">
                                <div className="flex items-center justify-between px-4 py-3 sm:px-6">
                                    <div className="flex items-center">
                                        <button className="md:hidden">
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                            </svg>
                                        </button>
                                        <h1 className="ml-2 text-lg font-semibold text-gray-800">Painel de Administração</h1>
                                    </div>

                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                                                <span className="sr-only">Abrir menu do usuário</span>
                                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                                                    A
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </header>

                            {/* Page content */}
                            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
                                {children}
                            </main>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}