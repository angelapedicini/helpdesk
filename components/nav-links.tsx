// components/nav-links.tsx
import DataObjectIcon from "@mui/icons-material/DataObject";
import type { NavLinkItem } from "./types/navlink";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type { TicketScope } from "@/graphql-generated/schema";
import { defineAbilityForTicketScope } from "@/lib/casl/abilities/ticket-scope/rules";
import { toTicketScopeSubject } from "@/lib/casl/abilities/ticket-scope/guards";
import { defineAbilityForUserManagement } from "@/lib/casl/abilities/user/rules";
import { defineAbilityForCategory } from "@/lib/casl/abilities/category/rules";
import { defineAbilityForStats } from "@/lib/casl/abilities/stats/rules";

/**
 * Costruisce i link di navigazione visibili per la sessione corrente.
 *
 * La visibilità è derivata dalle stesse ability CASL usate per autorizzare
 * le rispettive query, così non esistono elenchi di ruoli duplicati.
 */
export function buildNavLinks(session: AccessTokenPayload): NavLinkItem[] {
  const scopeAbility = defineAbilityForTicketScope(session);
  const userAbility = defineAbilityForUserManagement(session);
  const categoryAbility = defineAbilityForCategory(session);
  const statsAbility = defineAbilityForStats(session);

  const canSeeScope = (scope: TicketScope) =>
    scopeAbility.can("read", toTicketScopeSubject(scope));

  const links: NavLinkItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <DataObjectIcon /> },
    {
      label: "I miei ticket",
      href: "/tickets?scope=mine",
      icon: <DataObjectIcon />,
    },
  ];

  if (canSeeScope("ASSIGNED_TO_ME")) {
    links.push({
      label: "Ticket assegnati a me",
      href: "/tickets?scope=assigned_to_me",
      icon: <DataObjectIcon />,
    });
  }

  if (canSeeScope("DEPARTMENT")) {
    links.push({
      label: "Ticket del dipartimento",
      href: "/tickets?scope=department",
      icon: <DataObjectIcon />,
    });
  }

  if (canSeeScope("ALL")) {
    links.push({
      label: "Tutti i ticket",
      href: "/tickets?scope=all",
      icon: <DataObjectIcon />,
    });
  }

  if (userAbility.can("read", "User")) {
    links.push({
      label: "Utenti e specializzazioni",
      href: "/userCategory",
      icon: <DataObjectIcon />,
    });
  }

  if (categoryAbility.can("manage", "TicketCategory")) {
    links.push({
      label: "Categorie e accessi",
      href: "/categoryManagement",
      icon: <DataObjectIcon />,
    });
  }

  links.push({
    label: "I miei ticket cancellati",
    href: "/tickets-deleted?scope=mine",
    icon: <DataObjectIcon />,
  });

  if (canSeeScope("ASSIGNED_TO_ME")) {
    links.push({
      label: "Ticket assegnati a me cancellati",
      href: "/tickets-deleted?scope=assigned_to_me",
      icon: <DataObjectIcon />,
    });
  }

  if (canSeeScope("DEPARTMENT")) {
    links.push({
      label: "Ticket del dipartimento cancellati",
      href: "/tickets-deleted?scope=department",
      icon: <DataObjectIcon />,
    });
  }

  if (statsAbility.can("read", "TicketStats")) {
    links.push({
      label: "Statistiche",
      href: "/stats",
      icon: <DataObjectIcon />,
    });
  }

  return links;
}