// lib/casl/abilities/user/hook-permission.ts
import { useMemo } from "react";
import { useAbility } from "@/lib/casl/abilityContext";
import { toUserSubject } from "./guards";
import type { UserForAbility } from "./types";

export function useUserManagementPermissions() {
    const ability = useAbility();

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
