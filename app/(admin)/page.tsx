import { Suspense } from 'react'
import Dashboard from '@/components/admin/Dashboard'

export default function AdminPage() {
    return (
        <Suspense fallback={<div>Carregando dashboard...</div>}>
            <Dashboard />
        </Suspense>
    )
}