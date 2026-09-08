import { getPrismaClient } from "./demo-client";
import { staticPrismaClient } from "./static-client";

const USE_BRANCHING =
    process.env.USE_NEON_BRANCHING === "true";

export async function getPrisma() {
    if (USE_BRANCHING) {
        return getPrismaClient();
    }

    return staticPrismaClient;
}


// import { getPrismaClient } from "./demo-client";
// import { staticPrismaClient } from "./static-client";

// const USE_BRANCHING = process.env.USE_NEON_BRANCHING === "true";

// export async function getPrisma() {
//     if (USE_BRANCHING) {
//         return getPrismaClient(); // gestisce demo vs prod internamente
//     }
//     return staticPrismaClient; // sviluppo locale, sempre lo stesso DB
// }