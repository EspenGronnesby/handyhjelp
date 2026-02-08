# Agent Teams - Visuell Guide

> Klikk p en seksjon for  se diagrammet. Bruk denne som referanse sammen med [agent-teams-oppsett.md](./agent-teams-oppsett.md)

---

## Oversikt - Arkitektur

<details>
<summary><strong>Hvordan Agent Teams er bygget opp</strong></summary>

```mermaid
graph TB
    subgraph Team["Agent Team"]
        Lead["Team Lead<br/>(Opus 4.6)<br/>Koordinerer alt"]

        subgraph Teammates["Teammates (Sonnet)"]
            T1["Teammate 1<br/>Eget kontekstvindu"]
            T2["Teammate 2<br/>Eget kontekstvindu"]
            T3["Teammate 3<br/>Eget kontekstvindu"]
        end

        subgraph Shared["Delte ressurser"]
            Tasks["Oppgaveliste<br/>pending | in_progress | completed"]
            Mail["Mailbox<br/>Meldinger mellom agenter"]
        end
    end

    You["DU"] <-->|"Kommandoer & feedback"| Lead
    You -.->|"Shift+Up/Down<br/>Direkte meldinger"| T1
    You -.->|"Shift+Up/Down<br/>Direkte meldinger"| T2

    Lead -->|"Spawn & assign"| T1
    Lead -->|"Spawn & assign"| T2
    Lead -->|"Spawn & assign"| T3

    T1 <-->|"Direkte kommunikasjon"| T2
    T2 <-->|"Direkte kommunikasjon"| T3
    T1 <-->|"Direkte kommunikasjon"| T3

    T1 --> Tasks
    T2 --> Tasks
    T3 --> Tasks

    Lead --> Tasks
    Lead --> Mail

    style Lead fill:#7c3aed,stroke:#5b21b6,color:#fff
    style T1 fill:#2563eb,stroke:#1d4ed8,color:#fff
    style T2 fill:#2563eb,stroke:#1d4ed8,color:#fff
    style T3 fill:#2563eb,stroke:#1d4ed8,color:#fff
    style Tasks fill:#f59e0b,stroke:#d97706,color:#000
    style Mail fill:#f59e0b,stroke:#d97706,color:#000
    style You fill:#10b981,stroke:#059669,color:#fff
```

</details>

---

## Oppgaveflyt

<details>
<summary><strong>Hvordan oppgaver flyter gjennom teamet</strong></summary>

```mermaid
stateDiagram-v2
    [*] --> Pending: Lead oppretter oppgave
    Pending --> Blocked: Har avhengigheter
    Blocked --> Pending: Avhengigheter fullfort
    Pending --> InProgress: Teammate henter oppgave
    InProgress --> Completed: Arbeid ferdig
    Completed --> [*]

    state Pending {
        [*] --> Tilgjengelig
        Tilgjengelig --> Claimed: File lock
    }

    state InProgress {
        [*] --> Jobber
        Jobber --> Melder: Sender status
        Melder --> Jobber: Fortsetter
    }

    note right of Blocked
        Automatisk unblokkering
        nar avhengigheter fullf res
    end note
```

</details>

---

## Beslutningstre - Nar bruke hva

<details>
<summary><strong>Skal du bruke Agent Teams, Subagents, eller vanlig session?</strong></summary>

```mermaid
flowchart TD
    Start["Ny oppgave"] --> Q1{"Kan oppgaven<br/>parallelliseres?"}
    Q1 -->|"Nei"| Single["Vanlig session<br/>Lavest kostnad"]
    Q1 -->|"Ja"| Q2{"Trenger agentene<br/>a snakke sammen?"}
    Q2 -->|"Nei, kun resultat"| Sub["Subagents<br/>Fokuserte oppgaver<br/>Lavere token-bruk"]
    Q2 -->|"Ja, diskusjon"| Q3{"Hvor mange filer<br/>endres?"}
    Q3 -->|"Samme filer"| Single2["Vanlig session<br/>Unnga konflikter"]
    Q3 -->|"Ulike filer"| Team["Agent Teams<br/>Parallelt arbeid"]

    style Start fill:#6b7280,stroke:#4b5563,color:#fff
    style Single fill:#10b981,stroke:#059669,color:#fff
    style Single2 fill:#10b981,stroke:#059669,color:#fff
    style Sub fill:#3b82f6,stroke:#2563eb,color:#fff
    style Team fill:#7c3aed,stroke:#5b21b6,color:#fff
```

