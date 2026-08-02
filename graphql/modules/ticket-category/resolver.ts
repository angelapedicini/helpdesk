import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export const categoryResolvers = {
    Query: {
        categories: async () => {
            const session = await getSession();
            if (!session) return [];

            return prisma.ticketCategory.findMany({
                select: {
                    id: true,
                    name: true,
                    department: true,
                },
            });
        },
    }
}