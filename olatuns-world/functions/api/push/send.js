const te=new TextEncoder();
const b64u=b=>btoa(String.fromCharCode(...new Uint8Array(b))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
const fromB64u=s=>Uint8Array.from(atob(s.replace(/-/g,"+").replace(/_/g,"/")+"=".repeat((4-s.length%4)%4)),c=>c.charCodeAt(0));
async function hkdf(ikm,salt,info,len){
 const key=await crypto.subtle.importKey("raw",ikm,"HKDF",false,["deriveBits"]);
 return new Uint8Array(await crypto.subtle.deriveBits({name:"HKDF",hash:"SHA-256",salt,info},key,len*8));
}
async function vapidToken(endpoint,env){
 const input=b64u(te.encode(JSON.stringify({typ:"JWT",alg:"ES256"})))+"."+b64u(te.encode(JSON.stringify({aud:new URL(endpoint).origin,exp:Math.floor(Date.now()/1000)+3600,sub:"mailto:notifications@olatuns-world.pages.dev"})));
 const key=await crypto.subtle.importKey("jwk",cfg.privateJwk,{name:"ECDSA",namedCurve:"P-256"},false,["sign"]);
 return input+"."+b64u(await crypto.subtle.sign({name:"ECDSA",hash:"SHA-256"},key,te.encode(input)));
}
async function encryptPayload(s,payload){
 const ua=fromB64u(s.keys.p256dh),auth=fromB64u(s.keys.auth);
 const pair=await crypto.subtle.generateKey({name:"ECDH",namedCurve:"P-256"},true,["deriveBits"]);
 const as=new Uint8Array(await crypto.subtle.exportKey("raw",pair.publicKey));
 const uaKey=await crypto.subtle.importKey("raw",ua,{name:"ECDH",namedCurve:"P-256"},false,[]);
 const shared=new Uint8Array(await crypto.subtle.deriveBits({name:"ECDH",public:uaKey},pair.privateKey,256));
 const ikm=await hkdf(shared,auth,new Uint8Array([...te.encode("WebPush: info\0"),...ua,...as]),32);
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const cek=await hkdf(ikm,salt,te.encode("Content-Encoding: aes128gcm\0"),16);
 const nonce=await hkdf(ikm,salt,te.encode("Content-Encoding: nonce\0"),12);
 const aes=await crypto.subtle.importKey("raw",cek,{name:"AES-GCM"},false,["encrypt"]);
 const plain=new Uint8Array([...te.encode(JSON.stringify(payload)),2]);
 const cipher=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv:nonce},aes,plain));
 const head=new Uint8Array(21+as.length);head.set(salt);new DataView(head.buffer).setUint32(16,4096);head[20]=as.length;head.set(as,21);
 return new Uint8Array([...head,...cipher]);
}
export async function onRequestPost({request,env}){
 if(!env.PUSH_SUBSCRIPTIONS)return Response.json({error:"Push storage is not configured."},{status:503});
 const cfg=await env.PUSH_SUBSCRIPTIONS.get("_push_config","json");
 if(!cfg||request.headers.get("Authorization")!=="Bearer "+cfg.adminToken)return Response.json({error:"Unauthorized."},{status:401});
 let d;try{d=await request.json()}catch{return Response.json({error:"Invalid JSON."},{status:400})}
 const payload={title:String(d.title||"OLATUNS WORLD").slice(0,80),body:String(d.body||"Fresh DJ and music updates are waiting.").slice(0,180),url:String(d.url||"/").startsWith("/")?String(d.url||"/"):"/",tag:String(d.tag||"olatuns-world-update").slice(0,80)};
 const listed=await env.PUSH_SUBSCRIPTIONS.list({prefix:"sub:",limit:1000});let sent=0,removed=0,failed=0;
 for(const item of listed.keys){const saved=await env.PUSH_SUBSCRIPTIONS.get(item.name,"json");if(!saved?.subscription)continue;const s=saved.subscription;
  try{const token=await vapidToken(s.endpoint,env),body=await encryptPayload(s,payload);const res=await fetch(s.endpoint,{method:"POST",headers:{"Authorization":"vapid t="+token+", k="+cfg.publicKey,"Content-Encoding":"aes128gcm","Content-Type":"application/octet-stream","TTL":"86400"},body});if(res.status===201||res.status===202)sent++;else if(res.status===404||res.status===410){await env.PUSH_SUBSCRIPTIONS.delete(item.name);removed++;}else failed++;}catch{failed++;}
 }
 return Response.json({ok:true,sent,removed,failed,checked:listed.keys.length});
}
