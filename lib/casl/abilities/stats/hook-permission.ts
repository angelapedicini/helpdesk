// lib/casl/abilities/stats/presentation.ts
import { useMemo } from "react";
import { useAbility } from "@/lib/casl/abilityContext";

export function useStatsPermissions() {
    const ability = useAbility();

    return useMemo(
        () => ({
            canViewStats: ability.can("read", "TicketStats"),
            canViewAllDepartments: ability.can("readAll", "TicketStats"),
        }),
        [ability],
    );
}
