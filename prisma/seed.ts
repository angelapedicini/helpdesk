import {
  Department,
  PrismaClient,
  TicketSpecificField,
  HardwareType,
  Software,
  Customer,
  BudgetType,
  TicketPriority,
} from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { addBusinessDays } from "date-fns";
import "dotenv/config";
import bcrypt from "bcryptjs";
import { autoAssign } from "../lib/ticket/autoAssign";
import { computeDueDate } from "../lib/ticket/dueDate";
import { buildTicketHistoryData } from "../lib/ticket/history";
import { getTicketCase, OPEN_TICKET_CASE } from "@/lib/helper/seed-helper";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const DEPARTMENT_CATEGORIES: Record<Department, string[]> = {
  IT: ["Hardware", "Bug", "Sistemi e accessi"],
  HR: ["Buste paga", "Dati del dipendente"],
  FINANCE: ["Sconti per cliente", "Problemi contabili", "Budget"],
  SUPPORT: ["Dati cliente errati", "Comunicazione cliente"],
  LOGISTIC: ["Spedizione", "Problemi di consegna", "Reso"],
};

/*
 * Specifica associata a ciascuna categoria.
 *
 * Una categoria = un campo specifico (o nessuno, se assente dalla mappa).
 */
const CATEGORY_SPECIFIC_FIELD: Record<
  Department,
  Record<string, TicketSpecificField>
> = {
  IT: {
    Hardware: TicketSpecificField.HARDWARE_TYPE,
    Bug: TicketSpecificField.SOFTWARE,
    "Sistemi e accessi": TicketSpecificField.SOFTWARE,
  },
  HR: {
    "Buste paga": TicketSpecificField.PAYROLL_REFERENCE,
    "Dati del dipendente": TicketSpecificField.EMPLOYEE_REFERENCE,
  },
  FINANCE: {
    "Sconti per cliente": TicketSpecificField.CUSTOMER,
    "Problemi contabili": TicketSpecificField.INVOICE_REFERENCE,
    Budget: TicketSpecificField.BUDGET_TYPE,
  },
  SUPPORT: {
    "Dati cliente errati": TicketSpecificField.CUSTOMER,
    "Comunicazione cliente": TicketSpecificField.CUSTOMER,
  },
  LOGISTIC: {
    Spedizione: TicketSpecificField.CUSTOMER,
    "Problemi di consegna": TicketSpecificField.SHIPMENT_REFERENCE,
    Reso: TicketSpecificField.SHIPMENT_REFERENCE,
  },
};

const DEPARTMENTS = Object.keys(DEPARTMENT_CATEGORIES) as Department[];

const firstNames = [
  "Mario", "Giuseppe", "Anna", "Luca", "Sara", "Marco", "Elena", "Paolo",
  "Chiara", "Davide", "Francesca", "Alessandro", "Giulia", "Matteo",
  "Valentina", "Simone", "Laura", "Andrea", "Martina", "Roberto",
  "Federica", "Stefano", "Silvia", "Fabio", "Claudia", "Riccardo",
  "Ilaria", "Nicola", "Serena", "Antonio", "Beatrice", "Emanuele",
  "Giorgia", "Tommaso", "Alice", "Filippo", "Camilla", "Gabriele",
  "Noemi", "Leonardo", "Michela", "Daniele", "Veronica", "Pietro",
  "Cecilia", "Vittorio", "Rebecca", "Enrico", "Arianna", "Massimo",
];

