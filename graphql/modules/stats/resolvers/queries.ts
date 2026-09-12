// modules/ticket-stats/resolvers/queries.ts
import { getPrisma } from "@/lib/prisma/index";
import { requireSession } from "@/lib/auth/session";
import { Department } from "@/app/generated/prisma/enums";
import { Prisma } from "@/app/generated/prisma/client";

export const statQueries = {
  ticketStatsByDepartment: async (
    _parent: unknown,
    args: { dateRange?: { from?: Date; to?: Date } }
  ) => {
    const session = await requireSession();
    const prisma = await getPrisma();

    // ADMIN vede solo il proprio dipartimento.
    // Il ruolo super-admin (in arrivo) non entrerà in questo ramo
    // e vedrà tutti i dipartimenti come oggi.
    const departmentFilter =
      session.role === "ADMIN" ? session.department : undefined;

    const from = args.dateRange?.from;
    const to = args.dateRange?.to;
    const hasDateRange = from !== undefined && to !== undefined;

    const rows = await prisma.$queryRaw<
      {
        department: Department;
        totalTickets: bigint;
        openCount: bigint;
        pendingReviewCount: bigint;
        inProgressCount: bigint;
        closedCount: bigint;
        refusedCount: bigint;
        overdueCount: bigint;
        sumResolutionHours: number | null;
        closedWithResolutionCount: bigint;
      }[]
    >`
      SELECT
        t."ticketDepartment" AS department,
        COUNT(*) AS "totalTickets",
        COUNT(*) FILTER (WHERE t.status = 'OPEN') AS "openCount",
        COUNT(*) FILTER (WHERE t.status = 'ASSIGNED') AS "pendingReviewCount",
        COUNT(*) FILTER (WHERE t.status = 'IN_PROGRESS') AS "inProgressCount",
        COUNT(*) FILTER (
          WHERE t.status = 'CLOSED'
          ${hasDateRange ? Prisma.sql`AND t."closedAt" BETWEEN ${from} AND ${to}` : Prisma.empty}
        ) AS "closedCount",
        COUNT(*) FILTER (WHERE t.status = 'REFUSED') AS "refusedCount",
        COUNT(*) FILTER (
          WHERE t."dueDate" < NOW() AND t.status NOT IN ('CLOSED', 'REFUSED')
        ) AS "overdueCount",
        COALESCE(SUM(
          EXTRACT(EPOCH FROM (t."closedAt" - t."createdAt")) / 3600
        ) FILTER (
          WHERE t.status = 'CLOSED'
          ${hasDateRange ? Prisma.sql`AND t."closedAt" BETWEEN ${from} AND ${to}` : Prisma.empty}
        ), 0) AS "sumResolutionHours",
        COUNT(*) FILTER (
          WHERE t.status = 'CLOSED' AND t."closedAt" IS NOT NULL
          ${hasDateRange ? Prisma.sql`AND t."closedAt" BETWEEN ${from} AND ${to}` : Prisma.empty}
        ) AS "closedWithResolutionCount"
      FROM "Ticket" t
      WHERE 1=1
        ${departmentFilter ? Prisma.sql`AND t."ticketDepartment" = ${departmentFilter}::"Department"` : Prisma.empty}
      GROUP BY t."ticketDepartment"
      ORDER BY t."ticketDepartment"
    `;

    return rows.map((r) => ({
      department: r.department,
      totalTickets: Number(r.totalTickets),
      openCount: Number(r.openCount),
      pendingReviewCount: Number(r.pendingReviewCount),
      inProgressCount: Number(r.inProgressCount),
      closedCount: Number(r.closedCount),
      refusedCount: Number(r.refusedCount),
      overdueCount: Number(r.overdueCount),
      sumResolutionHours: r.sumResolutionHours ?? 0,
      closedWithResolutionCount: Number(r.closedWithResolutionCount),
    }));
  },

  technicianWorkloads: async (
    _parent: unknown,
    args: { department?: Department; dateRange?: { from?: Date; to?: Date } }
  ) => {
    const session = await requireSession();
    const prisma = await getPrisma();

    const departmentFilter =
      session.role === "ADMIN" ? session.department : args.department;

    const from = args.dateRange?.from;
    const to = args.dateRange?.to;
    const hasDateRange = from !== undefined && to !== undefined;

    const rows = await prisma.$queryRaw<
      {
        technicianId: number;
        firstName: string;
        lastName: string;
        role: string;
        department: Department;
        pendingReviewCount: bigint;
        activeCount: bigint;
        overdueCount: bigint;
        closedThisPeriod: bigint;
        sumResolutionHours: number | null;
        closedWithResolutionCount: bigint;
      }[]
    >`
    SELECT
      u.id AS "technicianId",
      u."firstName",
      u."lastName",
      u.role AS "role",
      u.department AS "department",
      COUNT(*) FILTER (WHERE t.status = 'ASSIGNED') AS "pendingReviewCount",
      COUNT(*) FILTER (WHERE t.status = 'IN_PROGRESS') AS "activeCount",
      COUNT(*) FILTER (
        WHERE t."dueDate" < NOW() AND t.status NOT IN ('CLOSED', 'REFUSED')
      ) AS "overdueCount",
      COUNT(*) FILTER (
        WHERE t.status = 'CLOSED'
        ${hasDateRange ? Prisma.sql`AND t."closedAt" BETWEEN ${from} AND ${to}` : Prisma.empty}
      ) AS "closedThisPeriod",
      COALESCE(SUM(
        EXTRACT(EPOCH FROM (t."closedAt" - t."createdAt")) / 3600
      ) FILTER (
        WHERE t.status = 'CLOSED'
        ${hasDateRange ? Prisma.sql`AND t."closedAt" BETWEEN ${from} AND ${to}` : Prisma.empty}
      ), 0) AS "sumResolutionHours",
      COUNT(*) FILTER (
        WHERE t.status = 'CLOSED' AND t."closedAt" IS NOT NULL
        ${hasDateRange ? Prisma.sql`AND t."closedAt" BETWEEN ${from} AND ${to}` : Prisma.empty}
      ) AS "closedWithResolutionCount"
    FROM "User" u
    LEFT JOIN "Ticket" t ON t."assignedToId" = u.id
    WHERE u.role = 'TECHNICIAN'
      ${departmentFilter ? Prisma.sql`AND u.department = ${departmentFilter}::"Department"` : Prisma.empty}
    GROUP BY u.id, u."firstName", u."lastName", u.role, u.department
    ORDER BY u.department, u."lastName"
  `;

    return rows.map((r) => ({
      technicianId: r.technicianId,
      firstName: r.firstName,
      lastName: r.lastName,
      role: r.role,
      department: r.department,
      pendingReviewCount: Number(r.pendingReviewCount),
      activeCount: Number(r.activeCount),
      overdueCount: Number(r.overdueCount),
      closedThisPeriod: Number(r.closedThisPeriod),
      sumResolutionHours: r.sumResolutionHours ?? 0,
      closedWithResolutionCount: Number(r.closedWithResolutionCount),
    }));
  },
};