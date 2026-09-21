// lib/casl/defineAbility.ts
import { createPrismaAbility } from "@casl/prisma";
import type { PrismaAbility, Subjects } from "@casl/prisma";
import type { RawRuleOf } from "@casl/ability";
import type { AccessTokenPayload } from "@/lib/auth/jwt";

import { defineAbilityForTicket } from "./abilities/ticket/rules";
import { defineAbilityForUserManagement } from "./abilities/user/rules";
import { defineAbilityForCategory } from "./abilities/category/rules";
import { defineAbilityForTicketNotification } from "./abilities/ticket-notification/rules";
import { defineAbilityForStats } from "./abilities/stats/rules";
import { defineAbilityForTicketHistory } from "./abilities/ticket-history/rules";
import { defineAbilityForTicketScope } from "./abilities/ticket-scope/rules";

import type {
  TicketActions,
  TicketForAbility,
  TicketMessageForAbility,
} from "./abilities/ticket/types";
import type {
  UserManagementActions,
  UserForAbility,
} from "./abilities/user/types";
import type {
  CategoryActions,
  CategoryForAbility,
  TicketCategoryAccessForAbility,
} from "./abilities/category/types";
import type {
  TicketNotificationActions,
  TicketNotificationForAbility,
} from "./abilities/ticket-notification/types";
import type { StatsActions, StatsForAbility } from "./abilities/stats/types";
import type {
  TicketHistoryActions,
  TicketHistoryForAbility,
} from "./abilities/ticket-history/types";
import type {
  TicketScopeActions,
  TicketScopeForAbility,
} from "./abilities/ticket-scope/types";

/**
 * Unione di tutte le azioni dei domini. Un'unica ability applicativa le
 * contiene tutte; i subject restano disgiunti per nome, quindi comporre le
 * regole non altera l'esito dei check (stessa regola, stesso subject).
 */
export type AppActions =
  | TicketActions
  | UserManagementActions
  | CategoryActions
  | TicketNotificationActions
  | StatsActions
  | TicketHistoryActions
  | TicketScopeActions;

export type AppSubjects = Subjects<{
  Ticket: TicketForAbility;
  TicketMessage: TicketMessageForAbility;
  User: UserForAbility;
  TicketCategory: CategoryForAbility;
  TicketCategoryAccess: TicketCategoryAccessForAbility;
  TicketNotification: TicketNotificationForAbility;
  TicketStats: StatsForAbility;
  TicketHistory: TicketHistoryForAbility;
  TicketScope: TicketScopeForAbility;
}>;

export type AppAbility = PrismaAbility<[AppActions, AppSubjects]>;

/**
 * Punto unico di definizione dell'ability lato server.
 *
 * Compone, nello stesso ordine, le regole di tutti i domini. I domini non
 * condividono nomi di subject, quindi la concatenazione preserva esattamente
 * il comportamento delle singole ability (le regole di un dominio non possono
 * interferire con quelle di un altro).
 */
export function defineAbility(user: AccessTokenPayload): AppAbility {
  const rules = [
    ...defineAbilityForTicket(user).rules,
    ...defineAbilityForUserManagement(user).rules,
    ...defineAbilityForCategory(user).rules,
    ...defineAbilityForTicketNotification(user).rules,
    ...defineAbilityForStats(user).rules,
    ...defineAbilityForTicketHistory(user).rules,
    ...defineAbilityForTicketScope(user).rules,
  ] as unknown as RawRuleOf<AppAbility>[];

  // Rilevamento del subject type: in ordine,
  // 1. il tag "__caslSubjectType__" posto da subject(...) nei guard lato server;
  // 2. "__typename" degli oggetti GraphQL lato frontend;
  // 3. il nome del costruttore come fallback.
  // I check con subject stringa (regole incondizionate, accessibleBy) non
  // passano da qui.
  return createPrismaAbility<AppAbility>(rules, {
    detectSubjectType: ((subject) => {
      if (
        subject &&
        typeof subject === "object" &&
        "__caslSubjectType__" in subject &&
        typeof (subject as { __caslSubjectType__?: unknown }).__caslSubjectType__ ===
          "string"
      ) {
        return (subject as { __caslSubjectType__: string }).__caslSubjectType__;
      }
      return (
        (subject as { __typename?: string })?.__typename ??
        (subject as object)?.constructor?.name
      );
    }) as AppAbility["detectSubjectType"],
  });
}
