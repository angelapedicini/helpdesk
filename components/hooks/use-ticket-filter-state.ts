// components/hooks/use-ticket-filter-state.ts
"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
    isAlertFilterKey,
    type AlertFilterKey,
} from "@/components/enums/ticket-alert.config";
import { useFilterState } from "@/components/hooks/use-filter-state";
import type { FilterTicketOutput } from "@/lib/validators/ticket-detail.schema";

/**
 * Lo stato dei filtri della pagina ticket: useFilterState più le due cose che
 * valgono solo per questa pagina, il seme ?filter= della dashboard e la formKey
 * per tenere allineato il form dei filtri.
 *
 * useFilterState resta generico perché ha anche un altro consumatore
 * (userCategory) che non ha né l'uno né l'altro.
 */

/** Il filtro iniziale letto da ?filter=, che è la chiave dell'alert clicato. */
function readAlertFilterSeed(
    searchParams: URLSearchParams
): FilterTicketOutput | undefined {
    const value = searchParams.get("filter");

    return isAlertFilterKey(value)
        ? ({ [value as AlertFilterKey]: true } as FilterTicketOutput)
        : undefined;
}

/**
 * Firma del filtro, in ordine di chiave così due filtri uguali danno la stessa
 * stringa e non provocano un rimontaggio inutile.
 */
function filterSignatureOf(filter: FilterTicketOutput | undefined): string {
    return JSON.stringify(
        Object.entries(filter ?? {}).sort(([a], [b]) => a.localeCompare(b))
    );
}

export function useTicketFilterState() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Le card contatore della dashboard arrivano con ?filter=...: senza questo
    // il filtro partirebbe vuoto e il link sembrerebbe muto. useState legge il
    // valore iniziale solo al primo render, quindi è una semina una tantum.
    const seed = readAlertFilterSeed(searchParams);
    const alertFilter = searchParams.get("filter");

    const state = useFilterState<FilterTicketOutput>(seed);

    // Il filtro dell'alert è transitorio: appena l'ha preso, sparisce dalla
    // URL. Se restasse lì un F5 ripartirebbe già filtrato, e il Reset sembrerebbe
    // non funzionare perché la pagina rimontata lo riapplicherebbe.
    //
    // replace e non push: il drill-down non deve aggiungere una voce alla
    // history, altrimenti il back tornerebbe a una URL con il filtro dentro.
    useEffect(() => {
        if (!isAlertFilterKey(alertFilter)) return;

        const params = new URLSearchParams(searchParams.toString());
        params.delete("filter");

        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, {
            scroll: false,
        });
    }, [alertFilter, pathname, searchParams, router]);

    // Va passata come key al form dei filtri. Il Drawer usa keepMounted, quindi
    // il form resta montato e la sincronizzazione interna di react-hook-form non
    // azzerava i checkbox: l'unico caso che funzionava era il mount da F5.
    // Cambiando key il form viene rismontato e riparte dai defaultValues, che a
    // quel punto sono aggiornati.
    return {
        ...state,
        formKey: filterSignatureOf(state.filter),
    };
}
