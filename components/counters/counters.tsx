// components/counters/counters.tsx
"use client";

import Link from "next/link";
import { Box, Card, CardActionArea, Stack, Typography } from "@mui/material";
import type { TicketAlertDef } from "@/components/enums/ticket-alert.config";

type AlertValue = {
    def: TicketAlertDef;
    value: number;
};

/**
 * Un gruppo è cliccabile in uno solo dei due modi.
 *
 * Sono due unioni e non prop opzionali: TypeScript rifiuta sia il caso in cui
 * passi entrambe le modalità sia quello in cui non ne passi nessuna, quindi
 * una card non può finire né link né pulsante.
 */
type CounterGroup =
    | {
          title?: string;
          alerts: AlertValue[];
          /** Dashboard: la card porta alla lista ticket già filtrata. */
          href: (def: TicketAlertDef) => string;
      }
    | {
          title?: string;
          alerts: AlertValue[];
          /** Pagina ticket: la card accende e spegne il filtro sul posto. */
          onToggle: (def: TicketAlertDef) => void;
          activeFilterKey?: string | null;
          disabled?: boolean;
      };

export type { AlertValue, CounterGroup };

/**
 * "column" = numero sopra, etichetta sotto: comodo in un pannello.
 * "row" = numero ed etichetta affiancati: comodo in una barra filtri.
 *
 * Con "column", su mobile (sotto md) le card diventano una lista verticale:
 * una per riga, a tutta larghezza, con numero ed etichetta affiancati.
 *
 * È un asse separato da size perché la dashboard usa "compact" anche a due
 * gruppi, e lì la card deve restare in colonna.
 */
type AlertLayout = "column" | "row";

function AlertCard({
    alert,
    size,
    layout,
    active,
    href,
    onToggle,
    disabled,
}: {
    alert: AlertValue;
    size: "regular" | "compact";
    layout: AlertLayout;
    active: boolean;
    href?: string;
    onToggle?: () => void;
    disabled?: boolean;
}) {
    const { def, value } = alert;
    const compact = size === "compact";
    const isRow = layout === "row";

    const boxSx = {
        // In compact su mobile il padding è ancora più stretto.
        p: compact ? { xs: 0.75, md: 1 } : 1.5,
        display: "flex",
        // In "row" resta sempre affiancato. In "column" lo è solo su mobile,
        // dove la card è una riga di lista; da md numero sopra, etichetta sotto.
        flexDirection: isRow ? "row" : { xs: "row", md: "column" },
        // Affiancati: baseline, così il numero grande non sembra sospeso sopra
        // il testo. In colonna: tutto a sinistra.
        alignItems: isRow ? "baseline" : { xs: "baseline", md: "flex-start" },
        // Il contenuto parte sempre dall'alto / da sinistra, mai centrato.
        justifyContent: "flex-start",
        minWidth: 0,
        gap: isRow ? 1 : { xs: 1.5, md: 0 },
    } as const;

    const content = (
        <>
            <Typography
                variant={compact ? "h5" : "h4"}
                sx={{
                    fontWeight: 600,
                    lineHeight: 1.1,
                    // In compact su mobile il numero è più piccolo.
                    fontSize: compact
                        ? isRow
                            ? "1.5rem"
                            : { xs: "1.25rem", md: "1.6rem" }
                        : undefined,
                    color: value > 0 && def.tone ? `${def.tone}.main` : value > 0 ? "text.primary" : "text.disabled",
                }}
            >
                {value}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    lineHeight: 1.2,
                    fontSize: compact ? { xs: "0.8125rem", md: "0.875rem" } : undefined,
                    // Mai a capo in riga: altrimenti una card diventa più
                    // alta delle altre.
                    whiteSpace: isRow ? "nowrap" : undefined,
                }}
            >
                {def.label}
            </Typography>
        </>
    );

    return (
        <Card
            variant="outlined"
            sx={{
                // Tetto all'altezza solo da md. Su mobile nessun tetto: la card
                // prende l'altezza del contenuto, quindi il testo non si taglia.
                maxHeight: { xs: "none", md: compact ? 90 : 120 },
                // Stato attivo: bordo e fondo colorati, così si distingue
                // dal semplice fatto che il valore sia diverso da zero.
                ...(active && {
                    borderColor: "primary.main",
                    borderWidth: 2,
                    bgcolor: "action.selected",
                }),
            }}
        >
            {href ? (
                <CardActionArea component={Link} href={href} sx={boxSx}>
                    {content}
                </CardActionArea>
            ) : onToggle ? (
                <CardActionArea onClick={onToggle} disabled={disabled} sx={boxSx}>
                    {content}
                </CardActionArea>
            ) : (
                <Box sx={boxSx}>{content}</Box>
            )}
        </Card>
    );
}

export default function Counters({
    groups,
    size,
    layout = "column",
}: {
    groups: CounterGroup[];
    /**
     * "regular" = numero h4 e padding largo: un pannello con un solo gruppo.
     * "compact" = 1.6rem e padding stretto: due gruppi, oppure una barra
     * filtri sopra una tabella.
     *
     * È esplicito e non derivato dal numero di gruppi perché la pagina ticket
     * ha un solo gruppo e lo vuole comunque piccolo.
     */
    size: "regular" | "compact";
    layout?: AlertLayout;
}) {
    const compact = size === "compact";

    return (
        <Stack spacing={compact ? 1 : 2}>
            {groups.map((g) => {
                const isToggle = "onToggle" in g;

                return (
                    <Box key={g.title ?? "alerts"}>
                        {g.title && (
                            <Typography
                                variant={compact ? "body2" : "subtitle1"}
                                component="h2"
                                sx={{ mb: compact ? 0.5 : 1.5, fontWeight: 600, lineHeight: 1.3 }}
                            >
                                {g.title}
                            </Typography>
                        )}

                        <Box
                            sx={{
                                display: "grid",
                                gap: compact ? { xs: 0.75, md: 1 } : 1.5,
                                alignContent: "start",
                                alignItems: "start",
                                gridTemplateColumns: {
                                    // Layout "column": una card per riga su mobile.
                                    // Layout "row" (barra filtri): resta a 2 colonne.
                                    xs: layout === "column" ? "minmax(0, 1fr)" : "repeat(2, minmax(0, 1fr))",
                                    md: `repeat(${g.alerts.length}, minmax(0, 1fr))`,
                                },
                            }}
                        >
                            {g.alerts.map((alert) => (
                                <AlertCard
                                    key={alert.def.key}
                                    alert={alert}
                                    size={size}
                                    layout={layout}
                                    active={isToggle && g.activeFilterKey === alert.def.filterKey}
                                    href={isToggle ? undefined : g.href(alert.def)}
                                    onToggle={isToggle ? () => g.onToggle(alert.def) : undefined}
                                    disabled={isToggle ? g.disabled : undefined}
                                />
                            ))}
                        </Box>
                    </Box>
                );
            })}
        </Stack>
    );
}