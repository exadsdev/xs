import { prisma } from "@/lib/db";

export async function GET() {
  const data = await prisma.destination.findMany({ orderBy:{createdAt:"desc"} });
  return Response.json({ ok:true, data });
}
