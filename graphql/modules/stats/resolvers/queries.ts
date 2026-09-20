// modules/stats/resolvers/queries.ts
import { getPrisma } from "@/lib/prisma/index";
import { Department } from "@/app/generated/prisma/enums";
import { requireSession } from "@/lib/auth/session";
import { Prisma } from "@/app/generated/prisma/client";
import { GraphQLError } from "graphql/error";
import { defineAbility } from "@/lib/casl/defineAbility";

export const statQueries = {
  ticketStatsByDepartment: async (
    _parent: unknown,
    args: { department?: Department }
  ) => {
    const session = await requireSession();
    const ability = defineAbility(session);
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
      firstResponseLate: bigint;
      dueDateLate: bigint;
      closedOnTime: bigint;
      openAssignedLate: bigint;
      average: number | null;
    } []
      > `
    WITH first_response AS (
      SELECT DISTINCT ON (h."originalTicketId")
        h."originalTicketId",
        h."dueFirstResponse",
        h."updatedAt" AS "firstResponseAt"
      FROM "TicketHistory" h
      WHERE h.status NOT IN ('OPEN', 'ASSIGNED')
      ORDER BY
        h."originalTicketId",
        h."updatedAt"
    )

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

      -- Prima risposta oltre la scadenza
      COUNT(*) FILTER (
        WHERE fr."dueFirstResponse" IS NOT NULL
          AND fr."firstResponseAt" > fr."dueFirstResponse"
      ) AS "firstResponseLate",

      -- Chiusura oltre la dueDate
      COUNT(*) FILTER (
        WHERE t.status = 'CLOSED'
          AND t."dueDate" IS NOT NULL
          AND t."closedAt" IS NOT NULL
          AND t."closedAt" > t."dueDate"
      ) AS "dueDateLate",

      -- Chiusura entro la dueDate
      COUNT(*) FILTER (
        WHERE t.status = 'CLOSED'
          AND t."dueDate" IS NOT NULL
          AND t."closedAt" IS NOT NULL
          AND t."closedAt" <= t."dueDate"
      ) AS "closedOnTime",

      -- OPEN/ASSIGNED oltre la prima risposta (in attesa da tempo)
      COUNT(*) FILTER (
        WHERE t.status IN ('OPEN', 'ASSIGNED')
          AND t."dueFirstResponse" < NOW()
      ) AS "openAssignedLate",

      -- Tempo medio di chiusura in ore
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

    LEFT JOIN first_response fr
      ON fr."originalTicketId" = t.id

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
      firstResponseLate: Number(r.firstResponseLate),
      dueDateLate: Number(r.dueDateLate),
      closedOnTime: Number(r.closedOnTime),
      openAssignedLate: Number(r.openAssignedLate),
      average: r.average ?? 0,
    }));
  },

  ticketStatsByTechnician: async (
    _parent: unknown,
    args: { department?: Department }
  ) => {
    const session = await requireSession();
    const ability = defineAbility(session);
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
      technicianId: string;
      label: string;
      total: bigint;
      open: bigint;
      assigned: bigint;
      inProgress: bigint;
      closed: bigint;
      refused: bigint;
      firstResponseLate: bigint;
      dueDateLate: bigint;
      average: number | null;
    } []
      > `
    WITH first_response AS (
      SELECT
        h."originalTicketId",
        h."assignedToId",
        h."dueFirstResponse",
        h."updatedAt" AS "firstResponseAt",
        ROW_NUMBER() OVER (
          PARTITION BY h."originalTicketId", h."assignedToId"
          ORDER BY h."updatedAt"
        ) AS rn
      FROM "TicketHistory" h
      WHERE h."assignedToId" IS NOT NULL
        AND h.status NOT IN ('OPEN', 'ASSIGNED')
    ),
    fr_agg AS (
      SELECT
        fr."assignedToId" AS "techId",
        COUNT(*) AS "lateFirstResponseCount"
      FROM first_response fr
      WHERE fr.rn = 1
        AND fr."dueFirstResponse" IS NOT NULL
        AND fr."firstResponseAt" > fr."dueFirstResponse"
      GROUP BY fr."assignedToId"
    )

    SELECT
      u.id AS "technicianId",
      u."firstName",
      u."lastName",
      u.email,
      CONCAT(u."lastName", ' ', u."firstName") AS label,
      COUNT(t.id) AS total,

      COUNT(t.id) FILTER (
        WHERE t.status = 'OPEN'
      ) AS open,

      COUNT(t.id) FILTER (
        WHERE t.status = 'ASSIGNED'
      ) AS assigned,

      COUNT(t.id) FILTER (
        WHERE t.status = 'IN_PROGRESS'
      ) AS "inProgress",

      COUNT(t.id) FILTER (
        WHERE t.status = 'CLOSED'
      ) AS closed,

      COUNT(t.id) FILTER (
        WHERE t.status = 'REFUSED'
      ) AS refused,

      COUNT(t.id) FILTER (
        WHERE t.status = 'CLOSED'
          AND t."dueDate" IS NOT NULL
          AND t."closedAt" IS NOT NULL
          AND t."closedAt" > t."dueDate"
      ) AS "dueDateLate",

      COALESCE(
        fr."lateFirstResponseCount",
        0
      ) AS "firstResponseLate",

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

    FROM "User" u

    LEFT JOIN "Ticket" t
      ON t."assignedToId" = u.id

    LEFT JOIN fr_agg fr
      ON fr."techId" = u.id

    WHERE u.role = 'TECHNICIAN'
      ${departmentFilter ? Prisma.sql`AND u."department" = ${departmentFilter}::"Department"` : Prisma.empty}

    GROUP BY
      u.id,
      u."firstName",
      u."lastName",
      u.email,
      fr."lateFirstResponseCount"

    ORDER BY total DESC
  `;

    return rows.map((r) => ({
      technicianId: String(r.technicianId),
      label: r.label,
      total: Number(r.total),
      open: Number(r.open),
      assigned: Number(r.assigned),
      inProgress: Number(r.inProgress),
      closed: Number(r.closed),
      refused: Number(r.refused),
      firstResponseLate: Number(r.firstResponseLate),
      dueDateLate: Number(r.dueDateLate),
      average: r.average ?? 0,
    }));
  },
};
