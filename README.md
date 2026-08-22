# SafePark — Context-Aware Parking Intelligence & Risk Mitigation

> SafePark shifts driver decision-making from transactional availability (*"Where can I park?"*) to intelligent safety assessment (*"Where SHOULD I park?"*).

---

## 🌟 Key Capabilities

1. **Composite Safety Index (CSI 0–100)**: Dynamic mathematical risk evaluation synthesizing property crime histories, solar zenith lighting models, physical infrastructure audits, and time-decayed hazard reports.
2. **Anti-Bias Verification Engine**: Algorithmic safeguard rejecting subjective profiling (*"sketchy"*, *"suspicious"*) in favor of verifiable physical infrastructure defects (*broken glass, failed street lamps, broken gates*).
3. **Multi-City Municipal Data ETL**: Automated ingestion scaling across 6 major US metropolitan launch markets (**San Francisco, New York, Chicago, Los Angeles, Seattle, Austin**).
4. **Native Mobile Packaging & Background Exit Detection**: Native Capacitor 6 iOS bridge with CoreBluetooth disconnect listener and CoreMotion analysis.
5. **Subterranean Offline Caching**: Complete operational resiliency inside multi-level underground concrete structures.
6. **Multi-Sided Platform Ecosystem**:
   - **Consumer Navigation App (Mobile/Web PWA)**
   - **In-Dash CarPlay Automotive Display**
   - **B2B Garage Operator Certification Portal ("SafePark Certified")**
   - **Enterprise OEM & Insurer Data Telemetry API**
   - **Driver Profile & Verified Safety Receipts**
   - **Admin Operations & Hazard Moderation Console**

---

## 🛠️ Tech Stack & Standards

- **Architecture**: Clean Architecture (Domain, Data, Presentation layers)
- **Framework**: React 18 + TypeScript + Vite
- **Mobile Runtime**: Capacitor 6 (iOS / Android) + Fastlane Automation
- **Styling & Tokens**: Custom WCAG 2.1 AAA Design Tokens (Dark Slate `#1E293B` on `#0F172A`, Primary Blue `#2C73D2`, isolated semantic status badges `#22C55E` / `#F59E0B` / `#EF4444`)
- **Typography**: Poppins SemiBold (Headers), Inter Regular (Body), JetBrains Mono (Tabular Numbers)
- **Testing**: Vitest (Unit) + Playwright (E2E) + Automated Post-Deployment Smoke Tests

---

## 🚀 CLI Commands & Runbook

```bash
# Start local development server (http://localhost:3000)
npm run dev

# Run unit and integration tests (Vitest)
npm test

# Run multi-city municipal open data ETL sync (SF, NYC, Chicago, LA, Seattle, Austin)
npm run etl:sync

# Run automated post-deployment live smoke tests
npm run test:smoke

# Run automated End-to-End browser test suite (Playwright)
npm run test:e2e

# Run iOS Fastlane permission check and TestFlight release packaging
npm run build:ios

# Run production database migrations
npm run db:migrate

# Compile production bundle
npm run build

# Preview production build locally (http://localhost:4173)
npm run preview
```

---

## 📚 Documentation

- [Go-To-Market Launch Playbook](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/docs/GTM_LAUNCH_PLAYBOOK.md)
- [Architecture & Algorithm Guide](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/docs/ARCHITECTURE.md)
- [Release Notes & Version Changelog](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/RELEASE_NOTES.md)
- [OpenAPI 3.0 API Specification](file:///Users/mikeaknin/.gemini/antigravity-ide/scratch/safepark/docs/openapi.yaml)
