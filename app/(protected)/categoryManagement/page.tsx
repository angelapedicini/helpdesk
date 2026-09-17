"use client";

import { useMutation, useQuery } from "@apollo/client/react";
import {
    Box,
    Chip,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import ControlPointIcon from "@mui/icons-material/ControlPoint";
import EditIcon from "@mui/icons-material/Edit";
import DisabledByDefaultIcon from "@mui/icons-material/DisabledByDefault";
import RestoreIcon from "@mui/icons-material/Restore";
import TuneIcon from "@mui/icons-material/Tune";
import EnhancedTable from "@/components/table";
import Modal from "@/components/modal";
import { useModalState } from "@/components/hooks/use-modal-state";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import { GET_CATEGORIES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import { GET_CATEGORY_ACCESSES } from "@/apollo-client/queries/ticket-category/ticket-category.queries";
import {
    DELETE_TICKET_CATEGORY,
    RESTORE_TICKET_CATEGORY,
    DELETE_TICKET_CATEGORY_ACCESS,
    RESTORE_TICKET_CATEGORY_ACCESS,
} from "@/apollo-client/queries/ticket-category/ticket-category.mutations";
import { createCategoryHeadCells, CategoryManagementRow } from "./column.def";
import CategoryForm from "@/components/forms/category/category-form";
import CategoryAccessForm from "@/components/forms/category/category-access-form";
import { ROLE_CONFIG } from "@/components/enums/role.config";
import { DEPARTMENT_CONFIG } from "@/components/enums/department.config";
import { useCategoryManagementPermissions } from "@/lib/casl/abilities/category/hook-permission";

export default function CategoryManagementPage() {
    const { data: meData } = useQuery(ME_QUERY);
    const { canManageCategories, canManageCategoryAccesses } =
        useCategoryManagementPermissions();

    const { data: categoriesData } = useQuery(GET_CATEGORIES);
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

    const [deleteTicketCategoryAccess] = useMutation(DELETE_TICKET_CATEGORY_ACCESS, {
        context: { successMessage: "Accesso disabilitato con successo." },
        refetchQueries: ["CategoryAccesses"],
        awaitRefetchQueries: true,
    });

    const [restoreTicketCategoryAccess] = useMutation(RESTORE_TICKET_CATEGORY_ACCESS, {
        context: { successMessage: "Accesso riattivato con successo." },
        refetchQueries: ["CategoryAccesses"],
        awaitRefetchQueries: true,
    });

    const headCells = createCategoryHeadCells();

    const createModal = useModalState<void>();
    const editModal = useModalState<CategoryManagementRow>();
    const accessesModal = useModalState<CategoryManagementRow>();

    const handleToggleCategory = (cat: CategoryManagementRow) => {
        if (cat.disabled) {
            restoreTicketCategory({ variables: { id: cat.id } });
        } else {
            deleteTicketCategory({ variables: { id: cat.id } });
        }
    };

    const handleToggleAccess = (accessId: number, disabled: boolean | null | undefined) => {
        if (disabled) {
            restoreTicketCategoryAccess({ variables: { id: accessId } });
        } else {
            deleteTicketCategoryAccess({ variables: { id: accessId } });
        }
    };

    const categoryAccesses = (categoryId: number) =>
        accesses.filter((a) => a.categoryId === categoryId);

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
                <EnhancedTable<CategoryManagementRow>
                    rows={categories}
                    headCells={headCells}
                    actionsWidth="152px"
                    actions={
                        canManageCategories
                            ? (cat) => (
                                <>
                                    <IconButton onClick={() => accessesModal.open(cat)}>
                                        <TuneIcon />
                                    </IconButton>
                                    <IconButton onClick={() => editModal.open(cat)}>
                                        <EditIcon />
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

            <Modal
                title="Modifica categoria"
                isOpen={editModal.isOpen}
                onClose={editModal.close}
            >
                {editModal.value && (
                    <CategoryForm
                        category={editModal.value}
                        onSubmit={editModal.close}
                    />
                )}
            </Modal>

            <Modal
                title="Accessi categoria"
                isOpen={accessesModal.isOpen}
                onClose={accessesModal.close}
            >
                {accessesModal.value && (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                            {accessesModal.value.name} ({DEPARTMENT_CONFIG[accessesModal.value.department]?.label ?? accessesModal.value.department})
                        </Typography>

                        {categoryAccesses(accessesModal.value.id).map((access) => {
                            const dept = access.requesterDepartment;
                            const deptConfig = dept ? DEPARTMENT_CONFIG[dept] : null;
                            const roleConfig = ROLE_CONFIG[access.requesterMinRole];
                            return (
                                <Stack
                                    key={access.id}
                                    direction="row"
                                    sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}
                                >
                                    <Stack direction="row" spacing={1} sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.5 }}>
                                        <Chip
                                            label={deptConfig?.label ?? "Tutti i reparti"}
                                            size="small"
                                            color={access.disabled ? "default" : "primary"}
                                        />
                                        <Chip
                                            label={`Ruolo minimo: ${roleConfig.label}`}
                                            size="small"
                                            color={access.disabled ? "default" : "secondary"}
                                        />
                                        {access.disabled && (
                                            <Chip label="Disabilitato" color="error" size="small" />
                                        )}
                                    </Stack>
                                    <IconButton onClick={() => handleToggleAccess(access.id, access.disabled)}>
                                        {access.disabled ? <RestoreIcon /> : <DisabledByDefaultIcon />}
                                    </IconButton>
                                </Stack>
                            );
                        })}

                        {categoryAccesses(accessesModal.value.id).length === 0 && (
                            <Typography variant="body2" color="text.secondary">
                                Nessun accesso configurato.
                            </Typography>
                        )}

                        <Box sx={{ mt: 2, borderTop: 1, borderColor: "divider", pt: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Aggiungi accesso
                            </Typography>
                            <CategoryAccessForm
                                categoryId={accessesModal.value.id}
                                categoryName={accessesModal.value.name}
                                onSubmit={accessesModal.close}
                            />
                        </Box>
                    </Box>
                )}
            </Modal>
        </Box>
    );
}