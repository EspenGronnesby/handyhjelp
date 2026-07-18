# Design — HandyHjelp

> **Formål:** Fasit over UI/UX-valgene i dette prosjektet — hva som er valgt og HVORFOR.
> **Oppdateringsregel:** Ved enhver UI-endring: oppdater relevant seksjon + legg linje i endringsloggen nederst. Ved designtilbakemelding fra Espen: spør om den også skal inn i den felles designprofilen (claude-felles).

## Identitet

Offentlig markedsføringsside + jobbplattform for håndverkstjenester i Kristiansand.
Skal utstråle **tillit, profesjonalitet og handlekraft** — kunden skal tørre å bestille.

## Farger (HSL-tokens i src/index.css)

| Rolle | Verdi | Hvorfor |
|---|---|---|
| Primary (CTA) | cyan/teal `188 94% 37%` | Frisk og tillitsvekkende; skiller seg fra konkurrenters blå |
| Hero-bakgrunn | mørk navy `213 51% 24%` (+ gradient) | Soliditet og profesjonalitet «over folden» |
| Accent | oransje `24 95% 53%` | Energi/handling — brukes sparsomt for oppmerksomhet |
| Bakgrunn | nesten hvit `210 40% 98%` | Lys og åpen — dette er en lys-modus-side |
| Status | destructive rød, warning gul, success = primary | Standard semantikk; success gjenbruker primær for helhet |

Gradienter (hero/kort/CTA) og 3 skyggenivåer (card → elevated → hero) gir dybde.

## Typografi

- Brødtekst: **Inter** — nøytral, moderne, lettlest
- Overskrifter: **Roboto Slab** (serif) — håndverksfølelse, soliditet, skiller seg ut
- Norsk språk i hele UI

## Form og bevegelse

- Radius: `0.75rem` (12px) — myke, vennlige hjørner
- Skygger: myke, aldri harde kanter
- Animasjon: **Framer Motion** med egne wrappere (`src/components/motion/` — MotionButton, MotionCard, MotionLink, PageTransition, ParallaxBackground). Subtile hover/inn-animasjoner + parallax i hero. Hvorfor: levende og påkostet førsteinntrykk uten å bli leken.

## Mønstre

- shadcn/ui (Radix) + Tailwind med semantiske CSS-variabler — aldri hardkodede farger i komponenter
- Multi-rolle-dashboards (admin/worker/kunde) gjenbruker samme komponentbibliotek
- Skjemaer: React Hook Form + Zod, norsk validering (8-sifret telefon, æøå)
- Mobil-først: kundene finner siden på mobil

## Endringslogg

- 2026-07-15: Dokument opprettet (analyse av eksisterende kodebase)
