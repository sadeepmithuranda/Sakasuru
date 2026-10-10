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
