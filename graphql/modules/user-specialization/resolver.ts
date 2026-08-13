import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Department } from "@/app/generated/prisma/enums";

export const userSpecializationResolvers = {
  Query: {
    soleSpecialistCategoryIds: async (
      _parent: unknown,
      args: { department: Department; userId?: number }
    ) => {
      const session = await getSession();
      if (!session) return [];

      // Default: l'utente chiede per sé stesso (caso "create").
      const targetUserId = args.userId ?? session.userId;

      // Autorizzazione: puoi vedere solo i tuoi dati,
      // a meno che tu non sia ADMIN (caso "edit", per conto del creatore).
      const isSelf = targetUserId === session.userId;
      if (!isSelf && session.role !== "ADMIN") return [];

      // Il ruolo del bersaglio va sempre letto dal DB, mai passato dal client:
      // non ci fidiamo di un eventuale "role" in input.
      const targetRole = isSelf
        ? session.role
        : (await prisma.user.findUnique({
            where: { id: targetUserId },
            select: { role: true },
          }))?.role;

      if (targetRole !== "TECHNICIAN") return [];

      const specializations = await prisma.userSpecialization.groupBy({
        by: ["categoryId"],
        where: {
          category: { department: args.department },
        },
        _count: { userId: true },
      });

      const soleCategoryIds = specializations
        .filter((s) => s._count.userId === 1)
        .map((s) => s.categoryId);

      if (soleCategoryIds.length === 0) return [];

      const mine = await prisma.userSpecialization.findMany({
        where: {
          categoryId: { in: soleCategoryIds },
          userId: targetUserId,
        },
        select: { categoryId: true },
      });

      return mine.map((m) => m.categoryId);
    },
  },
};

