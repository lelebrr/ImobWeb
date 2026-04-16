# ImobWeb Performance Optimization Plan

## Goal
Achieve a 100 score in Google PageSpeed Insights for both mobile and desktop.

## Current Status
Based on the analysis of the codebase, the following performance configurations are already in place:

### Image Optimization
- Uses `next/image` component for optimized image loading.
- Configured `next.config.mjs` with:
  - `formats: ["image/avif", "image/webp"]`
  - `deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048]`
  - `imageSizes: [16, 32, 48, 64, 96, 128, 256]`
  - Remote patterns for various domains (including Supabase, Google, etc.)
- Custom `ImageOptimized` component with blur-up transition, skeleton placeholders, and priority loading support.
- Some direct `<img>` tags found (should be migrated to `next/image`).

### Font Loading
- Uses `next/font/google` to load the Outfit font with subset `latin`, variable `--font-outfit`, and `display: "swap"`.
- Font is applied via `className={outfit.variable}` in `app/layout.tsx`.

### CSS Delivery
- Uses Tailwind CSS with JIT compilation (implied by the build setup).
- Global CSS file (`app/globals.css`) includes Tailwind directives and custom variables.
- CSS is imported in `app/layout.tsx`.

### JavaScript Bundle Size & Code Splitting
- Next.js 15 provides automatic code splitting.
- Dynamic import used in `app/(developers)/playground/page.tsx` for `swagger-ui-react`.
- External dependencies include many large libraries (e.g., `@ai-sdk/openai`, `@prisma/client`, `@radix-ui/*`, `@tanstack/react-table`, `ai`, `date-fns`, `dexie`, `framer-motion`, `lucide-react`, `next`, `next-auth`, `next-intl`, `openai`, `posthog-js`, `react`, `react-dom`, `react-hook-form`, `recharts`, `resend`, `sharp`, `sonner`, `stripe`, `swagger-ui-react`, `tailwind-merge`, `tailwindcss-animate`, `trpc-openapi`, `uuid`, `xlsx`, `xmlbuilder2`, `zod`, `zustand`).
- DevDependencies include testing and tooling.

### Third-Party Scripts & External Dependencies
- Analytics: `@vercel/analytics`, `posthog-js`
- Authentication: `next-auth`, `@auth/prisma-adapter`
- Payments: `stripe`, `@stripe/stripe-js`
- Database: `@prisma/client`, `@supabase/supabase-js`, `@supabase/ssr`
- AI: `@ai-sdk/openai`, `ai`, `openai`
- Email: `resend`, `@react-email/*`
- UI: `@radix-ui/*`, `lucide-react`, `clsx`, `tailwind-merge`, `tailwindcss-animate`, `sonner`
- Charts: `recharts`
- Date: `date-fns`
- Offline: `dexie`
- Animations: `framer-motion`
- Icons: `lucide-react`
- Forms: `react-hook-form`
- PDF: `jspdf`, `xlsx`
- Rich Text: `swagger-ui-react`
- State: `zustand`
- Validation: `zod`
- Internationalization: `next-intl`
- Monitoring: `@sentry/nextjs`
- Rate Limiting: `@upstash/ratelimit`, `@upstash/redis`
- WebSockets: Not observed
- Others: `lodash-es`, `csv-parser`, `exif-be-gone`, `html2canvas`, `jsPDF`, `xmlbuilder2`

### Caching Headers & Service Worker
- Service worker implemented in `public/sw.js` with:
  - Precaching of core assets (`/`, `/manifest.json`, `/offline.html`, icons)
  - Runtime caching for API requests (5-minute cache)
  - Offline fallback to `/offline.html`
  - Push notification handling
- PWA handler in `components/pwa/PWAHandler.tsx` registers the service worker and manages online/offline state.
- Next.js headers configuration in `next.config.mjs` includes:
  - Security headers (X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, Permissions-Policy, Content-Security-Policy)
  - PWA headers for `sw.js`, `manifest.json`, `offline.html`, and icons
  - API headers (CORS, rate limiting)
  - Public API headers
  - Development tools headers (in development)

### Core Web Vitals
- Largest Contentful Paint (LCP): Optimized via `next/image` (with priority for above-the-fold images) and font loading strategy.
- First Input Delay (FID): Minimized by minimizing main-thread work and using server components where possible.
- Cumulative Layout Shift (CLS): Mitigated by:
  - Using `next/image` with explicit width and height.
  - `font-display: swap` to avoid invisible text.
  - `suppressHydrationWarning` on `<html>` to avoid hydration mismatches.
  - `max-width: 100vw` on `*` to prevent horizontal overflow.

## Recommendations for 100 Score

### 1. Image Optimization
- **Migrate all `<img>` tags to `next/image` or `ImageOptimized`** (found in: `components/ui/PropertyCard.tsx`, `components/team/TeamHierarchy.tsx`, `components/navigation/Sidebar.tsx`, `components/navigation/ResponsiveHeader.tsx`, `components/leads/LeadSlideOver.tsx`, `components/contracts/SignatureWizard.tsx`, `app/help/articles/slug/page.tsx`, `app/(dashboard)/dashboard/page.tsx`, `app/(dashboard)/properties/[slug]/page.tsx`, `app/(branding)/preview/page.tsx`).
- **Use `priority` prop for above-the-fold images** (e.g., hero images, logo above the fold).
- **Consider using a custom loader or third-party image optimization service** (e.g., Cloudinary, Imgix) for further compression and resizing at edge.
- **Ensure all images are served with correct dimensions** (avoid CSS scaling down large images).
- **Leverage `next/future/image` if available** (Next.js 13+ has experimental features).
- **Add `loading="lazy"` for below-the-fold images** (default in `next/image` but ensure not overridden).

