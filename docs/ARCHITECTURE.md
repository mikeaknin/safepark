# SafePark System Architecture & Live GTM Production Infrastructure

SafePark is an enterprise-grade context-aware parking intelligence and property risk mitigation platform built on **Clean Architecture** principles.

---

## 1. Clean Architecture Layer Separation

```
                  ┌────────────────────────────────────────────────────────┐
                  │                   PRESENTATION LAYER                   │
                  │   Views: Driver, CarPlay, B2B Operator, API, Profile   │
                  │   Map: Mapbox GL Vector Tiles + Heatmap Overlays       │
                  │   Checkout: Stripe B2C Subscription & B2B SaaS Modal   │
                  │   Tokens: WCAG 2.1 AAA (#1E293B Dark Slate / #2C73D2)  │
                  └───────────────────────────┬────────────────────────────┘
                                              │ depends on
                                              ▼
                  ┌────────────────────────────────────────────────────────┐
                  │                      DOMAIN LAYER                      │
                  │   Services: CsiEngine, AntiBiasValidator,              │
                  │             ExitDetectionService, PushNotifications,   │
                  │             SafeWalkBackEngine, StripePaymentService,  │
                  │             AuthService, OfflineCacheService           │
                  │   Models: SafetyScore, Crime, Lighting, Infra, Hazard  │
                  └───────────────────────────▲────────────────────────────┘
                                              │ implemented by
                                              │
                  ┌────────────────────────────────────────────────────────┐
                  │                       DATA LAYER                       │
                  │   Adapters: CrimeDataFeedAdapter (DataSF / Socrata),   │
                  │             SolarLightingAdapter (SunCalc & Smart LED),│
                  │             GeocodingAdapter (Mapbox / Nominatim)      │
                  │   Backend: PostgreSQL / Supabase Schema + Edge Trigger │
                  └────────────────────────────────────────────────────────┘
```

---

## 2. Live Production Service Integrations

### A. Live Mapbox GL & Vector Tile Rendering
- High-performance vector street rendering with custom Dark Slate palette (`#1E293B` on `#0F172A`).
- Live device GPS Geolocation API tracking (`navigator.geolocation.watchPosition`).
- Radial lighting lux gradient heatmaps (68 Lux smart corridor vs. 6 Lux dark blindspot).
- Dynamic turn-by-turn "Safe Walk Back" illuminated path lines.

### B. Live Open Municipal Crime Data (Socrata / DataSF API)
- [`CrimeDataFeedAdapter.ts`](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/src/data/adapters/CrimeDataFeedAdapter.ts) queries real 30-day vehicle theft and smash-and-grab dispatch records from municipal open data endpoints.
- Auto-caches queries and seamlessly falls back to subterranean offline storage when disconnected.

### C. Astronomical Solar Zenith & Smart Lighting Lux (SunCalc)
- [`SolarLightingAdapter.ts`](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/src/data/adapters/SolarLightingAdapter.ts) calculates real-time solar elevation angles, civil twilight, and ambient daytime/nighttime lux output.

### D. Cloud Database & Anti-Bias Server-Side Trigger
- Production PostgreSQL / Supabase DDL in [`docs/schema.sql`](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/docs/schema.sql) with tables: `users`, `parking_facilities`, `certified_garages`, `active_sessions`, `hazard_reports`, `enterprise_api_keys`.
- PL/pgSQL database trigger (`validate_hazard_anti_bias`) blocks qualitative profiling phrases before DB write.

### E. Stripe Monetization Gateway
- **B2C Driver Subscriptions**: SafePark Premium ($4.99/mo or $39.99/yr) via [`StripeCheckoutModal.tsx`](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/src/presentation/components/monetization/StripeCheckoutModal.tsx).
- **B2B "SafePark Certified" SaaS**: Operator certification recurring billing ($199/mo Silver, $349/mo Gold, $499/mo Platinum) in [`GarageOperatorPortal.tsx`](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/src/presentation/views/GarageOperatorPortal.tsx).

### F. Native Push Notifications & Background Vehicle Exit Triggers
- [`PushNotificationService.ts`](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/src/domain/services/PushNotificationService.ts) registers Web Push / ServiceWorker notifications and pushes immediate cabin check alerts upon Bluetooth disconnect.
