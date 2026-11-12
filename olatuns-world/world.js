const refreshBtn=document.querySelector('#refreshBtn');
if(refreshBtn)refreshBtn.addEventListener('click',async()=>{
 refreshBtn.disabled=true;refreshBtn.textContent='↻ Updating…';
 try{const registration=await navigator.serviceWorker?.getRegistration();if(registration)await registration.update();}
 catch(error){console.warn('App update check failed',error)}
 location.reload();
});
let stories=[
{category:'Music',title:'Music releases and new sounds',summary:'Discover new Afrobeats releases, singles, albums and collaborations. Fresh stories will appear here as music sources are connected.',date:'Music discovery',url:'https://audiomack.com/'},
{category:'DJ',title:'DJAN announces national executives',summary:'The Deejays Association of Nigeria announced its National Executive Council after its 16th National Conference in Abuja. DJ Perfect International was re-elected president.',date:'9 Nov 2026 · DJ industry',url:'https://djan.ng/djan-elects-new-national-executive-council-at-16th-national-conference-2026/'},
{category:'DJ',title:'DJ culture and industry spotlight',summary:'Follow DJ achievements, interviews, mixes, performances and stories from the Nigerian and global DJ community.',date:'DJ spotlight',url:'https://djan.ng/'},
{category:'Events',title:'DJ shows and music events',summary:'Find DJ performances, concerts, music festivals and parties. Event listings will be added when dates and official details are confirmed.',date:'Music events',url:'https://djan.ng/'}
];
async function loadLatestFeed(){
 try {
  const response=await fetch('./data/updates.json?refresh='+Date.now(),{cache:'no-store'});
  if(!response.ok)throw new Error('Feed request failed: '+response.status);
  const payload=await response.json();
  if(Array.isArray(payload.items)&&payload.items.length){
   stories=payload.items;
   render();
  }
 } catch(error) {
  console.warn('Using the saved DJ and music list because the latest feed is unavailable.',error);
 }
}
let active='All';
const screens=[...document.querySelectorAll('.screen')];
function showScreen(name){screens.forEach(s=>s.classList.toggle('active',s.id===name));document.querySelectorAll('[data-screen]').forEach(b=>b.classList.toggle('active',b.classList.contains('nav-item')&&b.dataset.screen===name));}
document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>showScreen(b.dataset.screen)));
function render(){
 const list=stories.filter(s=>active==='All'||s.category===active);
 document.querySelector('#stories').innerHTML=list.map(s=>'<article class="story"><span class="tag">'+s.category.toUpperCase()+'</span><h3>'+s.title+'</h3><p>'+s.summary+'</p><small>'+s.date+'</small><a href="'+s.url+'" target="_blank" rel="noopener" style="font-size:9px;color:#167bd4;font-weight:800;margin-top:7px">Read source ↗</a></article>').join('');
 document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.category===active));
}
document.querySelectorAll('.filter').forEach(b=>b.addEventListener('click',()=>{active=b.dataset.category;render()}));
render();
loadLatestFeed();
let installPrompt;const installBtn=document.querySelector('#installBtn'),help=document.querySelector('#installHelp');
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();installPrompt=e;installBtn.hidden=false});
installBtn.addEventListener('click',async()=>{if(!installPrompt){help.hidden=false;return}installPrompt.prompt();await installPrompt.userChoice;installPrompt=null;installBtn.hidden=true});
document.querySelector('#closeHelp').onclick=()=>help.hidden=true;document.querySelector('#okHelp').onclick=()=>help.hidden=true;
window.addEventListener('appinstalled',()=>{installBtn.hidden=true;installPrompt=null});
if('serviceWorker'in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}))}
if('standalone'in navigator&&navigator.standalone)installBtn.hidden=true;
// Weekly content refresh: 12 November 2026.

// Cloudflare Pages path configuration corrected for this app.

// Weekly content deployment trigger.

// Publish content after Cloudflare Pages path-filter adjustment.

const notifyBtn=document.querySelector('#notifyBtn');
const notifyStatus=document.querySelector('#notifyStatus');
function notifyMessage(message){notifyStatus.textContent=message;notifyStatus.hidden=false;setTimeout(()=>{notifyStatus.hidden=true},7000)}
const b64ToBytes=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
async function enableWorldNotifications(){
 if(!('serviceWorker'in navigator)||!('PushManager'in window)||!('Notification'in window)){notifyMessage('This browser does not support website notifications. Try an updated Chrome, Edge or Safari browser.');return}
 if(location.protocol!=='https:'){notifyMessage('Notifications need a secure HTTPS website.');return}
 try{
  const permission=await Notification.requestPermission();
  if(permission!=='granted'){notifyMessage('Notifications are off. You can allow them later in your browser settings.');return}
  const registration=await navigator.serviceWorker.ready;
  const config=await fetch('/api/push/config',{cache:'no-store'}).then(r=>r.json());
  if(!config.publicKey){notifyMessage('Notifications are being configured. Please try again later.');return}
  let subscription=await registration.pushManager.getSubscription();
  if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64ToBytes(config.publicKey)});
  const saved=await fetch('/api/push/subscribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({subscription})});
  if(!saved.ok)throw new Error('Subscription could not be saved');
  notifyBtn.textContent='✓ Notifications on';notifyMessage('You are subscribed to OLATUNS WORLD alerts on this device.');
 }catch(error){console.error(error);notifyMessage('Could not activate notifications yet. Please try again shortly.')}
}
if(notifyBtn){
 notifyBtn.addEventListener('click',enableWorldNotifications);
 if('serviceWorker'in navigator&&'PushManager'in window){navigator.serviceWorker.ready.then(r=>r.pushManager.getSubscription()).then(s=>{if(s)notifyBtn.textContent='✓ Notifications on'}).catch(()=>{})}
}
