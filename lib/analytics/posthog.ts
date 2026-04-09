'use client'

import { PostHog } from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

if (typeof window !== 'undefined') {
    // Make sure to load PostHog only on the client-side
    import('posthog-js').then((module) => {
        const posthog = module.default

        if (!posthog.__INITIALIZED) {
            posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
                api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users
                capture_pageview: true,
                capture_pageleave: true,
            })
            posthog.__INITIALIZED = true
        }
    })
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
    return <PostHogProvider client={ typeof window !== 'undefined' ? window.posthog : undefined }>
        { children }
        </PostHogProvider>
}

// Helper function to capture events
export function capture(event: string, properties?: any) {
    if (typeof window !== 'undefined') {
        import('posthog-js').then((module) => {
            module.default?.capture(event, properties)
        })
    }
}

// Helper function to identify users
export function identify(userId: string, properties?: any) {
    if (typeof window !== 'undefined') {
        import('posthog-js').then((module) => {
            module.default?.identify(userId, properties)
        })
    }
}

// Helper function to reset
export function reset() {
    if (typeof window !== 'undefined') {
        import('posthog-js').then((module) => {
            module.default?.reset()
        })
    }
}

// Custom hook for PostHog events
export function usePostHog() {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            import('posthog-js').then((module) => {
                if (module.default) {
                    // Initialize PostHog if it's not already initialized
                    if (!module.default.__INITIALIZED) {
                        module.default.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
                            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
                            person_profiles: 'identified_only',
                            capture_pageview: true,
                            capture_pageleave: true,
                        })
                        module.default.__INITIALIZED = true
                    }
                }
            })
        }
    }, [])
}