import { headers } from "next/headers";
import { GraphQLError } from "graphql";
import { getAccessToken } from "./cookies";
import { verifyAccessToken, type AccessTokenPayload } from "./jwt";
import { Department, Role } from "@/app/generated/prisma/client"; // adatta il path al tuo client generato

function isValidRole(value: string): value is Role {
  return Object.values(Role).includes(value as Role);
}

function isValidDepartment(value: string): value is Department {
  return Object.values(Department).includes(value as Department);
}

export async function getSession(): Promise<AccessTokenPayload | null> {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  const role = headersList.get("x-user-role");
  const department = headersList.get("x-user-department");

  if (userId && role && isValidRole(role) && department && isValidDepartment(department)) {
    return { userId: Number(userId), role, department };
  }

  const token = await getAccessToken();
  if (!token) return null;
  return verifyAccessToken(token);
}

export async function requireSession(): Promise<AccessTokenPayload> {
  const session = await getSession();
  if (!session) {
    throw new GraphQLError("Non autorizzato", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
  return session;
}

export async function requireAdmin(): Promise<AccessTokenPayload> {
  const session = await requireSession();
  if (session.role !== "ADMIN") {
    throw new GraphQLError("Accesso negato", {
      extensions: { code: "FORBIDDEN" },
    });
  }
  return session;
}