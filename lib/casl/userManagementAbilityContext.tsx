// lib/casl/userManagementAbilityContext.tsx
"use client";
import { createContext, useContext, useMemo } from "react";
import { createPrismaAbility } from "@casl/prisma";
import type { UserManagementAbility } from "./abilities/user/types";

const UserManagementAbilityContext = createContext<UserManagementAbility | null>(null);

export function UserManagementAbilityProvider({
    initialRules,
    children,
}: {
    initialRules: UserManagementAbility["rules"];
    children: React.ReactNode;
}) {
    const ability = useMemo(
        () =>
            createPrismaAbility(initialRules, {
                detectSubjectType: (object: { __typename?: string }) => object.__typename,
            }),
        [initialRules],
    );

    return (
        <UserManagementAbilityContext.Provider value={ability}>
            {children}
        </UserManagementAbilityContext.Provider>
    );
}

export function useUserManagementAbility(): UserManagementAbility {
    const ctx = useContext(UserManagementAbilityContext);
    if (!ctx) throw new Error("useUserManagementAbility must be used within UserManagementAbilityProvider");
    return ctx;
}