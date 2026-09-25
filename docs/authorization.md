# Autorizzazione (CASL)

Cosa può fare ogni ruolo, su ogni risorsa, e dove stanno le regole.

Il percorso completo di un ticket, con i poteri a ogni stato, è descritto in
[ticket-lifecycle.md](ticket-lifecycle.md). Qui ci sono gli altri domini, in forma
di consultazione.

## Come è organizzata

```
lib/casl/defineAbility.ts          ← composing point: unisce tutti i domini
        │
        ├── abilities/<dominio>/rules.ts    ← le regole: qui si aggiunge un permesso
        ├── abilities/<dominio>/guards.ts   ← assertCan* (server) / hook can* (UI)
        │
        └── rendering
                ├── accessibleBy(ability, "read")   ← filtro Prisma nelle liste
                ├── assertCan*(ability, ...)        ← controllo nelle mutation
                └── ability.can(...)                ← hook useXxxPermissions()
```

- **Un solo set di regole** per frontend e backend: la stessa ability decide cosa
  mostrare nella UI e cosa consentire lato server, quindi non possono divergere.
- **`rules.ts`** è l'unico posto dove si aggiunge una regola, **`guards.ts`** la
  applica.
- Le regole condizionali valutano la **risorsa**, non il payload della richiesta.

> CASL risponde a «**può** fare X su *questa* risorsa?». Se la domanda è
> «**l'operazione è valida?**» (transizione di stato, formato dati, coerenza dei
> campi) è business rule e sta nel resolver o nello schema Zod.

## Ruoli

| Ruolo | In pratica |
| --- | --- |
| `EMPLOYEE` | apre ticket, gestisce i propri |
| `TECHNICIAN` | lavora sui ticket assegnati, ha specializzazioni |
| `ADMIN` | gestisce i ticket del **proprio dipartimento** |
| `SYSTEM_ADMIN` | trasversale: legge tutto, amministra ruoli e catalogo |

Nessuna ereditarietà: ogni dominio dichiara cosa ottiene ogni ruolo.

## Messaggi (TicketMessage)

| Azione | `EMPLOYEE` | `TECHNICIAN` | `ADMIN` | `SYSTEM_ADMIN` |
| --- | --- | --- | --- | --- |
| Scrittura | ticket creati, se non chiusi o rifiutati | anche ticket assegnati a sé, aperti o in lavorazione | ticket del proprio reparto, se non chiusi o rifiutati | nessuna scrittura trasversale |
| Cancellazione | solo i propri | solo i propri | solo i propri | solo i propri |

## Utenti e specializzazioni

| Azione | `EMPLOYEE` | `TECHNICIAN` | `ADMIN` | `SYSTEM_ADMIN` |
| --- | --- | --- | --- | --- |
| Lettura | — | solo se stesso | il proprio reparto | tutti |
| Cambio ruolo | — | — | — | sì, tranne il proprio e altri `SYSTEM_ADMIN` |
| Specializzazioni | — | — | dei tecnici del proprio reparto | — |

## Categorie e accessi

| Azione | `EMPLOYEE` / `TECHNICIAN` | `ADMIN` | `SYSTEM_ADMIN` |
| --- | --- | --- | --- |
| Lettura operativa (dashboard, form, filtri) | categorie attive con grant valido per reparto e ruolo | idem | categorie attive con almeno un grant attivo |
| Gestione catalogo | — | proprio reparto, incluse le disabilitate | tutto il catalogo e la matrice |

La matrice di accesso è l'unica fonte di visibilità operativa: nessuno vede il
catalogo per dipartimento, nemmeno l'amministratore di reparto. La trasversalità
dell'amministratore di sistema vale per **gestire** il catalogo, non per **usarlo**.

## Notifiche (campanella e subscription)

| Azione | `EMPLOYEE` | `TECHNICIAN` | `ADMIN` | `SYSTEM_ADMIN` |
| --- | --- | --- | --- | --- |
| Lettura e cancellazione | le proprie | le proprie | le proprie | le proprie |
| Subscription | — | — | sì, anche su ticket non propri | sì, su qualsiasi ticket |

Le notifiche non sono scoped per proprietà: un amministratore può attivarle su un
ticket non suo e la campanella resta leggibile anche se il ticket non lo è più. Il
controllo vero è `assertCanReadTicket` sulla pagina, che risponde `FORBIDDEN`.

## Statistiche

| Azione | `EMPLOYEE` | `TECHNICIAN` | `ADMIN` | `SYSTEM_ADMIN` |
| --- | --- | --- | --- | --- |
| Statistiche | — | — | proprio reparto | qualsiasi reparto + globale |

## History

| Azione | `EMPLOYEE` | `TECHNICIAN` | `ADMIN` | `SYSTEM_ADMIN` |
| --- | --- | --- | --- | --- |
| Lettura | ticket creati | creati e assegnati a sé | tutto il proprio reparto | tutto |

## Viste della lista ticket

| Scope | `EMPLOYEE` | `TECHNICIAN` | `ADMIN` | `SYSTEM_ADMIN` |
| --- | --- | --- | --- | --- |
| `MINE` | ✓ | ✓ | ✓ | ✓ |
| `ASSIGNED_TO_ME` | | ✓ | | |
| `DEPARTMENT` | | | ✓ | |
| `ALL` | | | | ✓ |

## Note

- **Non sta in CASL** perché non è una domanda "chi può": transizioni di stato
  ammesse, regola della `dueDate`, verifica che l'assegnatario abbia la
  specializzazione della categoria, validazione dello specific value, assegnazione
  automatica, calcolo delle scadenze.
- **Per aggiungere un permesso**: il subject in `types.ts` (e in `AppSubjects` se è
  nuovo), la `can` in `rules.ts` dentro il blocco del ruolo, poi l'applicazione:
  `accessibleBy` per le liste, `assertCan*` per le mutation, hook `can*` per la UI.
  Se la regola è condizionale, verifica che l'adapter del subject popoli i campi
  richiesti, altrimenti il check fallisce in silenzio.
- **Gli hook nascondono i pulsanti, non proteggono.** La protezione sta nel resolver:
  una regola senza `assertCan*` o `accessibleBy` corrispondente non è un permesso.
  Lo scope di gestione prende il `department` dalla sessione, mai dagli argomenti.
