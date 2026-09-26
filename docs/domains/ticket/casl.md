# CASL — dominio ticket

Per il flusso di business (stati, chi vede cosa a livello generale) vedi
[`life-cycle.md`](./life-cycle.md). Questo file entra nel dettaglio delle regole
scritte in `lib/casl/abilities/ticket/rules.ts`, a livello di singolo campo, e
nei pattern usati per farle rispettare. Per come questo dominio viene composto
insieme agli altri in un'unica ability applicativa, vedi
[`casl.md` dell'architettura](../../architecture/casl.md).

## File del dominio

| File | Contenuto |
| --- | --- |
| `types.ts` | `TicketActions`, `TicketForAbility` (`Pick` di `Ticket` sui soli campi usati nelle condizioni), `TicketMessageForAbility` |
| `rules.ts` | `defineAbilityForTicket(user)` — le regole di `Ticket` **e** di `TicketMessage` insieme, più `ALLOWED_STATUS_TRANSITIONS` |
| `guards.ts` | `assertCanCreateTicket` / `assertCanReadTicket` / `assertCanUpdateTicket` / `assertCanDeleteTicket`, gli adapter `to*Subject` |
| `ticket-message.guards.ts` | `assertCanCreateTicketMessage` / `assertCanDeleteTicketMessage` |
| `presentation.ts` | hook React (`useTicketUpdatePermissions`, `useTicketAllowedStatuses`, ...) |

`TicketMessage` non ha un proprio `rules.ts`: le sue `can`/`cannot` sono scritte
in coda alla stessa `defineAbilityForTicket`, perché le sue condizioni
(`ticket.createdById`, `ticket.status`, ...) hanno senso solo in funzione dello
stesso ticket padre — non sono una politica indipendente. `ticket-message.guards.ts`
è comunque un file a parte, ma solo per leggibilità: separa le funzioni
`assertCan...TicketMessage` da quelle di `Ticket` senza dover spezzare anche le
regole.

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

Le transizioni di stato ammesse (`OPEN → ASSIGNED`, `IN_PROGRESS → CLOSED`, ...)
non sono scritte come condizioni CASL: vivono in una mappa a parte,
`ALLOWED_STATUS_TRANSITIONS`, indicizzata per ruolo e stato corrente. Il motivo
è che CASL risponde a "posso toccare il campo `status` su questo ticket", non a
"questo valore di `status` è una transizione legale da quello attuale" — sono
due domande diverse, e mescolarle in un'unica condizione CASL (es. provare a
esprimere "posso mettere `status: CLOSED` solo se ero `IN_PROGRESS`" con un
`in: [...]` sul valore nuovo) non è rappresentabile con le condizioni CASL,
che valutano l'oggetto esistente, non il valore che l'utente sta scrivendo.

Questa mappa viene usata due volte:

- **Lato server**, in `assertCanUpdateTicket` (in `guards.ts`): dopo aver
  verificato con CASL che l'utente può toccare il campo `status`, se
  `input.status` è presente si verifica separatamente che
  `ALLOWED_STATUS_TRANSITIONS[ruolo][statoAttuale]` includa il valore
  richiesto; altrimenti l'errore è `BAD_USER_INPUT`, non `FORBIDDEN` — è un
  input non valido, non un problema di permessi.
- **Lato client**, in `useTicketAllowedStatuses` (in `presentation.ts`): popola
  le opzioni di un `<Select>` con lo stato attuale più le transizioni
  ammesse, ma solo se `ability.can("update", subject, "status")` è vero — se
  CASL nega il campo, l'unica opzione mostrata resta lo stato attuale.

## Come vengono fatte rispettare: `guards.ts`

Ogni subject espone funzioni `assertCan...`, chiamate dai resolver GraphQL
(`modules/ticket/resolvers/`). Il pattern:

1. **CREATE**: nessuna istanza esiste ancora, il check è di tipo:
   `ability.cannot("create", "Ticket")`.
2. **READ/UPDATE/DELETE su un'istanza singola**: si costruisce
   `subject("Ticket", existing)` — l'helper di `@casl/ability`, che tagga
   l'oggetto con `__caslSubjectType__` così il rilevamento del tipo non
   dipende dal costruttore né da un `__typename` GraphQL — e si valuta
   `ability.cannot(azione, subject, campo)`.
3. **UPDATE è per campo**: `assertCanUpdateTicket` itera solo sui campi
   effettivamente presenti nell'input e verifica ciascuno singolarmente,
   più il controllo di transizione di stato descritto sopra.
4. **Liste**: invece di un `assertCanX`, il resolver `tickets` usa
   direttamente `accessibleBy(ability, "read").ofType("Ticket")` per tradurre
   le regole di lettura in un filtro Prisma, in `AND` con il filtro dello
   scope selezionato (vedi [`ticket-scope/casl.md`](../ticket-scope/casl.md))
   e con i filtri liberi dell'utente — evita di dover fetchare tutto e
   scartare lato applicativo.

### Subject parziali: valutare una condizione senza un'istanza reale

A volte serve sapere se un certo valore di un campo (es. `ticketDepartment`)
renderebbe l'azione permessa, senza avere un ticket reale — per esempio in
creazione, prima ancora che l'oggetto esista, per decidere se mostrare il
suggerimento di auto-assegnazione. Il pattern (`toTicketDepartmentSubject`):
costruire un oggetto parziale con solo quel campo, passarlo a `subject(...)`,
e castare il risultato — non a un tipo "nudo" come `TicketForAbility` (che
butterebbe via il tag `__caslSubjectType__` appena impostato), ma al tipo che
lo mantiene:

```ts
export function toTicketDepartmentSubject(
  department: Department
): ReturnType<typeof toTicketSubject> {
  return subject("Ticket", {
    __typename: "Ticket",
    ticketDepartment: department,
  }) as unknown as ReturnType<typeof toTicketSubject>;
}
```

Quando invece la regola dipende da un oggetto padre che non esiste ancora
(creare un messaggio su un ticket), si costruisce un subject "finto" con la
relazione annidata nella stessa forma usata dalle condizioni di `rules.ts`
(`{ ticket: { createdById, status, ... } }`), senza dover salvare nulla prima
di sapere se l'azione è permessa — è quello che fa
`assertCanCreateTicketMessage`.

### Adapter FE ↔ BE

Le query GraphQL restituiscono relazioni annidate (`createdBy: { id }`,
`category: { id }`), mentre le condizioni CASL sono scritte in stile Prisma
flat (`createdById`, `categoryId`). Per questo il dominio espone
`toTicketSubject(ticketGraphQL)` e `toTicketMessageSubject(messageGraphQL)`:
prendono la forma GraphQL e restituiscono quella flat/annidata attesa dalle
condizioni, già avvolta in `subject(...)`. Le stesse condizioni funzionano
così sia sull'oggetto Prisma reale (backend) sia su quello GraphQL mappato
(frontend), perché entrambi vengono ricondotti alla stessa shape prima del
check.

## `presentation.ts` — hook per la UI

Gli hook (`useTicketUpdatePermissions`, `useTicketDeletePermission`,
`useTicketAllowedStatuses`, `useTicketAssigneeBrowseMode`,
`useTicketCreateSelfAssignment`) richiamano `ability.can(...)` sui subject
adattati sopra, per decidere cosa mostrare: quali campi di un form sono
editabili, quali stati proporre in una select, se mostrare la ricerca o la
lista completa per l'assegnatario. **Non sono un confine di sicurezza**:
replicano le regole solo per evitare che l'utente veda controlli che poi il
server rifiuterebbe — l'unica verifica che conta è quella in `guards.ts`.