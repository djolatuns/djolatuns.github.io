const { chromium } = require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage();
 const failed=[];
 page.on('requestfailed',r=>failed.push(r.url()+': '+(r.failure()?.errorText||'request failed')));
 const response=await page.goto('https://djolatuns.github.io/',{waitUntil:'networkidle',timeout:60000});
 if(!response||response.status()!==200) throw new Error('Homepage did not return HTTP 200');
 const title=await page.title();
 if(!/olatuns/i.test(title)) throw new Error('Unexpected page title: '+title);
 const body=await page.locator('body').innerText();
 if(/Ideas\. People\. Possibilities\.|YOUR NEW DIGITAL SPACE/i.test(body)) throw new Error('An old starter template is still being served');
 for(const asset of ['styles.css','app-core.js','app-cloud.js','manifest.webmanifest','icon.svg']){
   const res=await page.request.get('https://djolatuns.github.io/'+asset);
   if(!res.ok()) throw new Error('Required asset failed: '+asset+' HTTP '+res.status());
 }
 const pages=await page.locator('section.page').evaluateAll(nodes=>nodes.map(n=>n.id));
 const expected=['home','mixtapes','discover','community','profile','drafts','about'];
 for(const id of expected) if(!pages.includes(id)) throw new Error('Missing app page: '+id);
 const css=await page.locator('body').evaluate(el=>getComputedStyle(el).backgroundColor);
 if(!css||css==='rgba(0, 0, 0, 0)'||css==='rgb(255, 255, 255)') throw new Error('App stylesheet did not apply a dark background: '+css);
 const manifest=await page.request.get('https://djolatuns.github.io/manifest.webmanifest');
 const data=await manifest.json();
 if(data.name!=='DJ Olatuns App') throw new Error('Incorrect PWA manifest name');
 if(failed.length) throw new Error('Failed browser requests: '+failed.join('; '));
 console.log(JSON.stringify({status:'passed',title,pages,background:css,checkedAssets:5}));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
