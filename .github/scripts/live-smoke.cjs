const { chromium } = require('playwright');
const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
(async()=>{
 const browser=await chromium.launch({headless:true});
 let lastError=null,passed=null;
 for(let attempt=1;attempt<=12&&!passed;attempt++){
  const page=await browser.newPage();
  try{
   const failed=[];
   page.on('requestfailed',r=>failed.push(r.url()+': '+(r.failure()?.errorText||'request failed')));
   const response=await page.goto('https://djolatuns.github.io/?smoke='+Date.now(),{waitUntil:'domcontentloaded',timeout:45000});
   if(!response||response.status()!==200) throw new Error('Homepage HTTP '+(response?.status()||'unavailable'));
   await page.waitForTimeout(1200);
   const title=await page.title();
   if(!/olatuns/i.test(title)) throw new Error('Unexpected page title: '+title);
   const body=await page.locator('body').innerText();
   if(/Ideas\. People\. Possibilities\.|YOUR NEW DIGITAL SPACE/i.test(body)) throw new Error('An old starter template is still being served');
   for(const asset of ['styles.css','app-core.js','app-cloud.js','manifest.webmanifest','icon.svg']){
    const res=await page.request.get('https://djolatuns.github.io/'+asset+'?smoke='+Date.now());
    if(!res.ok()) throw new Error('Required asset failed: '+asset+' HTTP '+res.status());
   }
   const cloudSource=await (await page.request.get('https://djolatuns.github.io/app-cloud.js?smoke='+Date.now())).text();
   if(!cloudSource.includes('resetCloudProfile')||!cloudSource.includes("username_available")) throw new Error('Live account protections are not updated yet');
   if(!cloudSource.includes('submitCommunityComment')||!cloudSource.includes('toggleCommunityFollow')) throw new Error('Live community comments/follows code is not updated yet');
   if(!cloudSource.includes('video/webm')||!cloudSource.includes('postvideo')) throw new Error('Live community video upload/playback code is not updated yet');
   if(!await page.locator('#followStats').count()) throw new Error('Live profile follower statistics are missing');
   const pages=await page.locator('section.page').evaluateAll(nodes=>nodes.map(n=>n.id));
   const expected=['home','mixtapes','discover','community','profile','about'];
   for(const id of expected) if(!pages.includes(id)) throw new Error('Missing app page: '+id);
   const css=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
   if(!css||css==='rgba(0, 0, 0, 0)'||css==='rgb(255, 255, 255)') throw new Error('App stylesheet did not apply a dark background: '+css);
   const bookingResponse=await page.request.get('https://djolatuns.github.io/booking.html?smoke='+Date.now());
   if(!bookingResponse.ok()) throw new Error('Public booking page failed: HTTP '+bookingResponse.status());
   const bookingHtml=await bookingResponse.text();
   if(!/Book DJ Olatuns|Booking request/i.test(bookingHtml)) throw new Error('Public booking form is missing.');
   const adminResponse=await page.request.get('https://djolatuns.github.io/admin.html?smoke='+Date.now());
   if(!adminResponse.ok()) throw new Error('Admin dashboard page failed: HTTP '+adminResponse.status());
   const adminHtml=await adminResponse.text();
   if(!/noindex,nofollow/i.test(adminHtml)) throw new Error('Admin dashboard is missing noindex protection.');
   const manifest=await page.request.get('https://djolatuns.github.io/manifest.webmanifest?smoke='+Date.now());
   const data=await manifest.json();
   if(data.name!=='DJ Olatuns App') throw new Error('Incorrect PWA manifest name');
   if(failed.length) throw new Error('Failed browser requests: '+failed.join('; '));
   passed={status:'passed',attempt,title,pages,background:css,checkedAssets:5};
  }catch(e){lastError=e;console.log('Live check attempt '+attempt+' not ready: '+e.message)}
  finally{await page.close()}
  if(!passed&&attempt<12) await sleep(10000);
 }
 await browser.close();
 if(!passed) throw lastError||new Error('Live smoke test did not pass');
 console.log(JSON.stringify(passed));
})().catch(e=>{console.error(e);process.exit(1)});
