// app/(protected)/layout.tsx
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import Navbar from "@/components/navbar";
import { buildNavLinks } from "@/components/nav-links";
import { defineAbilityForTicket } from "@/lib/casl/abilities/ticket/rules";
import { AbilityProvider } from "@/lib/casl/abilityContext";
import { defineAbilityForUserManagement } from "@/lib/casl/abilities/user/rules";
import { UserManagementAbilityProvider } from "@/lib/casl/userManagementAbilityContext";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();
    if (!session) redirect("/");

    const prisma = await getPrisma();

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { id: true },
    });
    if (!user) redirect("/");

    const ability = defineAbilityForTicket(session);
    const userManagementAbility = defineAbilityForUserManagement(session);
    const navLinks = buildNavLinks(session);

    return (
        <>
            <Navbar links={navLinks} />
            <AbilityProvider initialRules={ability.rules}>
                <UserManagementAbilityProvider initialRules={userManagementAbility.rules}>
                    {children}
                </UserManagementAbilityProvider>
            </AbilityProvider>
        </>
    );
}