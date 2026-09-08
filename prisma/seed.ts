import {
  Department,
  PrismaClient,
  TicketSpecificField,
  HardwareType,
  Software,
  Customer,
  BudgetType,
} from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import bcrypt from "bcryptjs";

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
    "Hardware": TicketSpecificField.HARDWARE_TYPE,
    "Bug": TicketSpecificField.SOFTWARE,
    "Sistemi e accessi": TicketSpecificField.SOFTWARE,
  },
  HR: {
    "Buste paga": TicketSpecificField.PAYROLL_REFERENCE,
    "Dati del dipendente": TicketSpecificField.EMPLOYEE_REFERENCE,
  },
  FINANCE: {
    "Sconti per cliente": TicketSpecificField.CUSTOMER,
    "Problemi contabili": TicketSpecificField.INVOICE_REFERENCE,
    "Budget": TicketSpecificField.BUDGET_TYPE,
  },
  SUPPORT: {
    "Dati cliente errati": TicketSpecificField.CUSTOMER,
    "Comunicazione cliente": TicketSpecificField.CUSTOMER,
  },
  LOGISTIC: {
    "Spedizione": TicketSpecificField.CUSTOMER,
    "Problemi di consegna": TicketSpecificField.SHIPMENT_REFERENCE,
    "Reso": TicketSpecificField.SHIPMENT_REFERENCE,
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

/*
 * Costruisce il nested-create Prisma per il "ticket specific" coerente
 * con il campo specifico richiesto dalla categoria, più un'etichetta
 * leggibile da salvare in TicketHistory.ticketSpecific.
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
        label: `Hardware: ${hardwareType}`,
      };
    }

    case TicketSpecificField.SOFTWARE: {
      const values = Object.values(Software);
      const software = values[seedIndex % values.length];

      return {
        data: { itSpecific: { create: { software } } },
        label: `Software: ${software}`,
      };
    }

    case TicketSpecificField.PAYROLL_REFERENCE: {
      const payrollReference = `PR-${String(seedIndex + 1).padStart(4, "0")}`;

      return {
        data: { hrSpecific: { create: { payrollReference } } },
        label: `Busta paga: ${payrollReference}`,
      };
    }

    case TicketSpecificField.EMPLOYEE_REFERENCE: {
      const employeeReference = `EMP-${String(seedIndex + 1).padStart(4, "0")}`;

      return {
        data: { hrSpecific: { create: { employeeReference } } },
        label: `Dipendente: ${employeeReference}`,
      };
    }

    case TicketSpecificField.CUSTOMER: {
      const values = Object.values(Customer);
      const customer = values[seedIndex % values.length];

      if (department === Department.FINANCE) {
        return {
          data: { financeSpecific: { create: { customer } } },
          label: `Cliente: ${customer}`,
        };
      }

      if (department === Department.SUPPORT) {
        return {
          data: { supportSpecific: { create: { customer } } },
          label: `Cliente: ${customer}`,
        };
      }

      // LOGISTIC
      return {
        data: { logisticSpecific: { create: { customer } } },
        label: `Cliente: ${customer}`,
      };
    }

    case TicketSpecificField.INVOICE_REFERENCE: {
      const invoiceReference = `INV-${String(seedIndex + 1).padStart(5, "0")}`;

      return {
        data: { financeSpecific: { create: { invoiceReference } } },
        label: `Fattura: ${invoiceReference}`,
      };
    }

    case TicketSpecificField.BUDGET_TYPE: {
      const values = Object.values(BudgetType);
      const budgetType = values[seedIndex % values.length];

      return {
        data: { financeSpecific: { create: { budgetType } } },
        label: `Budget: ${budgetType}`,
      };
    }

    case TicketSpecificField.SHIPMENT_REFERENCE: {
      const shipmentReference = `SHP-${String(seedIndex + 1).padStart(6, "0")}`;

      return {
        data: { logisticSpecific: { create: { shipmentReference } } },
        label: `Spedizione: ${shipmentReference}`,
      };
    }

    default:
      return { data: {}, label: null };
  }
}

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

  const categoriesByDept: Record<
    Department,
    {
      id: number;
      name: string;
      department: Department;
      specificField: TicketSpecificField | null;
    }[]
  > = {
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
  for (const categoryName of [
    "Sconti per cliente",
    "Problemi contabili",
  ]) {
    const category = categoriesByDept.FINANCE.find(
      (category) => category.name === categoryName
    );

    if (!category) {
      throw new Error(
        `Categoria FINANCE "${categoryName}" non trovata`
      );
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
    for (const requesterDepartment of [
      Department.FINANCE,
      Department.LOGISTIC,
    ]) {
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


  const techniciansByDept: Record<
    Department,
    {
      id: number;
      firstName: string;
      lastName: string;
    }[]
  > = {
    IT: [],
    HR: [],
    FINANCE: [],
    SUPPORT: [],
    LOGISTIC: [],
  };

  const employeesByDept: Record<
    Department,
    {
      id: number;
      firstName: string;
      lastName: string;
    }[]
  > = {
    IT: [],
    HR: [],
    FINANCE: [],
    SUPPORT: [],
    LOGISTIC: [],
  };

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

  /*
   * CREAZIONE TICKET
   */
  let specificSeed = 0;

  for (const dept of DEPARTMENTS) {
    const categories = categoriesByDept[dept];
    const employees = employeesByDept[dept];
    const technicians = techniciansByDept[dept];

    /*
     * 1) Ticket OPEN garantito per ogni employee del reparto.
     *
     * La categoria viene assegnata a rotazione tra quelle del reparto,
     * così ogni employee ha comunque un ticket con categoria valida.
     */
    for (let e = 0; e < employees.length; e++) {
      const author = employees[e];
      const category = categories[e % categories.length];

      const { data: specificData, label: specificLabel } = buildSpecificData(
        category.department,
        category.specificField,
        specificSeed++
      );

      const dueDate = new Date(
        Date.now() + (e + 2) * 24 * 60 * 60 * 1000
      );

      const ticket = await prisma.ticket.create({
        data: {
          title: `Richiesta ${category.name.toLowerCase()} - ${author.firstName} ${author.lastName}`,

          description:
            `Ticket di esempio per la categoria "${category.name}" ` +
            `del reparto ${dept}.`,

          status: "OPEN",

          priority: PRIORITIES[e % PRIORITIES.length],

          categoryId: category.id,

          createdById: author.id,

          assignedToId: null,

          lastUpdatedById: author.id,

          closingMessage: null,

          sourceDepartmentForUser: dept,

          ticketDepartment: category.department,

          dueDate,

          closedAt: null,

          ...specificData,
        },
      });

      await prisma.ticketHistory.create({
        data: {
          originalTicketId: ticket.id,

          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,

          categoryId: category.id,
          createdById: author.id,
          assignedToId: null,
          lastUpdatedById: author.id,

          closingMessage: null,

          sourceDepartmentForUser: ticket.sourceDepartmentForUser,
          ticketDepartment: ticket.ticketDepartment,

          ticketSpecific: specificLabel,

          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          dueDate: ticket.dueDate,
          closedAt: ticket.closedAt,
        },
      });
    }

    /*
     * 2) Ticket aggiuntivi per varietà di stati (OPEN, ASSIGNED,
     *    IN_PROGRESS, CLOSED, REFUSED) e conversazioni di esempio.
     */
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

      const initialDueDate = new Date(
        Date.now() + (i + 2) * 24 * 60 * 60 * 1000
      );

      const closingMessageContent =
        status === "CLOSED"
          ? "Problema risolto. Puoi effettuare una verifica."
          : status === "REFUSED"
            ? "La richiesta non è di competenza della categoria selezionata. Creare un nuovo ticket con la categoria corretta."
            : null;

      const { data: specificData, label: specificLabel } = buildSpecificData(
        category.department,
        category.specificField,
        specificSeed++
      );

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

          ...specificData,
        },
      });

      await prisma.ticketHistory.create({
        data: {
          originalTicketId: ticket.id,

          title: ticket.title,
          description: ticket.description,
          status: ticket.status,
          priority: ticket.priority,

          categoryId: category.id,
          createdById: author.id,
          assignedToId: null,
          lastUpdatedById: author.id,

          closingMessage: null,

          sourceDepartmentForUser: ticket.sourceDepartmentForUser,
          ticketDepartment: ticket.ticketDepartment,

          ticketSpecific: specificLabel,

          createdAt: ticket.createdAt,
          updatedAt: ticket.updatedAt,
          dueDate: ticket.dueDate,
          closedAt: ticket.closedAt,
        },
      });

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
            originalTicketId: updatedTicket.id,

            title: updatedTicket.title,
            description: updatedTicket.description,
            status: updatedTicket.status,
            priority: updatedTicket.priority,

            categoryId: category.id,
            createdById: author.id,
            assignedToId: technician.id,
            lastUpdatedById: technician.id,

            closingMessage: closingMessageContent,

            sourceDepartmentForUser: updatedTicket.sourceDepartmentForUser,
            ticketDepartment: updatedTicket.ticketDepartment,

            ticketSpecific: specificLabel,

            createdAt: updatedTicket.createdAt,
            updatedAt: updatedTicket.updatedAt,
            dueDate: updatedTicket.dueDate,
            closedAt: updatedTicket.closedAt,
          },
        });
      }

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
            },
            {
              ticketId: ticket.id,
              authorId: author.id,
              content: "Confermo, tutto risolto. Grazie.",
            },
          ],
        });
      }

      if (status === "REFUSED") {
        await prisma.ticketMessage.createMany({
          data: [
            {
              ticketId: ticket.id,
              authorId: technician.id,
              content: closingMessageContent!,
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