### 2. Font Loading
- **Consider self-hosting fonts** to eliminate external request to Google Fonts (though `next/font/google` already optimizes by inlining the font subset in CSS).
- **Preload critical font weights** if using multiple weights (currently only one variable? Outfit variable font may cover multiple weights).
- **Use `font-display: optional`** for non-critical text if acceptable (but current `swap` is good).

### 3. CSS Delivery
- **Purge unused CSS** (Tailwind JIT should already do this, but verify with `@next/bundle-analyzer`).
- **Consider inlining critical CSS** for above-the-fold content (extract and inline in `<head>`).
- **Reduce CSS specificity** where possible to reduce size.
- **Use `cssnano` or similar for minification** (Tailwind build should minify).

### 4. JavaScript Bundle Size & Code Splitting
- **Analyze bundle with `@next/bundle-analyzer`** (run `ANALYZE=true next build` and review).
- **Split large libraries** using dynamic imports where possible (e.g., heavy charts, maps, editors only when needed).
- **Consider replacing heavy libraries with lighter alternatives** (e.g., `date-fns` is already lightweight; `lucide-react` is tree-shakable).
- **Ensure server components are used where possible** to reduce client-side JS.
- **Avoid large libraries in client-only code** (move to server if possible).
- **Use `next/script` for third-party scripts** with `strategy="lazyOnload"` or `afterInteractive`.
- **Remove unused dependencies** (audit with `npm ls` or `depcheck`).

### 5. Third-Party Scripts & External Dependencies
- **Load non-essential third-party scripts asynchronously** (e.g., analytics, chat widgets).
- **Use `next/script`** with appropriate strategy.
- **Self-host static third-party assets** if possible (to reduce DNS lookups and improve caching).
- **Evaluate necessity of each third-party script** (e.g., do we need all analytics? PostHog and Vercel Analytics?).
- **Consolidate analytics** if possible.

### 6. Caching Headers & Service Worker
- **Increase cache timeout for static assets** (currently icons: 2592000 seconds = 30 days; consider 1 year for immutable assets).
- **Cache HTML documents** (consider `Cache-Control: max-age=0, must-revalidate` for dynamic, but for static pages like blog, longer cache).
- **Stale-while-revalidate** for assets that can be slightly stale.
- **Ensure API caching is appropriate** (currently 5 minutes for API; adjust based on data freshness).
- **Add `Cache-Control` for JSON responses** if applicable.
- **Consider using `Cache-Control: immutable` for fingerprinted assets** (Next.js already fingerprints `_next` assets).
- **Review service worker precaching list** to include all critical above-the-fold assets.

### 7. Core Web Vitals
- **Optimize LCP**:
  - Ensure LCP element (likely hero image or heading) loads quickly.
  - Use `priority` on `next/image` for LCP image.
  - Consider using `loading="eager"` for LCP image (but `priority` is preferred).
  - Reduce server response time (TTFB) by optimizing API routes and database queries.
  - Use CDN for static assets (Vercel already provides).
- **Optimize FID**:
  - Break up long tasks (use `requestIdleCallback` or `scheduler.yield`).
  - Minimize main-thread JavaScript (defer non-critical JS).
  - Use web workers for heavy computation if any.
- **Optimize CLS**:
  - Ensure all elements have explicit dimensions (images, ads, embeds).
  - Avoid inserting content above existing content (except in response to user interaction).
  - Use `transform` for animations instead of changing layout properties.

### 8. Additional Recommendations
- **Enable compression** (already `compress: true` in `next.config.mjs`).
- **Remove `poweredByHeader`** (already `poweredByHeader: false`).
- **Use HTTP/2 or HTTP/3** (Vercel provides).
- **Prioritize critical requests** with `<link rel="preload">` for fonts, critical CSS, critical JS.
- **Use `next/link` with `prefetch`** for likely next navigations.
- **Implement `Cache-Control` for HTML** if using ISR or static generation.
- **Monitor performance** with Web Vitals library and set up alerts.

## Implementation Plan
1. **Audit and migrate all `<img>` tags** to `next/image` or `ImageOptimized`.
2. **Run bundle analyzer** to identify large dependencies and apply code splitting.
3. **Review third-party scripts** and load them asynchronously.
4. **Adjust caching headers** for longer cache times on static assets.
5. **Verify Core Web Vitals** with a staging deployment and use web-vitals measurement.
6. **Iterate and test** with PageSpeed Insights until score reaches 100.

## Notes
- The project already has a strong performance foundation.
- Many optimizations are already in place (Next.js image, font optimization, service worker, security headers).
- The main gains will come from:
  - Fixing the remaining `<img>` tags.
  - Reducing JavaScript bundle size via code splitting and removing unused dependencies.
  - Optimizing third-party script loading.
  - Fine-tuning caching.

Let's implement these steps to achieve the goal.
