## Oppdatere robots.txt for bedre indekseringskontroll

### Bakgrunn
`public/robots.txt` finnes allerede, men tillater alle crawlers på alle ruter (`Allow: /`). Dette betyr at private sider som dashboard, admin, worker og owner-paneler også kan bli indeksert.

### Endring
Oppdater `public/robots.txt` med følgende:

1. **Behold** `Allow: /` som hovedregel (viktige offentlige sider kan fortsatt indekseres).
2. **Legg til `Disallow`** for private og lavverdi-ruter:
   - `/dashboard` — brukerens private dashbord
   - `/owner` — eier-adminpanel
   - `/worker` — arbeider-panel
   - `/auth` — autentiseringsside (ikke innhold)
   - `/anmeldelse/*` — vurderingssider etter jobb
   - `/takk` — kvitteringsside etter tilbud
   - `/takk-avtale` — kvitteringsside etter avtale
   - `/tilbakemelding` — tilbakemeldingskjema
   - `/lovable/*` — interne Lovable-ruter
3. **Behold** `Sitemap: https://handyhjelp.no/sitemap.xml` og spesifikke `User-agent`-regler for Googlebot, Bingbot, Twitterbot og facebookexternalhit.
4. **Behold** `Crawl-delay: 1` for Bingbot.

### Fil som endres
- `public/robots.txt`

Ingen andre filer berøres.