"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import type { SxProps, Theme } from "@mui/material/styles";

// -------------------------------------------------------------------------
// Hook interno di rilevamento overflow (non esportato, usato solo qui sotto)
// -------------------------------------------------------------------------
function useOverflowDetection<T extends HTMLElement>(
    ref: RefObject<T | null>,
    deps: React.DependencyList
) {
    const [isOverflowing, setIsOverflowing] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        const checkOverflow = () => {
            setIsOverflowing(el.scrollWidth > el.clientWidth);
        };

        checkOverflow();

        const resizeObserver = new ResizeObserver(checkOverflow);
        resizeObserver.observe(el);

        return () => resizeObserver.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return isOverflowing;
}

// -------------------------------------------------------------------------
// ExpandButton: pulsante "leggi tutto" condiviso tra TruncatedTooltip
// (trigger="click") e TruncatedTextField. Stile pieno per massima visibilità.
// -------------------------------------------------------------------------
function ExpandButton({
    onClick,
    size = "small",
    sx,
}: {
    onClick: (e: React.MouseEvent<HTMLElement>) => void;
    size?: "small" | "medium";
    sx?: SxProps<Theme>;
}) {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                width: 20,
                height: 20,
                p: 0,
                flexShrink: 0,
                color: "primary.contrastText",
                bgcolor: "primary.main",
                "&:hover": {
                    bgcolor: "primary.dark",
                },
                ...sx,
            }}
        >
            <ReadMoreIcon sx={{ fontSize: 14 }} />
        </IconButton>
    );
}

// -------------------------------------------------------------------------
// ExpandPopover: popover condiviso che mostra il contenuto completo.
// -------------------------------------------------------------------------
function ExpandPopover({
    anchorEl,
    onClose,
    content,
}: {
    anchorEl: HTMLElement | null;
    onClose: () => void;
    content: React.ReactNode;
}) {
    return (
        <Popover
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        >
            <Typography sx={{ p: 2, maxWidth: 400, whiteSpace: "pre-wrap" }}>
                {content}
            </Typography>
        </Popover>
    );
}

// -------------------------------------------------------------------------
// TruncatedTooltip: componente UNICO per testo troncabile, usato ovunque
// (header di tabella, celle dati, modali di dettaglio...).
//
// - trigger="hover" (default): mostra un Tooltip MUI al passaggio del mouse,
//   nessun pulsante. Pensato per gli header di tabella.
// - trigger="click": mostra un pulsante "espandi" (visibile solo se il testo
//   è troncato) che apre un Popover con il testo completo. Pensato per le
//   celle dati e per contenuti lunghi in generale (es. modali di dettaglio).
// -------------------------------------------------------------------------
interface TruncatedTooltipProps {
    content?: React.ReactNode;
    trigger?: "hover" | "click";
    onlyWhenOverflowing?: boolean;
    buttonSize?: "small" | "medium";
    children: React.ReactNode;
    sx?: SxProps<Theme>;
}

export function TruncatedTooltip({
    content,
    trigger = "hover",
    onlyWhenOverflowing = trigger === "click",
    buttonSize = "small",
    children,
    sx,
}: TruncatedTooltipProps) {
    const textRef = useRef<HTMLSpanElement>(null);
    const isOverflowing = useOverflowDetection(textRef, [children]);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const showTrigger = onlyWhenOverflowing ? isOverflowing : true;
    const tooltipContent = content ?? children;

    const textNode = (
        <Box
            ref={textRef}
            component="span"
            sx={{
                display: "block",
                minWidth: 0,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                ...sx,
            }}
        >
            {children}
        </Box>
    );

    if (trigger === "hover") {
        return showTrigger ? (
            <Tooltip title={tooltipContent} arrow>
                {textNode}
            </Tooltip>
        ) : (
            textNode
        );
    }

    return (
        <Box sx={{ display: "flex", alignItems: "center", minWidth: 0, gap: 0.5 }}>
            {textNode}

            {showTrigger && (
                <>
                    <ExpandButton
                        size={buttonSize}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                    />
                    <ExpandPopover
                        anchorEl={anchorEl}
                        onClose={() => setAnchorEl(null)}
                        content={tooltipContent}
                    />
                </>
            )}
        </Box>
    );
}

// -------------------------------------------------------------------------
// TruncatedTextField: come TextField, ma con icona "leggi tutto" cliccabile
// quando il valore è troncato. Uso: modali, form, celle con dati lunghi.
// Si usa esattamente come <TextField>, stesse props.
// -------------------------------------------------------------------------
interface TruncatedTextFieldProps extends Omit<TextFieldProps, "value"> {
    value: string;
}

export function TruncatedTextField({ value, ...props }: TruncatedTextFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const isOverflowing = useOverflowDetection(inputRef, [value]);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    return (
        <Box sx={{ position: "relative" }}>
            <TextField
                {...props}
                value={value}
                inputRef={inputRef}
                sx={{
                    ...(props.sx as object),
                    "& .MuiInputBase-input": { pr: isOverflowing ? 4 : undefined },
                }}
            />

            {isOverflowing && (
                <ExpandButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                        position: "absolute",
                        right: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                    }}
                />
            )}

            <ExpandPopover
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                content={value}
            />
        </Box>
    );
}