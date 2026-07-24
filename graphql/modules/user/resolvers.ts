import prisma from "@/lib/prisma";

export const userResolvers = {
    Query: {
        users: async () => {
            return prisma.user.findMany({
                include: { items: true }, // precarica gli item insieme agli user
            });
        },
    },
    User: {
        items: (parent: { item: any[] }) => parent.item, // legge dal dato già caricato
    },
};

