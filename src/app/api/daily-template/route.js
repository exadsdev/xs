import { prisma } from "@/lib/db";

async function ensureTemplate(){
  let t = await prisma.dailyTemplate.findFirst();
  if (!t){
    t = await prisma.dailyTemplate.create({ data: { title:"Default Daily Plan", timezone:"Asia/Bangkok" } });
    // seed 10 ช่องว่าง
    const slots = Array.from({length:10}, (_,i)=>({
      templateId: t.id, index: i+1, enabled:false, timeHHMM:"", message:"", imageUrl:null, linkUrl:null, destinationId: null
    }));
    await prisma.slot.createMany({ data: slots });
  }
  return t;
}

export async function GET(){
  const t = await ensureTemplate();
  const slots = await prisma.slot.findMany({ where:{ templateId:t.id }, orderBy:{ index:"asc" } });
  return Response.json({ ok:true, data: { template: t, slots } });
}

export async function POST(req){
  const { slots } = await req.json();
  const t = await ensureTemplate();
  if (!Array.isArray(slots) || slots.length !== 10) {
    return Response.json({ ok:false, error:"slots must be array length 10" }, { status:400 });
  }
  for (const s of slots){
    await prisma.slot.updateMany({
      where: { templateId: t.id, index: s.index },
      data: {
        enabled: !!s.enabled,
        timeHHMM: s.timeHHMM || "",
        message: s.message || "",
        imageUrl: s.imageUrl || null,
        linkUrl: s.linkUrl || null,
        destinationId: s.destinationId || null
      }
    });
  }
  return Response.json({ ok:true });
}
