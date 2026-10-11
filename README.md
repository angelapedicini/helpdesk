# Helpdesk

Gestione delle richieste di assistenza interna. Gli utenti aprono ticket, i tecnici
li prendono in carico, e ogni ticket attraversa un ciclo di stati fino alla chiusura
o al rifiuto. Ognuno vede solo quello che gli compete, in base al ruolo e al
reparto.

## Funzionalità

- **Ticket** con titolo, descrizione, priorità, scadenza e stato, più i campi
  specifici del reparto (IT, HR, Finance, Support, Logistic).
- **Assegnazione automatica**: il backend sceglie il tecnico specializzato nella
  categoria che ha meno ticket aperti, escludendo chi ha aperto il ticket quando
  esiste un altro candidato.
- **Permessi con CASL**: quattro ruoli (`EMPLOYEE`, `TECHNICIAN`, `ADMIN`,
  `SYSTEM_ADMIN`) e un unico set di regole che vale sia per la UI sia per il server.
- **Categorie con matrice di accesso**: ogni categoria dichiara quali ruoli e
  reparti possono usarla, quindi la dashboard di un utente cambia in base a chi è.
- **Messaggi e history** su ogni ticket, con tracciamento di chi ha fatto cosa.
- **Notifiche in app**, con subscription per gli amministratori.
- **Statistiche** per reparto.
- **Autenticazione** con access token e refresh token.

## Struttura

```
app/            pagine, route group protetti e route handler GraphQL
components/     componenti React, quasi tutti presentational
apollo-client/  cache, link e query/mutation
graphql/        schema, resolver e moduli di dominio
lib/            logica di dominio, permessi CASL, validazione
prisma/         schema e seed
```

Il client Prisma non si genera in `node_modules` ma in `app/generated/prisma`,
perciò va rigenerato insieme allo schema.

## Avvio

```bash
npm install
npx prisma migrate dev   # crea lo schema sul database
npx prisma generate      # genera il client
npm run codegen          # genera i tipi GraphQL
npm run dev
```

Servono le variabili d'ambiente per la connessione al database e per i segreti
dell'autenticazione.

## Panoramica tecnica (breve)

### Stack

