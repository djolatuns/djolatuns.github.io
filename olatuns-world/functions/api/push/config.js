export async function onRequestGet({env}) {
 if(!env.PUSH_SUBSCRIPTIONS)return Response.json({error:"Push storage is not configured."},{status:503});
 let cfg=await env.PUSH_SUBSCRIPTIONS.get("_push_config","json");
 if(!cfg){
  const pair=await crypto.subtle.generateKey({name:"ECDSA",namedCurve:"P-256"},true,["sign","verify"]);
  const jwk=await crypto.subtle.exportKey("jwk",pair.privateKey);
  const raw=new Uint8Array(await crypto.subtle.exportKey("raw",pair.publicKey));
  const publicKey=btoa(String.fromCharCode(...raw)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const token=btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  cfg={publicKey,privateJwk:jwk,adminToken:token};
  await env.PUSH_SUBSCRIPTIONS.put("_push_config",JSON.stringify(cfg));
 }
 return Response.json({publicKey:cfg.publicKey},{headers:{"Cache-Control":"no-store"}});
}
