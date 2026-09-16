
/*
 * ---------------------------------------------------------------
 * CONTENUTI DEI TICKET
 * ---------------------------------------------------------------
 *
 * Un "caso" per categoria: titolo e descrizione scritti come li
 * scriverebbe davvero un dipendente (prima persona, niente nome
 * dell'autore), più la risposta del tecnico in caso di chiusura
 * e un motivo di rifiuto coerente con lo stesso problema (non
 * generico) in caso di REFUSED.
 *
 * Separato da seed.ts per tenere la logica di generazione libera
 * dal "muro di testo" dei contenuti — qui dentro non c'è altro che
 * dati.
 */

import { Department } from "@/app/generated/prisma/enums";

export type TicketCase = {
  title: string;
  description: string;
  closingMessage: string;
  refusedReason: string;
};

/*
 * Un ticket OPEN non ha ancora categoria (è in attesa di
 * triage/assegnazione), quindi ha un suo contenuto generico
 * separato, senza closingMessage/refusedReason (non li usa mai).
 */
export const OPEN_TICKET_CASE: Pick<TicketCase, "title" | "description"> = {
  title: "Richiesta da smistare",
  description:
    "Ho un problema ma non sono sicuro a quale categoria assegnarlo. Potete indirizzarlo al reparto giusto?",
};

