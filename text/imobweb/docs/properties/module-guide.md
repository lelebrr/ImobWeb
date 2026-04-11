# Property Module Documentation - ImobWeb 2026

## Overview
The Property Module is the core of the imobWeb SaaS. It is designed for extreme performance, flexibility, and AI-first workflows.

## 1. Property Types Architecture
We support over 50 property types categorized into:
- **RESIDENTIAL**: Apartments, Houses, Studios, Penthouses, etc.
- **COMMERCIAL**: Offices, Stores, Hotels, Medical Centers.
- **INDUSTRIAL**: Warehouses, Industrial Land.
- **RURAL**: Farms, Ranches.
- **LAND**: Lots, Condo Lots.

### Field Dynamics
Each property type has a configuration mapping in `lib/properties/property-types.ts`. This configuration determines:
- Which fields are required (e.g., bedrooms for residential, landArea for rural).
- Which icons to display in the UI.
- Suggested features/tags.

---

## 2. Image Optimization Engine
Located in `lib/image-optimization/image-processor.ts`.

### Pipeline:
1. **Upload**: Raw image received via API.
2. **Analysis**: AI Vision model (OpenAI/Gemini) detects room type and assesses quality.
3. **Processing**: `sharp` converts the image to **AVIF** (primary) and **WebP** (fallback).
4. **Placeholder**: A 12x12 blur placeholder is generated for instant lazy loading.
5. **CDN**: Optimized assets are stored in Supabase Storage and served via Global CDN.

### AI Enhancement
An optional "Enhance" step can be applied, which:
- Adjusts white balance and exposure.
- Removes sensor noise.
- Upscales if the original is low resolution.

---

## 3. Visualization Modes
- **Grid View**: Optimal for browsing multiple properties.
- **Map View**: Integrated with Google Maps API for spatial search.
- **Gallery**: Professional lightbox with AI quality insights.
- **Virtual Tour**: Placeholder for Matterport/Panorama integration.

---

## 4. Super Admin Panel
The Super Admin panel (`app/(admin)`) provides executive control:
- **Multi-tenant Metrics**: Real-time monitoring of all organizations.
- **Financial BI**: MRR, Churn, and LTV calculation logic in `lib/admin-reports/report-engine.ts`.
- **RBAC**: Granular control over permissions and feature flags.
