# Documentazione

Questa cartella raccoglie la documentazione tecnica del progetto. Ogni file
descrive un dominio del helpdesk e ha sempre la stessa struttura, così chi arriva
sa dove guardare.

## Struttura di un file di dominio

Tre parti, sempre in quest'ordine.

### 1. Riassunto

Tre o quattro frasi in linguaggio semplice: che cos'è il dominio e che cosa succede
in pratica. Niente nomi di file, niente nomi di regole, niente condizioni. Serve a
chi legge per la prima volta e vuole orientarsi in trenta secondi.

### 2. Diagramma

Un `flowchart` in Mermaid che mostra il flusso con una freccia per ogni ruolo. È la
parte che si guarda, non si legge.

### 3. Tabella dei ruoli

La stessa cosa del diagramma, ma in forma formale e consultabile: righe = azioni,
colonne = ruoli. Una riga dice un'azione, una cella dice cosa può fare quel ruolo su
quell'azione. Qui dentro valgono le condizioni esatte, anche se sono scomode.

La regola che tiene insieme le tre parti: **il riassunto dice cosa, il diagramma
mostra come, la tabella dimostra cosa è esatto.** Nessuna delle tre ripete le altre
due.

## Regole di scrittura

**Lingua.** Italiano, frasi brevi, tono asciutto. Niente enfasi e niente enfasi di
vendita: il codice parla da solo, il testo spiega.

**Verificabilità.** Ogni affermazione deve essere controllabile nel codice. Se
descrive una condizione, la fonte è la regola CASL o il resolver, e va citata. Se
non riesci a trovare dove è scritto nel codice, la frase non va nel file.

**Niente duplicazioni.** Il dettaglio sta in un file solo. Gli altri rimandano con
un link. Se trovi la stessa spiegazione in due posti, uno dei due è di troppo.

**Le eccezioni in fondo.** Limiti, casi particolari e difetti conosciuti stanno in
una sezione finale dedicata, mai dentro il riassunto e mai dentro il diagramma. Il
diagramma descrive il comportamento previsto, non quello rotto.

**Nomi che non si traducono.** I ruoli e gli stati vanno sempre in `monospace` e nel
nome originale: `EMPLOYEE`, `TECHNICIAN`, `ADMIN`, `SYSTEM_ADMIN`, `OPEN`,
`ASSIGNED`, `IN_PROGRESS`, `REOPENED`, `CLOSED`, `REFUSED`. Sono valori di enum del
database: chi li legge deve poterli cercare.

**Condizioni per esteso.** Niente abbreviazioni di stato. `quando è aperto o
assegnato`, non `OPEN/ASSIGNED`, e nella tabella neppure. Le eccezioni si scrivono
per intero anche se occupano tre righe.

## Regole per i diagrammi

**Sintassi Mermaid compatibile.** Solo la sintassi che ogni versione di Mermaid
riconosce, perché il rendering lo fa GitHub e non è detto che aggiorni Mermaid
all'ultima versione. Quindi niente `@{ shape: ... }`: le forme si dichiarano
direttamente sul nodo, `Nodo["etichetta"]` per un rettangolo, `Nodo{"decisione"}`
per un rombo, `Nodo(["etichetta"])` per uno stadio. Il vantaggio è che se in futuro
la sintassi nuova è supportata, la conversione è meccanica.

**Ogni `classDef` ha la sua riga `class`.** Definire un colore non basta: senza la
riga `class` che elenca i nodi, il diagramma si disegna tutto con i colori di
default e non te ne accorgi. È l'errore più facile da fare e il più invisibile.

**I colori hanno un significato fisso**, uguale in tutti i file:

| Colore | Significato |
| --- | --- |
| Verde | azione consentita a quel ruolo |
| Arancione | limite o caso speciale che va spiegato |
| Blu | stato del ticket |

**Le biforcazioni usano `&`.** `A --> B & C` invece di due righe separate, quando i
due rami escono dallo stesso nodo.

**Niente frecce che tornano indietro.** Un collegamento che risale nel grafico
attraversa tutto il resto e produce incroci illeggibili. Se serve descrivere un
ritorno, si scrive dentro il nodo di destinazione, per esempio "ritorna su `ASSIGNED`
e il backend ricalcola l'assegnatario".

**I nodi finali non convergono.** Si evita un nodo `Fine` che riceve da punti a
profondità diverse: crea percorsi lunghi che si incrociano. Ogni ramo finisce col
suo nodo.

## Indice

| File | Contenuto | Quando leggerlo |
| --- | --- | --- |
| `ticket-lifecycle.md` | Il ciclo di vita del ticket, dalla creazione alla riapertura e alla cancellazione, con i poteri di ogni ruolo a ogni passo. | Prima, per capire come lavora il sistema |
| `authorization.md` | Le regole di autorizzazione degli altri domini: messaggi, utenti, categorie, notifiche, statistiche, history, viste. | Quando serve un permesso preciso e controllabile |
| `architecture.md` | Lo stack: Next.js, GraphQL, Apollo Client, Prisma, CASL, Zod, autenticazione. Perché sono state scelte quelle e come si parlano tra loro. | Quando ti chiedi come è fatto |

## Checklist per un file nuovo

- [ ] il riassunto si capisce senza sapere cosa sia CASL
- [ ] il diagramma ha una freccia per ogni ruolo e non ha incroci
- [ ] ogni `classDef` ha la riga `class` corrispondente
- [ ] la tabella ripete esattamente il diagramma, in forma formale
- [ ] le eccezioni sono in fondo, in una sezione separata
- [ ] ogni condizione di stato è per esteso
- [ ] i nomi di ruolo e di stato sono in `monospace` e non tradotti
- [ ] ogni affermazione è riconducibile a un file del codice
- [ ] il file è linkato dall'indice
