import type { PrismaAbility, PrismaQuery, Subjects as PrismaSubjects } from "@casl/prisma";
import type { Ticket } from "@/app/generated/prisma/client";

export type Actions = "create" | "read" | "update" | "delete";
export type Subjects = PrismaSubjects<{ Ticket: Ticket }>;
export type AppAbility = PrismaAbility<[Actions, Subjects]>;