// prisma/seed.ts
import { PrismaClient } from "../app/generated/prisma/client";
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
  "Mario", "Giuseppe", "Anna", "Luca", "Sara", "Marco", "Elena", "Paolo", "Chiara", "Davide",
  "Francesca", "Alessandro", "Giulia", "Matteo", "Valentina", "Simone", "Laura", "Andrea", "Martina", "Roberto",
  "Federica", "Stefano", "Silvia", "Fabio", "Claudia", "Riccardo", "Ilaria", "Nicola", "Serena", "Antonio",
  "Beatrice", "Emanuele", "Giorgia", "Tommaso", "Alice", "Filippo", "Camilla", "Gabriele", "Noemi", "Leonardo",
  "Michela", "Daniele", "Veronica", "Pietro", "Cecilia", "Vittorio", "Rebecca", "Enrico", "Arianna", "Massimo",
];

const lastNames = [
  "Rossi", "Verdi", "Bianchi", "Ferrari", "Colombo", "Ricci", "Marino", "Greco", "Bruno", "Gallo",
  "Conti", "De Luca", "Costa", "Giordano", "Mancini", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana",
  "Santoro", "Mariani", "Rinaldi", "Caruso", "Ferrara", "Galli", "Martini", "Leone", "Longo", "Gentile",
  "Martinelli", "Vitale", "Sala", "Serra", "Farina", "Piras", "Grasso", "Pellegrini", "Palumbo", "Sanna",
  "Amato", "Vitali", "Testa", "Silvestri", "Guerra", "Parisi", "Ferraro", "Basile", "Monti", "Coppola",
];

export async function main() {
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.userPermission.deleteMany();
  await prisma.userSpecialization.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
  await prisma.ticketCategory.deleteMany();

  const hashedPassword = await bcrypt.hash("Password123!", 10);

  // CATEGORIE per reparto
  const categoriesByDept: Record<string, { id: number; name: string }[]> = {};

  for (const dept of DEPARTMENTS) {
    const created = await Promise.all(
      DEPARTMENT_CATEGORIES[dept].map((name) =>
        prisma.ticketCategory.create({
          data: { name, department: dept },
        })
      )
    );
    categoriesByDept[dept] = created;
  }

  // UTENTI: 1 admin + 3 tecnici + 6 employee per reparto
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
    // 1 admin
    const admin = nextPerson();
    await prisma.user.create({
      data: {
        ...admin,
        password: hashedPassword,
        role: "ADMIN",
        department: dept,
      },
    });

    // 3 tecnici, uno per ciascuna categoria del reparto
    const technicians = [];
    for (const category of categoriesByDept[dept]) {
      const person = nextPerson();
      const technician = await prisma.user.create({
        data: {
          ...person,
          password: hashedPassword,
          role: "TECHNICIAN",
          department: dept,
        },
      });

      await prisma.userSpecialization.create({
        data: { userId: technician.id, categoryId: category.id },
      });

      technicians.push(technician);
    }
    techniciansByDept[dept] = technicians;

    // 6 employee
    const employees = [];
    for (let i = 0; i < 6; i++) {
      const person = nextPerson();
      const employee = await prisma.user.create({
        data: {
          ...person,
          password: hashedPassword,
          role: "EMPLOYEE",
          department: dept,
        },
      });
      employees.push(employee);
    }
    employeesByDept[dept] = employees;
  }

  // TICKET di esempio: qualche ticket per reparto
  for (const dept of DEPARTMENTS) {
    const categories = categoriesByDept[dept];
    const employees = employeesByDept[dept];
    const technicians = techniciansByDept[dept];

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const author = employees[i % employees.length];
      const assignedTechnician = technicians[i % technicians.length];

      const ticket = await prisma.ticket.create({
        data: {
          title: `Richiesta ${category.name.toLowerCase()} #${i + 1}`,
          description: `Ticket di esempio per la categoria "${category.name}" nel reparto ${dept}.`,
          status: i % 2 === 0 ? "OPEN" : "IN_PROGRESS",
          categoryId: category.id,
          createdById: author.id,
          assignedToId: assignedTechnician.id,
        },
      });

      // Qualche messaggio di esempio solo sui ticket IN_PROGRESS (già presi in carico)
      if (ticket.status === "IN_PROGRESS") {
        await prisma.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            authorId: author.id,
            content: "Buongiorno, potete darmi un aggiornamento sulla richiesta?",
          },
        });
        await prisma.ticketMessage.create({
          data: {
            ticketId: ticket.id,
            authorId: assignedTechnician.id,
            content: "Ciao, ci sto lavorando, ti aggiorno a breve.",
          },
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