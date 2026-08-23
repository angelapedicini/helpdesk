"use client";

import { useQuery } from "@apollo/client/react";
import {
    Badge,
    Box,
    IconButton,
    Stack,
    Typography,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import FiltersSidebar from "@/components/filters-sidebar";
import { useFilterState } from "@/components/hooks/use-filter-state";
import EnhancedTable from "@/components/table";
import { GET_USERS_BY_DEPARTMENT } from "@/apollo-client/queries/user/user-queries";
import { createUserDepartmentHeadCells, UserDepartmentRow } from "./column.def";
import { FilterUserSpecOutput } from "@/lib/validators/userSpec.schema";
import FilterUserSpecForm from "@/components/forms/user/filter-userSpec";
import { useModalState } from "@/components/hooks/use-modal-state";
import ControlPointIcon from '@mui/icons-material/ControlPoint';
import Modal from "@/components/modal";
import AddUserSpecializationForm from "@/components/forms/user/create-userSpec";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveUserSpecializationForm from "@/components/forms/user/remove-userSpec";

export default function UsersByDepartmentPage() {
    const { data: meData, loading } = useQuery(ME_QUERY);
    const isAdmin = meData?.me?.role === "ADMIN";
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
        categoryId: userFilters.filter?.categoryId,
    };

    const { data } = useQuery(GET_USERS_BY_DEPARTMENT, {
        variables: queryVariables,
    });

    const users = data?.usersByDepartment ?? [];

    // --------------------------------
    // COLUMNS
    // --------------------------------

    const headCells = createUserDepartmentHeadCells();

    // --------------------------------
    // RENDER
    // --------------------------------

    const specModal = useModalState<UserDepartmentRow>();

    const handleAddSpec = (user: UserDepartmentRow) => {
        specModal.open(user);
    };

    const removeSpecModal = useModalState<UserDepartmentRow>();

    const handleRemoveSpec = (user: UserDepartmentRow) => {
        removeSpecModal.open(user);
    };

    return (
        <Box sx={{ mt: 3, mx: 2 }}>
            <Stack direction="row" sx={{ alignItems: "center", mb: 3 }}>
                {isAdmin && (
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

                <Typography variant="h5">Specializzazioni utente dipartimento {meData?.me?.department}</Typography>
            </Stack>

            <Box sx={{ height: "78vh" }}>
                <EnhancedTable<typeof users[number]>
                    rows={users}
                    headCells={headCells}
                    actionsWidth="152px"
                    actions={
                        isAdmin
                            ? (user) =>
                                user.role === "TECHNICIAN" ? (
                                    <>
                                        <IconButton onClick={() => handleAddSpec(user)}>
                                            <ControlPointIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleRemoveSpec(user)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </>
                                ) : null
                            : undefined
                    }
                />
            </Box>

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