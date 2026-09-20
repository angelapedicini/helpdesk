"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import {
    Box,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
// import VisibilityIcon from "@mui/icons-material/Visibility";
import EditSquareIcon from '@mui/icons-material/EditSquare';
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import RestoreIcon from "@mui/icons-material/Restore";
import EnhancedTable from "@/components/table";
import Modal from "@/components/modal";
import { useModalState } from "@/components/hooks/use-modal-state";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { GET_CATEGORY_ACCESSES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import {
    DELETE_TICKET_CATEGORY,
    RESTORE_TICKET_CATEGORY,
} from "@/apollo-client/queries/ticket-category/ticket-category.mutations";
import {
    createCategoryHeadCells,
    getCategoryAccessMatrix,
    CategoryManagementRow,
    CategoryManagementRowWithAccess,
} from "./column.def";
import CategoryForm from "@/components/forms/category/category-form";
import { useCategoryManagementPermissions } from "@/lib/casl/abilities/category/hook-permission";

export default function CategoryManagementPage() {
    const router = useRouter();
    const { data: meData } = useQuery(ME_QUERY);
    const { canManageCategories, canManageCategoryAccesses } =
        useCategoryManagementPermissions();

    const { data: categoriesData } = useQuery(GET_CATEGORIES, {
        variables: { includeDisabled: true },
    });
    const { data: accessesData } = useQuery(GET_CATEGORY_ACCESSES, {
        skip: !canManageCategoryAccesses,
    });

    const categories = categoriesData?.categories ?? [];
    const accesses = accessesData?.categoryAccesses ?? [];

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

    const headCells = createCategoryHeadCells(accesses, {
        includeAccessColumns: canManageCategoryAccesses,
    });

    const matrixRows: CategoryManagementRowWithAccess[] = categories.map((category) => {
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

    const createModal = useModalState<void>();

    const handleToggleCategory = (cat: CategoryManagementRow) => {
        if (cat.disabled) {
            restoreTicketCategory({ variables: { id: cat.id } });
        } else {
            deleteTicketCategory({ variables: { id: cat.id } });
        }
    };

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 3 }}>
                <Typography variant="h5">Gestione categorie e accessi</Typography>
                {canManageCategories && (
                    <IconButton onClick={createModal.openEmpty} aria-label="Nuova categoria" sx={{ ml: 1 }}>
                        <ControlPointIcon />
                    </IconButton>
                )}
            </Stack>

            <Box sx={{ height: "78vh" }}>
                <EnhancedTable<CategoryManagementRowWithAccess>
                    rows={matrixRows}
                    headCells={headCells}
                    actionsWidth="120px"
                    actions={
                        canManageCategories
                            ? (cat) => (
                                <>
                                    <IconButton
                                        onClick={() => router.push(`/categoryManagement/${cat.id}`)}
                                    >
                                        <EditSquareIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleToggleCategory(cat)}>
                                        {cat.disabled ? <RestoreIcon /> : <DisabledByDefaultIcon />}
                                    </IconButton>
                                </>
                            )
                            : undefined
                    }
                />
            </Box>

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