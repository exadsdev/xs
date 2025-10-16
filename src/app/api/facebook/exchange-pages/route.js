import { getUserPages } from "@/lib/facebook";

export async function POST(req){
  const { userAccessToken } = await req.json();
  if (!userAccessToken) return Response.json({ ok:false, error:"no user token" }, { status:400 });
  try {
    const pages = await getUserPages({ userAccessToken });
    return Response.json({ ok:true, data: pages });
  } catch (e) {
    return Response.json({ ok:false, error: String(e.message || e) }, { status:400 });
  }
}
