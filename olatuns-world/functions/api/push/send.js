const te=new TextEncoder();
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const fromB64u=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
async function hkdf(ikm,salt,info,len){
 const key=await crypto.subtle.importKey("raw",ikm,"HKDF",false,["deriveBits"]);
 return new Uint8Array(await crypto.subtle.deriveBits({name:"HKDF",hash:"SHA-256",salt,info},key,len*8));
}
async function vapidToken(endpoint,env){
 const aud=new URL(endpoint).origin, now=Math.floor(Date.now()/1000);
 const header=b64u(te.encode(JSON.stringify({typ:"JWT",alg:"ES256"})));
 const payload=b64u(te.encode(JSON.stringify({aud,exp:now+3600,sub:"mailto:notifications@olatuns-world.pages.dev"})));
 const input=header+"."+payload;
 const key=await crypto.subtle.importKey("jwk",JSON.parse(env.VAPID_PRIVATE_JWK),{name:"ECDSA",namedCurve:"P-256"},false,["sign"]);
 const sig=await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},key,te.encode(input));
 return input+"."+b64u(sig);
}
async function encryptPayload(subscription,payload){
 const ua=fromB64u(subscription.keys.p256dh), auth=fromB64u(subscription.keys.auth);
 const server=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
 const serverPub=new Uint8Array(await crypto.subtle.exportKey("raw",server.publicKey));
 const uaKey=await crypto.subtle.importKey("raw",ua,{name:"ECDH",namedCurve:"P-256"},false,[]);
 const shared=new Uint8Array(await crypto.subtle.deriveBits({name:"ECDH",public:uaKey},server.privateKey,256));
 const authPrk=await hkdf(shared,auth,te.encode("WebPush: info\0").length?new Uint8Array([...te.encode("WebPush: info\0"),...ua,...serverPub]):new Uint8Array(),32);
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const prk=await hkdf(authPrk,salt,new Uint8Array([...te.encode("Content-Encoding: aes128gcm\0")]),32);
 const cek=await hkdf(prk,new Uint8Array(0),te.encode("Content-Encoding: aes128gcm\0"),16);
 const nonce=await hkdf(prk,new Uint8Array(0),te.encode("Content-Encoding: nonce\0"),12);
 const aes=await crypto.subtle.importKey("raw",cek,{name:"AES-GCM"},false,["encrypt"]);
 const plain=new Uint8Array([...te.encode(JSON.stringify(payload)),2]);
 const cipher=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv:nonce},aes,plain));
 const header=new Uint8Array(16+4+1+serverPub.length);
 header.set(salt,0);new DataView(header.buffer).setUint32(16,4096);header[20]=serverPub.length;header.set(serverPub,21);
 return new Uint8Array([...header,...cipher]);
}
export async function onRequestPost({request,env}){
 if(!env.PUSH_ADMIN_TOKEN||request.headers.get("Authorization")!=="Bearer "+env.PUSH_ADMIN_TOKEN) return Response.json({error:"Unauthorized."},{status:401});
 if(!env.PUSH_SUBSCRIPTIONS||!env.VAPID_PRIVATE_JWK||!env.VAPID_PUBLIC_KEY) return Response.json({error:"Push secrets are not configured."},{status:503});
 let data;try{data=await request.json()}catch{return Response.json({error:"Invalid JSON."},{status:400})}
 const title=String(data.title||"OLATUNS WORLD").slice(0,80), body=String(data.body||"Fresh DJ and music updates are waiting.").slice(0,180), url=String(data.url||"/").startsWith("/")?String(data.url||"/"):"/";
 const payload={title,body,url,tag:String(data.tag||"olatuns-world-update").slice(0,80)};
 const listed=await env.PUSH_SUBSCRIPTIONS.list({prefix:"sub:",limit:1000});
 let sent=0,removed=0,failed=0;
 for(const item of listed.keys){
  const saved=await env.PUSH_SUBSCRIPTIONS.get(item.name,"json");if(!saved?.subscription)continue;
  const s=saved.subscription;
  try{
   const token=await vapidToken(s.endpoint,env), bodyBytes=await encryptPayload(s,payload);
   const response=await fetch(s.endpoint,{method:"POST",headers:{"Authorization":"vapid t="+token+", k="+env.VAPID_PUBLIC_KEY,"Content-Encoding":"aes128gcm","Content-Type":"application/octet-stream","TTL":"86400"},body:bodyBytes});
   if(response.status===201||response.status===202)sent++;
   else if(response.status===404||response.status===410){await env.PUSH_SUBSCRIPTIONS.delete(item.name);removed++;}
   else failed++;
  }catch{failed++;}
 }
 return Response.json({ok:true,sent,removed,failed,checked:listed.keys.length});
}
