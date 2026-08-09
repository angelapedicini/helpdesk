// lib/casl/AbilityContext.tsx
"use client";
import { createContext, useContext, useMemo } from "react";
import { createPrismaAbility, type PrismaQuery, type Subjects } from "@casl/prisma";
import type { AppAbility } from "./types";

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
                detectSubjectType: (object: any) => object.__typename,
            }),
        [initialRules],
    );

    return <AbilityContext.Provider value={ability}>{children}</AbilityContext.Provider>;
}

export function useAbility(): AppAbility {
    const ctx = useContext(AbilityContext);
    if (!ctx) throw new Error("useAbility must be used within AbilityProvider");
    return ctx;
}