const lastNames = [
  "Rossi", "Verdi", "Bianchi", "Ferrari", "Colombo", "Ricci", "Marino",
  "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Costa", "Giordano",
  "Mancini", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana",
  "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrara", "Galli",
  "Martini", "Leone", "Longo", "Gentile", "Martinelli", "Vitale",
  "Sala", "Serra", "Farina", "Piras", "Grasso", "Pellegrini", "Palumbo",
  "Sanna", "Amato", "Vitali", "Testa", "Silvestri", "Guerra", "Parisi",
  "Ferraro", "Basile", "Monti", "Coppola",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const STATUS_WEIGHTS: {
  status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "CLOSED" | "REFUSED";
  weight: number;
}[] = [
    { status: "OPEN", weight: 0.15 },
    { status: "ASSIGNED", weight: 0.25 },
    { status: "IN_PROGRESS", weight: 0.2 },
    { status: "CLOSED", weight: 0.3 },
    { status: "REFUSED", weight: 0.1 },
  ];

const CLOSED_DAYS_BACK = 60;
const REFUSED_DAYS_BACK = 45;

const MESSAGE_PROBABILITY = 0.5;

/*
 * Pool di messaggi per TicketMessage.
 *
 * Ogni conversazione è coerente con lo stato finale del ticket: per i
 * ticket IN_PROGRESS il richiedente chiede un aggiornamento (mai
 * "preso in carico", è già implicito nello stato), per i CLOSED il
 * tecnico comunica la chiusura, per i REFUSED spiega il rifiuto.
 */
const OPEN_CREATOR = [
  "Buongiorno, allego ulteriori dettagli per facilitare la gestione della richiesta.",
  "Aggiungo qualche informazione aggiuntiva che potrebbe risultare utile.",
  "Buongiorno, segnalo che la richiesta è urgente per le attività in corso. Grazie.",
  "Resto a disposizione per eventuali chiarimenti, grazie.",
];

const ASSIGNED_TECHNICIAN = [
  "Buongiorno, ho ricevuto la richiesta e la sto analizzando. La aggiornerò non appena avrò una stima.",
  "Buongiorno, ho preso in visione il ticket e procedo con la verifica.",
  "Buongiorno, per inquadrare al meglio la richiesta potrei avere qualche dettaglio in più?",
];

const REQUESTER_REPLY = [
  "Certamente, le fornisco tutti i dettagli necessari.",
  "Grazie, ricevuto. Resto in attesa di aggiornamenti.",
  "Facciamo seguito con le informazioni richieste.",
];

const IN_PROGRESS_ASK = [
  "Buongiorno, potresti darmi un aggiornamento sullo stato di avanzamento della richiesta?",
  "Buongiorno, volevo chiedere a che punto sia la gestione di questa pratica. Grazie.",
  "Buongiorno, mi chiedevo se ci fossero novità in merito alla richiesta. Grazie.",
];

const IN_PROGRESS_FOLLOW_UP = [
  "Grazie per l'aggiornamento, seguirò con attenzione.",
  "Ricevuto, grazie. Mi farò risentire se necessario.",
];

const IN_PROGRESS_TECHNICIAN = [
  "Buongiorno, abbiamo completato l'analisi e stiamo procedendo con la risoluzione. La informeremo non appena disponibile.",
  "Buongiorno, la pratica è in lavorazione; prevediamo di concludere la verifica nei prossimi giorni.",
  "Buongiorno, il problema è in fase di risoluzione. Le confermeremo l'esito appena conclusa l'attività.",
];

const CLOSED_TECHNICIAN_UPDATE = [
  "Buongiorno, la questione è in via di risoluzione, la aggiorneremo a breve.",
  "Buongiorno, abbiamo ultimato la verifica e stiamo completando l'intervento.",
];

const CLOSED_TECHNICIAN_FINAL = [
  "Buongiorno, la richiesta è stata risolta. Restiamo a disposizione per eventuali necessità.",
  "Buongiorno, confermo che il problema è stato risolto; il ticket viene chiuso.",
  "Buongiorno, l'intervento è concluso con esito positivo. Se il problema si ripresentasse, può riaprire il ticket.",
];

const REQUESTER_THANKS = [
  "Perfetto, grazie per il supporto.",
  "Ottimo, grazie per la disponibilità.",
  "Grazie, ora tutto funziona correttamente.",
];

const REFUSED_TECHNICIAN = [
  "Buongiorno, dopo le dovute verifiche non ci è possibile dare seguito a questa richiesta, pertanto il ticket viene rifiutato.",
  "Buongiorno, la richiesta esula dalle competenze del nostro reparto e non può essere presa in carico.",
  "Buongiorno, la documentazione fornita non è sufficiente per procedere; il ticket viene quindi rifiutato.",
];

const REFUSED_REQUESTER = [
  "Ok, grazie per il riscontro.",
  "Grazie, procedo contattando il reparto competente.",
  "Ricevuto, grazie per la comunicazione.",
];

type CategoryRecord = {
  id: number;
  name: string;
  department: Department;
  specificField: TicketSpecificField | null;
};

type AuthorRecord = {
  id: number;
  firstName: string;
  lastName: string;
  department: Department;
};

type TechnicianRecord = {
  id: number;
  firstName: string;
  lastName: string;
};

/*
 * "SNAKE_CASE" -> "Snake Case", per mostrare i valori enum in modo
 * leggibile nel campo "Specifica" senza gridare in maiuscolo.
 */
function humanizeEnum(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

/*
 * Costruisce il nested-create Prisma per il "ticket specific" coerente
 * con il campo specifico richiesto dalla categoria, più un'etichetta
 * leggibile per la history: SOLO il valore (es. "Jira", "PR-0001"),
 * senza prefisso "Software:"/"Hardware:" — la categoria è già mostrata
 * a fianco, il prefisso sarebbe ridondante.
 *
 * `seedIndex` serve solo a variare i valori tra un ticket e l'altro
 * (ciclando sugli enum o incrementando i reference testuali).
 */
function buildSpecificData(
  department: Department,
  specificField: TicketSpecificField | null,
  seedIndex: number
): { data: Record<string, unknown>; label: string | null } {
  if (!specificField) {
    return { data: {}, label: null };
  }

  switch (specificField) {
    case TicketSpecificField.HARDWARE_TYPE: {
      const values = Object.values(HardwareType);
      const hardwareType = values[seedIndex % values.length];

      return {
        data: { itSpecific: { create: { hardwareType } } },
        label: humanizeEnum(hardwareType),
      };
    }

    case TicketSpecificField.SOFTWARE: {
      const values = Object.values(Software);
      const software = values[seedIndex % values.length];

      return {
        data: { itSpecific: { create: { software } } },
        label: humanizeEnum(software),
      };
    }

    case TicketSpecificField.PAYROLL_REFERENCE: {
      const payrollReference = `PR-${String(seedIndex + 1).padStart(4, "0")}`;

      return {
        data: { hrSpecific: { create: { payrollReference } } },
        label: payrollReference,
      };
    }

    case TicketSpecificField.EMPLOYEE_REFERENCE: {
      const employeeReference = `EMP-${String(seedIndex + 1).padStart(4, "0")}`;

      return {
        data: { hrSpecific: { create: { employeeReference } } },
        label: employeeReference,
      };
    }

    case TicketSpecificField.CUSTOMER: {
      const values = Object.values(Customer);
      const customer = values[seedIndex % values.length];
      const label = humanizeEnum(customer);

      if (department === Department.FINANCE) {
        return {
          data: { financeSpecific: { create: { customer } } },
          label,
        };
      }

      if (department === Department.SUPPORT) {
        return {
          data: { supportSpecific: { create: { customer } } },
          label,
        };
      }

      // LOGISTIC
      return {
        data: { logisticSpecific: { create: { customer } } },
        label,
      };
    }

    case TicketSpecificField.INVOICE_REFERENCE: {
      const invoiceReference = `INV-${String(seedIndex + 1).padStart(5, "0")}`;

      return {
        data: { financeSpecific: { create: { invoiceReference } } },
        label: invoiceReference,
      };
    }

    case TicketSpecificField.BUDGET_TYPE: {
      const values = Object.values(BudgetType);
      const budgetType = values[seedIndex % values.length];

      return {
        data: { financeSpecific: { create: { budgetType } } },
        label: humanizeEnum(budgetType),
      };
    }

    case TicketSpecificField.SHIPMENT_REFERENCE: {
      const shipmentReference = `SHP-${String(seedIndex + 1).padStart(6, "0")}`;

      return {
        data: { logisticSpecific: { create: { shipmentReference } } },
        label: shipmentReference,
      };
    }

    default:
      return { data: {}, label: null };
  }
}

// --- HELPER GENERICI ---

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandom<T>(arr: readonly T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomDateBetween(start: Date, end: Date): Date {
  const s = start.getTime();
  const e = end.getTime();

  if (e <= s) {
    return new Date(s);
  }

  return new Date(s + Math.random() * (e - s));
}

function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function computeDueWorkDate(dueFirstResponse: Date): Date {
  return addBusinessDays(dueFirstResponse, randomInt(3, 7));
}

// --- SPLIT UTENTI PER STATO ---

function splitUsersByStatusWeights(
  users: AuthorRecord[]
): Record<(typeof STATUS_WEIGHTS)[number]["status"], AuthorRecord[]> {
  const shuffled = shuffleArray(users);
  const total = shuffled.length;

  const buckets = {
    OPEN: [] as AuthorRecord[],
    ASSIGNED: [] as AuthorRecord[],
    IN_PROGRESS: [] as AuthorRecord[],
    CLOSED: [] as AuthorRecord[],
    REFUSED: [] as AuthorRecord[],
  };

  let cursor = 0;

  STATUS_WEIGHTS.forEach(({ status, weight }, idx) => {
    const isLast = idx === STATUS_WEIGHTS.length - 1;
    const count = isLast ? total - cursor : Math.round(total * weight);

    buckets[status] = shuffled.slice(cursor, cursor + count);
    cursor += count;
  });

  return buckets;
}

// --- ASSEGNAZIONE TECNICO CON FALLBACK DI SICUREZZA ---

async function assignTechnician(
  categoryId: number,
  authorId: number,
  dept: Department,
  techniciansByDept: Record<Department, TechnicianRecord[]>
): Promise<number> {
  const assignedId = await autoAssign(prisma, categoryId, authorId);

  if (assignedId) {
    return assignedId;
  }

  const fallback = techniciansByDept[dept][0];

  if (!fallback) {
    throw new Error(`Nessun tecnico disponibile per il reparto ${dept}`);
  }

  console.warn(
    `autoAssign non ha trovato uno specialista per la categoria ${categoryId}, uso fallback tecnico ${fallback.id}`
  );

  return fallback.id;
}

// --- SCELTA CATEGORIA + SPECIFICA + CONTENUTO (helper condiviso) ---

function pickCategoryWithSpecific(
  dept: Department,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  specificSeedRef: { value: number }
) {
  const category = pickRandom(categoriesByDept[dept]);
  const { data: specificData, label: specificLabel } = buildSpecificData(
    category.department,
    category.specificField,
    specificSeedRef.value++
  );
  const ticketCase = getTicketCase(category.department, category.name);

  return { category, specificData, specificLabel, ticketCase };
}

// --- GENERAZIONE TICKET HISTORY (catena a ritroso in base allo stato finale) ---

type TicketRecord = Awaited<ReturnType<typeof prisma.ticket.create>>;

/*
 * Per ogni ticket, genera a ritroso la catena di stati che deve averlo
 * preceduto (in base allo stato finale salvato su Ticket) e crea un
 * record TicketHistory per ogni stato della catena, con lo snapshot dei
 * campi coerente con quello stato (non con lo stato finale).
 *
 * Le transizioni ammesse (nessun ritorno indietro):
 *   OPEN -> ASSIGNED -> IN_PROGRESS -> CLOSED
 *   ASSIGNED -> REFUSED
 *
 * Catene generate:
 *   OPEN        -> [OPEN]
 *   ASSIGNED    -> [ASSIGNED]
 *   REFUSED     -> [ASSIGNED, REFUSED]
 *   IN_PROGRESS -> [ASSIGNED, IN_PROGRESS]
 *   CLOSED      -> [ASSIGNED, IN_PROGRESS, CLOSED]
 */
type HistoryStep = {
  status: TicketRecord["status"];
  createdAt: Date;
  lastUpdatedById: number | null;
  categoryId: number | null;
  assignedToId: number | null;
  closingMessage: string | null;
  dueFirstResponse: Date | null;
  dueDate: Date | null;
  closedAt: Date | null;
};

/*
 * Crea i record TicketHistory a partire da una lista esplicita di step.
 * Condivisa tra la catena "normale" e i casi speciali del seed.
 */
async function createHistoryRecords(
  ticket: TicketRecord,
  ticketSpecific: string | null,
  steps: HistoryStep[]
) {
  for (const step of steps) {
    await prisma.ticketHistory.create({
      data: buildTicketHistoryData(
        {
          ...ticket,
          ...step,
          updatedAt: step.createdAt,
        },
        { ticketSpecific }
      ),
    });
  }
}

/*
 * Step "ASSIGNED": nasce alla creazione del ticket. Porta il
 * dueFirstResponse e il dueDate effettivi del ticket (gli ASSIGNED
 * normali hanno dueDate null, quindi resta coerente anche lì).
 */
function assignedStepFor(ticket: TicketRecord): HistoryStep {
  return {
    status: "ASSIGNED",
    createdAt: ticket.createdAt,
    lastUpdatedById: ticket.createdById,
    categoryId: ticket.categoryId,
    assignedToId: ticket.assignedToId,
    closingMessage: null,
    dueFirstResponse: ticket.dueFirstResponse,
    dueDate: ticket.dueDate,
    closedAt: null,
  };
}

async function createTicketHistoryChain(
  ticket: TicketRecord,
  ticketSpecific: string | null
) {
  const assignedStep = assignedStepFor(ticket);

  let steps: HistoryStep[];

  switch (ticket.status) {
    case "OPEN": {
      steps = [
        {
          status: "OPEN",
          createdAt: ticket.createdAt,
          lastUpdatedById: ticket.createdById,
          categoryId: null,
          assignedToId: ticket.assignedToId,
          closingMessage: null,
          dueFirstResponse: ticket.dueFirstResponse,
          dueDate: ticket.dueDate,
          closedAt: null,
        },
      ];
      break;
    }

    case "ASSIGNED": {
      steps = [assignedStep];
      break;
    }

    case "REFUSED": {
      steps = [
        assignedStep,
        {
          status: "REFUSED",
          createdAt: ticket.closedAt ?? ticket.createdAt,
          lastUpdatedById: ticket.assignedToId,
          categoryId: ticket.categoryId,
          assignedToId: ticket.assignedToId,
          closingMessage: ticket.closingMessage,
          dueFirstResponse: ticket.dueFirstResponse,
          dueDate: ticket.dueDate,
          closedAt: ticket.closedAt,
        },
      ];
      break;
    }

    case "IN_PROGRESS": {
      const inProgressAt = randomDateBetween(
        ticket.createdAt,
        ticket.dueFirstResponse ?? ticket.createdAt
      );

      steps = [
        assignedStep,
        {
          status: "IN_PROGRESS",
          createdAt: inProgressAt,
          lastUpdatedById: ticket.assignedToId,
          categoryId: ticket.categoryId,
          assignedToId: ticket.assignedToId,
          closingMessage: null,
          dueFirstResponse: ticket.dueFirstResponse,
          dueDate: ticket.dueDate,
          closedAt: null,
        },
      ];
      break;
    }

    case "CLOSED": {
      const inProgressAt = randomDateBetween(
        ticket.createdAt,
        ticket.dueFirstResponse ?? ticket.createdAt
      );

      steps = [
        assignedStep,
        {
          status: "IN_PROGRESS",
          createdAt: inProgressAt,
          lastUpdatedById: ticket.assignedToId,
          categoryId: ticket.categoryId,
          assignedToId: ticket.assignedToId,
          closingMessage: null,
          dueFirstResponse: ticket.dueFirstResponse,
          dueDate: ticket.dueDate,
          closedAt: null,
        },
        {
          status: "CLOSED",
          createdAt: ticket.closedAt ?? ticket.createdAt,
          lastUpdatedById: ticket.assignedToId,
          categoryId: ticket.categoryId,
          assignedToId: ticket.assignedToId,
          closingMessage: ticket.closingMessage,
          dueFirstResponse: ticket.dueFirstResponse,
          dueDate: ticket.dueDate,
          closedAt: ticket.closedAt,
        },
      ];
      break;
    }

    default: {
      steps = [];
    }
  }

  await createHistoryRecords(ticket, ticketSpecific, steps);
}

// --- GENERAZIONE MESSAGGI (conversazioni coerenti con lo stato) ---

type MessageStep = { role: "creator" | "technician"; content: string };

function buildMessageSequence(status: TicketRecord["status"]): MessageStep[] {
  const creator = { role: "creator" } as const;
  const technician = { role: "technician" } as const;

  switch (status) {
    case "OPEN": {
      const count = randomInt(1, 2);

      return Array.from({ length: count }, () => ({
        ...creator,
        content: pickRandom(OPEN_CREATOR),
      }));
    }

    case "ASSIGNED": {
      const sequence: MessageStep[] = [
        { ...technician, content: pickRandom(ASSIGNED_TECHNICIAN) },
        { ...creator, content: pickRandom(REQUESTER_REPLY) },
      ];

      if (Math.random() < 0.4) {
        sequence.push({ ...technician, content: pickRandom(ASSIGNED_TECHNICIAN) });
      }

      return sequence;
    }

    case "IN_PROGRESS": {
      const count = randomInt(2, 4);
      const sequence: MessageStep[] = [];

      for (let i = 0; i < count; i++) {
        if (i % 2 === 0) {
          sequence.push({
            ...creator,
            content: pickRandom(i === 0 ? IN_PROGRESS_ASK : IN_PROGRESS_FOLLOW_UP),
          });
        } else {
          sequence.push({ ...technician, content: pickRandom(IN_PROGRESS_TECHNICIAN) });
        }
      }

      return sequence;
    }

    case "CLOSED": {
      const sequence: MessageStep[] = [
        { ...technician, content: pickRandom(CLOSED_TECHNICIAN_UPDATE) },
        { ...technician, content: pickRandom(CLOSED_TECHNICIAN_FINAL) },
        { ...creator, content: pickRandom(REQUESTER_THANKS) },
      ];

      if (Math.random() < 0.5) {
        sequence.splice(1, 0, { ...creator, content: pickRandom(REQUESTER_REPLY) });
      }

      return sequence;
    }

    case "REFUSED": {
      return [
        { ...technician, content: pickRandom(REFUSED_TECHNICIAN) },
        { ...creator, content: pickRandom(REFUSED_REQUESTER) },
      ];
    }

    default:
      return [];
  }
}

/*
 * Aggiunge una conversazione di TicketMessage a circa il 50% dei ticket.
 *
 * L'autore alterna richiedente e tecnico assegnato (per i ticket OPEN
 * solo il creatore), con timestamp in ordine cronologico compresi tra
 * createdAt e closedAt (o "ora" se il ticket è ancora aperto).
 */
async function createTicketMessages(ticket: TicketRecord) {
  if (Math.random() >= MESSAGE_PROBABILITY) {
    return;
  }

  const sequence = buildMessageSequence(ticket.status);

  if (sequence.length === 0) {
    return;
  }

  const endTime = ticket.closedAt ?? new Date();

  const timestamps = Array.from({ length: sequence.length }, () =>
    randomDateBetween(ticket.createdAt, endTime).getTime()
  ).sort((a, b) => a - b);

  const data = sequence.map((step, index) => ({
    ticketId: ticket.id,
    authorId:
      step.role === "technician" && ticket.assignedToId !== null
        ? ticket.assignedToId
        : ticket.createdById,
    content: step.content,
    createdAt: new Date(timestamps[index]),
  }));

  await prisma.ticketMessage.createMany({ data });
}

// --- FUNZIONI DI CREAZIONE TICKET, UNA PER STATO ---

async function createOpenTicket(
  author: AuthorRecord
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = new Date();
  const dueFirstResponse = computeDueDate(priority, createdAt);

  const ticket = await prisma.ticket.create({
    data: {
      title: OPEN_TICKET_CASE.title,
      description: OPEN_TICKET_CASE.description,
      status: "OPEN",
      priority,
      categoryId: null,
      createdById: author.id,
      assignedToId: null,
      lastUpdatedById: author.id,
      closingMessage: null,
      sourceDepartmentForUser: author.department,
      ticketDepartment: author.department,
      dueFirstResponse,
      dueDate: null,
      closedAt: null,
      createdAt,
    },
  });

  await createTicketHistoryChain(ticket, null);

  return ticket;
}

async function createAssignedTicket(
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = new Date();
  const dueFirstResponse = computeDueDate(priority, createdAt);

  const { category, specificData, specificLabel, ticketCase } = pickCategoryWithSpecific(
    author.department,
    categoriesByDept,
    specificSeedRef
  );

  const assignedToId = await assignTechnician(
    category.id,
    author.id,
    author.department,
    techniciansByDept
  );

  const ticket = await prisma.ticket.create({
    data: {
      title: ticketCase.title,
      description: ticketCase.description,
      status: "ASSIGNED",
      priority,
      categoryId: category.id,
      createdById: author.id,
      assignedToId,
      lastUpdatedById: author.id,
      closingMessage: null,
      sourceDepartmentForUser: author.department,
      ticketDepartment: category.department,
      dueFirstResponse,
      dueDate: null,
      closedAt: null,
      createdAt,
      ...specificData,
    },
  });

  await createTicketHistoryChain(ticket, specificLabel);

  return ticket;
}

async function createInProgressTicket(
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = new Date();
  const dueFirstResponse = computeDueDate(priority, createdAt);
  const dueWorkDate = computeDueWorkDate(dueFirstResponse);

  const { category, specificData, specificLabel, ticketCase } = pickCategoryWithSpecific(
    author.department,
    categoriesByDept,
    specificSeedRef
  );

  const assignedToId = await assignTechnician(
    category.id,
    author.id,
    author.department,
    techniciansByDept
  );

  const ticket = await prisma.ticket.create({
    data: {
      title: ticketCase.title,
      description: ticketCase.description,
      status: "IN_PROGRESS",
      priority,
      categoryId: category.id,
      createdById: author.id,
      assignedToId,
      lastUpdatedById: assignedToId,
      closingMessage: null,
      sourceDepartmentForUser: author.department,
      ticketDepartment: category.department,
      dueFirstResponse,
      dueDate: dueWorkDate,
      closedAt: null,
      createdAt,
      ...specificData,
    },
  });

  await createTicketHistoryChain(ticket, specificLabel);

  return ticket;
}

async function createClosedTicket(
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = daysAgo(CLOSED_DAYS_BACK);
  const dueFirstResponse = computeDueDate(priority, createdAt);
  const dueWorkDate = computeDueWorkDate(dueFirstResponse);
  const closedAt = randomDateBetween(dueFirstResponse, dueWorkDate);

  const { category, specificData, specificLabel, ticketCase } = pickCategoryWithSpecific(
    author.department,
    categoriesByDept,
    specificSeedRef
  );

  const assignedToId = await assignTechnician(
    category.id,
    author.id,
    author.department,
    techniciansByDept
  );

  const ticket = await prisma.ticket.create({
    data: {
      title: ticketCase.title,
      description: ticketCase.description,
      status: "CLOSED",
      priority,
      categoryId: category.id,
      createdById: author.id,
      assignedToId,
      lastUpdatedById: assignedToId,
      closingMessage: ticketCase.closingMessage,
      sourceDepartmentForUser: author.department,
      ticketDepartment: category.department,
      dueFirstResponse,
      dueDate: dueWorkDate,
      closedAt,
      createdAt,
      ...specificData,
    },
  });

  await createTicketHistoryChain(ticket, specificLabel);

  return ticket;
}

async function createRefusedTicket(
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = daysAgo(REFUSED_DAYS_BACK);
  const dueFirstResponse = computeDueDate(priority, createdAt);
  const closedAt = randomDateBetween(createdAt, dueFirstResponse);

  const { category, specificData, specificLabel, ticketCase } = pickCategoryWithSpecific(
    author.department,
    categoriesByDept,
    specificSeedRef
  );

  const assignedToId = await assignTechnician(
    category.id,
    author.id,
    author.department,
    techniciansByDept
  );

  const ticket = await prisma.ticket.create({
    data: {
      title: ticketCase.title,
      description: ticketCase.description,
      status: "REFUSED",
      priority,
      categoryId: category.id,
      createdById: author.id,
      assignedToId,
      lastUpdatedById: assignedToId,
      closingMessage: ticketCase.refusedReason,
      sourceDepartmentForUser: author.department,
      ticketDepartment: category.department,
      dueFirstResponse,
      dueDate: null,
      closedAt,
      createdAt,
      ...specificData,
    },
  });

  await createTicketHistoryChain(ticket, specificLabel);

  return ticket;
}

// --- CASI SPECIALI PER IL TEST DI SLA / SCADENZE ---

/*
 * Una combinazione di scenari "in ritardo" per verificare i ticket
 * oltre le scadenze. 2 ticket per dipartimento, 10 totali, ogni caso
 * coperto almeno due volte:
 *
 *   1. IN_PROGRESS con prima risposta in ritardo
 *      (IN_PROGRESS avvenuto DOPO dueFirstResponse)
 *   2. CLOSED completato DOPO dueDate
 *   3. IN_PROGRESS con dueDate alzata più volte in progressione
 *   4. ASSIGNED con dueFirstResponse già scaduta
 *   5. ASSIGNED con dueDate già scaduta
 */
type SpecialCaseId = 1 | 2 | 3 | 4 | 5;

const CASES_BY_DEPARTMENT: Record<Department, SpecialCaseId[]> = {
  IT: [1, 2],
  HR: [2, 3],
  FINANCE: [3, 4],
  SUPPORT: [4, 5],
  LOGISTIC: [5, 1],
};

async function createLateFirstResponseTicket(
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = daysAgo(5);
  const dueFirstResponse = daysAgo(3);
  const dueDate = daysFromNow(2);
  const inProgressAt = daysAgo(2);

  const { category, specificData, specificLabel, ticketCase } = pickCategoryWithSpecific(
    author.department,
    categoriesByDept,
    specificSeedRef
  );

  const assignedToId = await assignTechnician(
    category.id,
    author.id,
    author.department,
    techniciansByDept
  );

  const ticket = await prisma.ticket.create({
    data: {
      title: ticketCase.title,
      description: ticketCase.description,
      status: "IN_PROGRESS",
      priority,
      categoryId: category.id,
      createdById: author.id,
      assignedToId,
      lastUpdatedById: assignedToId,
      closingMessage: null,
      sourceDepartmentForUser: author.department,
      ticketDepartment: category.department,
      dueFirstResponse,
      dueDate,
      closedAt: null,
      createdAt,
      ...specificData,
    },
  });

  await createHistoryRecords(ticket, specificLabel, [
    assignedStepFor(ticket),
    {
      status: "IN_PROGRESS",
      createdAt: inProgressAt,
      lastUpdatedById: assignedToId,
      categoryId: category.id,
      assignedToId,
      closingMessage: null,
      dueFirstResponse,
      dueDate,
      closedAt: null,
    },
  ]);

  return ticket;
}

async function createLateClosedTicket(
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = daysAgo(CLOSED_DAYS_BACK);
  const dueFirstResponse = computeDueDate(priority, createdAt);
  const dueDate = daysAgo(15);
  const closedAt = daysAgo(3);

  const { category, specificData, specificLabel, ticketCase } = pickCategoryWithSpecific(
    author.department,
    categoriesByDept,
    specificSeedRef
  );

  const assignedToId = await assignTechnician(
    category.id,
    author.id,
    author.department,
    techniciansByDept
  );

  const ticket = await prisma.ticket.create({
    data: {
      title: ticketCase.title,
      description: ticketCase.description,
      status: "CLOSED",
      priority,
      categoryId: category.id,
      createdById: author.id,
      assignedToId,
      lastUpdatedById: assignedToId,
      closingMessage: ticketCase.closingMessage,
      sourceDepartmentForUser: author.department,
      ticketDepartment: category.department,
      dueFirstResponse,
      dueDate,
      closedAt,
      createdAt,
      ...specificData,
    },
  });

  await createTicketHistoryChain(ticket, specificLabel);

  return ticket;
}

async function createEscalatedDueDateTicket(
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = daysAgo(10);
  const dueFirstResponse = daysAgo(8);
  const dueDate = daysFromNow(10);

  const { category, specificData, specificLabel, ticketCase } = pickCategoryWithSpecific(
    author.department,
    categoriesByDept,
    specificSeedRef
  );

  const assignedToId = await assignTechnician(
    category.id,
    author.id,
    author.department,
    techniciansByDept
  );

  const ticket = await prisma.ticket.create({
    data: {
      title: ticketCase.title,
      description: ticketCase.description,
      status: "IN_PROGRESS",
      priority,
      categoryId: category.id,
      createdById: author.id,
      assignedToId,
      lastUpdatedById: assignedToId,
      closingMessage: null,
      sourceDepartmentForUser: author.department,
      ticketDepartment: category.department,
      dueFirstResponse,
      dueDate,
      closedAt: null,
      createdAt,
      ...specificData,
    },
  });

  await createHistoryRecords(ticket, specificLabel, [
    assignedStepFor(ticket),
    {
      status: "IN_PROGRESS",
      createdAt: daysAgo(7),
      lastUpdatedById: assignedToId,
      categoryId: category.id,
      assignedToId,
      closingMessage: null,
      dueFirstResponse,
      dueDate: daysFromNow(5),
      closedAt: null,
    },
    {
      status: "IN_PROGRESS",
      createdAt: daysAgo(4),
      lastUpdatedById: assignedToId,
      categoryId: category.id,
      assignedToId,
      closingMessage: null,
      dueFirstResponse,
      dueDate: daysFromNow(8),
      closedAt: null,
    },
    {
      status: "IN_PROGRESS",
      createdAt: daysAgo(1),
      lastUpdatedById: assignedToId,
      categoryId: category.id,
      assignedToId,
      closingMessage: null,
      dueFirstResponse,
      dueDate,
      closedAt: null,
    },
  ]);

  return ticket;
}

async function createAssignedOverdueFirstResponseTicket(
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = daysAgo(3);
  const dueFirstResponse = daysAgo(1);

  const { category, specificData, specificLabel, ticketCase } = pickCategoryWithSpecific(
    author.department,
    categoriesByDept,
    specificSeedRef
  );

  const assignedToId = await assignTechnician(
    category.id,
    author.id,
    author.department,
    techniciansByDept
  );

  const ticket = await prisma.ticket.create({
    data: {
      title: ticketCase.title,
      description: ticketCase.description,
      status: "ASSIGNED",
      priority,
      categoryId: category.id,
      createdById: author.id,
      assignedToId,
      lastUpdatedById: author.id,
      closingMessage: null,
      sourceDepartmentForUser: author.department,
      ticketDepartment: category.department,
      dueFirstResponse,
      dueDate: null,
      closedAt: null,
      createdAt,
      ...specificData,
    },
  });

  await createTicketHistoryChain(ticket, specificLabel);

  return ticket;
}

async function createAssignedOverdueDueDateTicket(
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  const priority = pickRandom(PRIORITIES) as TicketPriority;
  const createdAt = daysAgo(10);
  const dueFirstResponse = computeDueDate(priority, createdAt);
  const dueDate = daysAgo(1);

  const { category, specificData, specificLabel, ticketCase } = pickCategoryWithSpecific(
    author.department,
    categoriesByDept,
    specificSeedRef
  );

  const assignedToId = await assignTechnician(
    category.id,
    author.id,
    author.department,
    techniciansByDept
  );

  const ticket = await prisma.ticket.create({
    data: {
      title: ticketCase.title,
      description: ticketCase.description,
      status: "ASSIGNED",
      priority,
      categoryId: category.id,
      createdById: author.id,
      assignedToId,
      lastUpdatedById: author.id,
      closingMessage: null,
      sourceDepartmentForUser: author.department,
      ticketDepartment: category.department,
      dueFirstResponse,
      dueDate,
      closedAt: null,
      createdAt,
      ...specificData,
    },
  });

  await createTicketHistoryChain(ticket, specificLabel);

  return ticket;
}

async function createSpecialCase(
  caseId: SpecialCaseId,
  author: AuthorRecord,
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  specificSeedRef: { value: number }
) {
  switch (caseId) {
    case 1:
      return createLateFirstResponseTicket(author, categoriesByDept, techniciansByDept, specificSeedRef);
    case 2:
      return createLateClosedTicket(author, categoriesByDept, techniciansByDept, specificSeedRef);
    case 3:
      return createEscalatedDueDateTicket(author, categoriesByDept, techniciansByDept, specificSeedRef);
    case 4:
      return createAssignedOverdueFirstResponseTicket(author, categoriesByDept, techniciansByDept, specificSeedRef);
    case 5:
      return createAssignedOverdueDueDateTicket(author, categoriesByDept, techniciansByDept, specificSeedRef);
  }
}

/*
 * Crea i 10 casi speciali (2 per dipartimento), usando come autori gli
 * employee del dipartimento in rotazione.
 */
async function createSpecialCases(
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>,
  employeesByDept: Record<Department, TechnicianRecord[]>
) {
  const specificSeedRef = { value: 1000 };
  const cursor: Record<Department, number> = {
    IT: 0,
    HR: 0,
    FINANCE: 0,
    SUPPORT: 0,
    LOGISTIC: 0,
  };

  for (const dept of DEPARTMENTS) {
    const employees = employeesByDept[dept];

    for (const caseId of CASES_BY_DEPARTMENT[dept]) {
      const employee = employees[cursor[dept] % employees.length];
      cursor[dept]++;

      const author: AuthorRecord = {
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: dept,
      };

      await createSpecialCase(
        caseId,
        author,
        categoriesByDept,
        techniciansByDept,
        specificSeedRef
      );
    }
  }
}

// --- DISPATCHER ---

async function createTicketsForAllUsers(
  allUsers: AuthorRecord[],
  categoriesByDept: Record<Department, CategoryRecord[]>,
  techniciansByDept: Record<Department, TechnicianRecord[]>
) {
  const buckets = splitUsersByStatusWeights(allUsers);
  const specificSeedRef = { value: 0 };

  for (const author of buckets.OPEN) {
    const ticket = await createOpenTicket(author);
    await createTicketMessages(ticket);
  }

  for (const author of buckets.ASSIGNED) {
    const ticket = await createAssignedTicket(author, categoriesByDept, techniciansByDept, specificSeedRef);
    await createTicketMessages(ticket);
  }

  for (const author of buckets.IN_PROGRESS) {
    const ticket = await createInProgressTicket(author, categoriesByDept, techniciansByDept, specificSeedRef);
    await createTicketMessages(ticket);
  }

  for (const author of buckets.CLOSED) {
    const ticket = await createClosedTicket(author, categoriesByDept, techniciansByDept, specificSeedRef);
    await createTicketMessages(ticket);
  }

  for (const author of buckets.REFUSED) {
    const ticket = await createRefusedTicket(author, categoriesByDept, techniciansByDept, specificSeedRef);
    await createTicketMessages(ticket);
  }
}

// --- MAIN ---

export async function main() {
  /*
   * Pulizia database.
   *
   * TicketCategoryAccess viene eliminata prima di TicketCategory
   * per rispettare la relazione FK.
   */
  await prisma.ticketHistory.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();

  await prisma.ticketCategoryAccess.deleteMany();

  await prisma.userPermission.deleteMany();
  await prisma.userSpecialization.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  await prisma.ticketCategory.deleteMany();

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const systemAdmin = await prisma.user.create({
    data: {
      firstName: "System",
      lastName: "Admin",
      email: "system.admin@example.com",
      password: hashedPassword,
      role: "SYSTEM_ADMIN",
      department: "FINANCE",
    },
  });

  const categoriesByDept: Record<Department, CategoryRecord[]> = {
    IT: [],
    HR: [],
    FINANCE: [],
    SUPPORT: [],
    LOGISTIC: [],
  };

  /*
   * Creazione categorie.
   */
  for (const dept of DEPARTMENTS) {
    const created = await Promise.all(
      DEPARTMENT_CATEGORIES[dept].map((name) =>
        prisma.ticketCategory.create({
          data: {
            name,
            department: dept,
            specificField: CATEGORY_SPECIFIC_FIELD[dept][name] ?? null,
          },
        })
      )
    );

    categoriesByDept[dept] = created;
  }

  /*
   * ACCESSO ALLE CATEGORIE
   *
   * Il dipartimento proprietario ha sempre accesso automaticamente.
   *
   * requesterMinRole = EMPLOYEE significa:
   * EMPLOYEE, TECHNICIAN e ADMIN.
   */

  /*
   * IT
   *
   * Tutti i dipartimenti, tutti i ruoli.
   */
  for (const category of categoriesByDept.IT) {
    await prisma.ticketCategoryAccess.create({
      data: {
        categoryId: category.id,
        requesterDepartment: null,
        requesterMinRole: "EMPLOYEE",
      },
    });
  }

  /*
   * HR
   *
   * Tutti i dipartimenti, tutti i ruoli.
   */
  for (const category of categoriesByDept.HR) {
    await prisma.ticketCategoryAccess.create({
      data: {
        categoryId: category.id,
        requesterDepartment: null,
        requesterMinRole: "EMPLOYEE",
      },
    });
  }

  /*
   * FINANCE
   *
   * Sconti per cliente e Problemi contabili:
   * visibili a tutti i ruoli di SUPPORT.
   */
  for (const categoryName of ["Sconti per cliente", "Problemi contabili"]) {
    const category = categoriesByDept.FINANCE.find(
      (category) => category.name === categoryName
    );

    if (!category) {
      throw new Error(`Categoria FINANCE "${categoryName}" non trovata`);
    }

    await prisma.ticketCategoryAccess.create({
      data: {
        categoryId: category.id,
        requesterDepartment: Department.SUPPORT,
        requesterMinRole: "EMPLOYEE",
      },
    });
  }

  /*
   * FINANCE
   *
   * Budget:
   * visibile agli ADMIN di qualsiasi dipartimento.
   */
  const budgetCategory = categoriesByDept.FINANCE.find(
    (category) => category.name === "Budget"
  );

  if (!budgetCategory) {
    throw new Error('Categoria FINANCE "Budget" non trovata');
  }

  await prisma.ticketCategoryAccess.create({
    data: {
      categoryId: budgetCategory.id,
      requesterDepartment: null,
      requesterMinRole: "ADMIN",
    },
  });

  /*
   * SUPPORT
   *
   * Tutte le categorie SUPPORT:
   * visibili a tutti i ruoli di FINANCE e LOGISTIC.
   */
  for (const category of categoriesByDept.SUPPORT) {
    for (const requesterDepartment of [Department.FINANCE, Department.LOGISTIC]) {
      await prisma.ticketCategoryAccess.create({
        data: {
          categoryId: category.id,
          requesterDepartment,
          requesterMinRole: "EMPLOYEE",
        },
      });
    }
  }

  /*
   * LOGISTIC
   *
   * Tutte le categorie LOGISTIC:
   * visibili a tutti i ruoli di SUPPORT.
   */
  for (const category of categoriesByDept.LOGISTIC) {
    await prisma.ticketCategoryAccess.create({
      data: {
        categoryId: category.id,
        requesterDepartment: Department.SUPPORT,
        requesterMinRole: "EMPLOYEE",
      },
    });
  }

  const techniciansByDept: Record<Department, TechnicianRecord[]> = {
    IT: [],
    HR: [],
    FINANCE: [],
    SUPPORT: [],
    LOGISTIC: [],
  };

  // Admin di ogni dipartimento, aggiunti agli allUsers per la creazione ticket.
  const employeesByDept: Record<Department, TechnicianRecord[]> = {
    IT: [],
    HR: [],
    FINANCE: [],
    SUPPORT: [],
    LOGISTIC: [],
  };

  // Accumula TUTTI gli utenti (admin + tecnici + employee) per la creazione ticket
  const allUsers: AuthorRecord[] = [];

  let personIndex = 0;

  function nextPerson() {
    const firstName = firstNames[personIndex];
    const lastName = lastNames[personIndex];

    personIndex++;

    return {
      firstName,
      lastName,
      email: `${lastName.toLowerCase().replace(" ", "")}@example.com`,
    };
  }

  /*
   * Creazione utenti.
   */
  for (const dept of DEPARTMENTS) {
    const admin = await prisma.user.create({
      data: {
        ...nextPerson(),
        password: hashedPassword,
        role: "ADMIN",
        department: dept,
      },
    });

    await prisma.userPermission.createMany({
      data: [
        { userId: admin.id, action: "tickets.manage" },
        { userId: admin.id, action: "users.manage" },
        { userId: admin.id, action: "categories.manage" },
      ],
    });


    allUsers.push({
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      department: dept,
    });

    const technicians: TechnicianRecord[] = [];

    for (const category of categoriesByDept[dept]) {
      const technician = await prisma.user.create({
        data: {
          ...nextPerson(),
          password: hashedPassword,
          role: "TECHNICIAN",
          department: dept,
        },
      });

      await prisma.userSpecialization.create({
        data: {
          userId: technician.id,
          categoryId: category.id,
        },
      });

      technicians.push(technician);

      allUsers.push({
        id: technician.id,
        firstName: technician.firstName,
        lastName: technician.lastName,
        department: dept,
      });
    }

    techniciansByDept[dept] = technicians;

    const employees: TechnicianRecord[] = [];

    for (let i = 0; i < 6; i++) {
      const employee = await prisma.user.create({
        data: {
          ...nextPerson(),
          password: hashedPassword,
          role: "EMPLOYEE",
          department: dept,
        },
      });

      employees.push(employee);

      allUsers.push({
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        department: dept,
      });
    }

    employeesByDept[dept] = employees;
  }

  /*
   * CREAZIONE TICKET
   *
   * Ogni utente (admin, tecnico o employee) riceve un ticket, con stato
   * scelto secondo i pesi in STATUS_WEIGHTS. Le funzioni di creazione
   * girano in sequenza (non in parallelo) perché autoAssign conta i
   * ticket aperti già esistenti nel DB per bilanciare il carico.
   *
   * Ogni funzione crea anche, subito dopo il Ticket, la relativa catena
   * di TicketHistory coerente con lo stato finale.
   */
  await createTicketsForAllUsers(allUsers, categoriesByDept, techniciansByDept);

  /*
   * CASI SPECIALI (SLA / scadenze)
   *
   * 10 ticket (2 per dipartimento) che coprono i ticket "in ritardo":
   * prima risposta oltre la scadenza, chiusura dopo dueDate, dueDate
   * alzata in progressione, ASSIGNED/ASSIGNED oltre le scadenze.
   */
  await createSpecialCases(categoriesByDept, techniciansByDept, employeesByDept);

  console.log(
    `Seed completato: ${allUsers.length} utenti, ${allUsers.length + 10} ticket creati ` +
      `(${allUsers.length} standard + 10 casi speciali SLA)`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });