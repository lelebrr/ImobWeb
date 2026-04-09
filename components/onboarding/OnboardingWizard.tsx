'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Building2, Users, MessageSquare, CreditCard, ArrowRight, ArrowLeft } from 'lucide-react'
import { trackOnboardingEvent } from '@/lib/analytics/events'

interface WizardStep {
    id: string
    title: string
    description: string
    icon: React.ReactNode
}

const steps: WizardStep[] = [
    {
        id: 'organization',
        title: 'Dados da Imobiliária',
        description: 'Informações básicas sobre sua empresa',
        icon: <Building2 className="h-8 w-8" />,
    },
    {
        id: 'team',
        title: 'Convide sua Equipe',
        description: 'Adicione corretores e colaboradores',
        icon: <Users className="h-8 w-8" />,
    },
    {
        id: 'whatsapp',
        title: 'Configuração WhatsApp',
        description: 'Integre sua conta do WhatsApp',
        icon: <MessageSquare className="h-8 w-8" />,
    },
    {
        id: 'billing',
        title: 'Escolha seu Plano',
        description: 'Selecione o plano ideal para seu negócio',
        icon: <CreditCard className="h-8 w-8" />,
    },
]

interface OnboardingWizardProps {
    currentStep?: number
    onStepChange?: (step: number) => void
    onComplete?: () => void
}

