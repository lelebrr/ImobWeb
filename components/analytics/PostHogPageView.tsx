'use client'

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef } from "react"
import { analytics } from "@/lib/analytics/posthog"

/**
 * PostHogPageView
 * Captura pageviews manualmente no Next.js App Router.
 * Este componente deve ser inserido no RootLayout.
 */
export function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const lastUrlRef = useRef<string>('')

  useEffect(() => {
    if (pathname && analytics.isInitialized) {
      let url = window.origin + pathname
      if (searchParams && searchParams.toString()) {
        url = url + `?${searchParams.toString()}`
      }
      
      if (url !== lastUrlRef.current) {
        lastUrlRef.current = url
        analytics.capturePageview(url)
      }
    }
  }, [pathname, searchParams])

  return null
}
