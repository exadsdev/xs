const GRAPH = "https://graph.facebook.com/v20.0";

/** โพสต์ไปยังเพจ/กรุ๊ป */
export async function createFacebookPost({ fbId, accessToken, message, imageUrl, linkUrl }) {
  const hasImage = !!imageUrl;
  const endpoint = hasImage ? `${GRAPH}/${fbId}/photos` : `${GRAPH}/${fbId}/feed`;

  const body = new URLSearchParams();
  if (hasImage) body.append("url", imageUrl);
  if (hasImage && message) body.append("caption", message);
  if (!hasImage && message) body.append("message", message);
  if (!hasImage && linkUrl) body.append("link", linkUrl);
  body.append("access_token", accessToken);

  const res = await fetch(endpoint, { method: "POST", body });
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(JSON.stringify(json.error || json));
  const postId = json.post_id || json.id;
  return { id: postId };
}

/** ใช้ user token ดึงเพจที่เป็นแอดมิน + page tokens */
export async function getUserPages({ userAccessToken }) {
  const url = `https://graph.facebook.com/v20.0/me/accounts?fields=name,id,access_token&access_token=${encodeURIComponent(userAccessToken)}`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || json.error) throw new Error(JSON.stringify(json.error || json));
  return json.data || [];
}
