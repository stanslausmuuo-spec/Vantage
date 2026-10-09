# UI/UX Research — Distinctive Product Design

Reference research behind the Vantage redesign. Two questions:

1. What makes an interface read as "vibe coded" / AI-generated?
2. What do award-winning sites and the best project-management tools do instead?

---

## 1. Why this matters

By 2026, "looks AI-generated" is a signal users actively use to discount a product.
Detection takes seconds. The blue-purple gradient is a meme; the
Inter + Lucide + rounded-cards combination is a punchline. Trust drops with the
aesthetic.

The root cause is convergence: LLMs emit the highest-probability design token at
each decision, so every generated frontend lands on the same centroid. Breaking
out is not about being "prettier" — it is about making **deliberate** choices
instead of **default** ones. The cliff between "obviously AI" and "ambiguously
human" is shallow: one degree of freedom often clears it, and 8–12 compounded
deviations read as a brand.

Sources: Sailop "AI Slop 2026", "From AI Slop to Signature: 73 Patterns",
"The Complete Guide to Anti-AI Design"; uxskill; TheCrit; The Fountain Institute;
arXiv 2603.13036 (design homogenization in web vibe coding).

---

## 2. The AI fingerprint (checklist)

| # | Dimension | Default signature |
|---|---|---|
| 1 | Palette | blue/purple `#3b82f6`–`#6366f1`–`#7c3aed`; blue→purple hero gradient; 3–4 colors total |
| 2 | Typography | Inter / `system-ui` only; `3rem/2.25rem/1.5rem/1rem` scale; no optical sizing |
| 3 | Layout | hero → 3-col features → testimonials → pricing → CTA → footer; `max-w-7xl`, symmetric |
| 4 | Iconography | Lucide `Check`/`Sparkles`/`Zap`/`Shield`/`BarChart3` decoratively; emoji in headings |
| 5 | Cards | `rounded-2xl` + `shadow-md` on everything; `hover:scale-105` + shadow |
| 6 | Motion | Framer `opacity:0→1, y:20→0, .5s` fade-up on every section |
| 7 | Spacing | `gap-6`/`gap-8` everywhere; one section padding repeated; no optical nudges |
| 8 | Copy | "Transform your X", "Built with care"; badge + h1 + sub + two CTAs |
| 9 | Structure | bento grid (now itself a tell); terminal mock with three macOS dots |
| 10 | Craft gaps | no `:focus-visible`; no `prefers-reduced-motion`; dark mode = inverted colors |

**Key nuance:** the signals are correlated, not independent. Five together start
to feel like a system; eight to ten feel like a brand. Move on several axes at once.

---

## 3. What "decided" looks like

- **Palette:** non-Tailwind, built in OKLCH, avoiding the model's convergence arc
  (roughly hue 220–280). Earthy/warm neutrals, muted chroma. 8–12 tokens with
  tints/shades and semantic states, not 3–4.
- **Typography:** a real duo (display + body) with personality; variable weights as
  a system (300 quiet → 800 hero); negative tracking on display, wide tracking on
  small caps; `font-feature-settings` for ligatures and `tabular-nums`.
- **Layout:** asymmetry (60/40, 70/30), varied section rhythm, `dl/dt/dd` or tables
  instead of card grids, oversized mono section numbers.
- **Motion:** bespoke easing, staggered reveals, `motion-safe` default (fail toward
  no motion), 100–400ms, purposeful.

---

## 4. Award-winner teardown

Direct reads of recent Awwwards SOTD / CSSDA winners (via Dokle award breakdowns
and Awwwards listings; Awwwards blocks automated fetch).

| Site | Award | Palette | Type system | Structural move |
|---|---|---|---|---|
| **twks** (Geneva agency) | SOTD Oct 7 2026 | black + white + **one grey** | one neo-grotesk, **two sizes** (nav + display) | visible 4-col grid; first-line indent = grid; hairlines; **no cards/shadows/rounded corners**; superscript counts (`Selected 38 / Archives 283`) |
| **Aevion** (Riotters) | SOTD Oct 6 2026 | white + blue-grey + dark slate + **one scan color** | **two registers**: Switzer = human voice; Proto Mono = machine voice in `[brackets]`; numbers big/light/tight | two-tone ink/grey pairs carry hierarchy; labels decode on scroll |
| **Santioni Spirits** (Active Theory) | SOTD Oct 5 2026 (8.09) | **two reds** `#592223` + `#C82924` on black + paper | display face with swashes + small-caps captions | **one red word per caption** = where to look, matched to the red in the image |
| **House of Honey** | SOTD Jul 14 2026 | blush + espresso + **one hot pink** | fat-face Didone + cursive; three sizes, one family | pink does **double duty**: loudest moment *and* active-nav wayfinding |
| **PP Neue Montreal** (Demande Spéciale) | SOTD Jul 13 2026 | **tomato-red + black** | the typeface **is** the art direction; huge display | numbered itinerary; pinned pill TOC; text-vs-display compare |
| **Razorpay Sprint26** | SOTD | **electric blue `#0039FF` + near-black `#151515`** | spare, structured | "two colors powering 100+ interactions" |
| **Shed.design** | SOTD Mar 2026 | restrained | three custom faces rotating with intention | "no formula, only judgment" |

