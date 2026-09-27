// lib/casl/abilities/ticket-notification/hook-permission.ts
import { useMemo } from "react";
import { useAbility } from "@/lib/casl/abilityContext";

export function useTicketNotificationPermissions() {
    const ability = useAbility();

    return useMemo(
        () => ({
            canManageNotifications: ability.can("create", "TicketNotification"),
        }),
        [ability],
    );
}
