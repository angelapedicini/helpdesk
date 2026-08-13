// lib/ticket/autoAssign.ts

import prisma from "@/lib/prisma";
import type { TicketStatus } from "@/app/generated/prisma/client";

/**
 * Stati che consideriamo come "ticket aperto".
 *
 * Un ticket CLOSED non deve contribuire al carico del technician,
 * perché non richiede più lavoro.
 */
const OPEN_TICKET_STATUSES: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
];

/**
 * Trova automaticamente il technician a cui assegnare un ticket.
 *
 * Regole:
 *
 * 1. Trova tutti i technician specializzati nella categoria.
 *
 * 2. Se il creator NON è uno degli specialisti:
 *      → tutti gli specialisti sono candidati.
 *
 * 3. Se il creator È uno degli specialisti:
 *      → se esiste almeno un altro specialist,
 *        il creator viene escluso dalla scelta automatica.
 *
 *      → se il creator è l'UNICO specialist,
 *        rimane candidato e il ticket viene assegnato a lui.
 *
 * 4. Tra i candidati viene scelto il technician
 *    che ha meno ticket ancora aperti.
 *
 * 5. Se non esiste nessuno specialista per la categoria,
 *    ritorna null.
 */
export async function autoAssign(
  categoryId: number,
  createdById: number
): Promise<number | null> {
  /*
   * ---------------------------------------------------------
   * 1. TROVIAMO I TECHNICIAN DELLA CATEGORIA
   * ---------------------------------------------------------
   *
   * userSpecialization rappresenta il rapporto:
   *
   *    User <-> Category
   *
   * Esempio:
   *
   * categoryId = 5 (Hardware)
   *
   * risultato:
   *
   * [
   *   { userId: 10 },
   *   { userId: 15 },
   *   { userId: 20 }
   * ]
   *
   * Significa che gli utenti 10, 15 e 20
   * sono specializzati nella categoria Hardware.
   */

  const specialists = await prisma.userSpecialization.findMany({
    where: {
      categoryId,
    },
    select: {
      userId: true,
    },
  });

  /*
   * Se non c'è nessun technician specializzato
   * nella categoria, non possiamo fare l'assegnazione automatica.
   *
   * Esempio:
   *
   * Category: Hardware
   * Specialists: []
   *
   * → ritorniamo null
   *
   * Sarà il chiamante a decidere cosa fare:
   * lasciare il ticket Unassigned,
   * farlo gestire all'admin, ecc.
   */
  if (specialists.length === 0) {
    return null;
  }

  /*
   * Trasformiamo:
   *
   * [
   *   { userId: 10 },
   *   { userId: 15 },
   *   { userId: 20 }
   * ]
   *
   * in:
   *
   * [10, 15, 20]
   */
  const specialistIds = specialists.map(
    (specialist) => specialist.userId
  );

  /*
   * ---------------------------------------------------------
   * 2. CREIAMO LA LISTA DEI CANDIDATI
   * ---------------------------------------------------------
   *
   * Qui gestiamo il caso particolare del creator.
   *
   * Esempio normale:
   *
   * creator = 10
   * specialists = [10, 15, 20]
   *
   * Non vogliamo che il sistema assegni automaticamente
   * il ticket a chi lo ha appena creato, se esiste
   * almeno un altro technician.
   *
   * Quindi otteniamo:
   *
   * candidates = [15, 20]
   *
   *
   * CASO PARTICOLARE:
   *
   * creator = 10
   * specialists = [10]
   *
   * Qui il creator è l'UNICO technician disponibile.
   *
   * Non possiamo eliminarlo dalla lista, altrimenti
   * non rimarrebbe nessun technician a cui assegnare il ticket.
   *
   * Quindi:
   *
   * candidates = [10]
   */

  const candidateIds =
    specialistIds.length > 1
      ? specialistIds.filter((id) => id !== createdById)
      : specialistIds;

  /*
   * ---------------------------------------------------------
   * 3. SAFETY CHECK
   * ---------------------------------------------------------
   *
   * Normalmente questo caso non dovrebbe verificarsi
   * con dati corretti.
   *
   * Esempi:
   *
   * specialists = [10]
   * creator = 10
   *
   * → candidateIds = [10]
   *
   * specialists = [10, 20]
   * creator = 10
   *
   * → candidateIds = [20]
   *
   * specialists = [20, 30]
   * creator = 10
   *
   * → candidateIds = [20, 30]
   *
   * In tutti questi casi abbiamo almeno un candidato.
   *
   * Manteniamo comunque il controllo per sicurezza.
   */

  if (candidateIds.length === 0) {
    return null;
  }

  /*
   * ---------------------------------------------------------
   * 4. CONTIAMO I TICKET APERTI PER OGNI CANDIDATO
   * ---------------------------------------------------------
   *
   * Ora abbiamo, ad esempio:
   *
   * candidateIds = [15, 20, 25]
   *
   * Vogliamo sapere quanti ticket aperti
   * ha attualmente ogni technician.
   *
   * NON facciamo una query per ogni technician.
   *
   * Facciamo una sola query groupBy.
   *
   * Esempio risultato:
   *
   * [
   *   { assignedToId: 15, _count: 3 },
   *   { assignedToId: 20, _count: 7 }
   * ]
   *
   * Se un technician non compare nel risultato,
   * significa che non ha ticket aperti → quindi ha 0.
   */

  const openCounts = await prisma.ticket.groupBy({
    by: ["assignedToId"],

    where: {
      /*
       * Consideriamo solamente i ticket assegnati
       * ai technician che stiamo valutando.
       */
      assignedToId: {
        in: candidateIds,
      },

      /*
       * Consideriamo solo i ticket ancora "aperti".
       *
       * CLOSED viene escluso.
       */
      status: {
        in: OPEN_TICKET_STATUSES,
      },

      /*
       * I ticket eliminati non devono contribuire
       * al carico del technician.
       */
      deletedAt: null,
    },

    /*
     * Prisma ci restituisce il numero di ticket
     * per ogni assignedToId.
     */
    _count: true,
  });

  /*
   * ---------------------------------------------------------
   * 5. CREIAMO UNA MAPPA userId -> numero di ticket
   * ---------------------------------------------------------
   *
   * openCounts potrebbe essere:
   *
   * [
   *   { assignedToId: 15, _count: 3 },
   *   { assignedToId: 20, _count: 7 }
   * ]
   *
   * Lo trasformiamo in:
   *
   * Map {
   *   15 => 3,
   *   20 => 7
   * }
   *
   * Se cerchiamo:
   *
   * countMap.get(25)
   *
   * e 25 non compare nella query,
   * significa che ha 0 ticket aperti.
   */

  const countMap = new Map<number, number>(
    openCounts
      .filter((item) => item.assignedToId !== null)
      .map((item) => [
        item.assignedToId as number,
        item._count,
      ])
  );

  /*
   * ---------------------------------------------------------
   * 6. SCEGLIAMO IL TECHNICIAN CON MENO TICKET
   * ---------------------------------------------------------
   *
   * Esempio:
   *
   * candidateIds = [15, 20, 25]
   *
   * countMap:
   *
   * 15 -> 3 ticket
   * 20 -> 7 ticket
   * 25 -> 0 ticket
   *
   * reduce() confronta i candidati e mantiene
   * quello con il numero minore di ticket.
   *
   * Risultato:
   *
   * 25
   */

  return candidateIds.reduce((best, current) => {
    /*
     * Se il technician non compare nella Map,
     * significa che non ha ticket aperti.
     *
     * Quindi usiamo 0.
     */
    const bestCount = countMap.get(best) ?? 0;
    const currentCount = countMap.get(current) ?? 0;

    /*
     * Se current ha meno ticket di best,
     * current diventa il nuovo candidato migliore.
     *
     * Altrimenti manteniamo best.
     */
    return currentCount < bestCount ? current : best;
  });
}