export async function onRequestPost({request,env}) {
  if(!env.PUSH_SUBSCRIPTIONS) return Response.json({error:"Push storage is not configured."},{status:503});
  let data; try{data=await request.json()}catch{return Response.json({error:"Invalid JSON."},{status:400})}
  const s=data?.subscription;
  if(!s?.endpoint||!s?.keys?.p256dh||!s?.keys?.auth) return Response.json({error:"Invalid push subscription."},{status:400});
  if(!/^https:\/\//i.test(s.endpoint)||s.endpoint.length>3000) return Response.json({error:"Invalid endpoint."},{status:400});
  const id=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s.endpoint));
  const key=[...new Uint8Array(id)].map(x=>x.toString(16).padStart(2,"0")).join("");
  await env.PUSH_SUBSCRIPTIONS.put("sub:"+key,JSON.stringify({subscription:s,createdAt:new Date().toISOString()}));
  return Response.json({ok:true});
}
