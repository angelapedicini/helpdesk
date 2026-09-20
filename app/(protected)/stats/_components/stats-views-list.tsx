"use client";

import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";

type Props = {
    views: ReadonlyArray<{ id: string; label: string }>;
    activeId: string;
    onSelect: (id: string) => void;
};

export default function StatsViewsList({
    views,
    activeId,
    onSelect,
}: Props) {
    return (
        <List component="nav" disablePadding>
            {views.map((view) => (
                <ListItemButton
                    key={view.id}
                    selected={view.id === activeId}
                    onClick={() => onSelect(view.id)}
                    sx={{ borderRadius: 1 }}
                >
                    <ListItemText primary={view.label} />
                </ListItemButton>
            ))}
        </List>
    );
}