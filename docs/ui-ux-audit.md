# Vantage — UI/UX Audit

Before-state assessment of the frontend against the AI-fingerprint checklist and
accessibility requirements in `docs/ui-ux-research.md`.

## 1. Summary

Vantage is functional and internally consistent, but it reads as generic — and in
the project-management category specifically it reads as a **Linear clone**:
near-black canvas, indigo accent, Inter, JetBrains Mono, hairline density. That is
worse than generic because it invites direct comparison to the category's best.
It hits **9 of the 10** AI tells simultaneously.

## 2. Diagnostic

| Dimension | Finding | Evidence |
|---|---|---|
| Palette | `--primary: #6366f1`, `--bg: #09090b`, `--primary-hover: #818cf8` — the exact AI range and a near-match to Linear's `#08090a`/`#5e6ad2` | `src/index.css:4-18` |
| Gradient | indigo→indigo logo gradient; indigo radial hero glows | `Landing.jsx:33,38`; `App.css:450-451` |
| Typography | Inter-only; no optical sizing; default-ish scale; no tabular figures | `index.css:1,37,70-79` |
| Layout | symmetric bento grid; hero = badge + h1 + sub + two CTAs; terminal mock with 3 macOS dots | `Landing.jsx:70-200` |
| Icons | Lucide `Sparkles/Zap/Command/...` decoratively per card; emoji badges `✨ ⚡️` | `Landing.jsx:4-17,77,120-122,210-211` |
| Depth | glass `blur(16px) saturate(180%)`; glow shadows `0 0 24-35px`; `rounded-2xl` | `App.css:65,532,750,796,1043` |
| Motion | heavy `framer-motion` fade/slide on nearly every component | all `*.jsx` |
| Spacing | uniform gaps/padding; no optical rhythm | `App.css` (global) |
| Copy | "Vantage 2.0 • Precision Engineering & Velocity"; "Designed for elite product teams" | `Landing.jsx:77,85` |
| A11y | **no** `prefers-reduced-motion`; no global `:focus-visible`; icon-only buttons lack `aria-label`; `role`/`aria-live` only in `Toast.jsx` | see §3 |

## 3. Accessibility gaps (verified)

- **Reduced motion:** zero `prefers-reduced-motion` anywhere, despite Framer Motion
  on nearly every screen. `Sidebar` animates width; modals scale/translate;
  `Toast` slides; `MorningBrief` slides.
- **Focus:** only `input:focus` (`index.css:93`) and `.smart-input:focus`
  (`App.css:1172`). No global `:focus-visible`, no visible ring for buttons/links.
- **ARIA:** only `Toast.jsx` has `role="status"` + `aria-live` and one
  `aria-label="Dismiss notification"`. Icon-only controls lacking labels include:
  `Sidebar` collapse/nav, `TaskCard` delete, `CalendarPage` prev/next,
  `ProjectDetail` back/menu, `App.jsx` header buttons (they use `title`, not
  `aria-label`), `CommandPalette`/`GlobalSearch` dialogs have no `role`/`aria-modal`.
- **Semantics:** decorative visuals and mock rows are not `aria-hidden`.

## 4. Change list (maps to the build phases)

**Design system (`src/index.css`)**
- Replace tokens with Paper & Signal (light default + warm dark override).
- Add Fraunces (display) + Public Sans (body); keep JetBrains Mono.
- Add type scale with optical tracking; `tabular-nums` utility.
- Add global `:focus-visible` ring; global `prefers-reduced-motion` guard.
- Reduce radius (`6/10/12`), replace heavy shadows with hairline-first depth.

**Shell (`src/App.css`, `src/App.jsx`, `src/components/Sidebar.jsx`)**
- Remove glass `backdrop-filter`; replace glow shadows with 1px hairlines.
- Retune header/sidebar/cards/modals to paper surfaces and terracotta accent.

**Landing (`src/components/Landing.jsx`)**
- Asymmetric 60/40 hero; single primary CTA.
- Remove emoji badges, bento grid, three-dot terminal mock.
- Two-register type: mono bracketed labels + big/light/tight numbers; real
  workflow proof instead of equal feature cards.

**Accessibility**
- Wrap app in `MotionConfig reducedMotion="user"`.
- Add `aria-label`/`role`/`aria-modal`/`aria-expanded` across icon-only controls
  and dialogs.

**Empty states (`Dashboard`, `TasksPage`, `PaymentsPage`, `DeploymentsPage`, `TeamPage`)**
- Outcome-first copy, one primary CTA, ghost-row / sample-data pattern, semantic
  heading, `aria-hidden` decoration.

## 5. Verification plan

- `npm run lint` and `npx vitest run` pass.
- Contrast: body text ≥ 4.5:1, large/UI ≥ 3:1 (paper + accent).
- Reduced-motion: DevTools rendering emulation shows static UI.
- Keyboard-only: every control reachable with a visible focus ring.
- Landing: no indigo, no emoji, no glow, no glass, no three-dot mock.
