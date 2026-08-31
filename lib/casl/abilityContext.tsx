// lib/casl/AbilityContext.tsx
"use client";
import { createContext, useContext, useMemo } from "react";
import { createPrismaAbility } from "@casl/prisma";
import type { TicketAbility } from "./abilities/ticket/types";

const AbilityContext = createContext<TicketAbility | null>(null);

export function AbilityProvider({
    initialRules,
    children,
}: {
    initialRules: TicketAbility["rules"];
    children: React.ReactNode;
}) {
    const ability = useMemo(
        () =>
            createPrismaAbility(initialRules, {
                detectSubjectType: (object: any) => object.__typename,
            }),
        [initialRules],
    );

    return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}

export function useAbility(): TicketAbility {
    const ctx = useContext(AbilityContext);
    if (!ctx) throw new Error("useAbility must be used within AbilityProvider");
    return ctx;
}