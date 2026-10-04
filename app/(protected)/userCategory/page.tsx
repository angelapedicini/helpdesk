"use client";

import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@apollo/client/react";
import { Badge, Box, IconButton, Stack, Typography } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import FilterListIcon from "@mui/icons-material/FilterList";
import type { GridSortModel } from "@mui/x-data-grid";

import FiltersSidebar from "@/components/filters-sidebar";
import { useFilterState } from "@/components/hooks/use-filter-state";
import ServerDataGrid from "@/components/server-data-grid";
import CardList from "@/components/card-list";
import { GET_USERS_FOR_MANAGEMENT } from "@/apollo-client/queries/user/user-queries";
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
import { createUserManagementColumns, type UserManagementRow } from "./column.def";

const PAGE_SIZE = 20;

// I dati non sono paginati dal BE e la lista non è ordinabile, ma
// ServerDataGrid richiede queste props. Costanti fuori dal componente per non
// creare riferimenti nuovi a ogni render.
const NO_SORT: GridSortModel = [];
const noop = () => {};

export default function UsersManagementPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"), { noSsr: true });

    const { data: meData, loading: meLoading } = useQuery(ME_QUERY);
    const isAdmin = meData?.me?.role === "ADMIN";
    const { canViewFilters } = useUserManagementPermissions();

    // --------------------------------
    // FILTRI
    // --------------------------------

    const userFilters = useFilterState<FilterUserSpecOutput>();

    // --------------------------------
    // QUERY
    // --------------------------------

    // I filtri arrivano come variabili: usersForManagement parte già ristretto
    // per ruolo e i filtri lo restringono ulteriormente, in AND.
    const queryVariables = {
        userId: userFilters.filter?.userId,
        role: userFilters.filter?.role,
        department: userFilters.filter?.department,
        categoryId: userFilters.filter?.categoryId,
    };

    const { data, loading: usersLoading } = useQuery(GET_USERS_FOR_MANAGEMENT, {
        variables: queryVariables,
        skip: meLoading,
    });

    // array stabile: cambia solo quando cambiano i dati della query
    const users: UserManagementRow[] = useMemo(
        () => data?.usersForManagement ?? [],
        [data]
    );

    // --------------------------------
    // MODALS + HANDLERS
    // --------------------------------

    const specModal = useModalState<UserManagementRow>();
    const removeSpecModal = useModalState<UserManagementRow>();
    const roleModal = useModalState<UserManagementRow>();

    const handleAddSpec = (user: UserManagementRow) => {
        specModal.open(user);
    };

    const handleRemoveSpec = (user: UserManagementRow) => {
        removeSpecModal.open(user);
    };

    const handleEditRole = (user: UserManagementRow) => {
        roleModal.open(user);
    };

    // azioni condivise tra DataGrid (desktop) e card (mobile)
    const renderActions = (user: UserManagementRow) => (
        <UserManagementRowActions
            user={user}
            onAddSpec={handleAddSpec}
            onRemoveSpec={handleRemoveSpec}
            onEditRole={handleEditRole}
        />
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
            createUserManagementColumns({
                renderActions: (user) => renderActionsRef.current(user),
            }),
        []
    );

    const showFilters = canViewFilters;

    // --------------------------------
    // RENDER
    // --------------------------------

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
                    columns={columns}
                    titleKey="firstName"
                    subtitleKey="id"
                />
            ) : (
                <ServerDataGrid<UserManagementRow>
                    rows={users}
                    columns={columns}
                    loading={meLoading || usersLoading}
                    onLoadMore={noop}
                    totalCount={users.length}
                    pageSize={PAGE_SIZE}
                    sortModel={NO_SORT}
                    onSortModelChange={noop}
                    resetKey={JSON.stringify(userFilters.filter ?? null)}
                />
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
                        restrictUsersToDepartment={isAdmin}
                    />
                </Box>
            </FiltersSidebar>
        </Box>
    );
}