</details>

---

## Display Modes

<details>
<summary><strong>In-process vs Split panes</strong></summary>

```mermaid
graph LR
    subgraph InProcess["In-Process Mode (standard)"]
        direction TB
        Terminal["Ett terminalvindu"]
        Terminal --> Lead_IP["Team Lead"]
        Terminal --> T1_IP["Teammate 1 (skjult)"]
        Terminal --> T2_IP["Teammate 2 (skjult)"]
        Nav["Shift+Up/Down for a bytte"]
    end

    subgraph SplitPane["Split Pane Mode (tmux/iTerm2)"]
        direction TB
        P1["Panel 1<br/>Team Lead"]
        P2["Panel 2<br/>Teammate 1"]
        P3["Panel 3<br/>Teammate 2"]
        Click["Klikk panel for interaksjon"]
    end

    style InProcess fill:#1e293b,stroke:#334155,color:#fff
    style SplitPane fill:#1e293b,stroke:#334155,color:#fff
    style Terminal fill:#374151,stroke:#4b5563,color:#fff
    style Nav fill:#f59e0b,stroke:#d97706,color:#000
    style P1 fill:#7c3aed,stroke:#5b21b6,color:#fff
    style P2 fill:#2563eb,stroke:#1d4ed8,color:#fff
    style P3 fill:#2563eb,stroke:#1d4ed8,color:#fff
    style Click fill:#f59e0b,stroke:#d97706,color:#000
    style Lead_IP fill:#7c3aed,stroke:#5b21b6,color:#fff
    style T1_IP fill:#2563eb,stroke:#1d4ed8,color:#fff
    style T2_IP fill:#2563eb,stroke:#1d4ed8,color:#fff
```

</details>

---

## Eksempel: Feature-bygging

<details>
<summary><strong>Slik ser en typisk feature-build ut med 3 teammates</strong></summary>

```mermaid
sequenceDiagram
    actor Du
    participant Lead as Team Lead (Opus)
    participant FE as Frontend (Sonnet)
    participant BE as Backend (Sonnet)
    participant Test as Tester (Sonnet)

    Du->>Lead: "Bygg notifikasjonssystem"
    Lead->>Lead: Bryter ned i oppgaver

    par Parallelt arbeid
        Lead->>FE: Spawn + oppgave: UI-komponenter
        Lead->>BE: Spawn + oppgave: Edge function + DB
        Lead->>Test: Spawn + oppgave: Skriv tester
    end

    FE->>BE: "Hvilket API-format bruker du?"
    BE->>FE: "JSON med { type, message, timestamp }"

    FE-->>Lead: UI ferdig
    BE-->>Lead: API ferdig

    Test->>FE: "Trenger komponent-eksport for testing"
    FE->>Test: "Eksportert fra index.ts"

    Test-->>Lead: Tester ferdig

    Lead->>Du: Alt ferdig - oppsummering
```

</details>

---

## Eksempel: Debugging-battle

<details>
<summary><strong>Konkurrerende hypoteser for feilsoking</strong></summary>

```mermaid
sequenceDiagram
    actor Du
    participant Lead as Team Lead
    participant A as Agent A: Auth-teori
    participant B as Agent B: DB-teori
    participant C as Agent C: Race condition

    Du->>Lead: "App krasjer ved login"
    Lead->>A: Undersok auth-flyt
    Lead->>B: Undersok database-queries
    Lead->>C: Undersok async race conditions

    A->>B: "Fant expired token - kan det utlose DB-feil?"
    B->>A: "Nei, DB handterer det. Sjekk refresh-logikken"
    C->>A: "Jeg ser at refresh og login kjorer samtidig!"
    A->>C: "Bekreftet! Race condition i token refresh"

    A-->>Lead: Root cause funnet
    B-->>Lead: DB er uskyldig
    C-->>Lead: Fix-forslag klart

    Lead->>Du: Rapport: Race condition i token refresh
```

