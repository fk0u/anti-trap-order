# Ruas AI Vibe Memory Checkpoint
- **Timestamp:** 2026-10-29T00:00:00.000Z
- **Vibe Session ID:** vibe-ato-20261029-ai-realmulator-gemini-web2api
- **Session Tag:** ato-ai-realmulator-gemini-web2api
- **Project Name:** Anti Trap Order (ATO)
- **Status:** AI Realmulator Chat (`/realmulator`) and Full Frutiger Aero Aqua Polish Deployed Live.

## Active Files
- `services/gemini-web2api/` (Python zero-auth Gemini Web2API daemon on port 8081)
- `src/app/api/realmulator/chat/route.ts` (Next.js AI intermediary with resilient payload parsing & context-rich scam personas)
- `src/app/realmulator/page.tsx` (AI Realmulator cyber-messenger window with real-time reflex co-pilot & WhatsApp alert generator)
- `src/app/lite/page.tsx` (Frutiger Aero Aqua glass redesign, high contrast typography, aero-cards, no mobile dock overlap)
- `src/components/layout/MobileTabBar.tsx` (5-column mobile dock with Realmulator icon)
- `src/content/landing.ts` & `src/components/landing/Navbar.tsx` (Global navigation links for Chat AI)
- `scripts/deploy.sh` (Automated rsync, venv builder, and PM2 process manager for Next.js, Go backend, and gemini-web2api)

## AI Realmulator Architecture
1. **Engine**: `gemini-web2api` converts Google Gemini Web interface into an OpenAI-compatible API running locally on port 8081.
2. **Personas & Scenarios**:
   - `job_scam`: "Kak Sarah" (HRD freelance like video WFH deposit scam).
   - `bank_freeze`: Bank CS phishing urgency auto-blockir threat.
   - `cod_scam`: "Andi" J&T fake COD package delivery scam with inline invoice card.
   - `apk_wedding`: "Dika" wedding invitation malware (.APK delivery card).
   - `crypto_dating`: "Jessica" dating app crypto trading romance scam.
3. **Guardian Reflex Co-Pilot**:
   - Heuristic trap detection during chat (e.g. upfront fee, artificial urgency, authority impersonation).
   - Tactical counter-reply pills for user testing.
   - "Bongkar Modus" modal with one-click copyable family warning templates for WhatsApp.

## Deployment Status
- Live domain: `https://ato.kousozo.tech`
- PM2 Processes on EC2:
  - `ato-gemini-web2api` (ID 5, port 8081)
  - `anti-trap-order` (ID 3, Next.js port 3120)
  - `ato-backend` (ID 4, Go backend port 8080)
- Nginx: Configured to route `/api/realmulator/` to Next.js (port 3120) and `/api/` to Go (port 8080).
- Local Daemon: `services/gemini-web2api/venv/bin/python3 services/gemini-web2api/gemini_web2api.py` (task-1291).
