"use client";

import { useEffect, useLayoutEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Box, Stack, Typography, Paper } from "@mui/material";
import type { TicketMessage } from "@/apollo-client/queries/ticket-message/ticket-message.queries";

const PARTICIPANT_COLORS = [
    "#1976d2", // blu
    "#9c27b0", // viola
    "#2e7d32", // verde
    "#ed6c02", // arancione
    "#c2185b", // rosa
];

function getColorForAuthor(authorId: number): string {
    const index = authorId % PARTICIPANT_COLORS.length;
    return PARTICIPANT_COLORS[index];
}

const SCROLL_THRESHOLD_PX = 100;

export interface TicketMessageThreadHandle {
    scrollToBottom: (behavior?: ScrollBehavior) => void;
}

interface TicketMessageThreadProps {
    messages: TicketMessage[];
    myId?: number;
    hasNextPage?: boolean;
    onLoadMore?: () => void;
}

const TicketMessageThread = forwardRef<TicketMessageThreadHandle, TicketMessageThreadProps>(
    function TicketMessageThread({ messages, myId, hasNextPage = false, onLoadMore }, ref) {
        const containerRef = useRef<HTMLDivElement>(null);
        const loadingLockRef = useRef(false);

        const prevFirstIdRef = useRef<number | undefined>(undefined);
        const prevLastIdRef = useRef<number | undefined>(undefined);
        const prevScrollHeightRef = useRef(0);

        // flag impostato dal parent prima di un refetch che deve
        // forzare lo scroll in fondo, a prescindere da cosa succede agli id
        const forceScrollBottomRef = useRef(false);

        useImperativeHandle(ref, () => ({
            scrollToBottom: (behavior: ScrollBehavior = "smooth") => {
                forceScrollBottomRef.current = true;
                const container = containerRef.current;
                if (container) {
                    // se il layout effect non scatta (nessun cambio di id in arrivo)
                    // eseguiamo comunque uno scroll immediato come fallback
                    container.scrollTo({ top: container.scrollHeight, behavior });
                }
            },
        }));

        // --------------------------------
        // LOCK RESET
        // --------------------------------

        useEffect(() => {
            loadingLockRef.current = false;
        }, [messages.length, hasNextPage]);

        const requestLoadMore = () => {
            if (!hasNextPage || !onLoadMore || loadingLockRef.current) {
                return;
            }
            loadingLockRef.current = true;

            const container = containerRef.current;
            if (container) {
                prevScrollHeightRef.current = container.scrollHeight;
            }

            onLoadMore();
        };

        // --------------------------------
        // SCROLL HANDLER — trigger vicino alla cima
        // --------------------------------

        const handleScroll = () => {
            const container = containerRef.current;
            if (!container) {
                return;
            }

            if (container.scrollTop <= SCROLL_THRESHOLD_PX) {
                requestLoadMore();
            }
        };

        useEffect(() => {
            const container = containerRef.current;
            if (!container) {
                return;
            }

            if (container.scrollHeight <= container.clientHeight) {
                requestLoadMore();
            }
        }, [messages, hasNextPage]);

        // --------------------------------
        // POSIZIONE SCROLL DOPO UPDATE
        // --------------------------------

        useLayoutEffect(() => {
            const container = containerRef.current;
            if (!container) {
                return;
            }

            const firstId = messages[0]?.id;
            const lastId = messages[messages.length - 1]?.id;

            if (forceScrollBottomRef.current) {
                container.scrollTop = container.scrollHeight;
                forceScrollBottomRef.current = false;
                prevFirstIdRef.current = firstId;
                prevLastIdRef.current = lastId;
                return;
            }

            const isPrepend =
                prevFirstIdRef.current !== undefined &&
                firstId !== prevFirstIdRef.current &&
                lastId === prevLastIdRef.current;

            const isAppend =
                prevLastIdRef.current !== undefined &&
                lastId !== prevLastIdRef.current &&
                firstId === prevFirstIdRef.current;

            if (isPrepend) {
                const delta = container.scrollHeight - prevScrollHeightRef.current;
                container.scrollTop = container.scrollTop + delta;
            } else if (isAppend || prevFirstIdRef.current === undefined) {
                container.scrollTop = container.scrollHeight;
            }

            prevFirstIdRef.current = firstId;
            prevLastIdRef.current = lastId;
        }, [messages]);

        return (
            <Box
                ref={containerRef}
                onScroll={handleScroll}
                sx={{
                    height: "100%",
                    overflowY: "auto",
                    pr: 1,
                }}
            >
                <Stack spacing={1.5}>
                    {messages.map((message) => {
                        const isMine = message.author.id === myId;
                        const color = isMine ? undefined : getColorForAuthor(message.author.id);

                        return (
                            <Box
                                key={message.id}
                                sx={{
                                    display: "flex",
                                    justifyContent: isMine ? "flex-end" : "flex-start",
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        maxWidth: "70%",
                                        p: 1.5,
                                    }}
                                >
                                    <Typography
                                        variant="subtitle2"
                                        sx={{ color: isMine ? "primary.dark" : color }}
                                    >
                                        {message.author.firstName} {message.author.lastName}
                                        <Typography
                                            component="span"
                                            variant="caption"
                                            sx={{ ml: 1, color: "text.secondary" }}
                                        >
                                            {new Date(message.createdAt).toLocaleString()}
                                        </Typography>
                                    </Typography>

                                    <Typography variant="body2">{message.content}</Typography>
                                </Paper>
                            </Box>
                        );
                    })}
                </Stack>
            </Box>
        );
    }
);

export default TicketMessageThread;