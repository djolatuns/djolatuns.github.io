const pageNames=['home','mixtapes','discover','community','profile','about'];
let experienceReturnPage='home';
function createExperiencePages(){
 const main=document.querySelector('main');
 document.querySelectorAll('.experience-panel').forEach(panel=>{
  const id=panel.id+'Page';
  if(document.getElementById(id))return;
  const page=document.createElement('section');
  page.className='page experience-route';
  page.id=id;
  const back=document.createElement('button');
  back.type='button';back.className='btn secondary experience-back';
  back.textContent='← Back';
  back.addEventListener('click',()=>go(experienceReturnPage));
  back.style.margin='0 0 12px';
  page.appendChild(back);
  page.appendChild(panel);
  main.appendChild(page);
  pageNames.push(id);
 });
}
createExperiencePages();
const requestedPage=new URLSearchParams(window.location.search).get('page');
if(pageNames.includes(requestedPage))go(requestedPage,false);
function go(name,updateUrl=true){if(!pageNames.includes(name))return;if(name.endsWith('Page')){document.querySelectorAll('.experience-panel').forEach(panel=>panel.hidden=true);const targetPanel=document.getElementById(name.slice(0,-4));if(targetPanel)targetPanel.hidden=false}if(updateUrl){const url=new URL(window.location.href);url.searchParams.set('page',name);window.history.pushState({page:name},'',url)}document.querySelectorAll('.page').forEach(el=>el.classList.toggle('active',el.id===name));document.querySelectorAll('.nav button').forEach(el=>el.classList.toggle('active',el.dataset.page===name));window.scrollTo(0,0)}
window.addEventListener('popstate',()=>{const page=new URLSearchParams(window.location.search).get('page');go(pageNames.includes(page)?page:'home',false)});
function esc(s){return String(s||'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
function read(key,def){try{return JSON.parse(localStorage.getItem(key))??def}catch(e){return def}}
function save(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true}catch(e){return false}}
const quotes=['Your future is shaped by small decisions made consistently.','Progress begins when you choose to keep moving.','Your possibilities are bigger than your present circumstances.','Be patient with the process. Keep showing up.','Growth takes courage, consistency and time.','Small beginnings can lead to remarkable destinations.'];
document.getElementById('quote').textContent=quotes[Math.floor(Date.now()/86400000)%quotes.length];document.getElementById('date').textContent=new Date().toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'});
const mixes=[{t:'New Wave 2026',d:'Fresh sounds and new energy.',c:'NEW WAVE',u:'https://audiomack.com/dj_olatuns1/song/new-wave-2026-mixtape?share-user-id=153478386'},{t:'Movement Mixtape',d:'Keep moving. Keep the vibe alive.',c:'MOVEMENT',u:'https://audiomack.com/dj_olatuns1/song/dj-olatuns-2026-movement-mixtape?share-user-id=153478386'},{t:'Faaja Mixtape',d:'Sounds made for the groove.',c:'FAÀJÀ',u:'https://audiomack.com/dj_olatuns1/song/undefeatable-dj-olatuns-faaja-mixtape?share-user-id=153478386'},{t:'2026 Dance Mix',d:'Dance energy and nonstop vibes.',c:'DANCE MIX',u:'https://audiomack.com/dj_olatuns1/song/dj-olatuns-2026-dance-mix?share-user-id=153478386'}];
function mixCard(m){return '<article class="release"><div class="cover">'+esc(m.c)+'</div><div class="release-body"><h3>'+esc(m.t)+'</h3><p>'+esc(m.d)+'</p><a class="link" href="'+m.u+'" target="_blank" rel="noopener">Listen on Audiomack ↗</a></div></article>'}
document.getElementById('mixGrid').innerHTML=mixes.map(mixCard).join('');document.getElementById('homeMix').innerHTML=mixes.slice(0,2).map(mixCard).join('');
const topics={mindset:'<b>Mindset & growth</b><p>Pick one realistic goal, break it into a small action, and repeat it consistently. Track progress, not perfection.</p><span class="chip">Consistency</span><span class="chip">Patience</span><span class="chip">Confidence</span>',creative:'<b>Creativity</b><p>Write down ideas as they arrive. Explore alternatives, experiment without fear, and make a small first version before waiting for perfection.</p><span class="chip">Explore</span><span class="chip">Experiment</span><span class="chip">Build</span>',tech:'<b>Technology</b><p>Start with a real problem. Learn what causes it, explore available tools, and test a simple solution that helps someone.</p><span class="chip">Learn</span><span class="chip">Solve</span><span class="chip">Innovate</span>',life:'<b>Everyday life</b><p>Protect your time, communicate clearly, learn from mistakes and give yourself space to improve. A thoughtful next step can be enough for today.</p><span class="chip">Balance</span><span class="chip">Reflection</span><span class="chip">Progress</span>'};
function topic(key){document.getElementById('topicContent').innerHTML=topics[key]||topics.mindset}
topic('mindset');
const keys={profile:'olatuns_profile_v2',posts:'olatuns_posts_v2'};
let user=read(keys.profile,{name:'',bio:'',photo:''}),posts=read(keys.posts,[]),selectedPostImage='';
function userInitials(name){return (String(name||'O').trim().split(/\s+/).slice(0,2).map(s=>s[0]||'').join('').toUpperCase()||'O')}
function avatar(name,photo){return '<div class="avatar">'+(photo?'<img alt="Avatar" loading="lazy" decoding="async" src="'+photo+'">':esc(userInitials(name)))+'</div>'}
function updateProfileUI(){const saved=!!user.name;document.getElementById('profileEditorSection').style.display=saved?'none':'block';document.getElementById('profileSavedSection').style.display=saved?'block':'none';document.getElementById('name').value=user.name||'';document.getElementById('bio').value=user.bio||'';document.getElementById('avatar').innerHTML=user.photo?'<img alt="Profile picture" src="'+user.photo+'">':esc(userInitials(user.name));document.getElementById('profileHeading').textContent=user.name||'Your profile';document.getElementById('bioCard').textContent=user.bio||'Your bio will appear here.';const mine=posts.filter(p=>p.author===(user.name||'Guest'));document.getElementById('postCount').textContent=mine.length;document.getElementById('likesCount').textContent=mine.reduce((sum,p)=>sum+(p.likes||0),0)}
function editProfile(){document.getElementById('profileEditorSection').style.display='block';document.getElementById('profileSavedSection').style.display='none';document.getElementById('profileMsg').textContent='';}
function cancelProfileEdit(){if(user.name){document.getElementById('profileEditorSection').style.display='none';document.getElementById('profileSavedSection').style.display='block';}else{document.getElementById('profileMsg').textContent='Complete your profile to save it.';}}
function readImage(file,max,cb){if(!file)return;if(!file.type.startsWith('image/')){alert('Select an image file.');return}if(file.size>max){alert('Image is too large. Please choose a smaller file.');return}const reader=new FileReader();reader.onload=()=>cb(reader.result);reader.onerror=()=>alert('Could not read image. Try again.');reader.readAsDataURL(file)}
updateProfileUI();

function toggleAppMenu(open){const drawer=document.getElementById('appDrawer'),scrim=document.getElementById('drawerScrim'),trigger=document.querySelector('.menu-trigger');if(!drawer||!scrim)return;const show=typeof open==='boolean'?open:!drawer.classList.contains('open');drawer.classList.toggle('open',show);drawer.setAttribute('aria-hidden',String(!show));scrim.hidden=!show;if(trigger)trigger.setAttribute('aria-expanded',String(show));document.body.classList.toggle('menu-open',show)}
function drawerGo(page){toggleAppMenu(false);hideExperiencePanels?.();go(page)}
function drawerPanel(panel,loader){toggleAppMenu(false);experienceReturnPage=document.querySelector('.page.active')?.id||'home';const target=panel+'Page';if(pageNames.includes(target))go(target);if(typeof window[loader]==='function')window[loader]()}
document.addEventListener('keydown',e=>{if(e.key==='Escape')toggleAppMenu(false)});
window.addEventListener('load',()=>{
 const originalShow=window.showExperiencePanel;
 const originalHide=window.hideExperiencePanels;
 window.hideExperiencePanels=function(){if(typeof originalHide==='function')originalHide();if(document.querySelector('.page.active')?.classList.contains('experience-route'))go(experienceReturnPage)};
 window.showExperiencePanel=function(id){
  experienceReturnPage=document.querySelector('.page.active')?.id||'home';
  document.querySelectorAll('.experience-panel').forEach(p=>p.hidden=true);
  const panel=document.getElementById(id);if(panel)panel.hidden=false;
  const target=id+'Page';if(pageNames.includes(target))go(target);
  else if(typeof originalShow==='function')originalShow(id);
 };
});