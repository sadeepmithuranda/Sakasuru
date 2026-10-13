# Design system

**Personality:** trustworthy, friendly, proudly Sri Lankan, calm, empowering. Not a crypto app, trading platform, casino, loan app or corporate bank portal.

## Identity

- **Mark:** a traditional clay savings pot (කැටය) in modern geometry, with a two-leaf sprout (sunset orange) growing from the coin slot — saving that grows. (`components/brand`)
- **Signature element:** the Financial Health Score drawn as **eight petals, one per scoring factor**, each filled by the points earned. The score's makeup is visible at a glance, which is the product's promise of transparent scoring.
- **One woven accent:** a Dumbara-mat inspired border (blue and orange) on the welcome screen only.

## Colour

Blue and orange: ocean blue carries trust and every primary action; sunset orange adds warmth and marks achievements. The palette is Sakasuru's own — it deliberately does not copy any bank's brand colours, because Sakasuru is an education tool, not a bank, and must not look affiliated with one.

| Token | Light | Dark | Use |
|---|---|---|---|
| ink | `#0F1D33` | `#E6EDF8` | text |
| surface / card | `#F4F7FB` / `#FFFFFF` | `#0A1220` / `#111B2E` | page and card backgrounds |
| brand-600 | `#1556B8` | `#2563D0` | primary actions, hero panels — ocean blue |
| brand-deep | `#0C2F66` | `#10295A` | deep feature panels (white text) |
| accent-400 | `#F7881F` | `#FF9A3C` | achievements, streaks, XP, warm highlights — sunset orange |
| learn-500 / learn-deep | `#0A86AD` / `#0A4A63` | `#3CB6DD` / `#0C3A4D` | learning (sea-sky blue) |
| alert-500 | `#B42318` | `#FF8A7F` | risk, over-budget, destructive |
| amber-600 | `#A16207` | `#F2C14E` | near-limit warnings |

Tokens are named by role (`brand`, `accent`, `learn`), so a future palette change only edits `apps/web/src/index.css`.

**Charts** use eight category colours (`--color-series-1…8`, blue and orange first) in a fixed order — a category keeps its colour whatever its rank. The set was checked with a colour-blind separation validator in both themes; every chart also has a text legend with values.

Meaning is never carried by colour alone: statuses always have text labels, risk results have icons and words.

### Dark mode

A "night ocean" palette: deep navy surfaces, light text, tinted panels become low-light washes and their text uses the light shade (e.g. `brand-800 → #A9C8F7`); orange glows slightly brighter. Every token is redefined under the `.dark` class on `<html>` in `apps/web/src/index.css`, so components use the same class names in both themes.

- **Switching:** sun/moon button in the top bar (also on login and welcome screens) and Profile → Appearance: Light / Dark / Device. The choice is saved per device; "Device" follows the phone or computer setting live.
- **No flash:** `public/theme-init.js` applies the theme before the app loads (an external file so it works under the strict Content-Security-Policy).
- **Fixed panels:** `brand-deep`, `learn-deep` and `danger` stay deep in both themes because they carry white text; `inverse` / `on-inverse` are used for toasts; `on-accent` is the dark text used on orange.
- **Charts and illustrations** use CSS variables (`var(--color-…)`, `--color-track` for grids and empty petals), so they follow the theme automatically.
- Contrast was checked for every text/background pair in both themes: all text ≥ 4.5:1, white on blue buttons ≥ 5.5:1.

## Type

Self-hosted (offline, no third-party requests):
- **Anek Latin** (variable width) — Latin UI; money figures use the semi-condensed width with tabular numerals (`.figure`, `.figure-xl`).
- **Yaldevi** — Sinhala, designed in Sri Lanka by Mooniak; also the wordmark.
- **Anek Tamil** — Tamil.

Sinhala and Tamil get extra line-height (1.7 / 1.65) for vowel signs. Text scales from 90% to 130% in Profile.

## Layout & components

Mobile-first; bottom navigation (Home, Learn, **+**, Money, Goals, Profile) with a central add button and a floating "Ask සකසුරු" chip; desktop sidebar from 1024px. Radii carry hierarchy: 28px panels, 18px cards, 12px fields, pills for actions. Stats sit in divided strips rather than identical cards. Sheets slide up on phones and centre on desktop. Motion is used for the score reveal, sheet open/close and lesson transitions; it is disabled by Reduce motion and Data Saver.

## Accessibility

Visible focus rings, skip link, ARIA roles on tabs/switches/radiogroups/progress, `aria-live` for toasts and AI replies, 44px+ touch targets, high-contrast mode, reduced motion, `lang` attribute set per language for screen readers.
