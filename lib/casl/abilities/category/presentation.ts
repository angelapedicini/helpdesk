// lib/casl/abilities/category/presentation.ts
import { useMemo } from "react";
import { defineAbilityForCategory } from "./rules";
import { useAbilityUser } from "@/lib/casl/useAbilityUser";

export function useCategoryManagementPermissions() {
    const user = useAbilityUser();

    return useMemo(() => {
        if (!user) {
            return { canManageCategories: false, canManageCategoryAccesses: false };
        }

        const ability = defineAbilityForCategory(user);

        return {
            canManageCategories: ability.can("manage", "TicketCategory"),
            canManageCategoryAccesses: ability.can("manage", "TicketCategoryAccess"),
        };
    }, [user]);
}