</details>

---

## Plan Approval Flow

<details>
<summary><strong>Nar teammates ma fa godkjenning for de koder</strong></summary>

```mermaid
flowchart TD
    A["Lead spawner teammate<br/>med plan approval"] --> B["Teammate utforsker<br/>(read-only modus)"]
    B --> C["Teammate lager plan"]
    C --> D["Sender plan til Lead"]
    D --> E{"Lead vurderer"}
    E -->|"Godkjent"| F["Teammate koder"]
    E -->|"Avvist + feedback"| B
    F --> G["Oppgave ferdig"]

    style A fill:#7c3aed,stroke:#5b21b6,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style C fill:#3b82f6,stroke:#2563eb,color:#fff
    style D fill:#f59e0b,stroke:#d97706,color:#000
    style E fill:#ef4444,stroke:#dc2626,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
    style G fill:#10b981,stroke:#059669,color:#fff
```

</details>

---

## Hurtigreferanse - Tastatur

<details>
<summary><strong>Alle hurtigtaster for agent teams</strong></summary>

```mermaid
graph TD
    subgraph Navigasjon
        A["Shift + Up/Down<br/>Bytt teammate"]
        B["Enter<br/>Se teammate session"]
        C["Escape<br/>Avbryt teammate"]
    end

    subgraph Modes
        D["Shift + Tab<br/>Delegate mode"]
    end

    subgraph Visning
        E["Ctrl + T<br/>Vis oppgaveliste"]
    end

    style A fill:#3b82f6,stroke:#2563eb,color:#fff
    style B fill:#3b82f6,stroke:#2563eb,color:#fff
    style C fill:#ef4444,stroke:#dc2626,color:#fff
    style D fill:#7c3aed,stroke:#5b21b6,color:#fff
    style E fill:#f59e0b,stroke:#d97706,color:#000
```

</details>

---

## Token-kostnad

<details>
<summary><strong>Kostnadssammenligning mellom tilnarminger</strong></summary>

```mermaid
graph LR
    subgraph Kostnad["Token-bruk (relativt)"]
        direction TB
        S1["Vanlig session<br/>1x tokens"] ~~~ S2["Subagents<br/>~2-3x tokens"]
        S2 ~~~ S3["Agent Team (3)<br/>~4-5x tokens"]
        S3 ~~~ S4["Agent Team (5+)<br/>~6-10x tokens"]
    end

    style S1 fill:#10b981,stroke:#059669,color:#fff
    style S2 fill:#3b82f6,stroke:#2563eb,color:#fff
    style S3 fill:#f59e0b,stroke:#d97706,color:#000
    style S4 fill:#ef4444,stroke:#dc2626,color:#fff
```

</details>

---

## Livssyklus

<details>
<summary><strong>Full livssyklus for et agent team</strong></summary>

```mermaid
flowchart TD
    A["Du gir oppgave til Claude"] --> B{"Claude vurderer:<br/>Trenger dette et team?"}
    B -->|"Ja / du ber om det"| C["Team opprettes"]
    B -->|"Nei"| Z["Vanlig session"]

    C --> D["Lead bryter ned oppgaven"]
    D --> E["Teammates spawnes"]
    E --> F["Oppgaver fordeles"]

    F --> G["Teammates jobber parallelt"]
    G --> H["Kommunikasjon ved behov"]
    H --> I{"Alle oppgaver ferdig?"}

    I -->|"Nei"| J["Lead overvaker & styrer"]
    J --> G

    I -->|"Ja"| K["Lead syntetiserer resultater"]
    K --> L["Teammates shuts down"]
    L --> M["Team cleanup"]
    M --> N["Ferdig"]

    style A fill:#10b981,stroke:#059669,color:#fff
    style C fill:#7c3aed,stroke:#5b21b6,color:#fff
    style E fill:#3b82f6,stroke:#2563eb,color:#fff
    style G fill:#3b82f6,stroke:#2563eb,color:#fff
    style K fill:#7c3aed,stroke:#5b21b6,color:#fff
    style N fill:#10b981,stroke:#059669,color:#fff
```

</details>
