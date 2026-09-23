"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
    Box,
    Button,
    FormControl,
    FormHelperText,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
} from "@mui/material";
import { skipToken, useQuery, useMutation, useApolloClient } from "@apollo/client/react";
import { Department } from "@/graphql-generated/graphql";
import { EasyLogin, EasyLoginDep, EasyLoginDepSchema, EasyLoginSchema } from "@/lib/validators/auth.schema";
import { GET_USERS_BY_DEP_FOR_LOGIN } from "@/apollo-client/queries/user/user-queries";
import { DepartmentEnum } from "@/lib/validators/enums.schema";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { LOGIN } from "@/apollo-client/queries/auth/login/login.mutation";
import { ROLE_CONFIG } from "@/components/enums/role.config";

interface EasyLoginFormProps {
    defaultDepartment?: Department;
    defaultEmail?: string;
}

export default function EasyLoginForm({ defaultDepartment, defaultEmail }: EasyLoginFormProps) {
    const router = useRouter();

    const [selectedDepartment, setSelectedDepartment] = useState<Department | undefined>(
        defaultDepartment
    );

    const {
        control: depControl,
        watch: watchDep,
        formState: { errors: depErrors },
    } = useForm<EasyLoginDep>({
        resolver: zodResolver(EasyLoginDepSchema),
        mode: "onChange",
        defaultValues: { department: defaultDepartment },
    });

    const departmentValue = watchDep("department");

    useEffect(() => {
        setSelectedDepartment(departmentValue as Department | undefined);
    }, [departmentValue]);

    const { data: usersData, loading: usersLoading } = useQuery(
        GET_USERS_BY_DEP_FOR_LOGIN,
        selectedDepartment ? { variables: { department: selectedDepartment } } : skipToken
    );

    const userOptions = useMemo(
        () => usersData?.usersByDepForLogin ?? [],
        [usersData]
    );

    const {
        control: loginControl,
        handleSubmit,
        setValue: setLoginValue,
        formState: { errors: loginErrors },
    } = useForm<EasyLogin>({
        resolver: zodResolver(EasyLoginSchema),
        mode: "onChange",
        defaultValues: { email: defaultEmail },
    });

    useEffect(() => {
        if (userOptions.length > 0) {
            const isDefaultUserInList =
                !!defaultEmail && userOptions.some((u) => u.email === defaultEmail);
            setLoginValue(
                "email",
                isDefaultUserInList ? defaultEmail! : userOptions[0].email,
                { shouldValidate: true }
            );
        } else {
            setLoginValue("email", undefined as unknown as string, { shouldValidate: true });
        }
    }, [userOptions, setLoginValue, defaultEmail]);

    const client = useApolloClient();

    const [login] = useMutation(LOGIN, {
        onCompleted: async () => {
            await client.clearStore();

            await client.refetchQueries({
                include: "active", // solo le query montate sulla pagina corrente
            });

            router.refresh();
        },
    });

    const handleLoginSubmit = (values: EasyLogin) => {
        login({ variables: { input: { email: values.email } } });
    };

    return (
        <Box
            component="form"
            onSubmit={handleSubmit(handleLoginSubmit)}
            noValidate
            sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1.5,
            }}
        >
            <IconButton color="inherit" size="small">
                <AccountCircleIcon />
            </IconButton>

{/* Step 1: Department */}
            <Controller
                name="department"
                control={depControl}
                render={({ field }) => (
                    <FormControl size="small" error={!!depErrors.department} sx={{ minWidth: 110 }}>
                        <InputLabel id="department-select-label" className="navbar-input">Dipartimento</InputLabel>
                        <Select
                            {...field}
                            className="navbar-input"
                            labelId="department-select-label"
                            label="Dipartimento"
                            value={field.value ?? ""}
                        >
                            {DepartmentEnum.options.map((dep) => (
                                <MenuItem key={dep} value={dep}>
                                    {dep}
                                </MenuItem>
                            ))}
                        </Select>
                        {depErrors.department && (
                            <FormHelperText>{depErrors.department.message}</FormHelperText>
                        )}
                    </FormControl>
                )}
            />

            {/* Step 2: Utente */}
            <Controller
                name="email"
                control={loginControl}
                render={({ field }) => {
                    const safeEmailValue = userOptions.some((u) => u.email === field.value)
                        ? field.value
                        : "";

                    return (
                        <FormControl
                            size="small"
                            error={!!loginErrors.email}
                            disabled={!selectedDepartment || usersLoading || userOptions.length === 0}
                            sx={{ minWidth: 300 }}
                        >
                            <InputLabel id="user-select-label" className="navbar-input">Utente</InputLabel>
                            <Select
                                {...field}
                                className="navbar-input"
                                labelId="user-select-label"
                                label="Utente"
                                value={safeEmailValue}
                            >
                                {userOptions.map((u) => (
                                    <MenuItem key={u.id} value={u.email}>
                                        {u.firstName} {u.lastName} — {ROLE_CONFIG[u.role].label}
                                    </MenuItem>
                                ))}
                            </Select>
                            {loginErrors.email && (
                                <FormHelperText>{loginErrors.email.message}</FormHelperText>
                            )}
                        </FormControl>
                    );
                }}
            />

            <Button
                type="submit"
                variant="contained"
                size="small"
                className="navbar-button"
                disabled={!selectedDepartment || userOptions.length === 0}
            >
                Accedi
            </Button>
        </Box>
    );
}