export const CATEGORY_CASES: Record<Department, Record<string, TicketCase>> = {
  IT: {
    Hardware: {
      title: "Malfunzionamento hardware",
      description:
        "Il dispositivo che uso per lavorare si è bloccato e non risponde più. Potete controllarlo?",
      closingMessage:
        "Abbiamo sostituito il dispositivo con uno nuovo: lo trovi disponibile in ufficio IT da ritirare.",
      refusedReason:
        "Il dispositivo indicato risulta già sostituito il mese scorso: la richiesta sembra duplicata. Verifica il numero seriale e riapri il ticket se il problema è su un dispositivo diverso.",
    },
    Bug: {
      title: "Errore applicativo",
      description:
        "Il software si blocca con un errore imprevisto ogni volta che provo ad aprire un nuovo progetto.",
      closingMessage:
        "Abbiamo rilasciato una patch che risolve il problema: aggiorna il software all'ultima versione disponibile.",
      refusedReason:
        "Il problema segnalato risulta già corretto nell'ultimo aggiornamento rilasciato: verifica di avere la versione più recente installata prima di riaprire.",
    },
    "Sistemi e accessi": {
      title: "Problema di accesso al sistema",
      description:
        "Usando le mie credenziali non riesco ad entrare nel software. Cosa devo fare?",
      closingMessage:
        "Ti ho inviato un link via email per cambiare le credenziali: scade tra 24 ore. Devi prima inserire l'indirizzo email associato all'account, poi potrai procedere con il cambio password.",
      refusedReason:
        "Non risultano tentativi di accesso falliti sul tuo account nelle ultime 48 ore: la richiesta non sembra riconducibile a un problema di sistema. Se il blocco persiste, riapri il ticket specificando l'orario esatto.",
    },
  },

  HR: {
    "Buste paga": {
      title: "Discrepanza in busta paga",
      description:
        "Ho notato un importo diverso da quello atteso nell'ultima busta paga. Potete verificare?",
      closingMessage:
        "Abbiamo verificato e corretto l'errore di calcolo: la busta paga rettificata sarà disponibile nel portale entro 3 giorni lavorativi.",
      refusedReason:
        "Abbiamo verificato i conteggi e risultano corretti in base al contratto in vigore: se hai ancora dubbi, allega la busta paga di riferimento al ticket.",
    },
    "Dati del dipendente": {
      title: "Aggiornamento dati anagrafici",
      description:
        "Ho cambiato indirizzo di residenza e ho bisogno di aggiornare i miei dati nel sistema.",
      closingMessage:
        "I tuoi dati anagrafici sono stati aggiornati: controlla che risultino corretti nella tua area personale.",
      refusedReason:
        "Per aggiornare i dati anagrafici serve un documento a supporto (es. certificato di residenza): la richiesta viene rifiutata in attesa della documentazione.",
    },
  },

  FINANCE: {
    "Sconti per cliente": {
      title: "Richiesta approvazione sconto cliente",
      description:
        "Il cliente ha chiesto uno sconto extra sull'ordine in corso: serve la vostra approvazione per procedere.",
      closingMessage:
        "Lo sconto è stato approvato e applicato all'ordine: il cliente può procedere con il pagamento.",
      refusedReason:
        "Lo sconto richiesto supera il tetto massimo consentito per questa fascia cliente: rivedi la percentuale e ripresenta la richiesta.",
    },
    "Problemi contabili": {
      title: "Anomalia su fattura",
      description:
        "La fattura che ho ricevuto riporta un importo diverso da quello concordato con il cliente.",
      closingMessage:
        "Abbiamo emesso una nota di credito per correggere l'importo: la trovi allegata nel gestionale.",
      refusedReason:
        "L'importo in fattura risulta corretto in base al contratto firmato: verifica le condizioni concordate prima di riaprire il ticket.",
    },
    Budget: {
      title: "Richiesta stanziamento budget",
      description:
        "Abbiamo bisogno di un nuovo stanziamento per coprire una spesa non prevista in questo trimestre.",
      closingMessage:
        "Lo stanziamento è stato approvato ed è già visibile nel budget del reparto.",
      refusedReason:
        "Il budget del trimestre risulta già interamente allocato: la richiesta potrà essere rivalutata nel prossimo ciclo di pianificazione.",
    },
  },

  SUPPORT: {
    "Dati cliente errati": {
      title: "Dati cliente non corretti",
      description:
        "Ho notato che l'indirizzo email del cliente nel sistema non è aggiornato: questo sta causando problemi nelle comunicazioni.",
      closingMessage:
        "Abbiamo corretto i dati del cliente nel sistema: ora risultano aggiornati.",
      refusedReason:
        "I dati indicati corrispondono a quanto comunicato direttamente dal cliente: verifica con lui prima di segnalare l'errore.",
    },
    "Comunicazione cliente": {
      title: "Richiesta supporto comunicazione cliente",
      description:
        "Il cliente non ha ricevuto risposta alla sua ultima email e ha sollecitato un aggiornamento.",
      closingMessage:
        "Abbiamo contattato il cliente e fornito l'aggiornamento richiesto: la situazione è chiusa.",
      refusedReason:
        "Risulta già una risposta inviata al cliente in data odierna: verifica la casella di posta prima di riaprire la segnalazione.",
    },
  },

  LOGISTIC: {
    Spedizione: {
      title: "Richiesta informazioni spedizione",
      description:
        "Il cliente chiede lo stato della spedizione del suo ordine: non ha ricevuto aggiornamenti.",
      closingMessage:
        "Abbiamo fornito al cliente il numero di tracking aggiornato: la spedizione risulta in transito.",
      refusedReason:
        "La spedizione risulta già consegnata secondo il corriere: verifica con il cliente prima di riaprire la richiesta.",
    },
    "Problemi di consegna": {
      title: "Problema con la consegna",
      description:
        "Il pacco è arrivato danneggiato al cliente: serve gestire la sostituzione.",
      closingMessage:
        "Abbiamo organizzato la sostituzione del pacco: la nuova spedizione partirà entro domani.",
      refusedReason:
        "Il danno segnalato non risulta compatibile con le foto ricevute dal corriere: serve documentazione aggiuntiva prima di procedere.",
    },
    Reso: {
      title: "Richiesta gestione reso",
      description:
        "Il cliente vuole restituire un prodotto non conforme a quanto ordinato.",
      closingMessage:
        "Il reso è stato autorizzato: abbiamo inviato al cliente l'etichetta di spedizione per la restituzione.",
      refusedReason:
        "Il prodotto risulta fuori dai termini previsti per il reso (oltre 30 giorni dall'acquisto): la richiesta non può essere accolta.",
    },
  },
};

export function getTicketCase(department: Department, categoryName: string): TicketCase {
  const ticketCase = CATEGORY_CASES[department][categoryName];

  if (!ticketCase) {
    throw new Error(`Nessun caso definito per ${department} / ${categoryName}`);
  }

  return ticketCase;
}