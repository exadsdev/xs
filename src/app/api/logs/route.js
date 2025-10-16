import { prisma } from "@/lib/db";

export async function GET(){
  const data = await prisma.postLog.findMany({ orderBy:{ ranAt:"desc" }, take:200 });
  return Response.json({ ok:true, data });
}
