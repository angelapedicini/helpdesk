// lib/casl/abilities/stats/presentation.ts
import { useMemo } from "react";
import { defineAbilityForStats } from "./rules";
import { useAbilityUser } from "@/lib/casl/useAbilityUser";

export function useStatsPermissions() {
    const user = useAbilityUser();

    return useMemo(() => {
        if (!user) {
            return { canViewStats: false, canViewAllDepartments: false };
        }

        const ability = defineAbilityForStats(user);

        return {
            canViewStats: ability.can("read", "TicketStats"),
            canViewAllDepartments: ability.can("readAll", "TicketStats"),
        };
    }, [user]);
}
