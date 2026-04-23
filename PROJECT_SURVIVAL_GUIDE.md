# Travel Health Bridge: Project Survival Guide (V2)

This document ensures that the **Travel Health Bridge** monorepo remains stable and maintainable after the current session. All changes are saved in the `TravelMedix-v2` directory.

## 🚀 Quick Start
To launch the entire ecosystem (Admin, Consumer, Provider):
1. Open a terminal in the root: `C:\Users\MAHENDRA TARAGI\.gemini\antigravity\scratch\TravelMedix-v2`.
2. Run `.\start-all.cmd`. 
   - *This will kill existing node processes, clear caches, and boot all three apps.*

## 🏗 Architecture & Branding
- **New Identity**: The project has been fully rebranded from "TravelMedix" to **Travel Health Bridge**.
- **Package Scopes**: All internal packages now use the `@travelhealthbridge` scope (e.g., `@travelhealthbridge/shared`).
- **Shared UI (Universal Pattern)**: 
  - Admin components in `packages/shared/ui` use a `.web.tsx` suffix.
  - This allows the Next.js Admin app to use Tailwind-native implementations while sharing the same component interface with React Native mobile apps.

## 📊 Admin Console Verification (Prompt 10)
All 6 dashboard pages are implemented:
1. **Overview**: Key Impact Metrics (Displacement/Reuse rates).
2. **Providers**: Verification and Strike management.
3. **Overcharges**: Audit queue for fee discrepancies.
4. **Reviews**: Internal acknowledgment of traveler feedback.
5. **Sessions**: Live triage monitoring.
6. **Advisories**: Broadcast center for health alerts.

### Required Database Tables
To make the dashboard fully live, ensure your Supabase instance includes:
- `triage_sessions`: (ID, user_id, city_id, symptom, urgency, etc.)
- `feedback`: (session_id, rating, comment, prior_recommendation_source, reuse_intent)
- `overcharge_reports`: (provider_id, actual_charged_fee, reported_quoted_fee)
- `whatsapp_cases`: (case_id, severity, status, opened_at)
- `advisories`: (city_id, condition, content, urgency, expiry_at)

## 🛡 Stability Checklist
- [x] Branding: `ripgrep` search for "TravelMedix" returns zero results.
- [x] Dependencies: `npm install` has been run to link the new scopes.
- [x] Scripts: `start-all.cmd` and `rebrand.ps1` updated with new names.
- [x] API: `useAdminDailySummary` implemented with 5-minute polling.

> [!IMPORTANT]
> **No Approve/Publish for Reviews**: Adhering to the Specification Amendment, feedback is for internal operations ONLY. There are no UI controls to make reviews public.

> [!TIP]
> **Displacement Formula**: The displacement rate on the Overview dashboard is calculated strictly using the "True Displacement" formula defined in Prompt 10.
