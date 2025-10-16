import { PrismaClient } from "@prisma/client";
let prismaClient;
try {
  prismaClient = globalThis.__prisma || new PrismaClient();
  if (!globalThis.__prisma) globalThis.__prisma = prismaClient;
} catch (e) {
  console.error("Prisma init failed. Did you run `npx prisma generate` ?", e);
  throw e;
}
export const prisma = prismaClient;
