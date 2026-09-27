# Documentazione

## In breve

La documentazione è organizzata per **dominio di business**, non per file sorgente:
un dominio (`ticket`, `category`, `user`, ...) ha una cartella in `docs/domains/` e
i documenti che lo descrivono. I documenti trasversali, che valgono per tutti i
domini, stanno in `docs/architecture/`. Le guide che seguono il percorso di una
richiesta o di una sessione stanno nella root di `docs/`.

Le convenzioni generali del progetto — separazione dei layer, regole di GraphQL,
gestione degli errori, workflow — **non** stanno qui: sono in
[`AGENTS.md`](../AGENTS.md) e valgono per tutto il repository.

I sorgenti restano la verità sul *come* questa cosa è implementata. Questi
documenti rispondono a *cosa si può fare*, *chi può farlo* e *perché è fatto
così*, quindi non duplicano liste di endpoint, query o campi dello schema: quelle
sono generate e si leggono nel codice.

## Struttura

```
docs/
  README.md                  questo file: indice e convenzioni
  auth.md                    login, refresh, sessione
  frontend.md                page → container → componenti, link Apollo, loading
  architecture/
    casl.md                  come i domini vengono uniti in un'unica ability, e come questa arriva al frontend
    data-flow.md             GraphQL resolver → service → Prisma
  domains/
    ticket/
      life-cycle.md          il percorso di un ticket, stato per stato
      casl.md                le regole CASL del dominio ticket, campo per campo
    user/casl.md
    category/casl.md
    ticket-scope/casl.md
    ticket-history/casl.md
    ticket-notification/casl.md
    stats/casl.md
```

## Architettura

- [CASL](architecture/casl.md)
- [Data flow](architecture/data-flow.md)

## Domini

Ogni dominio ha le sue regole in `lib/casl/abilities/<dominio>/` e le documenta
nella cartella omonima. Il pattern è quello di
[ticket/casl.md](domains/ticket/casl.md): `In breve`, file del dominio, tabelle
`Ruolo × Azione`, e come le regole vengono fatte rispettare.

- **ticket**
  - [ciclo di vita](domains/ticket/life-cycle.md)
  - [regole CASL](domains/ticket/casl.md)
- **user**
  - [regole CASL](domains/user/casl.md)
- **category**
  - [regole CASL](domains/category/casl.md)
- **ticket-scope**
  - [regole CASL](domains/ticket-scope/casl.md)
- **ticket-history**
  - [regole CASL](domains/ticket-history/casl.md)
- **ticket-notification**
  - [regole CASL](domains/ticket-notification/casl.md)
- **stats**
  - [regole CASL](domains/stats/casl.md)

## Guide

- [Autenticazione](auth.md)
- [Frontend](frontend.md)
