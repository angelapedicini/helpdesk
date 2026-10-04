"use client";

import { useEffect, useMemo, useRef } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import EditSquareIcon from "@mui/icons-material/EditSquare";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import RestoreIcon from "@mui/icons-material/Restore";

import ServerDataGrid from "@/components/server-data-grid";
import CardList from "@/components/card-list";
import Modal from "@/components/modal";
import { useModalState } from "@/components/hooks/use-modal-state";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import {
    GET_CATEGORIES,
    GET_CATEGORY_ACCESSES,
} from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import {
    DELETE_TICKET_CATEGORY,
    RESTORE_TICKET_CATEGORY,
} from "@/apollo-client/queries/ticket-category/ticket-category.mutations";
import CategoryForm from "@/components/forms/category/category-form";
import {
    createCategoryColumns,
    getCategoryAccessMatrix,
    type CategoryManagementRow,
    type CategoryManagementRowWithAccess,
} from "./column.def";
// import { useCategoryManagementPermissions } from "@/lib/casl/abilities/category/hook-permission";

const PAGE_SIZE = 20;

export default function CategoryManagementPage() {
    const router = useRouter();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    const { data: meData } = useQuery(ME_QUERY);
    // const { canManageCategories, canManageCategoryAccesses } =
    //     useCategoryManagementPermissions();

    // --------------------------------
    // QUERY
    // --------------------------------

    const { data: categoriesData, loading: categoriesLoading } = useQuery(
        GET_CATEGORIES,
        { variables: { includeDisabled: true } }
    );
    const { data: accessesData, loading: accessesLoading } = useQuery(
        GET_CATEGORY_ACCESSES,
        {
            // skip: !canManageCategoryAccesses,
        }
    );

    const [deleteTicketCategory] = useMutation(DELETE_TICKET_CATEGORY, {
        context: { successMessage: "Categoria disabilitata con successo." },
        refetchQueries: ["Categories", "CategoryAccesses"],
        awaitRefetchQueries: true,
    });

    const [restoreTicketCategory] = useMutation(RESTORE_TICKET_CATEGORY, {
        context: { successMessage: "Categoria riattivata con successo." },
        refetchQueries: ["Categories", "CategoryAccesses"],
        awaitRefetchQueries: true,
    });

    // array stabile: cambia solo quando cambiano i dati delle query
    const matrixRows: CategoryManagementRowWithAccess[] = useMemo(() => {
        const categories = categoriesData?.categories ?? [];
        const accesses = accessesData?.categoryAccesses ?? [];

        return categories.map((category) => {
            const matrix = getCategoryAccessMatrix(category.id, accesses);
            return {
                ...category,
                accessFinance: matrix.FINANCE ?? null,
                accessHr: matrix.HR ?? null,
                accessIt: matrix.IT ?? null,
                accessLogistic: matrix.LOGISTIC ?? null,
                accessSupport: matrix.SUPPORT ?? null,
            };
        });
    }, [categoriesData, accessesData]);

    // --------------------------------
    // MODAL + ACTIONS
    // --------------------------------

    const createModal = useModalState<void>();

    const handleToggleCategory = (cat: CategoryManagementRow) => {
        if (cat.disabled) {
            restoreTicketCategory({ variables: { id: cat.id } });
        } else {
            deleteTicketCategory({ variables: { id: cat.id } });
        }
    };

    // azioni condivise tra DataGrid (desktop) e card (mobile)
    const renderActions = (cat: CategoryManagementRowWithAccess) => (
        <>
            <IconButton
                onClick={() => router.push(`/categoryManagement/${cat.id}`)}
                aria-label="Modifica categoria"
            >
                <EditSquareIcon />
            </IconButton>
            <IconButton
                onClick={() => handleToggleCategory(cat)}
                aria-label={cat.disabled ? "Riattiva categoria" : "Disabilita categoria"}
            >
                {cat.disabled ? <RestoreIcon /> : <DisabledByDefaultIcon />}
            </IconButton>
        </>
    );

    // --------------------------------
    // COLUMNS (condivise tra DataGrid e CardList)
    // --------------------------------

    // renderActions cambia a ogni render, quindi lo leggo da un ref sempre
    // aggiornato: così `columns` resta stabile e il grid non si ricalcola.
    const renderActionsRef = useRef(renderActions);
    useEffect(() => {
        renderActionsRef.current = renderActions;
    });

    const columns = useMemo(
        () =>
            createCategoryColumns({
                renderActions: (cat) => renderActionsRef.current(cat),
                // includeAccessColumns: canManageCategoryAccesses,
            }),
        []
    );

    // --------------------------------
    // RENDER
    // --------------------------------

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 3 }}>
                <Typography variant="h5">Gestione categorie e accessi</Typography>
                {/* {canManageCategories && ( */}
                <IconButton
                    onClick={createModal.openEmpty}
                    aria-label="Nuova categoria"
                    sx={{ ml: 1 }}
                >
                    <ControlPointIcon />
                </IconButton>
                {/* )} */}
            </Stack>

            {isMobile ? (
                <CardList<CategoryManagementRowWithAccess>
                    rows={matrixRows}
                    columns={columns}
                    titleKey="name"
                />
            ) : (
                <ServerDataGrid<CategoryManagementRowWithAccess>
                    rows={matrixRows}
                    columns={columns}
                    loading={categoriesLoading || accessesLoading}
                    pageSize={PAGE_SIZE}
                    sortingMode="client"
                />
            )}

            <Modal
                title="Nuova categoria"
                isOpen={createModal.isOpen}
                onClose={createModal.close}
            >
                <CategoryForm
                    defaultDepartment={meData?.me?.department}
                    onSubmit={createModal.close}
                />
            </Modal>
        </Box>
    );
}