const OnboardingWizard = ({ currentStep = 0, onStepChange, onComplete }: OnboardingWizardProps) => {
    const [activeStep, setActiveStep] = useState(currentStep)
    const [completedSteps, setCompletedSteps] = useState<number[]>([])

    // Track when steps are completed
    useEffect(() => {
        if (completedSteps.includes(activeStep)) {
            trackOnboardingEvent('Onboarding Step Completed', activeStep + 1)
        }
    }, [activeStep, completedSteps])

    const handleStepChange = (step: number) => {
        setActiveStep(step)
        onStepChange?.(step)
    }

    const handleNext = async () => {
        // Mark current step as completed
        if (!completedSteps.includes(activeStep)) {
            setCompletedSteps([...completedSteps, activeStep])
        }

        // Move to next step
        if (activeStep < steps.length - 1) {
            setActiveStep(activeStep + 1)
            onStepChange?.(activeStep + 1)
        } else {
            // Onboarding completed
            onComplete?.()
            // In a real app, you would redirect to dashboard here
        }
    }

    const handlePrev = () => {
        if (activeStep > 0) {
            setActiveStep(activeStep - 1)
            onStepChange?.(activeStep - 1)
        }
    }

    const isStepCompleted = (stepIndex: number) =>
        completedSteps.includes(stepIndex) || stepIndex < activeStep

    return (
        <div className="w-full max-w-4xl mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => (
                        <div key={step.id} className="flex items-center">
                            <div className="flex items-center">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 ${isStepCompleted(index)
                                            ? 'border-green-500 bg-green-500 text-white'
                                            : activeStep === index
                                                ? 'border-blue-500 bg-blue-500 text-white'
                                                : 'border-gray-300 bg-white text-gray-500'
                                        }`}
                                >
                                    {isStepCompleted(index) ? (
                                        <CheckCircle className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-medium">{index + 1}</span>
                                    )}
                                </div>

                                <div className="ml-4">
                                    <h3 className="text-sm font-medium text-gray-900">
                                        {step.title}
                                    </h3>
                                    <p className="text-xs text-gray-500">
                                        {step.description}
                                    </p>
                                </div>
                            </div>

                            {index < steps.length - 1 && (
                                <div
                                    className={`mx-4 h-0.5 flex-1 ${index < activeStep ? 'bg-green-500' : 'bg-gray-300'
                                        }`}
                                ></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step content */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        {steps[activeStep].icon}
                        <span className="ml-2">{steps[activeStep].title}</span>
                    </CardTitle>
                    <CardDescription>
                        {steps[activeStep].description}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <div className="py-6">
                        {/* Render step content based on active step */}
                        {activeStep === 0 && (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="organization-name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome da Imobiliária
                                    </label>
                                    <input
                                        type="text"
                                        id="organization-name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ex: Imobiliária ABC"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="organization-email" className="block text-sm font-medium text-gray-700 mb-1">
                                        E-mail corporativo
                                    </label>
                                    <input
                                        type="email"
                                        id="organization-email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="contato@imobiliariaabc.com.br"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="organization-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Telefone
                                    </label>
                                    <input
                                        type="tel"
                                        id="organization-phone"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="(11) 9999-9999"
                                    />
                                </div>
                            </div>
                        )}

                        {activeStep === 1 && (
                            <div className="space-y-6">
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">
                                        Envite corretores e colaboradores para sua equipe
                                    </p>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Convidar Corretor
                                    </Button>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Corretores já convidados
                                    </h4>
                                    <div className="border border-gray-200 rounded-md p-4">
                                        <p className="text-gray-500 text-sm">
                                            Nenhum convite enviado ainda
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeStep === 2 && (
                            <div className="space-y-6">
                                <div className="text-center py-8">
                                    <p className="text-gray-600 mb-4">
                                        Configure sua integração com o WhatsApp
                                    </p>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Conectar WhatsApp
                                    </Button>
                                </div>

                                <div className="border border-gray-200 rounded-md p-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                                        Pré-requisitos
                                    </h4>
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        <li>• Conta do WhatsApp Business</li>
                                        <li>• Número de telefone verificado</li>
                                        <li>• Acesso ao WhatsApp Cloud API</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {activeStep === 3 && (
                            <div className="space-y-6">
                                <div className="text-center py-4">
                                    <p className="text-gray-600">
                                        Escolha o plano que melhor se adapta ao seu negócio
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-medium mb-2">Grátis</h3>
                                        <p className="text-2xl font-bold mb-2">R$ 0</p>
                                        <p className="text-sm text-gray-600 mb-4">Para corretores autônomos</p>
                                        <ul className="text-sm text-gray-600 space-y-1 mb-4">
                                            <li>• Até 10 imóveis</li>
                                            <li>• Até 100 contatos</li>
                                            <li>• Suporte básico</li>
                                        </ul>
                                        <Button variant="outline" className="w-full">
                                            Escolher
                                        </Button>
                                    </div>

                                    <div className="border-2 border-blue-500 rounded-lg p-4 relative">
                                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                                            Recomendado
                                        </div>
                                        <h3 className="font-medium mb-2">Professional</h3>
                                        <p className="text-2xl font-bold mb-2">R$ 99/mês</p>
                                        <p className="text-sm text-gray-600 mb-4">Para imobiliárias</p>
                                        <ul className="text-sm text-gray-600 space-y-1 mb-4">
                                            <li>• Imóveis ilimitados</li>
                                            <li>• Contatos ilimitados</li>
                                            <li>• Integração WhatsApp</li>
                                            <li>• Relatórios avançados</li>
                                        </ul>
                                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                            Escolher
                                        </Button>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <h3 className="font-medium mb-2">Enterprise</h3>
                                        <p className="text-xl font-bold mb-2">Personalizado</p>
                                        <p className="text-sm text-gray-600 mb-4">Para grandes imobiliárias</p>
                                        <ul className="text-sm text-gray-600 space-y-1 mb-4">
                                            <li>• Tudo do Professional</li>
                                            <li>• Suporte dedicado</li>
                                            <li>• Personalizações</li>
                                            <li>• Treinamentos</li>
                                        </ul>
                                        <Button variant="outline" className="w-full">
                                            Contato
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Navigation buttons */}
            <div className="mt-8 flex justify-between">
                <Button
                    variant="outline"
                    onClick={handlePrev}
                    disabled={activeStep === 0}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Anterior
                </Button>

                <Button onClick={handleNext}>
                    {activeStep === steps.length - 1 ? 'Concluir' : 'Próximo'}
                    {activeStep < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
            </div>
        </div>
    )
}

export default OnboardingWizard