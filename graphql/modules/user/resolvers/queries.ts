import type { GraphQLContext } from "@/graphql/context";
import { Department, Role } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";
import { GraphQLError } from "graphql";

export const userQueries = {
  me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
    const session = context.requireSession();
    const prisma = context.prisma;


    return prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        department: true,
      },
    });
  },

  searchUsers: async (
    _parent: unknown,
    args: {
      search?: string;
      role?: Role;
      department?: Department;
      categoryId?: number;
      restrictToDepartment?: boolean | null;
    },
    context: GraphQLContext
  ) => {
    // Serve solo l'autenticazione, non una visibilità per ruolo.
    //
    // Questa query è una directory: serve a cercare nomi per i filtri della
    // pagina ticket (elenco assegnatari, ricerca per categoria, ricerca
    // utenti) e i suoi caller passano già i filtri espliciti di cui hanno
    // bisogno. L'ability "read User" la stringeva, e per un tecnico rendeva
    // la ricerca "assegnato a" capace di trovare solo sé stesso.
    //
    // Chi deve amministrare utenti non usa questa query, ma usersForManagement,
    // che ha regole di visibilità proprie e separate.
    const session = context.requireSession();
    const prisma = context.prisma;

    const { search, role, department, categoryId, restrictToDepartment } = args;

    // Nessun argomento: torna l'elenco completo, il default della directory.
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role;
    }

    if (department) {
      where.department = department;
    }

    if (categoryId) {
      where.specializations = { some: { categoryId } };
    }

    // restrictToDepartment stringe al reparto di chi chiede.
    //
    // Serve alla pagina ticket quando lo scope è DEPARTMENT: l'admin sta
    // guardando i ticket del proprio reparto, quindi anche i tecnici che può
    // assegnare devono essere quelli del suo reparto. Il reparto NON arriva
    // dal client, che non lo conosce e potrebbe inviare un altro valore: qui si
    // prende dalla sessione, che è l'unica fonte affidabile.
    if (restrictToDepartment) {
      where.department = session.department;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        department: true,
        specializations: {
          select: {
            category: {
              select: { id: true, name: true, department: true },
            },
          },
        },
      },
      orderBy: { role: "asc" },
    });

    // Il select annida la categoria dentro specializations, mentre l'SDL espone
    // specializations: [TicketCategory!]!, quindi qui si appiattisce.
    return users.map((u) => ({
      ...u,
      specializations: u.specializations.map((s) => s.category),
    }));
  },

  // Elenco utenti per la pagina di gestione, separato da searchUsers.
  //
  // La visibilità dipende dal ruolo di chi chiede ed è il filtro di base: i
  // filtri del form ci si combinano in AND, quindi possono solo restringere
  // l'elenco, mai allargarlo. Per questo nessuno dei due si somma a mano
  // con l'altro: entrano nello stesso oggetto "where" e Prisma li mette in AND.
  //
  // Le regole sono qui e non passano da CASL per scelta: sono la visibilità di
  // uno schermo, non i permessi per gestire un singolo record utente, e tenerle
  // in una policy condivisa le faceva interferire con i filtri della pagina
  // ticket, che hanno esigenze diverse.
  usersForManagement: async (
    _parent: unknown,
    args: {
      search?: string;
      userId?: number;
      role?: Role;
      department?: Department;
      categoryId?: number;
    },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const prisma = context.prisma;

    const { search, userId, role, department, categoryId } = args;

    const where: Prisma.UserWhereInput = ((): Prisma.UserWhereInput => {
      switch (session.role) {
        case "SYSTEM_ADMIN":
          // Vede tutti gli utenti.
          return {};
        case "ADMIN":
          // Vede solo il proprio dipartimento.
          return { department: session.department };
        case "TECHNICIAN":
          // Vede solo se stesso.
          return { id: session.userId };
        default:
          // EMPLOYEE non ha accesso alla gestione utenti.
          throw new GraphQLError("Employees cannot access the user management list", {
            extensions: { code: "FORBIDDEN" },
          });
      }
    })();

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
      ];
    }

    if (userId) {
      where.id = userId;
    }

    if (role) {
      where.role = role;
    }

    // Nota: se l'admin filtra per un dipartimento diverso dal proprio non vede
    // nulla, perché la visibilità del ruolo vince. Non serve impedirlo: il
    // risultato vuoto è la risposta corretta a un filtro che non gli compete.
    if (department) {
      where.department = department;
    }

    if (categoryId) {
      where.specializations = { some: { categoryId } };
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        department: true,
        specializations: {
          select: {
            category: {
              select: { id: true, name: true, department: true },
            },
          },
        },
      },
      orderBy: { role: "asc" },
    });

    return users.map((u) => ({
      ...u,
      specializations: u.specializations.map((s) => s.category),
    }));
  },

   usersByDepForLogin: async (
    _parent: unknown,
    args: { department: Department; },
    context: GraphQLContext
  ) => {
    const session = context.requireSession();
    const prisma = context.prisma;

    const users = await prisma.user.findMany({
      where: { department: args.department },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
      },
      orderBy: { role: "asc" },
    });

    return users;
  },
};