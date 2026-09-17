import { getPrisma } from "@/lib/prisma/index";
import { Department } from "@/app/generated/prisma/enums";
import { getSession } from "@/lib/auth/session";
import { Prisma } from "@/app/generated/prisma/client";
import { defineAbilityForUserManagement } from "@/lib/casl/abilities/user/rules";


export const userSpecQueries = {
    soleSpecialistCategoryIds: async (
        _parent: unknown,
        args: { department: Department; userId?: number }
    ) => {
        const session = await getSession();
        if (!session) return [];
        const prisma = await getPrisma();


        const targetUserId = args.userId ?? session.userId;

        const isSelf = targetUserId === session.userId;
        const ability = defineAbilityForUserManagement(session);
        if (!isSelf && ability.cannot("manageSpecialization", "User")) return [];

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

    usersForCategoryId: async (
        _parent: unknown,
        args: { categoryId: number; search?: string }
    ) => {
        const session = await getSession();
        if (!session) return [];
        const prisma = await getPrisma();


        const { categoryId, search } = args;

        const where: Prisma.UserSpecializationWhereInput = {
            categoryId,
        };

        if (search) {
            where.user = {
                OR: [
                    { firstName: { contains: search, mode: "insensitive" } },
                    { lastName: { contains: search, mode: "insensitive" } },
                ],
            };
        }

        const specializedUsers = await prisma.userSpecialization.findMany({
            where,
            select: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
        });

        return specializedUsers.map((s) => s.user);
    },

}