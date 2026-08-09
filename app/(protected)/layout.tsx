// app/(protected)/layout.tsx
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import Navbar from "@/components/navbar";
import { defineAbilityFor } from "@/lib/casl/abilities";
import { AbilityProvider } from "@/lib/casl/abilityContext";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true },
    });
    if (!user) redirect("/login");

    const ability = defineAbilityFor(session); // session deve avere shape AccessTokenPayload

    return (
        <>
            <Navbar />
            <AbilityProvider initialRules={ability.rules}>
                {children}
            </AbilityProvider>
        </>
    );
}