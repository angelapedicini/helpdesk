"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    Box,
    Button,
    List,
    ListItemButton,
    ListItemText,
    Typography,
} from "@mui/material";
import { REMOVE_USER_SPECIALIZATION } from "@/apollo-client/queries/user-specialization/user-specilization.mutation";

type Specialization = {
    id: number;
    name: string;
};

type RemoveUserSpecializationFormProps = {
    userId: number;
    fullName: string;
    specializations: Specialization[];
    onSubmit: () => void;
};

export default function RemoveUserSpecializationForm({
    userId,
    fullName,
    specializations,
    onSubmit,
}: RemoveUserSpecializationFormProps) {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    const [removeUserSpecialization, { loading }] = useMutation(REMOVE_USER_SPECIALIZATION, {
        context: {
            successMessage: "Specializzazione rimossa con successo.",
        },
        refetchQueries: ["UsersByDepartment"],
        awaitRefetchQueries: true,
    });

    const handleSave = async () => {
        if (selectedId === null) return;

        const result = await removeUserSpecialization({
            variables: {
                input: { userId, categoryId: selectedId },
            },
        });

        if (result.error) {
            return;
        }

        onSubmit();
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                {fullName}
            </Typography>

            {specializations.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Nessuna specializzazione assegnata.
                </Typography>
            ) : (
                <List disablePadding sx={{ mb: 2 }}>
                    {specializations.map((spec) => (
                        <ListItemButton
                            key={spec.id}
                            selected={selectedId === spec.id}
                            onClick={() => setSelectedId(spec.id)}
                        >
                            <ListItemText primary={spec.name} />
                        </ListItemButton>
                    ))}
                </List>
            )}

            <Button
                variant="contained"
                color="error"
                fullWidth
                disabled={selectedId === null || loading}
                onClick={handleSave}
            >
                Salva
            </Button>
        </Box>
    );
}