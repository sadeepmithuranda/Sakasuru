# Design system

**Personality:** trustworthy, friendly, proudly Sri Lankan, calm, empowering. Not a crypto app, trading platform, casino, loan app or corporate bank portal.

## Identity

- **Mark:** a traditional clay savings pot (කැටය) in modern geometry, with a two-leaf sprout (saffron + light leaf) growing from the coin slot — saving that grows. (`components/brand`)
- **Signature element:** the Financial Health Score drawn as **eight petals, one per scoring factor**, each filled by the points earned. The score's makeup is visible at a glance, which is the product's promise of transparent scoring.
- **One woven accent:** a Dumbara-mat inspired border on the welcome screen only.

## Colour

| Token | Hex | Use |
|---|---|---|
| ink | `#13261D` | text |
| surface | `#F5F8F5` | page background (cool, not cream) |
| leaf-600 | `#0E6B4F` | primary actions, hero panels — tea-estate green |
| saffron-400 | `#F2B705` | achievements, streaks, XP only |
| lagoon-500/700 | `#2E5FA8` / `#1F4272` | learning |
| alert-500 | `#B42318` | risk, over-budget, destructive |
| amber-600 | `#B45309` | near-limit warnings |

Meaning is never carried by colour alone: statuses always have text labels, risk results have icons and words.

### Dark mode

A "night-time tea estate" palette: deep green-black surfaces (`surface #0B1310`, `card #131D19`), light text (`ink #E4EEE8`), tinted panels become low-light washes and their text uses the light shade (e.g. `leaf-800 → #9BE0BF`). Every token is redefined under the `.dark` class on `<html>` in `apps/web/src/index.css`, so components use the same class names in both themes.

- **Switching:** sun/moon button in the top bar (also on login and welcome screens) and Profile → Appearance: Light / Dark / Device. The choice is saved per device; "Device" follows the phone or computer setting live.
- **No flash:** `public/theme-init.js` applies the theme before the app loads (an external file so it works under the strict Content-Security-Policy).
- **Fixed panels:** `forest`, `lagoon-deep` and `danger` stay deep in both themes because they carry white text; `inverse` / `on-inverse` are used for toasts.
- **Charts and illustrations** use CSS variables (`var(--color-…)`, `--color-track` for grids and empty petals), so they follow the theme automatically.
- Contrast was checked for every text/background pair: body text 6.8–15:1, white on buttons ≥ 4.5:1.

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
