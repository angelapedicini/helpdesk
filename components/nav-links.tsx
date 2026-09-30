// components/nav-links.tsx
import DataObjectIcon from "@mui/icons-material/DataObject";
import type { NavLinkItem } from "./types/navlink";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import type { TicketScope } from "@/graphql-generated/schema";
import { toTicketScopeSubject } from "@/lib/casl/abilities/ticket-scope/guards";
import {
  isUnrestrictedCategoryManager,
  isDepartmentCategoryManager,
} from "@/lib/casl/abilities/category/guards";
import { defineAbility } from "@/lib/casl/defineAbility";

/**
 * Costruisce i link di navigazione visibili per la sessione corrente.
 *
 * La visibilità è derivata dalle stesse ability CASL usate per autorizzare
 * le rispettive query, così non esistono elenchi di ruoli duplicati.
 */
export function buildNavLinks(session: AccessTokenPayload): NavLinkItem[] {
  const ability = defineAbility(session);

  const canSeeScope = (scope: TicketScope) =>
    ability.can("read", toTicketScopeSubject(scope));

  const links: NavLinkItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <DataObjectIcon /> },
    { label: "Dashboard2", href: "/dashboard2", icon: <DataObjectIcon /> },
    { label: "Nuovo Ticket", href: "/categories", icon: <DataObjectIcon /> },
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

  if (ability.can("read", "User")) {
    links.push({
      label: "Utenti e specializzazioni",
      href: "/userCategory",
      icon: <DataObjectIcon />,
    });
  }

  if (
    isUnrestrictedCategoryManager(ability) ||
    isDepartmentCategoryManager(ability, session.department)
  ) {
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

  if (ability.can("read", "TicketStats")) {
    links.push({
      label: "Statistiche",
      href: "/stats",
      icon: <DataObjectIcon />,
    });
  }

  return links;
}