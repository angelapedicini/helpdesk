// lib/casl/useAbilityUser.ts
"use client";
import { useMemo } from "react";
import { useQuery } from "@apollo/client/react";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

/**
 * Espone l'utente corrente nella forma attesa dalle ability
 * ({ userId, role, department }), ricavandolo da ME_QUERY.
 *
 * Serve per i controlli CASL puramente type-level (nessuna istanza):
 * in quel caso non serve un provider, basta ricostruire l'ability
 * lato client dai dati di `me`.
 */
export function useAbilityUser(): AccessTokenPayload | null {
    const { data } = useQuery(ME_QUERY);
    const me = data?.me;

    return useMemo(
        () =>
            me
                ? { userId: me.id, role: me.role, department: me.department }
                : null,
        [me],
    );
}
