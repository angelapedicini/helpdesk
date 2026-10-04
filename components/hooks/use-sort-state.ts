// components/hooks/use-sort-state.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import type { SortDirection } from "@/graphql-generated/schema";

export type Order = 'asc' | 'desc';

interface SortState<K> {
    orderBy: K;
    order: Order;
}

export function useSortState<K>(initialOrderBy: K, initialOrder: Order = "desc") {
    const [state, setState] = useState<SortState<K>>({
        orderBy: initialOrderBy,
        order: initialOrder,
    });

    const onRequestSort = useCallback((property: K) => {
        setState((prev) => {
            const isAsc = prev.orderBy === property && prev.order === "asc";
            return { orderBy: property, order: isAsc ? "desc" : "asc" };
        });
    }, []);

    const sortDirection = useMemo<SortDirection>(
        () => (state.order === "asc" ? "ASC" : "DESC"),
        [state.order]
    );

    return { order: state.order, orderBy: state.orderBy, onRequestSort, sortDirection };
}