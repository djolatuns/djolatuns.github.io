export async function onRequestPost({request,env}) {
  if(!env.PUSH_SUBSCRIPTIONS) return Response.json({error:"Push storage is not configured."},{status:503});
  let data; try{data=await request.json()}catch{return Response.json({error:"Invalid JSON."},{status:400})}
  const endpoint=data?.endpoint; if(!endpoint) return Response.json({error:"Missing endpoint."},{status:400});
  const id=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(endpoint));
  const key=[...new Uint8Array(id)].map(x=>x.toString(16).padStart(2,"0")).join("");
  await env.PUSH_SUBSCRIPTIONS.delete("sub:"+key);
  return Response.json({ok:true});
}
