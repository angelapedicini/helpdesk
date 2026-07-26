"use client";

import { useAppQuery } from "@/lib/apollo-client/hooks/query-hook";
import { useModalState } from "@/components/hooks/use-modal-state";
import { useAppMutation } from "@/lib/apollo-client/hooks/mutation-hook";
import { DELETE_ITEM } from "@/lib/apollo-client/queries/item/item.mutations";
import { GET_ITEMS } from "@/lib/apollo-client/queries/item/item.queries";
import Modal from "@/components/modal";
import { ItemForm } from "@/components/forms/item/item-form";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import SureForm from "@/components/forms/sure-form";

export default function Page() {
  const { data: items = [] } = useAppQuery(GET_ITEMS);

  const itemModal = useModalState<(typeof items)[number]>();
  const deleteModal = useModalState<(typeof items)[number]>();

  const { mutate: deleteItem, loading: deleting } = useAppMutation(
    DELETE_ITEM,
    "Elemento eliminato con successo.",
    GET_ITEMS,
    "remove"
  );

  const handleConfirmDelete = async () => {
    if (!deleteModal.value) return;

    const result = await deleteItem({ id: deleteModal.value.id });

    if (result.data && !result.error) {
      deleteModal.close();
    }
  };

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", minHeight: "100vh" }}>
      <Container maxWidth="md" sx={{ mt: 5 }}>
        <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4">Items</Typography>
          <Button onClick={itemModal.openEmpty}>Nuovo Item</Button>
        </Stack>

        {items.length === 0 && (
          <Typography color="text.secondary">Nessun elemento trovato.</Typography>
        )}

        <Stack sx={{ gap: "12px" }}>
          {items.map((item) => (
            <Card key={item.id}>
              <CardContent>
                <Typography variant="h6">{item.string}</Typography>
                <Typography color="text.secondary">
                  {item.user.firstName} {item.user.lastName}
                </Typography>
                <Typography sx={{ mt: 1 }}>Numero: {item.numberDecimal}</Typography>
                
                <Typography sx={{ mt: 1 }}>
                  Data: {new Date(item.data).toLocaleDateString("it-IT")}
                </Typography>
                {item.optionalEasy && <Typography>Testo: {item.optionalEasy}</Typography>}
                <Chip label={item.enum} color="primary" sx={{ mt: 2 }} />

                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  <Button size="small" onClick={() => itemModal.open(item)}>
                    Modifica
                  </Button>
                  <Button size="small" color="error" onClick={() => deleteModal.open(item)}>
                    Elimina
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>

        <Modal
          title={itemModal.value ? "Modifica Item" : "Nuovo Item"}
          isOpen={itemModal.isOpen}
          onClose={itemModal.close}
        >
          <ItemForm item={itemModal.value ?? undefined} onSuccess={itemModal.close} />
        </Modal>

        <Modal title="Conferma eliminazione" isOpen={deleteModal.isOpen} onClose={deleteModal.close}>
          <SureForm
            testo="eliminare"
            onConfirm={handleConfirmDelete}
            onCancel={deleteModal.close}
          />
        </Modal>
      </Container>
    </Box>
  );
}