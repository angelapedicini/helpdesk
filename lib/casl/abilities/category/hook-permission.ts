// lib/casl/abilities/category/presentation.ts
import { useMemo } from "react";
import { useAbility } from "@/lib/casl/abilityContext";

export function useCategoryManagementPermissions() {
    const ability = useAbility();

    return useMemo(
        () => ({
            canManageCategories: ability.can("manage", "TicketCategory"),
            canManageCategoryAccesses: ability.can("manage", "TicketCategoryAccess"),
        }),
        [ability],
    );
}
