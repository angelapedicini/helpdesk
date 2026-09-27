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

La documentazione è in [`docs/`](docs/README.md), dove c'è l'indice completo e
le convenzioni con cui è scritta. Da dove iniziare:

- [ciclo di vita del ticket](docs/domains/ticket/life-cycle.md) — il percorso
  di una richiesta, stato per stato
- [architettura CASL](docs/architecture/casl.md) — come i domini vengono uniti
  in un'unica ability e come questa arriva al frontend
- [regole CASL del dominio ticket](docs/domains/ticket/casl.md) — chi può fare
  cosa, campo per campo
