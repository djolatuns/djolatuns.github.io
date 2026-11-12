export async function onRequestGet({env}) {
  return Response.json({publicKey:env.VAPID_PUBLIC_KEY||""},{headers:{"Cache-Control":"no-store"}});
}
