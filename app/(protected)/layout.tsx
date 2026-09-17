// app/(protected)/layout.tsx
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import Navbar from "@/components/navbar";
import { buildNavLinks } from "@/components/nav-links";
import { AbilityProvider } from "@/lib/casl/abilityContext";
import { defineAbility } from "@/lib/casl/defineAbility";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/");

    const prisma = await getPrisma();

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true },
    });
    if (!user) redirect("/");

    const ability = defineAbility(session);
    const navLinks = buildNavLinks(session);

    return (
        <>
            <Navbar links={navLinks} />
            <AbilityProvider initialRules={ability.rules}>
                {children}
            </AbilityProvider>
        </>
    );
}