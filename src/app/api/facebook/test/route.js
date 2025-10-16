import { createFacebookPost } from "@/lib/facebook";

export async function POST(req) {
  const b = await req.json();
  try {
    const res = await createFacebookPost(b);
    return Response.json({ ok: true, data: res });
  } catch (e) {
    return Response.json({ ok: false, error: String(e.message || e) }, { status: 400 });
  }
}
