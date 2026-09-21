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

// Campi modificabili dall'utente nella creazione di una categoria.
// Il reparto è editabile solo dal SYSTEM_ADMIN (regola "manage" senza
// condizioni): l'ADMIN crea esclusivamente nel proprio dipartimento,
// quindi il select resta bloccato sul valore della sessione, coerente
// con lo scope imposto dal resolver lato backend.
export type CategoryCreateFieldPermissions = {
    department: boolean;
};

export function useCategoryCreateFieldPermissions(): CategoryCreateFieldPermissions {
    const ability = useAbility();

    return useMemo<CategoryCreateFieldPermissions>(
        () => ({
            department: ability.can("manage", "TicketCategory"),
        }),
        [ability],
    );
}