**Invariant across winners:**

1. **Two colors** (sometimes three), one accent doing double duty.
2. **Type is the concept** — display carries the frame; a second "machine voice"
   face handles data/code.
3. **Hairlines and visible grids instead of cards, shadows, rounded corners.**
4. **One idea carried to every page without wobble.**
5. Color = meaning; color otherwise belongs to the content.
6. Superscript/tabular metadata; two-tone ink pairs at equal size = hierarchy.

Note: judges score usability separately, and the flashiest sites lose there
(Santioni 7.54). A workflow tool must keep density and clarity.

---

## 5. Best project-management benchmarks

| Tool | Palette | Type | Lesson |
|---|---|---|---|
| **Linear** | near-black `#08090a`, indigo `#5e6ad2`, elevation ladder | Inter Variable, optical weights 400/510/590/680; Berkeley Mono | quiet chrome, keyboard-first density, hairline depth, 100–160ms motion |
| **Asana** | indigo `#222875` as **panel fill** (not CTA), near-black pill CTAs, coral chips | Ghost display + TWK Lausanne body at **weight 300** | invert the convention: brand color need not run the CTA |
| **Stripe / Vercel / Attio** | monochrome, color = state only | one sans + mono | "the table is the truth, the chart is the summary" |

2026 dashboard consensus: **quiet chrome, high density, dark-first for daily-use
tools, color reserved for state and meaning**, AI output as a first-class surface.

---

## 6. Accessibility requirements

- **Focus:** global `:focus-visible` ring on every interactive element (WCAG 2.2).
- **Reduced motion:** honor `prefers-reduced-motion`. Two runtimes:
  - CSS transitions/keyframes → `@media (prefers-reduced-motion: reduce)` with a
    near-zero duration (not `none`, so `transitionend`/`animationend` still fire).
  - JS animation (Framer Motion) → `MotionConfig reducedMotion="user"`, which drops
    transform/layout animations but keeps opacity, or `useReducedMotion()` for
    bespoke branches. CSS media queries do **not** reach JS animation.
  - Prefer a `no-preference` (motion-safe) default so a forgotten override fails
    toward no motion.
- **Semantics:** real headings (`h1`–`h6`) not styled `div`s; decorative visuals
  `aria-hidden`; icon-only controls get `aria-label`; modals/palettes get `role`,
  `aria-modal`, `aria-expanded`.
- **Contrast:** 4.5:1 body, 3:1 large text and UI components.

Sources: MDN `prefers-reduced-motion`, web.dev, Motion.dev accessibility guide,
Nielsen Norman Group, WCAG 2.2.

---

## 7. Applied identity: "Paper & Signal"

Vantage adopts the twks/Aevion hybrid in a form a dense PM dashboard can carry.

- **Canvas:** warm paper `#F5F2EB`; surface `#FFFFFF`; warm dark as an alternate.
- **Ink:** near-black `#1A1814` + grey `#6B6659` at equal size = hierarchy.
- **Single accent (double duty):** terracotta `#A34C26` for primary action **and**
  focus ring **and** active nav.
- **Status only:** jade `#37704F` / amber `#8A6216` / oxblood `#B23A2F`.
- **Two type registers:** display **Fraunces** (headings only) · human voice
  **Public Sans** · machine voice **JetBrains Mono** (bracketed labels,
  `tabular-nums`, superscript counts).
- **Structure:** hairlines over shadows; visible grid/indent rhythm; no
  `rounded-2xl` cards; big/light/tight numbers.
- **Motion:** 100–160ms ease-out; machine-voice reveal for data; nothing bouncy.

See `docs/ui-ux-audit.md` for the before-state and the concrete change list.
