// modules/stats/resolvers/queries.ts
import { getPrisma } from "@/lib/prisma/index";
import { Department } from "@/app/generated/prisma/enums";
import { requireSession } from "@/lib/auth/session";
import { Prisma } from "@/app/generated/prisma/client";
import { GraphQLError } from "graphql/error";
import { defineAbilityForStats } from "@/lib/casl/abilities/stats/rules";

export const statQueries = {
  ticketStatsByDepartment: async (
    _parent: unknown,
    args: { department?: Department }
  ) => {
    const session = await requireSession();
    const ability = defineAbilityForStats(session);
    const prisma = await getPrisma();

    if (ability.cannot("read", "TicketStats")) {
      throw new GraphQLError("Accesso negato", {
        extensions: { code: "FORBIDDEN" },
      });
    }

    // SYSTEM_ADMIN (readAll) può filtrare su qualsiasi dipartimento;
    // ADMIN è vincolato al proprio dipartimento.
    const departmentFilter = ability.can("readAll", "TicketStats")
      ? args.department
      : session.department;

    const rows = await prisma.$queryRaw<
    {
      department: Department;
      total: bigint;
      open: bigint;
      assigned: bigint;
      inProgress: bigint;
      closed: bigint;
      refused: bigint;
      average: number | null;
    } []
      > `
    SELECT
      t."ticketDepartment" AS department,

      COUNT(*) AS total,

      COUNT(*) FILTER (
        WHERE t.status = 'OPEN'
      ) AS open,

      COUNT(*) FILTER (
        WHERE t.status = 'ASSIGNED'
      ) AS assigned,

      COUNT(*) FILTER (
        WHERE t.status = 'IN_PROGRESS'
      ) AS "inProgress",

      COUNT(*) FILTER (
        WHERE t.status = 'CLOSED'
      ) AS closed,

      COUNT(*) FILTER (
        WHERE t.status = 'REFUSED'
      ) AS refused,

      COALESCE(
        AVG(
          EXTRACT(
            EPOCH FROM (t."closedAt" - t."createdAt")
          ) / 3600
        ) FILTER (
          WHERE t.status = 'CLOSED'
            AND t."closedAt" IS NOT NULL
        ),
        0
      ) AS average

    FROM "Ticket" t

    WHERE 1=1
      ${departmentFilter ? Prisma.sql`AND t."ticketDepartment" = ${departmentFilter}::"Department"` : Prisma.empty}

    GROUP BY t."ticketDepartment"

    ORDER BY t."ticketDepartment"
  `;

    return rows.map((r) => ({
      department: r.department,
      total: Number(r.total),
      open: Number(r.open),
      assigned: Number(r.assigned),
      inProgress: Number(r.inProgress),
      closed: Number(r.closed),
      refused: Number(r.refused),
      average: r.average ?? 0,
    }));
  },
};
