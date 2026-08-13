"use client";
import { useState } from "react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { ME_QUERY } from "@/apollo-client/queries/user/me";
import { LOGOUT } from "@/apollo-client/queries/auth/logout/logout.mutation";

export default function NavUser() {
  const { data, loading } = useQuery(ME_QUERY);
  const client = useApolloClient();
  const router = useRouter();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);

  const [logout] = useMutation(LOGOUT);

  if (loading) return null;
  const user = data?.me;
  if (!user) return null;

  const handleLogout = async () => {
    const result = await logout({});

    if (result.data?.logout.success) {
      await client.clearStore(); // pulisce "me" e tutto il resto dalla cache Apollo
      router.replace("/login");
    }
  };

  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
      >
        <Typography variant="body2" className="hidden md:block">
          {user.firstName} {user.lastName}
        </Typography>
        <Chip label={user.role} size="small" color="primary" />
        <IconButton color="inherit" size="small">
          <AccountCircleIcon />
        </IconButton>
      </Box>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        <MenuItem disabled className="block md:hidden">
          <Typography variant="body2">{user.firstName} {user.lastName}</Typography>
        </MenuItem>
        <Divider className="block md:hidden" />
        <MenuItem onClick={handleLogout}>
          <Typography variant="body2">Logout</Typography>
        </MenuItem>
      </Menu>
    </>
  );
}