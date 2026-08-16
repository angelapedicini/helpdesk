import { Department, PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const DEPARTMENT_CATEGORIES: Record<
  "HR" | "IT" | "FINANCE" | "SALES" | "MARKETING",
  string[]
> = {
  IT: ["Hardware", "Bug", "Nuovo software"],
  HR: ["Contratti", "Buste paga", "Onboarding"],
  FINANCE: ["Fatture", "Revisione contratti"],
  SALES: ["Lead", "Richiesta contratto"],
  MARKETING: ["Correzione dati cliente", "Richiesta campagna"],
};

const DEPARTMENTS = Object.keys(DEPARTMENT_CATEGORIES) as Array<
  keyof typeof DEPARTMENT_CATEGORIES
>;

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

// Stesso shape usato dai resolver create.ts / update.ts: sotto-oggetti
// ridotti a id + campi display, mai l'entità Prisma completa.
type SnapshotPerson = { id: number; firstName: string; lastName: string };
type SnapshotCategory = { id: number; name: string; department: Department };

function buildSnapshot(params: {
  title: string;
  description: string;
  status: string;
  priority: string;
  category: SnapshotCategory | null;
  createdBy: SnapshotPerson;
  assignedTo: SnapshotPerson | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
  dueDate: Date | null;
  deletedAt: Date | null;
  sourceDepartmentForUser: Department;
  ticketDepartment: Department;
  lastUpdatedBy: SnapshotPerson | null;
  closingMessage: string | null;
}) {
  const toPerson = (p: SnapshotPerson | null) =>
    p ? { id: p.id, firstName: p.firstName, lastName: p.lastName } : null;

  return {
    title: params.title,
    description: params.description,
    status: params.status,
    priority: params.priority,

    category: params.category
      ? { id: params.category.id, name: params.category.name, department: params.category.department }
      : null,

    createdBy: toPerson(params.createdBy),
    assignedTo: toPerson(params.assignedTo),

    createdAt: params.createdAt,
    updatedAt: params.updatedAt,
    closedAt: params.closedAt,
    dueDate: params.dueDate,
    deletedAt: params.deletedAt,

    sourceDepartmentForUser: params.sourceDepartmentForUser,
    ticketDepartment: params.ticketDepartment,

    lastUpdatedBy: toPerson(params.lastUpdatedBy),

    closingMessage: params.closingMessage,
  };
}

export async function main() {
  await prisma.ticketHistory.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.userSpecialization.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ticketCategory.deleteMany();

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const categoriesByDept: Record<
    string,
    { id: number; name: string; department: Department }[]
  > = {};

  for (const dept of DEPARTMENTS) {
    const created = await Promise.all(
      DEPARTMENT_CATEGORIES[dept].map((name) =>
        prisma.ticketCategory.create({
          data: {
            name,
            department: dept,
          },
        })
      )
    );

    categoriesByDept[dept] = created;
  }

  const techniciansByDept: Record<string, { id: number; firstName: string; lastName: string }[]> = {};
  const employeesByDept: Record<string, { id: number; firstName: string; lastName: string }[]> = {};

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

    const technicians = [];

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
    }

    techniciansByDept[dept] = technicians;

    const employees = [];

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
    }

    employeesByDept[dept] = employees;
  }

  // CREAZIONE TICKET
  for (const dept of DEPARTMENTS) {
    const categories = categoriesByDept[dept];
    const employees = employeesByDept[dept];
    const technicians = techniciansByDept[dept];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      const author = employees[i % employees.length];
      const technician = technicians[i % technicians.length];

      let status: "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "CLOSED" | "REFUSED";

      /*
        Distribuzione stati:

        0 -> OPEN
        1 -> ASSIGNED
        2 -> IN_PROGRESS
        3 -> CLOSED
        4 -> REFUSED
      */
      switch (i % 5) {
        case 0:
          status = "OPEN";
          break;

        case 1:
          status = "ASSIGNED";
          break;

        case 2:
          status = "IN_PROGRESS";
          break;

        case 3:
          status = "CLOSED";
          break;

        default:
          status = "REFUSED";
          break;
      }

      const priority = PRIORITIES[i % PRIORITIES.length];

      /*
        La dueDate viene calcolata quando il ticket viene creato,
        indipendentemente dallo stato finale che avrà nel seed.

        In questo modo lo snapshot iniziale contiene la dueDate
        effettivamente presente nel ticket appena creato.
      */
      const initialDueDate = new Date(
        Date.now() + (i + 2) * 24 * 60 * 60 * 1000
      );

      const closingMessageContent =
        status === "CLOSED"
          ? "Problema risolto. Puoi effettuare una verifica."
          : status === "REFUSED"
            ? "La richiesta non è di competenza della categoria selezionata. Creare un nuovo ticket con la categoria corretta."
            : null;

      /*
        Il ticket viene creato SEMPRE nello stato iniziale OPEN.
      */
      const ticket = await prisma.ticket.create({
        data: {
          title: `Richiesta ${category.name.toLowerCase()} #${i + 1}`,

          description:
            `Ticket di esempio per la categoria "${category.name}" ` +
            `del reparto ${dept}.`,

          status: "OPEN",

          priority,

          categoryId: category.id,

          createdById: author.id,

          assignedToId: null,

          lastUpdatedById: author.id,

          closingMessage: null,

          sourceDepartmentForUser: dept,

          ticketDepartment: category.department,

          dueDate: initialDueDate,

          closedAt: null,
        },
      });

      /*
        Primo snapshot: fotografa il ticket appena creato, coerentemente
        con quanto fa createTicket resolver (uno snapshot "di nascita"
        per ogni ticket, indipendentemente dal fatto che venga poi
        modificato o meno).
      */
      await prisma.ticketHistory.create({
        data: {
          ticketId: ticket.id,
          snapshot: buildSnapshot({
            title: ticket.title,
            description: ticket.description,
            status: ticket.status,
            priority: ticket.priority,
            category,
            createdBy: author,
            assignedTo: null,
            createdAt: ticket.createdAt,
            updatedAt: ticket.updatedAt,
            closedAt: ticket.closedAt,
            dueDate: ticket.dueDate,
            deletedAt: ticket.deletedAt,
            sourceDepartmentForUser: ticket.sourceDepartmentForUser,
            ticketDepartment: ticket.ticketDepartment,
            lastUpdatedBy: author,
            closingMessage: null,
          }),
        },
      });

      /*
        Se il ticket deve avere uno stato diverso da OPEN, applichiamo
        l'update e scriviamo un secondo snapshot che fotografa lo stato
        DOPO la modifica — coerente con updateTicket resolver.
      */
      if (status !== "OPEN") {
        const updatedTicket = await prisma.ticket.update({
          where: {
            id: ticket.id,
          },

          data: {
            status,

            assignedToId: technician.id,

            lastUpdatedById: technician.id,

            closingMessage: closingMessageContent,

            dueDate:
              status === "CLOSED" || status === "REFUSED"
                ? null
                : initialDueDate,

            closedAt:
              status === "CLOSED" || status === "REFUSED"
                ? new Date(Date.now() - 24 * 60 * 60 * 1000)
                : null,
          },
        });

        await prisma.ticketHistory.create({
          data: {
            ticketId: ticket.id,
            snapshot: buildSnapshot({
              title: updatedTicket.title,
              description: updatedTicket.description,
              status: updatedTicket.status,
              priority: updatedTicket.priority,
              category,
              createdBy: author,
              assignedTo: technician,
              createdAt: updatedTicket.createdAt,
              updatedAt: updatedTicket.updatedAt,
              closedAt: updatedTicket.closedAt,
              dueDate: updatedTicket.dueDate,
              deletedAt: updatedTicket.deletedAt,
              sourceDepartmentForUser: updatedTicket.sourceDepartmentForUser,
              ticketDepartment: updatedTicket.ticketDepartment,
              lastUpdatedBy: technician,
              closingMessage: closingMessageContent,
            }),
          },
        });
      }

      /*
        Messaggi per ticket IN_PROGRESS
      */
      if (status === "IN_PROGRESS") {
        await prisma.ticketMessage.createMany({
          data: [
            {
              ticketId: ticket.id,
              authorId: author.id,
              content:
                "Buongiorno, potete darmi un aggiornamento sulla richiesta?",
            },
            {
              ticketId: ticket.id,
              authorId: technician.id,
              content:
                "Ho preso in carico il ticket. Sto verificando il problema.",
            },
          ],
        });
      }

      /*
        Messaggi per ticket CLOSED
      */
      if (status === "CLOSED") {
        await prisma.ticketMessage.createMany({
          data: [
            {
              ticketId: ticket.id,
              authorId: author.id,
              content: "Avete aggiornamenti sulla richiesta?",
            },
            {
              ticketId: ticket.id,
              authorId: technician.id,
              content: closingMessageContent!,
              isClosingMessage: true,
            },
            {
              ticketId: ticket.id,
              authorId: author.id,
              content: "Confermo, tutto risolto. Grazie.",
            },
          ],
        });
      }

      /*
        Messaggi per ticket REFUSED
      */
      if (status === "REFUSED") {
        await prisma.ticketMessage.createMany({
          data: [
            {
              ticketId: ticket.id,
              authorId: technician.id,
              content: closingMessageContent!,
              isClosingMessage: true,
            },
          ],
        });
      }
    }
  }

  console.log("Seed completato");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });