// lib/casl/abilityContext.tsx
"use client";
import { createContext, useContext, useMemo } from "react";
import { createPrismaAbility } from "@casl/prisma";
import type { AppAbility } from "./defineAbility";

const AbilityContext = createContext<AppAbility | null>(null);

export function AbilityProvider({
    initialRules,
    children,
}: {
    initialRules: AppAbility["rules"];
    children: React.ReactNode;
}) {
    const ability = useMemo(
        () =>
            createPrismaAbility(initialRules, {
                detectSubjectType: ((object) =>
                    (object as { __typename?: string }).__typename) as AppAbility["detectSubjectType"],
            }) as AppAbility,
        [initialRules],
    );

    return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}

export function useAbility(): AppAbility {
    const ctx = useContext(AbilityContext);
    if (!ctx) throw new Error("useAbility must be used within AbilityProvider");
    return ctx;
}
