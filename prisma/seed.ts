// prisma/seed.ts
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
  "Sala", "Serra", "Farina", "Piras", "Grasso", "Pellegrini",
  "Palumbo", "Sanna", "Amato", "Vitali", "Testa", "Silvestri",
  "Guerra", "Parisi", "Ferraro", "Basile", "Monti", "Coppola",
];

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

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

  const techniciansByDept: Record<string, { id: number }[]> = {};
  const employeesByDept: Record<string, { id: number }[]> = {};

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

      let status:
        | "OPEN"
        | "ASSIGNED"
        | "IN_PROGRESS"
        | "CLOSED"
        | "REFUSED";

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

      /*
        Messaggio di chiusura: definito prima della creazione del ticket
        così da poter popolare subito Ticket.closingMessage (cache) e
        riusare lo stesso contenuto nel relativo TicketMessage
        (isClosingMessage: true), mantenendo le due scritture coerenti.
      */
      const closingMessageContent =
        status === "CLOSED"
          ? "Problema risolto. Puoi effettuare una verifica."
          : status === "REFUSED"
            ? "La richiesta non è di competenza della categoria selezionata. Creare un nuovo ticket con la categoria corretta."
            : null;

      /*
        lastUpdatedBy: chi ha effettuato l'ultima modifica al ticket.
        - OPEN: nessuna modifica dopo la creazione, resta l'autore
        - tutti gli altri stati: il tecnico è intervenuto per ultimo
          (assegnazione, lavorazione, chiusura/rifiuto)
      */
      const lastUpdatedById = status === "OPEN" ? author.id : technician.id;

      const ticket = await prisma.ticket.create({
        data: {
          title: `Richiesta ${category.name.toLowerCase()} #${i + 1}`,

          description:
            `Ticket di esempio per la categoria "${category.name}" ` +
            `del reparto ${dept}.`,

          status,

          priority: PRIORITIES[i % PRIORITIES.length],

          categoryId: category.id,

          createdById: author.id,

          lastUpdatedById,

          closingMessage: closingMessageContent,

          /*
            OPEN:
            nessun tecnico assegnato

            tutti gli altri stati:
            hanno un tecnico assegnato
          */
          assignedToId: status === "OPEN" ? null : technician.id,

          // reparto di appartenenza dell'autore al momento della creazione
          sourceDepartmentForUser: dept,

          // reparto target del ticket: dato che qui la categoria è sempre presente,
          // coincide con il reparto della categoria stessa
          ticketDepartment: category.department,

          dueDate:
            status === "CLOSED" || status === "REFUSED"
              ? null
              : new Date(Date.now() + (i + 2) * 24 * 60 * 60 * 1000),

          closedAt:
            status === "CLOSED" || status === "REFUSED"
              ? new Date(Date.now() - 24 * 60 * 60 * 1000)
              : null,
        },
      });

      /*
        Storico modifiche (TicketHistory)

        Per i ticket che hanno subito una transizione dallo stato OPEN
        iniziale, salviamo uno snapshot "prima" della modifica insieme
        ai campi effettivamente cambiati. actorId = tecnico, dato che
        è lui a intervenire su assegnazione/lavorazione/chiusura.
      */
      if (status !== "OPEN") {
        await prisma.ticketHistory.create({
          data: {
            ticketId: ticket.id,
            actorId: technician.id,
            snapshotBefore: {
              status: "OPEN",
              assignedToId: null,
              lastUpdatedById: author.id,
              closingMessage: null,
              closedAt: null,
              dueDate: null,
            },
            changedFields:
              status === "CLOSED" || status === "REFUSED"
                ? [
                  "status",
                  "assignedToId",
                  "lastUpdatedById",
                  "closingMessage",
                  "closedAt",
                  "dueDate",
                ]
                : ["status", "assignedToId", "lastUpdatedById", "dueDate"],
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