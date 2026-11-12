const stories=[
{category:'Music',title:'Tems: Surround Sound premieres',summary:'Spotify has released a full-length concert film shot in Lagos, following Tems through songs from across her career.',date:'11 Nov 2026 · Entertainment',url:'https://guardian.ng/life/spotify-premieres-tems-lagos-concert-film-as-debut-ep-reaches-888m-streams/'},
{category:'DJ',title:'DJAN announces national executives',summary:'The Deejays Association of Nigeria announced its National Executive Council after its 16th National Conference in Abuja. DJ Perfect International was re-elected president.',date:'9 Nov 2026 · DJ industry',url:'https://djan.ng/djan-elects-new-national-executive-council-at-16th-national-conference-2026/'},
{category:'Events',title:'Entertainment Week Africa',summary:'17–22 November 2026 in Lagos. Six days of summits, markets, showcases and creative-industry networking across seven tracks.',date:'Upcoming · Lagos',url:'https://ewafrica.com/schedule/'},
{category:'Events',title:'AGHA Festival — The Global Homecoming',summary:'Planned for 26–29 December 2026 at SOL Beach, Lekki, Lagos. The official site lists music, culture and creative participation; check its site for lineup updates.',date:'Upcoming · Lagos',url:'https://www.aghafestival.com/'}
];
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
