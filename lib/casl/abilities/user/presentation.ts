// lib/casl/abilities/user/presentation.ts
import { useMemo } from "react";
import { useUserManagementAbility } from "@/lib/casl/userManagementAbilityContext";
import { toUserSubject } from "./guards";
import type { UserForAbility } from "./types";

export function useUserManagementPermissions() {
    const ability = useUserManagementAbility();

    return useMemo(
        () => ({
            canViewFilters:
                ability.can("updateRole", "User") ||
                ability.can("manageSpecialization", "User"),
            canUseDepartmentFilter: ability.can("updateRole", "User"),
            canUpdateRole: (target: UserForAbility) =>
                ability.can("updateRole", toUserSubject(target)),
            canManageSpecialization: (target: UserForAbility) =>
                ability.can("manageSpecialization", toUserSubject(target)),
        }),
        [ability],
    );
}