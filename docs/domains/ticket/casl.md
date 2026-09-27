# CASL — dominio ticket

## In breve

Due subject, `Ticket` e `TicketMessage`, e un'azione in più rispetto agli altri
domini: `browseAssignees`, che non autorizza nulla e serve solo a decidere come
popolare il campo assegnatario.

È l'unico dominio dove l'`update` è a grana di campo — quale campo si può toccare
dipende dal ruolo e dallo stato — ed è l'unico che tiene le transizioni di stato
fuori da CASL, in una mappa separata.

`TicketMessage` non ha un `rules.ts` proprio: le sue condizioni hanno senso solo
in funzione del ticket padre, quindi vivono in coda a quelle di `Ticket`.

Le regole sono in `lib/casl/abilities/ticket/rules.ts`. Per il flusso di business
vedi [`life-cycle.md`](./life-cycle.md), per come i domini vengono uniti in
un'unica ability vedi [`casl.md` dell'architettura](../../architecture/casl.md).

## File del dominio

| File | Contenuto |
| --- | --- |
| `types.ts` | `TicketActions`, `TicketForAbility` (`Pick` di `Ticket` sui soli campi usati nelle condizioni), `TicketMessageForAbility` |
| `rules.ts` | `defineAbilityForTicket(user)` — le regole di `Ticket` **e** di `TicketMessage` insieme, più `ALLOWED_STATUS_TRANSITIONS` |
| `guards.ts` | `assertCanCreateTicket` / `assertCanReadTicket` / `assertCanUpdateTicket` / `assertCanDeleteTicket`, gli assert `assertCan*TicketMessage`, gli adapter `to*Subject` |
| `hook-permission.ts` | hook React (`useTicketUpdatePermissions`, `useTicketAllowedStatuses`, ...) |

`TicketMessage` non ha un proprio `rules.ts`: le sue `can`/`cannot` sono scritte
in coda alla stessa `defineAbilityForTicket`, perché le sue condizioni
(`ticket.createdById`, `ticket.status`, ...) hanno senso solo in funzione dello
stesso ticket padre — non sono una politica indipendente. Anche i suoi assert
(`assertCanCreateTicketMessage`, `assertCanDeleteTicketMessage`) stanno in
`guards.ts` accanto a quelli di `Ticket`, per lo stesso motivo.

## Permessi CASL — Ticket

### CREATE

| Ruolo | Condizione | Campi consentiti |
| --- | --- | --- |
| tutti | — | `title`, `description`, `categoryId`, `priority`, `department`, `specificValue` |
| `TECHNICIAN` | `ticketDepartment` = reparto dell'utente | `assignedToId` *(solo presentazione: mostra il suggerimento di auto-assegnazione in UI; l'assegnatario reale in creazione è sempre calcolato dal backend)* |

### READ

| Ruolo | Condizione |
| --- | --- |
| `SYSTEM_ADMIN` | nessuna: tutti i ticket |
| tutti | `createdById` = utente |
| `TECHNICIAN` | `assignedToId` = utente |
| `ADMIN` | `ticketDepartment` = reparto dell'utente |

### UPDATE

**Regole comuni (creatore o assegnatario, indipendentemente dal ruolo)**

| Ruolo/relazione | Condizione | Campi consentiti |
| --- | --- | --- |
| creatore | `status` ∈ {`OPEN`, `ASSIGNED`} | `title`, `description`, `priority` |
| creatore | `status` ∈ {`OPEN`, `ASSIGNED`} | `categoryId`, `specificValue` |
| creatore | `status` = `CLOSED` | `status` (→ `REOPENED`), `reopenReason`, `closedAt` |
| assegnatario | `status` = `CLOSED` | `status` (→ `REOPENED`), `reopenReason`, `closedAt` |

**`TECHNICIAN` in quanto assegnatario**

| Condizione | Campi consentiti |
| --- | --- |
| `status` ∈ {`ASSIGNED`, `REOPENED`} | `status` (→ `IN_PROGRESS` o `REFUSED`), `closingMessage` |
| `status` = `IN_PROGRESS` | `status` (→ `CLOSED`), `closedAt`, `closingMessage` |
| `status` ∈ {`ASSIGNED`, `IN_PROGRESS`} | `dueDate` |
| `status` ∈ {`ASSIGNED`, `IN_PROGRESS`} | `assignedToId` (riassegnazione) |
| sempre, sul ticket assegnato | ✗ `createdById` — mai modificabile |

**`ADMIN` nel proprio reparto**

| Condizione | Campi consentiti |
| --- | --- |
| `status` ∈ {`OPEN`, `ASSIGNED`} | `assignedToId` |
| `status` = `OPEN` | `status`, `closingMessage` |
| `status` = `OPEN` | `categoryId`, `specificValue` |
| `lastUpdatedBy.role` = `ADMIN` (qualsiasi stato) | `categoryId`, `specificValue` — caso speciale: se l'admin è l'ultimo ad aver toccato il ticket (es. appena dopo averlo assegnato), può ancora cambiare categoria anche fuori da `OPEN` |
| `status` ∈ {`OPEN`, `ASSIGNED`} | `priority` |
| `status` ∈ {`IN_PROGRESS`, `CLOSED`} | ✗ `status` — non può intervenire su un ticket già in lavorazione |
| sempre, sul reparto | ✗ `createdById` — mai modificabile |

### DELETE

| Ruolo | Condizione |
| --- | --- |
| creatore | `status` ∈ {`OPEN`, `ASSIGNED`} |

### Capability di presentazione

Non sono permessi di modifica: guidano solo l'interfaccia (quale componente
mostrare), la sicurezza reale resta sulle regole di `update` sopra.

