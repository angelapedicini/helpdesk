import type { PrismaAbility, Subjects } from "@casl/prisma";
import type { Department } from "@/app/generated/prisma/enums";

export type StatsActions = "read" | "readAll";

export type StatsForAbility = {
  department: Department;
};

export type StatsSubjects = Subjects<{
  TicketStats: StatsForAbility;
}>;

export type StatsAbility = PrismaAbility<[StatsActions, StatsSubjects]>;