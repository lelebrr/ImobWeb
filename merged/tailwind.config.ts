import type { Config } from "tailwindcss";
const { fontFamily } = require("tailwindcss/defaultTheme");

/**
 * ============================================
 * TAILWIND CONFIG - IMOBWEB MERGE COMPLETO
 * ============================================
 * Combina configurações de todas as IAs:
 * - IA 1: Core utilities
 * - IA 2: Custom extensions
 * - IA 3: PWA/Theme colors
 * - IA 4: Design System tokens
 * ============================================
 */

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      // ============================================
      // IA 4 - DESIGN SYSTEM TOKENS
      // ============================================
      colors: {
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        // ============================================
        // IA 3 - PWA/BRAND COLORS
        // ============================================
        imobweb: {
          blue: "#0b5bd3",
          "blue-dark": "#0a4aad",
          "blue-light": "#1a6fe3",
          purple: "#667eea",
          "purple-dark": "#764ba2",
          success: "#48bb78",
          warning: "#ecc94b",
          error: "#e53e3e",
          info: "#4299e1",
        },
        // ============================================
        // IA 1 + IA 2 - REAL ESTATE COLORS
        // ============================================
        property: {
          available: "#22c55e",
          sold: "#ef4444",
          rented: "#f59e0b",
          reserved: "#8b5cf6",
          pending: "#6b7280",
          draft: "#9ca3af",
        },
        lead: {
          new: "#3b82f6",
          contacted: "#8b5cf6",
          interested: "#22c55e",
          converted: "#10b981",
          lost: "#ef4444",
        },
        // ============================================
        // IA 4 - SEMANTIC COLORS
        // ============================================
        success: {
          light: "#dcfce7",
          DEFAULT: "#22c55e",
          dark: "#166534",
        },
        warning: {
          light: "#fef3c7",
          DEFAULT: "#f59e0b",
          dark: "#92400e",
        },
        error: {
          light: "#fee2e2",
          DEFAULT: "#ef4444",
          dark: "#991b1b",
        },
        info: {
          light: "#dbeafe",
          DEFAULT: "#3b82f6",
          dark: "#1e40af",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        // ============================================
        // IA 4 - DESIGN SYSTEM RADII
        // ============================================
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        serif: ["var(--font-serif)", ...fontFamily.serif],
        mono: ["var(--font-mono)", ...fontFamily.mono],
        // ============================================
        // IA 4 - CUSTOM FONTS
        // ============================================
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      fontSize: {
        // ============================================
        // IA 4 - TYPOGRAPHY SCALE
        // ============================================
        "display-1": ["4.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }],
        "display-2": ["3.75rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "700" }],
        "display-3": ["3rem", { lineHeight: "1.2", fontWeight: "600" }],
        "display-4": ["2.25rem", { lineHeight: "1.3", fontWeight: "600" }],
        "heading-1": ["1.875rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-2": ["1.5rem", { lineHeight: "1.4", fontWeight: "600" }],
        "heading-3": ["1.25rem", { lineHeight: "1.5", fontWeight: "600" }],
        "heading-4": ["1.125rem", { lineHeight: "1.5", fontWeight: "500" }],
        "body-lg": ["1.125rem", { lineHeight: "1.6" }],
        "body-base": ["1rem", { lineHeight: "1.6" }],
        "body-sm": ["0.875rem", { lineHeight: "1.5" }],
        "body-xs": ["0.75rem", { lineHeight: "1.5" }],
        "label": ["0.75rem", { lineHeight: "1.4", fontWeight: "500", letterSpacing: "0.05em" }],
      },
      spacing: {
        // ============================================
        // IA 4 - CUSTOM SPACING
        // ============================================
        "18": "4.5rem",
        "22": "5.5rem",
        "88": "22rem",
        "104": "26rem",
        "112": "28rem",
        "128": "32rem",
      },
      height: {
        // ============================================
        // IA 4 - CUSTOM HEIGHTS
        // ============================================
        "screen-dvh": "100dvh",
        "screen-svh": "100svh",
        "screen-lvh": "100lvh",
      },
      width: {
        // ============================================
        // IA 4 - CUSTOM WIDTHS
        // ============================================
        "128": "32rem",
        "144": "36rem",
      },
      minHeight: {
        // ============================================
        // IA 4 - MIN HEIGHTS
        // ============================================
        "screen-dvh": "100dvh",
        "screen-svh": "100svh",
      },
      maxHeight: {
        // ============================================
        // IA 4 - MAX HEIGHTS
        // ============================================
        "screen-dvh": "100dvh",
        "screen-svh": "100svh",
      },
      animation: {
        // ============================================
        // IA 3 + IA 4 - ANIMATIONS
        // ============================================
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
        "fade-out": "fadeOut 0.3s ease-out",
        "slide-in-from-bottom": "slideInFromBottom 0.3s ease-out",
        "slide-in-from-top": "slideInFromTop 0.3s ease-out",
        "slide-in-from-left": "slideInFromLeft 0.3s ease-out",
        "slide-in-from-right": "slideInFromRight 0.3s ease-out",
        "slide-out-to-bottom": "slideOutToBottom 0.3s ease-out",
        "slide-out-to-top": "slideOutToTop 0.3s ease-out",
        "slide-out-to-left": "slideOutToLeft 0.3s ease-out",
        "slide-out-to-right": "slideOutToRight 0.3s ease-out",
        "shimmer": "shimmer 2s linear infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "bounce-soft": "bounceSoft 1s infinite",
        "spin-slow": "spin 3s linear infinite",
        // PWA specific
        "pwa-install": "pwaInstall 0.5s ease-out",
        "offline-indicator": "offlineIndicator 0.3s ease-in-out",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        fadeOut: {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        slideInFromBottom: {
          from: { transform: "translateY(20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromTop: {
          from: { transform: "translateY(-20px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        slideInFromLeft: {
          from: { transform: "translateX(-20px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        slideInFromRight: {
          from: { transform: "translateX(20px)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        slideOutToBottom: {
          from: { transform: "translateY(0)", opacity: "1" },
          to: { transform: "translateY(20px)", opacity: "0" },
        },
        slideOutToTop: {
          from: { transform: "translateY(0)", opacity: "1" },
          to: { transform: "translateY(-20px)", opacity: "0" },
        },
        slideOutToLeft: {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(-20px)", opacity: "0" },
        },
        slideOutToRight: {
          from: { transform: "translateX(0)", opacity: "1" },
          to: { transform: "translateX(20px)", opacity: "0" },
        },
        shimmer: {
          from: { backgroundPosition: "0 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        bounceSoft: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        pwaInstall: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        offlineIndicator: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        // ============================================
        // IA 3 + IA 4 - GRADIENTS
        // ============================================
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-brand": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-primary": "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary-dark)) 100%)",
        "gradient-success": "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
        "gradient-error": "linear-gradient(135deg, #e53e3e 0%, #c53030 100%)",
        "shimmer-gradient": "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
      },
      backgroundSize: {
        // ============================================
        // IA 4 - BACKGROUND SIZES
        // ============================================
        "300%": "300%",
      },
      backgroundPosition: {
        // ============================================
        // IA 4 - BACKGROUND POSITIONS
        // ============================================
        "shimmer": "shimmer 200%",
      },
      boxShadow: {
        // ============================================
        // IA 4 - CUSTOM SHADOWS
        // ============================================
        "soft": "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 3px 6px -4px rgba(0, 0, 0, 0.04)",
        "soft-md": "0 4px 6px -4px rgba(0, 0, 0, 0.1), 0 2px 4px -6px rgba(0, 0, 0, 0.1)",
        "soft-lg": "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.05)",
        "soft-xl": "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        "glow-primary": "0 0 20px -5px hsl(var(--primary) / 0.3)",
        "glow-success": "0 0 20px -5px rgba(72, 187, 120, 0.3)",
        "glow-error": "0 0 20px -5px rgba(229, 62, 62, 0.3)",
        "glow-warning": "0 0 20px -5px rgba(236, 201, 75, 0.3)",
        // ============================================
        // IA 2 - CARD SHADOWS
        // ============================================
        "card-hover": "0 0 0 1px hsl(var(--border)), 0 8px 16px -4px rgba(0, 0, 0, 0.1)",
        "card-active": "0 0 0 1px hsl(var(--primary)), 0 8px 16px -4px hsl(var(--primary) / 0.2)",
      },
      letterSpacing: {
        // ============================================
        // IA 4 - LETTER SPACING
        // ============================================
        tighter: "-0.05em",
        tight: "-0.025em",
        normal: "0",
        wide: "0.025em",
        wider: "0.05em",
        widest: "0.1em",
      },
      lineHeight: {
        // ============================================
        // IA 4 - LINE HEIGHTS
        // ============================================
        "tightest": "1.1",
        "tighter": "1.2",
        "tight": "1.3",
        "normal": "1.5",
        "relaxed": "1.6",
        "loose": "1.75",
      },
      textDecoration: {
        // ============================================
        // IA 4 - TEXT DECORATION
        // ============================================
        underline: "underline",
        "underline-offset": "underline-offset 2px",
        "decoration-dashed": "underline 1px dashed",
        "decoration-dotted": "underline 1px dotted",
      },
      textWrapMode: {},
      textIndent: {},
      textTransform: {
        // ============================================
        // IA 4 - TEXT TRANSFORM
        // ============================================
        sentence: "capitalize first-letter",
      },
      opacity: {
        // ============================================
        // IA 4 - OPACITY
        // ============================================
        2: "0.02",
        5: "0.05",
        10: "0.1",
        20: "0.2",
        25: "0.25",
        30: "0.3",
        40: "0.4",
        50: "0.5",
        60: "0.6",
        70: "0.7",
        75: "0.75",
        80: "0.8",
        90: "0.9",
        95: "0.95",
      },
      ringColor: {
        DEFAULT: "hsl(var(--ring) / <alpha-value>)",
      },
      ringOffsetColor: {
        DEFAULT: "hsl(var(--ring-offset) / <alpha-value>)",
      },
      ringOffsetWidth: {
        DEFAULT: "var(--ring-offset-width)",
      },
      ringWidth: {
        DEFAULT: "var(--ring-width)",
      },
      zIndex: {
        // ============================================
        // IA 4 - Z-INDEX
        // ============================================
        "dropdown": "1000",
        "sticky": "1020",
        "fixed": "1030",
        "modal-backdrop": "1040",
        "modal": "1050",
        "popover": "1060",
        "tooltip": "1070",
        "toast": "1080",
        "pwa-banner": "9999",
        "pwa-install": "9998",
      },
      aspectRatio: {
        // ============================================
        // IA 1 - PROPERTY IMAGES
        // ============================================
        "property-card": "4 / 3",
        "property-gallery": "16 / 9",
        "property-detail": "3 / 2",
      },
      scale: {
        // ============================================
        // IA 4 - SCALE
        // ============================================
        "98": "0.98",
        "102": "1.02",
      },
      blur: {
        // ============================================
        // IA 4 - BLUR
        // ============================================
        xs: "2px",
      },
      screens: {
        // ============================================
        // IA 4 - CUSTOM SCREENS
        // ============================================
        "xs": "475px",
        "3xl": "1920px",
        "4xl": "2560px",
        // ============================================
        // IA 3 - PWA SCREENS
        // ============================================
        "portrait": { "raw": "(orientation: portrait)" },
        "landscape": { "raw": "(orientation: landscape)" },
        "mobile": { "raw": "(max-width: 640px)" },
        "tablet": { "raw": "(min-width: 641px) and (max-width: 1024px)" },
        "desktop": { "raw": "(min-width: 1025px)" },
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("tailwindcss-motion"),
  ],
};

export default config;