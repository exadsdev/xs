import { prisma } from "@/lib/db";

export async function POST(req){
  const { pages } = await req.json();
  if (!Array.isArray(pages) || !pages.length) {
    return Response.json({ ok:false, error:"no pages" }, { status:400 });
  }
  const results = [];
  for (const p of pages) {
    const name = p.name || `Page ${p.id}`;
    const fbId = String(p.id);
    const accessToken = p.access_token;
    if (!accessToken) continue;
    const existing = await prisma.destination.findFirst({ where:{ fbId } });
    if (existing) {
      const d = await prisma.destination.update({
        where:{ id: existing.id },
        data:{ name, type:"PAGE", accessToken }
      });
      results.push(d);
    } else {
      const d = await prisma.destination.create({
        data:{ name, type:"PAGE", fbId, accessToken }
      });
      results.push(d);
    }
  }
  return Response.json({ ok:true, data: results });
}
