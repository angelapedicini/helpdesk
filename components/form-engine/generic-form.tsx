// "use client";

// import { useForm, Resolver, FieldValues, Path } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import Button from "@mui/material/Button";
// import Box from "@mui/material/Box";
// import { FormConfig } from "./types";
// import { renderField } from "./field-renderers";
// import { BaseItem } from "../types/common";
// import { useFilterPanel } from "@/app/components/filter-panel";

// type Props<TInput extends FieldValues, TResponse extends BaseItem> = {
//   config: FormConfig<TInput, TResponse>;
//   onCancel?: () => void;
//   initialData?: TResponse;
//   role?: string;
// };

// export default function GenericForm
//   TInput extends FieldValues,
//   TResponse extends BaseItem,
// >({ config, onCancel, initialData, role }: Props<TInput, TResponse>) {
//   const isEdit = !!initialData;
//   const queryClient = useQueryClient();
//   const { onClose: closeFilterPanel } = useFilterPanel();

//   const {
//     handleSubmit,
//     reset,
//     control,
//     register,
//     formState: { errors, isDirty },
//   } = useForm<TInput>({
//     resolver: zodResolver(config.schema) as Resolver<TInput>,
//     values:
//       initialData && config.mode === "form"
//         ? config.mapToForm(initialData)
//         : config.defaultValues,
//   });

//   const createMutation = useMutation({
//     mutationFn: (data: TInput) => {
//       if (config.mode !== "form" || !config.apiPost) {
//         return Promise.resolve({} as TResponse);
//       }
//       return config.apiPost(data);
//     },
//     onSuccess: (created) => {
//       queryClient.setQueryData<TResponse[]>([config.queryKey], (old = []) => [
//         created,
//         ...old,
//       ]);
//     },
//   });

//   const updateMutation = useMutation({
//     mutationFn: (data: TInput) => {
//       if (config.mode !== "form" || !config.apiPatch) {
//         return Promise.resolve({} as TResponse);
//       }
//       return config.apiPatch(initialData!.id, data);
//     },
//     onSuccess: (updated) => {
//       queryClient.setQueryData<TResponse[]>([config.queryKey], (old = []) =>
//         old.map((c) => (c.id === updated.id ? updated : c)),
//       );
//     },
//   });

//   async function onSubmit(data: TInput) {
//     if (config.mode === "filter") {
//       const results = await config.fetchFn(data);
//       queryClient.setQueryData([config.queryKey], results);
//       closeFilterPanel();
//       return;
//     }

//     if (isEdit && !isDirty) {
//       onCancel?.();
//       return;
//     }

//     if (isEdit && !config.apiPatch) {
//       console.error("apiPatch mancante per questo form in edit mode");
//       return;
//     }
//     if (!isEdit && !config.apiPost) {
//       console.error("apiPost mancante per questo form in create mode");
//       return;
//     }

//     try {
//       if (isEdit) {
//         await updateMutation.mutateAsync(data);
//       } else {
//         await createMutation.mutateAsync(data);
//       }
//     } catch {
//       return;
//     }
//     reset();
//     onCancel?.();
//   }

//   const visibleFields = config.fields.filter(
//     (f) => (!f.onlyEdit || isEdit) && (!f.visibleFor || f.visibleFor(role)),
//   );

//   return (
//     <Box
//       component="form"
//       onSubmit={handleSubmit(onSubmit)}
//       sx={{ display: "flex", flexDirection: "column", gap: 2, paddingTop: 2 }}
//     >
//       {visibleFields.map((def) => (
//         <Box key={def.name}>
//           {renderField<TInput>(def, { control, register, errors })}
//         </Box>
//       ))}

//       <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
//         {config.mode === "filter" ? (
//           <>
//             <Button
//               variant="outlined"
//               onClick={async () => {
//                 reset();
//                 const results = await config.fetchFn(config.defaultValues);
//                 queryClient.setQueryData([config.queryKey], results);
//                 closeFilterPanel();
//               }}
//             >
//               Reset
//             </Button>
//             <Button type="submit" variant="contained">
//               Cerca
//             </Button>
//           </>
//         ) : (
//           <>
//             <Button
//               variant="outlined"
//               onClick={() => {
//                 reset();
//                 onCancel?.();
//               }}
//             >
//               Annulla
//             </Button>
//             <Button type="submit" variant="contained">
//               {isEdit ? "Salva modifiche" : "Crea"}
//             </Button>
//           </>
//         )}
//       </Box>
//     </Box>
//   );
// }