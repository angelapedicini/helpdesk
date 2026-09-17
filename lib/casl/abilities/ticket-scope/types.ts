import type { PrismaAbility, Subjects } from "@casl/prisma";
import type { TicketScope } from "@/graphql-generated/schema";

export type TicketScopeActions = "read";

export type TicketScopeForAbility = {
  scope: TicketScope;
};

export type TicketScopeSubjects = Subjects<{
  TicketScope: TicketScopeForAbility;
}>;

export type TicketScopeAbility = PrismaAbility<
  [TicketScopeActions, TicketScopeSubjects]
>;