| Capability | Ruolo | Condizione | Uso |
| --- | --- | --- | --- |
| `browseAssignees` | `ADMIN` | `ticketDepartment` = reparto, `status` = `OPEN` | mostra la lista completa dei tecnici del reparto invece della ricerca testuale |

### Caso particolare: lock da ultimo aggiornamento admin

Quando l'ultimo aggiornamento di un ticket è stato fatto da un admin
(`lastUpdatedBy.role = ADMIN`), tutti i ruoli diversi da `ADMIN` perdono ogni
permesso di modifica su quel ticket, **compreso il creatore** — è un blocco
totale, non limitato a un campo. L'unica eccezione è il `TECHNICIAN`
assegnatario, che conserva comunque il permesso di modificare `status`: deve
poter prendere in carico o rifiutare il ticket anche subito dopo che l'admin
lo ha appena assegnato. Non appena il tecnico esegue un aggiornamento,
`lastUpdatedBy` cambia e si torna alle regole normali. L'admin stesso non è
mai soggetto a questo lock.

## Permessi CASL — TicketMessage

| Azione | Ruolo | Condizione |
| --- | --- | --- |
| create | creatore del ticket | `ticket.status` ∉ {`CLOSED`, `REFUSED`} |
| create | `TECHNICIAN` assegnatario | `ticket.status` ∈ {`ASSIGNED`, `IN_PROGRESS`} |
| create | `ADMIN` del reparto | `ticket.status` ∉ {`CLOSED`, `REFUSED`} |
| delete | autore del messaggio | nessuna condizione di stato: si può sempre eliminare un proprio messaggio |

`SYSTEM_ADMIN` non ha una regola dedicata: vale solo quella generica del
creatore, coerente con `Ticket` — la trasversalità del ruolo copre la lettura,
non la scrittura.

## Stato vs permesso

Le transizioni ammesse (`OPEN → ASSIGNED`, `IN_PROGRESS → CLOSED`, ...) non sono
regole CASL: stanno in una mappa separata, `ALLOWED_STATUS_TRANSITIONS`,
indicizzata per ruolo e stato corrente. Le due cose rispondono a domande
diverse — "posso scrivere il campo `status`?" e "questo valore è una
transizione valida dallo stato attuale?" — e solo la prima è un permesso.

La mappa viene usata in due punti:

- **`assertCanUpdateTicket`** (`guards.ts`): dopo il check CASL sul campo
  `status`, verifica che la transizione sia ammessa. Se non lo è l'errore è
  `BAD_USER_INPUT`, non `FORBIDDEN` — è un input non valido, non un permesso.
- **`useTicketAllowedStatuses`** (`hook-permission.ts`): popola le opzioni
  del `<Select>` con lo stato attuale più le transizioni ammesse, ma solo se
  il check CASL sul campo `status` passa.

## Come vengono fatte rispettare: `guards.ts`

Ogni subject espone funzioni `assertCan*`, chiamate dai resolver GraphQL
(`graphql/modules/ticket/resolvers/`). Su un'istanza singola costruiscono
`subject("Ticket", existing)` e valutano il check; in creazione, dove l'istanza
non esiste ancora, il check è sul tipo e basta.

Due scelte sono di questo progetto:

- **`update` si verifica campo per campo**: `assertCanUpdateTicket` itera solo
  sui campi effettivamente presenti nell'input e verifica ciascuno singolarmente,
  più il controllo di transizione di stato descritto sopra.
- **Le liste non hanno un assert**: il resolver `tickets` usa
  `accessibleBy(ability, "read").ofType("Ticket")` per tradurre le regole di
  lettura in un filtro Prisma, in `AND` con il filtro dello scope selezionato
  (vedi [`ticket-scope/casl.md`](../ticket-scope/casl.md)) e con i filtri
  liberi dell'utente — evita di dover fetchare tutto e scartare lato applicativo.

### Valutare una condizione senza l'istanza

In due casi l'oggetto su cui valutare la regola non esiste, e al suo posto se ne
costruisce uno parziale:

- **in creazione**, per decidere se mostrare il suggerimento di auto-assegnazione
  senza avere ancora un ticket: `toTicketDepartmentSubject` contiene solo
  `ticketDepartment`, il campo su cui è scritta la condizione del `TECHNICIAN`.
- **in creazione di un messaggio**, che non ha ancora un id: si costruisce
  l'istanza con la relazione `ticket` annidata nella stessa forma usata dalle
  condizioni di `rules.ts`, così non va salvato nulla per sapere se l'azione è
  consentita.

### Adapter FE ↔ BE

Le condizioni in `rules.ts` sono scritte in stile Prisma piatto (`createdById`),
mentre il frontend riceve GraphQL annidato (`createdBy: { id }`). Per questo il
dominio espone `toTicketSubject` e `toTicketMessageSubject`: prendono la forma
GraphQL e restituiscono quella attesa dalle condizioni. Le stesse regole
funzionano così sia sull'oggetto Prisma reale sia su quello GraphQL mappato,
perché entrambi vengono ricondotti alla stessa forma prima del check.

## `hook-permission.ts` — hook per la UI

Gli hook (`useTicketUpdatePermissions`, `useTicketDeletePermission`,
`useTicketAllowedStatuses`, `useTicketAssigneeBrowseMode`,
`useTicketCreateSelfAssignment`) richiamano i check sui subject adattati sopra,
per decidere cosa mostrare: quali campi di un form sono editabili, quali stati
proporre in una select, se mostrare la ricerca o la lista completa per
l'assegnatario.

Non sono un confine di sicurezza, per il motivo descritto in
[`casl.md` dell'architettura](../../architecture/casl.md#cosa-se-ne-fa-il-frontend):
replicano le regole solo per non offrire all'utente controlli che il server
rifiuterebbe comunque.