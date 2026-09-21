import { accessibleBy } from "@casl/prisma";
import { GraphQLError } from "graphql/error";
import type { PrismaClient } from "@/app/generated/prisma/client";
import type { Department } from "@/app/generated/prisma/enums";
import type { AppAbility } from "@/lib/casl/defineAbility";
import type { CategoryActions } from "./types";
import type { CategoryForAbility } from "./types";

// Le categorie disattivate sono escluse dalla lettura per tutti (dashboard,
// form ticket, specializzazioni, validazioni di creazione/aggiornamento ticket).
// Chi gestisce le categorie (SYSTEM_ADMIN sempre, ADMIN sul proprio reparto)
// accede al catalogo di gestione via departmentScope, che include anche le
// disattivate: le categorie "gestite" non passano da questo filtro.
function categoryReadWhere(ability: AppAbility, includeDisabled = false) {
  const base = accessibleBy(ability, "read").ofType("TicketCategory");
  if (includeDisabled) return base;
  // "attiva": disabled è non-nullable (Boolean), quindi il predicato è esplicito.
  // La visibilità "operativa" richiede anche almeno un grant attivo: pure chi
  // gestisce (SYSTEM_ADMIN, per cui base è senza restrizioni) vede in dashboard,
  // form e filtri solo le categorie a cui è stata assegnata una visibilità.
  // Le categorie gestite (SYSTEM_ADMIN e ADMIN del proprio reparto) non passano
  // da questo filtro: usano departmentScope nei contesti di gestione.
  return {
    AND: [
      base,
      { disabled: false },
      { accessGrants: { some: { disabled: false } } },
    ],
  } as const;
}

export type CategoryReadOptions = { includeDisabled?: boolean };

export async function getAllowedCategoryIds(
  prisma: PrismaClient,
  ability: AppAbility,
  options?: CategoryReadOptions
): Promise<number[]> {
  const categories = await prisma.ticketCategory.findMany({
    where: categoryReadWhere(ability, options?.includeDisabled),
    select: { id: true },
  });

  return categories.map((c) => c.id);
}

export async function getAllowedCategories(
  prisma: PrismaClient,
  ability: AppAbility,
  options?: CategoryReadOptions & { departmentScope?: Department }
) {
  // departmentScope: scope di gestione scoped sul reparto della sessione.
  // Il department viene imposto dal resolver, non da input: così un ADMIN
  // vede e gestisce solo le categorie del proprio dipartimento e il frontend
  // non deve fare nessun controllo sui dati ricevuti.
  const where = options?.departmentScope
    ? { department: options.departmentScope }
    : categoryReadWhere(ability, options?.includeDisabled);
  return prisma.ticketCategory.findMany({
    where,
    select: { id: true, name: true, department: true, specificField: true, disabled: true },
    orderBy: [{ id: "desc" }, { name: "asc" }],
  });
}

type CategoryManageAction = Extract<CategoryActions, "manage" | "read" | "create" | "update" | "delete" | "restore">;

const SUBJECT_TICKET_CATEGORY = "TicketCategory" as const;

// Il typing di CASL limita il subject delle "can" alle Model registrate, che
// non prevedono __typename. Qui il cast è contenuto: l'unico uso è valutare
// una regola CONDIZIONALE su un oggetto parziale (department) fornendo al
// runtime la detection esplicita (vedi detectSubjectType in defineAbility).
type CategoryAbilityCheck = {
  can(
    action: CategoryManageAction,
    subject: { __typename: typeof SUBJECT_TICKET_CATEGORY; [key: string]: unknown }
  ): boolean;
  cannot(
    action: CategoryManageAction,
    subject: { __typename: typeof SUBJECT_TICKET_CATEGORY; [key: string]: unknown }
  ): boolean;
};

function canOnCategorySubject(
  ability: AppAbility,
  action: CategoryManageAction,
  subject: Partial<CategoryForAbility>
): boolean {
  return (ability as unknown as CategoryAbilityCheck).can(action, {
    __typename: SUBJECT_TICKET_CATEGORY,
    ...subject,
  });
}

// "Manage" non condizionato: solo SYSTEM_ADMIN (regola "manage" senza condizioni).
// Distingue la gestione trasversale da quella scoped dell'ADMIN.
export function isUnrestrictedCategoryManager(ability: AppAbility): boolean {
  return ability.can("manage", SUBJECT_TICKET_CATEGORY);
}

// Gestore scoped sul reparto: true per SYSTEM_ADMIN e per l'ADMIN del reparto.
// Il subject viene taggato con __typename perché il server risolva il tipo
// sull'oggetto (la regola ADMIN è condizionale sul department).
export function isDepartmentCategoryManager(
  ability: AppAbility,
  department: Department
): boolean {
  return canOnCategorySubject(ability, "update", { department });
}

export function assertCanManageTicketCategory(
  ability: AppAbility,
  action: CategoryManageAction,
  category: Partial<CategoryForAbility>
): void {
  if (!canOnCategorySubject(ability, action, category)) {
    throw new GraphQLError("Non hai i permessi per gestire le categorie", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}

// Gate per chi accede ai contesti di gestione (list includeDisabled,
// matrice accessi): permette SYSTEM_ADMIN e ADMIN del proprio reparto.
export function assertCategoryManagerForDepartment(
  ability: AppAbility,
  department: Department
): void {
  if (
    !isUnrestrictedCategoryManager(ability) &&
    !isDepartmentCategoryManager(ability, department)
  ) {
    throw new GraphQLError("Non hai i permessi per gestire le categorie", {
      extensions: { code: "FORBIDDEN" },
    });
  }
}