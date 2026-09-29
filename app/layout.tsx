// app/(protected)/layout.tsx
import { redirect } from "next/navigation";
import { getPrisma } from "@/lib/prisma";
import { getAccessToken, getRefreshToken } from "@/lib/auth/cookies";
import { verifyAccessToken, verifyRefreshToken, buildAccessTokenPayload } from "@/lib/auth/jwt";
import Navbar from "@/components/navbar";
import { buildNavLinks } from "@/components/nav-links";
import { AbilityProvider } from "@/lib/casl/abilityContext";
import { defineAbility } from "@/lib/casl/defineAbility";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const prisma = await getPrisma();

    // 1. Access token valido -> identità subito
    const token = await getAccessToken();
    let userId = (token ? await verifyAccessToken(token) : null)?.userId ?? null;

    // 2. Access token scaduto -> la sessione è ancora viva se il refresh token
    //    è valido e presente a DB. Il rinnovo lo fa il client (link Apollo)
    //    alla prima query; qui serve solo sapere CHI è l'utente.
    if (!userId) {
        const refresh = await getRefreshToken();
        const refreshPayload = refresh ? await verifyRefreshToken(refresh) : null;

        if (refresh && refreshPayload) {
            const stored = await prisma.refreshToken.findUnique({
                where: { token: refresh },
                select: { userId: true, expiresAt: true },
            });
            if (stored && stored.userId === refreshPayload.userId && stored.expiresAt > new Date()) {
                userId = stored.userId;
            }
        }
    }

    if (!userId) redirect("/");

    // 3. Ruolo e dipartimento dal DB, non dal token
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, role: true, department: true },
    });
    if (!user) redirect("/");

    const session = buildAccessTokenPayload(user);
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