- **[Next.js](https://nextjs.org/docs)** (App Router) — Struttura full-stack con route handler per GraphQL e layout protetti.
- **[React](https://react.dev/)** + **[TypeScript](https://www.typescriptlang.org/docs/)** — Componenti e tipizzazione end-to-end.
- **[Material UI (MUI)](https://mui.com/)** — Layout e componenti UI, senza Tailwind.
- **[Apollo Client](https://www.apollographql.com/docs/react/)** — Gestione GraphQL e stato server sul frontend.
- **[React Hook Form](https://react-hook-form.com/)** + **[Zod](https://zod.dev/)** — Form e validazione condivisa con backend.
- **[GraphQL](https://graphql.org/learn/)** — Contratto tra frontend e backend.
- **[Prisma](https://www.prisma.io/docs)** + **[Neon](https://neon.tech/docs/introduction)** — ORM e database PostgreSQL.
- **[CASL](https://casl.js.org/v6/en/)** — Permessi basati su regole, riutilizzati frontend/backend.
- **[jose](https://github.com/panva/jose)** — Firma e verifica JWT (access + refresh). 

### GraphQL + Apollo Client

I componenti (`useQuery`/`useMutation`) non conoscono la rete: l'andata passa da **loadingLink** (alza il contatore globale per lo spinner), poi da **authRefreshLink** + **httpLink** verso `POST /api/graphql`. Il ritorno passa da **notificationLink** che traduce gli errori in italiano, mostra eventuale messaggio di successo per le mutation e fa proseguire i dati.

```mermaid
flowchart LR
  subgraph AC1["Apollo Client · andata"]
    LL{"loading link"}
    AR["authRefreshLink<br/>httpLink"]
  end
  subgraph GS["GraphQL Apollo Server"]
    API["route.ts<br/>entrypoint"]
    CTX["context<br/>requireSession()"]
    BE["Apollo Server<br/>smista al resolver giusto"]
    PRISMA["Prisma"]
  end
  subgraph AC2["Apollo Client · ritorno"]
    NL{"notification link"}
    Q{"ci sono errori?"}
    EC["code → italiano"]
    M{"mutation<br/>e non silent?"}
    MS["successMessage"]
  end
  C1["Componente React<br/>useQuery / useMutation"] -->|1 richiesta| LL
  LL --> AR
  AR -->|2 POST /api/graphql| API
  API --> CTX --> BE --> PRISMA
  PRISMA <--> DB["Neon"]
  BE2["Apollo Server"] -->|3 risposta| NL
  NL --> Q
  Q -->|sì| EC --> SN["notify()<br/>snackbar centralizzata"]
  Q -->|no| M
  M -->|sì| MS --> SN
  M -->|"no · i dati"| C2["Componente React"]
```

**Note**: `loadingVar` gestisce il loader globale; `notificationLink` centralizza errori/success (nessun `try/catch` + `notify` nei componenti). 

### Autenticazione

Easylogin a credenziali preimpostate. Vengono emessi due JWT (**access** e **refresh**) con **segreti separati** e scritti in **cookie httpOnly** (`secure` solo in produzione, `sameSite: "lax"`). Il context verifica l'access token una volta sola; se scaduto/manomesso, **authRefreshLink** (Apollo) reagisce a `UNAUTHENTICATED` chiamando `RefreshToken`.

- Access: 10s, payload contiene `userId`, `role`, `department` (evita query DB ad ogni richiesta).
- Refresh: 1 giorno, payload solo `userId`, salvato in tabella `RefreshToken` con stessa scadenza e `jti` univoco (rotazione + lock per evitare doppie rotazioni).
- Esclusi dal ciclo di refresh: `RefreshToken`, `Login`, `Register`.
- `REFRESH_CONFLICT`: token valido ma riga già ruotata — non sloggare; si ritenta con i nuovi cookie del vincitore.
- `logout`: cancella **tutte** le sessioni dell'utente.

#### Flusso normale

```mermaid
flowchart LR
  U["easylogin"] --> A["access_token<br/>10 secondi"]
  U --> R["refresh_token<br/>1 giorno"]
  A --> C["cookie httpOnly<br/>due segreti jose"]
  R --> C
  C --> Q["browser manda cookie"]
  Q --> S{"verifyAccessToken()"}
  S -->|valido| D["context.session → ability → resolver → Prisma"]
  S -->|scaduto/assente/manomesso| NA["GraphQLError UNAUTHENTICATED<br/>→ refresh via Apollo"]
```

#### Flusso refresh (Apollo authRefreshLink)

```mermaid
flowchart TD
  NA["UNAUTHENTICATED"] --> RL["authRefreshLink chiama RefreshToken (no Apollo loop)"]
  RL -->|success| RT["ritenta operazione originale"]
  RL -->|REFRESH_CONFLICT| CF["attende 300ms e riprova 1 volta"]
  CF -->|success| RT
  CF -->|ancora conflict| L["redirect a /"]
  RL -->|denied| L
  RL -->|rete/500| K["restituisce errore originale, non sloggare"]
```

[Approfondimento: Autenticazione](AGENTS.md#authentication) e codice in `graphql/context.ts`, `lib/auth/*`, `lib/apollo-client/auth-refresh-link.ts`.

### Demo e branching Neon

Ogni sessione demo vive su un **branch Neon dedicato**, creato al volo come copia **copy-on-write** del branch di produzione. La demo parte dai dati reali (utenti seedati inclusi), le modifiche fatte dentro non toccano la produzione, e il branch sparisce da solo alla scadenza grazie al TTL nativo di Neon.

#### Ciclo di vita

1. L'utente chiama la mutation `startDemo`.
2. Se il cookie `helpdesk_demo_session_id` esiste ed è ancora valido in `DemoSession`, il branch esistente viene riusato (niente branch duplicati).
3. Altrimenti `createDemoBranch()` (`lib/neon/neon.ts`) chiama l'API Neon V2: crea un branch figlio di `NEON_PARENT_BRANCH_ID` con `expires_at` tra 1 ora e un endpoint `read_write`. La response contiene già la connection string, non serve la seconda chiamata a `reveal_password`.
4. Il resolver salva la riga su `DemoSession` (`neonBranchId`, `connectionString`, `expiresAt`) e scrive il cookie demo **prima di tornare**: in questo modo la chiamata a `Login` che arriva subito dopo viene già instradata sul branch giusto.
5. Se il branch non si crea (errore Neon/API), `startDemo` lancia `GraphQLError` con `extensions.code: DEMO_BRANCH_FAILED`.

La pulizia è affidata a Neon stesso (`expires_at`): alla scadenza il branch viene eliminato. `deleteBranch()` esiste per un eventuale delete esplicito (es. abbandono immediato, per liberare risorse prima dell'ora).

#### Routing del client Prisma

```mermaid
flowchart LR
  subgraph CL["Browser"]
    M["startDemo<br/>mutation"] -->|1| API["resolver demo"]
    CK["cookie demo session id"] --> REQ["login + query successive"]
  end
  subgraph NEON["Neon"]
    PARENT["branch produzione<br/>(parent)"] -->|copy-on-write| B["branch demo<br/>expires_at +1h"]
  end
  API --> NEON
  API -->|2 salva DemoSession| PDB["production DB<br/>DemoSession"]
  PDB -->|3 setta cookie| CK
  REQ -->|4| GP["getPrismaClient()"]
  GP -->|cookie assente/scaduto| PROD["prodPrisma"]
  GP -->|cookie valido| LOOK["lookup DemoSession<br/>(via prodPrisma)"]
  LOOK --> GC["client Prisma demo<br/>cache LRU · max 20"]
  GC -->|5 connessione| B
  PROD -->|connessione| PARENT
  classDef neon fill:#e8eaf6,stroke:#3949ab,color:#1a237e
  class NEON,B,PARENT neon
```

`getPrisma()` (`lib/prisma/index.ts`) sceglie il percorso in base a `USE_NEON_BRANCHING`: se vale `false`, usa `getPrismaClient()` (`lib/prisma/demo-client.ts`), che risolve il branch giusto in base al cookie; altrimenti (o in sviluppo locale) usa sempre `staticPrismaClient`.

Dettagli del routing:

- **Cookie prima di tutto**: senza `helpdesk_demo_session_id` non viene interrogata `DemoSession` — il costo è solo una lettura di cookie per richiesta.
- **Cache LRU**: i client Prisma dei branch demo vengono tenuti in cache (`Map` globale, max 20): al raggiungimento del limite si sfratta e disconnette il client meno usato di recente.
- **Un solo client per richiesta**: nel context GraphQL (`graphql/context.ts`) il client si risolve una volta per richiesta, non per resolver. Così la lookup della sessione demo non si ripete e, soprattutto, tutti i resolver della stessa query parlano con lo stesso database anche se la cache sfrattasse il client a metà query.

#### Variabili d'ambiente

- `NEON_PROJECT_ID`, `NEON_API_KEY` — credenziali dell'API Neon V2.
- `NEON_PARENT_BRANCH_ID` — branch di produzione da cui si diramano le demo.
- `USE_NEON_BRANCHING=false` — attiva il routing sui branch demo. Se assente o con valore diverso, si usa sempre il client statico (sviluppo locale).

Riferimenti: `graphql/modules/demo/resolvers.ts`, `lib/neon/neon.ts`, `lib/prisma/demo-client.ts`, `lib/prisma/index.ts`, `lib/auth/cookies.ts`, `prisma/schema.prisma` (`DemoSession`).

### Permessi (CASL)

È un'unica **AppAbility** costruita da `defineAbility(session)`: ogni dominio (`ticket`, `user`, `category`, `ticket-notification`, `stats`, `ticket-history`, `ticket-scope`) dichiara proprie regole e subject; tutte vengono unite in un solo oggetto. 

- **Backend**: enforcement tramite `assertCan*` (`guards.ts`) o filtro con `accessibleBy()` per le liste (evita fetch+scarto). 
- **Frontend**: le stesse regole serializzate vengono ricostruite in `AbilityProvider` e usate dagli hook di dominio solo per guidare UI (nascondere/disabilitare). La sicurezza resta sul backend.

```mermaid
flowchart TB
  S["session"] --> D["defineAbility()"]
  D --> R["7 domini → regole"]
  R --> A["AppAbility unica"]
  A -->|"resolver"| G["assertCan* / accessibleBy()"]
  A -->|"UI"| L["layout → AbilityProvider → useAbility()"]
```

[CASL docs](https://casl.js.org/v6/en/guide/intro), implementazione in `lib/casl/defineAbility.ts` e `lib/casl/abilityContext.tsx`.

### Ciclo di vita del Ticket

Il backend decide l'assegnazione in creazione: se esiste un tecnico specialista nella categoria con meno ticket aperti → **ASSIGNED** (auto-assegnato), altrimenti **OPEN** (da assegnare). Lettura/modifica/cancellazione dipendono da **ruolo** + relazione (creatore/assegnatario) + **reparto**. Le transizioni di stato sono in `ALLOWED_STATUS_TRANSITIONS` (mappa), separate dai permessi CASL.

```mermaid
flowchart TB
  START(["Creazione"]) --> BASE["campi + categoria"]
  BASE --> S1["ASSIGNED<br/>auto-assegnato"] & S2["OPEN<br/>nessun specialista"]
  S1 --> READ
  S2 --> READ
  READ -- EMPLOYEE --> R1["solo propri"]
  READ -- TECHNICIAN --> R2["propri o assegnati"]
  READ -- ADMIN --> R3["reparto + propri"]
  READ -- SYSTEM_ADMIN --> R4["tutti"]
  R2 --> INPROG["IN_PROGRESS<br/>tecnico prende in carico"]
  INPROG --> CONS["chiude in CLOSED o riassegna"]
  CONS --> CLOSED["CLOSED"] --> REOP["REOPENED<br/>creatore/assegnatario"]
  S2 --> SPEC["ADMIN: assegna tecnico o cambia categoria → può tornare ad ASSIGNED;<br/>oppure REFUSED se non fondato"]
  SPEC --> REF["REFUSED (finale)"]
  classDef stato fill:#e3f2fd,stroke:#1565c0,color:#0d47a1
  class S1,S2,INPROG,CLOSED,REOP,REF stato
```

Dettagli campo-per-campo: vedere `lib/casl/abilities/ticket/rules.ts`.

### Errori, notifiche e loading

- **Backend**: `GraphQLError` con **messaggio inglese** (dev/log) + `extensions.code` in `UPPER_SNAKE_CASE`. Mai testo italiano nel backend.
- **Frontend (`notificationLink`)**: mappa `extensions.code` → **messaggio italiano** (`graphqlErrorMessages`), fallback a messaggio originale o generico. Anche errori HTTP mappati. 
- **Success**: per mutation, se non `silent`, mostra `context.successMessage` (con placeholder sostituiti dai campi ritornati). 
- **Side effects**: `FORBIDDEN`/403 → `redirectToDashboard()`; `UNAUTHENTICATED` gestito da `authRefreshLink` (refresh + retry, redirect a `/` solo se fallisce).
- **Loading**: `loadingLink` incrementa/decrementa `loadingVar` (contatore globale). Il loader globale legge `loadingVar`; il `loading` locale Apollo resta per disabilitare singoli bottoni.
