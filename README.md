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

## Stack

| Livello | Scelta |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Interfaccia | Material UI 9, React Hook Form, Zod 4 |
| Dati | Apollo Client 4, GraphQL 16, codegen per i tipi |
| API | Apollo Server 5 su Next.js |
| Database | PostgreSQL su Neon, Prisma 7 |
| Permessi | CASL 7 con adapter Prisma |
| Autenticazione | JWT con `jose`, password con `bcryptjs` |

## Struttura

```
app/            pagine, route group protetti e route handler GraphQL
components/     componenti React, quasi tutti presentational
apollo-client/  cache, link e query/mutation
graphql/        schema, resolver e moduli di dominio
lib/            logica di dominio, permessi CASL, validazione
prisma/         schema e seed
docs/           documentazione
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

## Documentazione

### In breve

La documentazione è in `docs/` ed è organizzata per **dominio di business**, non
per file sorgente: ogni dominio (`ticket`, `category`, `user`, ...) ha la sua
cartella in `docs/domains/` e i documenti che lo descrivono. I documenti che
valgono per tutti i domini stanno in `docs/architecture/`, le guide di frontend
nella root di `docs/`.

Le convenzioni generali del progetto — separazione dei layer, regole di GraphQL,
gestione degli errori — non stanno qui: sono in [AGENTS.md](AGENTS.md) e valgono
per tutto il repository.

I sorgenti restano la verità sul *come* una cosa è implementata. Questi
documenti rispondono a *cosa si può fare*, *chi può farlo* e *perché è fatto
così*.

### Architettura

- [CASL](docs/architecture/casl.md)
- [Autenticazione](docs/architecture/auth.md)
- [Data flow](docs/architecture/data-flow.md)

### Domini

Ogni dominio ha le sue regole in `lib/casl/abilities/<dominio>/` e le documenta
nella cartella omonima. Il pattern è quello di
[ticket](docs/domains/ticket/casl.md): `In breve`, file del dominio, tabelle
`Ruolo × Azione`, e come le regole vengono fatte rispettare.

- **ticket**
  - [ciclo di vita](docs/domains/ticket/life-cycle.md)
  - [regole CASL](docs/domains/ticket/casl.md)
- **user**
  - [regole CASL](docs/domains/user/casl.md)
- **category**
  - [regole CASL](docs/domains/category/casl.md)
- **ticket-scope**
  - [regole CASL](docs/domains/ticket-scope/casl.md)
- **ticket-history**
  - [regole CASL](docs/domains/ticket-history/casl.md)
- **ticket-notification**
  - [regole CASL](docs/domains/ticket-notification/casl.md)
- **stats**
  - [regole CASL](docs/domains/stats/casl.md)

### Guide

- [Frontend](docs/frontend.md)
