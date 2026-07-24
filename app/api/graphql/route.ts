import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { server } from "@/graphql/server";

const handler = startServerAndCreateNextHandler(server);

export { handler as GET, handler as POST };