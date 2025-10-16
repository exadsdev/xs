import { prisma } from "@/lib/db";
import { createFacebookPost } from "@/lib/facebook";

// เรียกทุกนาที: curl -fsS "https://YOUR_DOMAIN/api/cron/tick?key=ADMIN_SECRET"
function nowInBangkok(){
  return new Date(); // ใช้เวลาระบบ (ตั้ง TZ=Asia/Bangkok ใน .env)
}
function toHHMM(d){
  const h = d.getHours().toString().padStart(2,"0");
  const m = d.getMinutes().toString().padStart(2,"0");
  return `${h}:${m}`;
}

export async function GET(req){
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  if (key !== process.env.ADMIN_SECRET) return new Response("Unauthorized", { status:401 });

  const t = await prisma.dailyTemplate.findFirst();
  if (!t) return Response.json({ ok:true, ran:0 });

  const slots = await prisma.slot.findMany({ where:{ templateId: t.id, enabled: true } });
  const hhmm = toHHMM(nowInBangkok());

  // อนุโลม: โพสต์เฉพาะช่องที่เวลา == hh:mm ตอนนาทีนี้
  const due = slots.filter(s => (s.timeHHMM||"").trim() === hhmm);

  let ran = 0;
  for (const s of due){
    try {
      if (!s.destinationId) throw new Error("No destination selected");
      const dest = await prisma.destination.findUnique({ where:{ id: s.destinationId } });
      if (!dest) throw new Error("Destination not found");

      const { id: fbPostId } = await createFacebookPost({
        fbId: dest.fbId,
        accessToken: dest.accessToken,
        message: s.message,
        imageUrl: s.imageUrl || undefined,
        linkUrl: s.linkUrl || undefined
      });

      await prisma.postLog.create({ data:{
        slotId: s.id,
        status: "SUCCESS",
        fbPostId
      }});
      ran++;
    } catch (e) {
      await prisma.postLog.create({ data:{
        slotId: s.id,
        status: "FAILED",
        error: String(e.message || e)
      }});
    }
  }

  return Response.json({ ok:true, ran, matchedTime: hhmm });
}
