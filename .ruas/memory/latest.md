# Ruas AI Vibe Memory Checkpoint
- **Timestamp:** 2026-10-28T01:05:00.000Z
- **Vibe Session ID:** vibe-ato-20261028-guardiandrill
- **Session Tag:** ato-duolingo-drill-and-icons
- **Project Name:** Anti Trap Order (ATO)
- **Status:** Icons migrated (zero emojis in UI), 10 scenarios live, Duolingo drill deployed, RUAS context synced.

## Active Files
- `src/app/drill/page.tsx`
- `src/components/layout/MobileTabBar.tsx`
- `src/components/landing/ReverseReflexDemo.tsx`
- `src/data/scenarios.json`
- `internal/data/scenarios.json`
- `internal/reflect/nlp.go`
- `internal/model/types.go`
- `internal/handler/handler.go`
- `scripts/deploy.sh`
- `RUAS_CONTEXT.md`
- `CONTEXT.md`

## Invariants
1. Perspective Inversion (no percentage scam scores).
2. Stateless by design (no DB, no login, localStorage only for streak & XP).
3. No raw unicode emojis in UI indicators — Lucide icons only.
4. Lightweight rule-based NLP in Go (< 5ms, < 5MB RAM).
5. SafeStep must be serialized as `{ id, text, applies_to_tags }`.
