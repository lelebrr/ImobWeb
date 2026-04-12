"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Aqui enviaríamos para o Sentry
    console.error("[MONITORING ERROR]", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center space-y-4">
          <div className="bg-destructive/10 p-4 rounded-full">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <h2 className="text-2xl font-bold">Ops! Algo deu errado.</h2>
          <p className="text-muted-foreground max-w-md">
            Ocorreu um erro inesperado nesta parte da interface. Nossa equipe foi notificada.
          </p>
          <Button 
            onClick={() => this.setState({ hasError: false })}
            variant="outline"
          >
            Tentar novamente
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
