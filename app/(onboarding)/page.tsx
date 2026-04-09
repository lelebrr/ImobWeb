import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export default function OnboardingPage() {
    // Em uma implementação real, verificaríamos se o usuário já completou o onboarding
    // e redirecionaríamos para o dashboard se necessário
    // const isCompleted = await checkOnboardingStatus()
    // if (isCompleted) {
    //   redirect('/dashboard')
    // }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center py-12">
            <div className="w-full max-w-4xl px-4 sm:px-6 lg:px-8">
                <Suspense fallback={<div>Carregando...</div>}>
                    <OnboardingWizard />
                </Suspense>
            </div>
        </main>
    )
}