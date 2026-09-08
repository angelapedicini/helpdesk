// app/(protected)/layout.tsx
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import Navbar from "@/components/navbar";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";
import { AbilityProvider } from "@/lib/casl/abilityContext";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const prisma = await getPrisma();

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true },
    });
    if (!user) redirect("/login");

    const ability = defineAbilityForTicket(session);

    return (
        <>
            <Navbar />
            <AbilityProvider initialRules={ability.rules}>
                {children}
            </AbilityProvider>
        </>
    );
}