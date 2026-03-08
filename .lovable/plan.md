

# Analyse og plan: Fra «app-look» til «nettside-look» + hover-fiks

## Analyse: Hva gjør nettsiden app-aktig?

Etter grundig gjennomgang av koden identifiserer jeg følgende problemer:

### 1. Seksjonene er pakket i kort (app-pattern)
Hver seksjon (Process, Projects, Services) er innkapslet i en `bg-card rounded-2xl shadow-lg border` container. Dette gir en "kort-i-kort"-følelse typisk for mobilapper, ikke nettsider. Ekte nettsider lar seksjonene flyte naturlig mot hele bredden med alternerende bakgrunner.

### 2. `section-mobile` tvinger fullskjerm-høyde
CSS-klassen `.section-mobile` setter `min-h-[100svh]` på mobil. Dette er et app-mønster (à la fullscreen slides/stories), ikke en nettside. Nettsider lar innholdet bestemme høyden naturlig.

### 3. Hero-telefonnummer hover-bug (bekreftet)
Linje 132 i HeroSection.tsx:
```
hover:bg-warning hover:border-warning
```
Når man hovrer over telefonnummer-boksen, skifter bakgrunnen til `warning` (gul/oransje), men teksten bruker `group-hover:text-warning-foreground` som er `hsl(0 0% 11%)` (nesten svart). Problemet er at **teksten under "24/7 Service"** bruker `text-white/80` som standard, men på hover endres bare til `text-warning-foreground` — fargeovergangen er brå og usynelig mot den gule bakgrunnen i visse tilstander.

### 4. `card-hover-lift` translateY(-8px) er for aggressiv
8px løft + kraftig shadow er app-aktig. Nettsider bruker subtilere effekter. Gjelder: tjenestekort, prosesskort, prosjektkort, testimonials.

### 5. Scroll Progress dots (mobil) er app-aktig
Den faste scroll-indikatoren med dots på høyre side er typisk for app-onboarding, ikke nettsider.

### 6. StickyMobileCTA er app-aktig
Fast CTA-bar i bunnen som skyves opp er typisk for apper/e-handel, ikke en håndverker-nettside. Den dekker innhold og føles påtrengende.

### 7. Overdreven bruk av `rounded-2xl`
Store avrundede hjørner på seksjonscontainere gir et mykt, app-lignende utseende. Nettsider bruker typisk skarpere kanter eller `rounded-lg` maks.

---

## Plan: Steg-for-steg endringer

### Steg 1: Fjern kort-innpakning fra seksjoner
**Filer:** `src/pages/Index.tsx`, `src/components/ProcessSection.tsx`, `src/components/ProjectsSection.tsx`

Fjern `bg-card rounded-2xl shadow-lg border border-border/50 p-6 md:p-12` wrapper-div fra Process, Projects og Services seksjonene. La seksjonene bruke full bredde med alternerende bakgrunner (`bg-background`, `bg-muted/30`, `bg-background`) for visuell separasjon — slik ekte nettsider gjør.

### Steg 2: Fjern `min-h-[100svh]` fra `section-mobile`
**Fil:** `src/index.css`

Endre `.section-mobile` fra `min-h-[100svh]` til `min-h-0` (eller fjern min-height helt). La innholdet bestemme høyden naturlig. Behold padding.

### Steg 3: Fiks hero telefonnummer hover
**Fil:** `src/components/HeroSection.tsx`

Fjern `hover:bg-warning hover:border-warning` fra telefonboksen. Erstatt med en subtil hover som beholder lesbarhet:
```
hover:bg-white/15 hover:border-white/50
```
Fjern `group-hover:text-warning-foreground` fra teksten — behold hvit tekst hele veien.

### Steg 4: Demp card-hover-lift
**Fil:** `src/index.css`

Reduser `translateY(-8px)` til `translateY(-4px)` og demp skyggen. Fjern `0 0 0 1px hsl(var(--primary) / 0.15)` ring-effekten som gir et "valgt element"-app-utseende.

### Steg 5: Fjern ScrollProgress-komponenten
**Fil:** `src/pages/Index.tsx`

Fjern `<ScrollProgress />` fra forsiden. Denne vertikale dot-indikatoren er et typisk app-mønster.

### Steg 6: Gjør StickyMobileCTA mer nettside-lik
**Fil:** `src/components/StickyMobileCTA.tsx`

Endre fra en heavy fast bunnbar til en enklere, mer diskret versjon med mindre padding, gjennomsiktig bakgrunn, og fade-in i stedet for slide-up. Alternativt: fjern den helt og stol på CTA-ene i innholdet.

### Steg 7: Juster avrunding på seksjonscontainere
**Filer:** Diverse komponenter

Reduser `rounded-2xl` til `rounded-xl` eller `rounded-lg` på gjenværende kort. Ikke på de individuelle tjenestekortene (de er fine), men på store seksjonsblokker.

### Steg 8: Hover-audit hele nettsiden

| Element | Nåværende problem | Fix |
|---------|-------------------|-----|
| Hero telefon-boks | Warning-farge gjør tekst uleselig | Subtil hvit overlay |
| Tjenestekort (`card-hover-lift`) | 8px lift er for mye | 4px lift |
| Prosesskort | Lift + overlay på informasjonsblokk | Bare subtil shadow |
| Prosjektkort | Lift fungerer OK | Behold men demp |
| Testimonial-kort | Lift + ring + gradient overlay = tre effekter | Bare shadow |
| Footer sosiale ikoner | `hover:bg-primary` er OK | Behold |
| Nav-lenker | `hover:text-primary` er OK | Behold |
| CTA-knapper | `hover:scale-105` + MotionButton lift = dobbel effekt | Fjern en av dem |
| Outline-knapper | `hover:bg-accent hover:text-accent-foreground` endrer til oransje | Vurder subtilere |

### Oppsummering av endringene
- Ingen funksjoner endres
- Ingen layout-endring i rekkefølge
- Alt handler om visuell "nettside vs app" styling
- 6-8 filer berøres, hovedsakelig CSS og styling-klasser

