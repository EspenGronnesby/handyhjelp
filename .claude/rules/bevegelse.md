# Bevegelse (BINDENDE)

> Kilde: [emilkowalski/skills](https://github.com/emilkowalski/skills) (Emil Kowalski —
> laget Sonner og Vaul), supplert med Apples bevegelsesprinsipper og
> «AI-tells»-listen fra [impeccable.style](https://impeccable.style/).
> Innført 2026-09-09 etter gjennomgang av HandyHjelps bevegelsessystem.

Bevegelse er ikke pynt. Hver animasjon skal ha ett formål, og de aller fleste
ganger er riktig svar **ingen animasjon**.

---

## 1. Skal dette animeres i det hele tatt?

| Hvor ofte brukeren ser det | Regel |
|---|---|
| 100+ ganger daglig (tastatursnarveier, toggles) | **Aldri animer.** |
| Titalls ganger daglig (hover, navigasjon) | Kraftig redusert — 150–200 ms |
| Av og til (modaler, skuffer, toasts) | Vanlig animasjon |
| Sjelden / første gang (onboarding, kvittering) | Her er det lov å glede |

Klarer du ikke å si hva animasjonen er *til for* — feedback, romlig sammenheng,
tilstandsendring, hindre brå hopp, forklaring — så dropp den.

---

## 2. Easing

Bruk alltid tokens. Aldri innebygde `ease`/`ease-out` — de mangler futt.
Aldri ad-hoc `cubic-bezier` rett i en komponent.

| Token | Verdi | Brukes til |
|---|---|---|
| `--ease-out` / `ease-enter` | `cubic-bezier(0.22, 1, 0.36, 1)` | Inn- og ut-animasjoner |
| `--ease-in-out` / `ease-move` | `cubic-bezier(0.77, 0, 0.175, 1)` | Bevegelse på skjermen |
| `--ease-press` / `ease-press` | `cubic-bezier(0.4, 0, 0.2, 1)` | Trykk-feedback |

**`ease-in` på UI er forbudt.** Den utsetter bevegelsen akkurat når brukeren ser
mest etter, og får grensesnittet til å føles tregt selv på samme varighet.

---

## 3. Varighet

| Token | Verdi | Brukes til |
|---|---|---|
| `duration-micro` | 120 ms | Trykk-feedback |
| `duration-fast` | 180 ms | Hover, små popovers |
| `duration-normal` | 250 ms | Dropdowns, UI-overganger |
| `duration-slow` | 350 ms | Sideoverganger |
| `duration-reveal` | 500 ms | Scroll-reveal på markedsføringssider |

**UI skal under 300 ms.** Over det krever en begrunnelse i koden.

**Stagger: 30–80 ms mellom elementer.** Ikke mer. 200 ms per kort betyr at fjerde
kort venter 600 ms — da føles siden treg, ikke påkostet.

---

## 4. Forbudsliste

- ❌ `transition: all` / `transition-all` — navngi egenskapene
- ❌ `scale(0)` som inngang — start på `scale(0.95)` + `opacity: 0`.
     Ingenting i virkeligheten oppstår fra ingenting
- ❌ `ease-in` på UI
- ❌ Animere layout-egenskaper: `width`, `height`, `margin`, `padding`, `top`, `left`
- ❌ Animere `backdrop-filter` — blant det dyreste en nettleser gjør, særlig i Safari
- ❌ Permanent `will-change` — sett det kun mens noe faktisk animeres
- ❌ Hover-bevegelse uten `@media (hover: hover) and (pointer: fine)`
- ❌ `@keyframes` på noe som trigges raskt etter hverandre (toasts, toggles) —
     keyframes starter på nytt, `transition` retargeter mykt
- ❌ Uendelig puls som ikke betyr noe (klassisk «AI-tell»)

Kun `transform` og `opacity` er gratis. De hopper over layout og paint og går på
GPU. `box-shadow`, `filter` og `color` koster paint — greit i små doser, aldri i
lange overganger.

---

## 5. Knapper

```css
transition: transform var(--duration-micro) var(--ease-press);
:active { transform: scale(0.97); }
```

En knapp uten trykk-feedback føles ødelagt. `scale(0.95)` er for mye —
`0.97` er nok til at grensesnittet bekrefter at det hørte deg.

---

## 6. Tilgjengelighet

`prefers-reduced-motion` betyr **mildere bevegelse, ikke null bevegelse.**
Behold overganger på `opacity` og farge — de forklarer fortsatt hva som skjer.
Fjern det som flytter på seg.

Ikke drep alt med `* { animation-duration: 0.01ms !important }`: det fryser også
lastespinnere, som er statusindikatorer brukeren trenger.

---

## 7. Sjekkliste ved gjennomgang

| Funn | Fiks |
|---|---|
| `transition: all` | Navngi egenskapene |
| `scale(0)` som inngang | `scale(0.95)` + `opacity: 0` |
| `ease-in` på UI | `var(--ease-out)` |
| Hover over 200 ms | `var(--duration-fast)` |
| Hover-bevegelse uten media query | Legg til `(hover: hover) and (pointer: fine)` |
| Stagger over 80 ms | Ned til 60 ms |
| Lik inn- og ut-tid | Ut skal være raskere enn inn |
| Animasjon på tastaturhandling | Fjern helt |
| `transform-origin: center` på popover | Sett til triggeren (modaler er unntatt) |

---

## 8. Felle: `cn()` / tailwind-merge overstyrer grunnklassen

Sender du `transition-all` inn i `className` på en `<Button>`, fjerner
tailwind-merge knappens egen `transition-[...]` — og du får `all` tilbake uten
at noe advarer deg. Oppdaget i `ScrollToTop.tsx`.

I tillegg kjenner ikke tailwind-merge våre egne navn (`duration-fast`,
`ease-enter`), så `duration-fast` og `duration-300` kan bli stående samtidig, og
hvem som vinner avgjøres av rekkefølgen i CSS-en — ikke av rekkefølgen i
klassestrengen.

**Regel:** send aldri `transition-*` eller `duration-*` inn i `className` på en
komponent som allerede setter dem. Trenger du noe annet, endre varianten i
`button.tsx` i stedet.

Sjekk med:

```js
getComputedStyle(el).transitionProperty   // skal ALDRI være "all"
```

## 9. Hvor tokenene bor

- **CSS:** `src/index.css`, `:root` — `--ease-*` og `--duration-*`
- **Tailwind:** `tailwind.config.ts` — `ease-enter`/`ease-move`/`ease-press`,
  `duration-micro`/`fast`/`normal`/`slow`/`reveal`

**De to skal alltid si det samme.** Endrer du én, endre begge.

(Framer Motion og `src/lib/motionTokens.ts` ble fjernet fra markedsføringsdelen
2026-09-09 — biblioteket kostet 39,5 kB gzip for to effekter CSS gjør gratis.)
