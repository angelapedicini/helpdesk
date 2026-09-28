"use client";

import { useQuery } from "@apollo/client/react";
import {
    Badge,
    Box,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import FiltersSidebar from "@/components/filters-sidebar";
import { useFilterState } from "@/components/hooks/use-filter-state";
import EnhancedTable from "@/components/table";
import CardList from "@/components/card-list"; // NEW
import { GET_USERS_FOR_MANAGEMENT } from "@/apollo-client/queries/user/user-queries";
import { createUserManagementHeadCells, UserManagementRow } from "./column.def";
import { FilterUserSpecOutput } from "@/lib/validators/userSpec.schema";
import FilterUserSpecForm from "@/components/forms/user/filter-userSpec";
import { useModalState } from "@/components/hooks/use-modal-state";
import Modal from "@/components/modal";
import AddUserSpecializationForm from "@/components/forms/user/create-userSpec";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import RemoveUserSpecializationForm from "@/components/forms/user/remove-userSpec";
import UpdateUserRoleForm from "@/components/forms/user/update-user-role-form";
import { useUserManagementPermissions } from "@/lib/casl/abilities/user/hook-permission";
import UserManagementRowActions from "./_components/actions";

export default function UsersManagementPage() {
    // NEW: breakpoint mobile
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    const { data: meData, loading } = useQuery(ME_QUERY);
    const {
        canViewFilters,
    } = useUserManagementPermissions();

    // --------------------------------
    // FILTRI
    // --------------------------------

    const userFilters = useFilterState<FilterUserSpecOutput>();

    // --------------------------------
    // QUERY
    // --------------------------------

    const queryVariables = {
        userId: userFilters.filter?.userId,
        role: userFilters.filter?.role,
        department: userFilters.filter?.department,
        categoryId: userFilters.filter?.categoryId,
    };

    const { data } = useQuery(GET_USERS_FOR_MANAGEMENT, {
        variables: queryVariables,
        skip: loading,
    });

    const users = data?.searchUsers ?? [];

    // --------------------------------
    // COLUMNS
    // --------------------------------

    const headCells = createUserManagementHeadCells();

    // --------------------------------
    // MODALS + HANDLERS
    // --------------------------------

    const specModal = useModalState<UserManagementRow>();

    const handleAddSpec = (user: UserManagementRow) => {
        specModal.open(user);
    };

    const removeSpecModal = useModalState<UserManagementRow>();

    const handleRemoveSpec = (user: UserManagementRow) => {
        removeSpecModal.open(user);
    };

    const roleModal = useModalState<UserManagementRow>();

    const handleEditRole = (user: UserManagementRow) => {
        roleModal.open(user);
    };

    // NEW: azioni condivise tra tabella e card
    const renderActions = (user: UserManagementRow) => (
        <UserManagementRowActions
            user={user}
            onAddSpec={handleAddSpec}
            onRemoveSpec={handleRemoveSpec}
            onEditRole={handleEditRole}
        />
    );

    const showFilters = canViewFilters;

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 3 }}>
                {showFilters && (
                    <IconButton onClick={userFilters.open} aria-label="Filtri">
                        <Badge
                            badgeContent={userFilters.activeCount}
                            color="primary"
                            invisible={userFilters.activeCount === 0}
                        >
                            <FilterListIcon />
                        </Badge>
                    </IconButton>
                )}

                <Typography variant="h5">Utenti e specializzazioni</Typography>
            </Stack>

            {isMobile ? (
                <CardList<UserManagementRow>
                    rows={users}
                    headCells={headCells}
                    titleKey={headCells[0]?.id}
                    actions={renderActions}
                />
            ) : (
                <Box sx={{ height: "78vh" }}>
                    <EnhancedTable<UserManagementRow>
                        rows={users}
                        headCells={headCells}
                        actionsWidth="152px"
                        actions={renderActions}
                    />
                </Box>
            )}

            {/* SPEC MODAL */}
            <Modal
                title="Assegna specializzazione"
                isOpen={specModal.isOpen}
                onClose={specModal.close}
            >
                {specModal.value && (
                    <AddUserSpecializationForm
                        userId={specModal.value.id}
                        fullName={`${specModal.value.firstName} ${specModal.value.lastName}`}
                        department={meData?.me?.department}
                        onSubmit={() => {
                            specModal.close();
                        }}
                    />
                )}
            </Modal>

            <Modal
                title="Rimuovi specializzazione"
                isOpen={removeSpecModal.isOpen}
                onClose={removeSpecModal.close}
            >
                {removeSpecModal.value && (
                    <RemoveUserSpecializationForm
                        userId={removeSpecModal.value.id}
                        fullName={`${removeSpecModal.value.firstName} ${removeSpecModal.value.lastName}`}
                        specializations={removeSpecModal.value.specializations}
                        onSubmit={() => removeSpecModal.close()}
                    />
                )}
            </Modal>

            {/* ROLE MODAL */}
            <Modal
                title="Cambia ruolo"
                isOpen={roleModal.isOpen}
                onClose={roleModal.close}
            >
                {roleModal.value && (
                    <UpdateUserRoleForm
                        userId={roleModal.value.id}
                        fullName={`${roleModal.value.firstName} ${roleModal.value.lastName}`}
                        currentRole={roleModal.value.role}
                        onSubmit={roleModal.close}
                    />
                )}
            </Modal>

            {/* FILTRI */}
            <FiltersSidebar open={userFilters.isOpen} onClose={userFilters.close}>
                <Box sx={{ p: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Filtri utenti
                    </Typography>

                    <FilterUserSpecForm
                        onApply={userFilters.apply}
                        onReset={userFilters.reset}
                    />
                </Box>
            </FiltersSidebar>
        </Box>
    );
}