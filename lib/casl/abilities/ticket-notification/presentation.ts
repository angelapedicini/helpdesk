// lib/casl/abilities/ticket-notification/presentation.ts
import { useMemo } from "react";
import { defineAbilityForTicketNotification } from "./rules";
import { useAbilityUser } from "@/lib/casl/useAbilityUser";

export function useTicketNotificationPermissions() {
    const user = useAbilityUser();

    return useMemo(() => {
        if (!user) {
            return { canManageNotifications: false };
        }

        const ability = defineAbilityForTicketNotification(user);

        return {
            canManageNotifications: ability.can("create", "TicketNotification"),
        };
    }, [user]);
}
