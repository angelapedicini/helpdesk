import "dotenv/config";
import { runSeed, prisma } from "./seed";

runSeed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());