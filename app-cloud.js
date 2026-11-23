const SUPABASE_URL='https://tiqracqtgggoctyvtuqo.supabase.co';
const SUPABASE_KEY='sb_publishable_9UYttF-UC-2xgb6KBYBvLQ_4rCob3LO';
const cloud=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
let cloudUser=null,cloudProfile=null,coverSelected=null,profileFileSelected=null;
function authMsg(t){document.getElementById('authMessage').textContent=t||''}
function showLogin(){document.getElementById('loginForm').style.display='block';document.getElementById('signupForm').style.display='none';document.getElementById('recoveryForm').style.display='none';document.getElementById('authTitle').textContent='Welcome back.'}
function showSignup(){document.getElementById('loginForm').style.display='none';document.getElementById('signupForm').style.display='block';document.getElementById('recoveryForm').style.display='none';document.getElementById('authTitle').textContent='Join Olatuns.';authMsg('')}

document.getElementById('loginForm').addEventListener('submit',async e=>{e.preventDefault();const identity=document.getElementById('loginIdentity').value.trim(),password=document.getElementById('loginPassword').value;authMsg('Signing in…');let email=identity;if(!identity.includes('@')){authMsg('Please sign in using your email address. Username is your public handle.');return}const {error}=await cloud.auth.signInWithPassword({email,password});if(error){authMsg(error.message);return}authMsg('Signed in.')}
);
document.getElementById('signupForm').addEventListener('submit',async e=>{e.preventDefault();const form=e.currentTarget,button=form.querySelector('button[type="submit"]');if(button.disabled)return;const name=document.getElementById('signupName').value.trim(),username=document.getElementById('signupUsername').value.trim().toLowerCase(),email=document.getElementById('signupEmail').value.trim().toLowerCase(),password=document.getElementById('signupPassword').value,confirm=document.getElementById('signupConfirm').value;if(!name){authMsg('Please enter your display name.');return}if(!/^[a-z0-9_]{3,20}$/.test(username)){authMsg('Username must be 3–20 letters, numbers or underscores.');return}if(password.length<8){authMsg('Password must be at least 8 characters.');return}if(password!==confirm){authMsg('Passwords do not match.');return}button.disabled=true;button.textContent='Creating account…';authMsg('Checking username…');try{const {data:available,error:checkError}=await cloud.rpc('username_available',{candidate:username});if(checkError){authMsg('We could not check that username right now. Please try again in a moment.');return}if(!available){authMsg('That username is already taken. Choose another.');return}authMsg('Creating your account…');const {data,error}=await cloud.auth.signUp({email,password,options:{emailRedirectTo:location.origin+location.pathname,data:{display_name:name,username}}});if(error){const m=String(error.message||'');authMsg(/already registered|already exists|user already/i.test(m)?'An account may already exist with this email. Try signing in or use Forgot password.':/invalid email/i.test(m)?'Please enter a valid email address.':/password/i.test(m)?'Please choose a stronger password (at least 8 characters).':'Signup could not be completed. Please try again.');return}if(data.session){authMsg('Account created successfully. Welcome to Olatuns!')}else{authMsg('Account created! Check your email for the confirmation link, then return here to sign in.')}}catch(err){authMsg('Something went wrong while creating your account. Check your internet connection and try again.')}finally{button.disabled=false;button.textContent='Create account'}})
document.getElementById('recoveryForm').addEventListener('submit',async e=>{e.preventDefault();const p=document.getElementById('recoveryPassword').value,confirm=document.getElementById('recoveryConfirm').value;if(p.length<8){authMsg('Password must be at least 8 characters.');return}if(p!==confirm){authMsg('Passwords do not match.');return}authMsg('Updating password…');const {error}=await cloud.auth.updateUser({password:p});if(error){authMsg(error.message);return}authMsg('Password updated. You can now sign in.');await cloud.auth.signOut();showLogin()});
async function forgotPassword(){const identity=document.getElementById('loginIdentity').value.trim();if(!identity.includes('@')){authMsg('Enter your email address first, then choose Forgot password.');return}authMsg('Sending reset email…');const {error}=await cloud.auth.resetPasswordForEmail(identity,{redirectTo:location.origin+location.pathname});authMsg(error?error.message:'If an account exists for that email, a password reset email has been sent.')}
async function signOutApp(){await cloud.auth.signOut();cloudUser=null;document.body.classList.add('locked');showLogin();authMsg('You have signed out.')}
function profileInitials(n){return (String(n||'O').trim().split(/\s+/).slice(0,2).map(s=>s[0]||'').join('').toUpperCase()||'O')}
async function loadCloudProfile(){if(!cloudUser)return;let {data,error}=await cloud.from('profiles').select('*').eq('id',cloudUser.id).maybeSingle();if(error){console.error(error);authMsg('Signed in, but profile could not load.');return}if(!data){authMsg('Profile is being prepared. Refresh in a moment.');return}cloudProfile=data;user={name:data.display_name||'',username:data.username||'',bio:data.bio||'',photo:data.avatar_path||'',cover:data.cover_photo_path||''};updateProfileUI();document.getElementById('profileDisplay').textContent=user.name||'Member';document.getElementById('profileHeading').textContent=user.name||'Member profile';document.getElementById('profileUsername').textContent=user.username?'@'+user.username:'';document.getElementById('profileUsernameInput').value=user.username;document.getElementById('profileCover').style.backgroundImage=user.cover?'url('+user.cover+')':'';document.getElementById('profileCover').classList.toggle('hascover',!!user.cover);document.getElementById('profileCover').textContent=user.cover?'':'Cover photo · add yours below';document.getElementById('name').value=user.name;document.getElementById('bio').value=user.bio;const [followers,following]=await Promise.all([cloud.from('community_follows').select('follower_id',{count:'exact',head:true}).eq('following_id',cloudUser.id),cloud.from('community_follows').select('following_id',{count:'exact',head:true}).eq('follower_id',cloudUser.id)]);const stats=document.getElementById('followStats');if(stats)stats.textContent='Followers '+(followers.count||0)+' · Following '+(following.count||0)}
function showApp(){document.body.classList.remove('locked');document.getElementById('authGate').style.display='none';loadCloudProfile();loadCommunity()}
cloud.auth.onAuthStateChange((event,session)=>{cloudUser=session?.user||null;if(cloudUser){showApp();if(event==='PASSWORD_RECOVERY'){document.getElementById('loginForm').style.display='none';document.getElementById('signupForm').style.display='none';document.getElementById('recoveryForm').style.display='block';document.getElementById('authTitle').textContent='Reset password.';authMsg('Choose a new password.');document.body.classList.add('locked');document.getElementById('authGate').style.display='flex';document.body.classList.add('locked')}}else{document.body.classList.add('locked');document.getElementById('authGate').style.display='flex';showLogin()}});
async function removeCoverPhoto(){if(!cloudUser){document.getElementById('profileMsg').textContent='Please sign in first.';return}if(!user.cover&&!coverSelected){document.getElementById('profileMsg').textContent='There is no cover photo to remove.';return}if(coverSelected){coverSelected=null;document.getElementById('coverFile').value='';document.getElementById('coverPreview').innerHTML='';document.getElementById('profileMsg').textContent='Selected cover cleared. Save profile to keep this change.';return}const msg=document.getElementById('profileMsg');msg.textContent='Removing cover photo…';const {error}=await cloud.from('profiles').update({cover_photo_path:null,updated_at:new Date().toISOString()}).eq('id',cloudUser.id);if(error){msg.textContent='Could not remove cover: '+error.message;return}user.cover='';coverSelected=null;document.getElementById('coverFile').value='';document.getElementById('coverPreview').innerHTML='';await loadCloudProfile();msg.textContent='Cover photo removed from your profile.'}
async function uploadProfileAsset(file,kind){if(!file)return null;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){throw new Error('Use a JPG, PNG or WebP image.')}if(file.size>5*1024*1024)throw new Error('Image must be 5 MB or smaller.');const ext=file.type.split('/')[1].replace('jpeg','jpg'),path=cloudUser.id+'/'+kind+'-'+Date.now()+'.'+ext;const {error}=await cloud.storage.from('member-profile-media').upload(path,file,{upsert:false,contentType:file.type});if(error)throw error;const {data}=cloud.storage.from('member-profile-media').getPublicUrl(path);return data.publicUrl}
document.getElementById('photoFile').addEventListener('change',e=>{profileFileSelected=e.target.files[0]||null;if(profileFileSelected)document.getElementById('profilePreview').textContent='Selected: '+profileFileSelected.name});
document.getElementById('coverFile').addEventListener('change',e=>{coverSelected=e.target.files[0]||null;if(coverSelected){const preview=document.getElementById('coverPreview');preview.innerHTML='<p class="small">Cover selected: '+esc(coverSelected.name)+'</p>';readImage(coverSelected,5*1024*1024,data=>preview.innerHTML='<img class="postimg" alt="Cover preview" src="'+data+'">')}});
document.getElementById('profileForm').addEventListener('submit',async e=>{e.preventDefault();if(!cloudUser){document.getElementById('profileMsg').textContent='Please sign in first.';return}const name=document.getElementById('name').value.trim(),username=document.getElementById('profileUsernameInput').value.trim().toLowerCase(),bio=document.getElementById('bio').value.trim();if(!name||!username){document.getElementById('profileMsg').textContent='Display name and username are required.';return}if(!/^[a-z0-9_]{3,20}$/.test(username)){document.getElementById('profileMsg').textContent='Username must be 3–20 letters, numbers or underscores.';return}const msg=document.getElementById('profileMsg');msg.textContent='Saving profile securely…';try{let avatarUrl=user.photo||null,coverUrl=user.cover||null;if(profileFileSelected)avatarUrl=await uploadProfileAsset(profileFileSelected,'avatar');if(coverSelected)coverUrl=await uploadProfileAsset(coverSelected,'cover');const {data:collision}=await cloud.from('profiles').select('id').ilike('username',username).neq('id',cloudUser.id).maybeSingle();if(collision){msg.textContent='Username already taken. Please choose another.';return}const {error}=await cloud.from('profiles').update({display_name:name,username,bio,avatar_path:avatarUrl,cover_photo_path:coverUrl,updated_at:new Date().toISOString()}).eq('id',cloudUser.id);if(error)throw error;user={name,username,bio,photo:avatarUrl||'',cover:coverUrl||''};profileFileSelected=null;coverSelected=null;msg.textContent='Profile saved to your account. It will sync across devices.';await loadCloudProfile()}catch(err){msg.textContent='Save failed: '+(err.message||'Please try again.')}})

let isOlatunsAdmin=false;
let cloudPosts=[];
let cloudLikeIds=new Set();
let selectedCommunityFile=null;
function safeMessage(id,message){const el=document.getElementById(id);if(el)el.textContent=message||''}
function displayDate(value){const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString()}
async function loadAnnouncements(){
 const list=document.getElementById('announcementList');
 const {data,error}=await cloud.from('site_notifications').select('id,title,message,created_at').eq('published',true).order('created_at',{ascending:false}).limit(20);
 if(error){list.innerHTML='<div class="card">Official updates are temporarily unavailable. Please try again later.</div>';console.error(error);return}
 if(!data?.length){list.innerHTML='<div class="card">There are no official announcements yet. Check back for updates.</div>';return}
 list.innerHTML=data.map(n=>'<article class="card"><b>'+esc(n.title)+'</b><p>'+esc(n.message)+'</p><div class="small">'+esc(displayDate(n.created_at))+'</div></article>').join('');
}
async function loadCommunity(){
 if(!cloudUser)return;
 const adminCheck=await cloud.from('admin_users').select('user_id').eq('user_id',cloudUser.id).maybeSingle();
 isOlatunsAdmin=!!adminCheck.data;
 window.olatunsAdmin=isOlatunsAdmin;
 document.querySelectorAll('[data-page="drafts"]').forEach(el=>el.hidden=!isOlatunsAdmin);
 document.getElementById('drafts').hidden=!isOlatunsAdmin;
 document.getElementById('announcementForm').style.display=isOlatunsAdmin?'block':'none';
 document.getElementById('moderationSection').style.display=isOlatunsAdmin?'block':'none';
 await Promise.all([loadAnnouncements(),loadCloudFeed()]);
 if(isOlatunsAdmin)await loadPendingPosts();
}
async function loadCloudFeed(){
 const feed=document.getElementById('feed');
 const {data,error}=await cloud.from('community_posts').select('id,title,caption,media_url,media_type,created_by,created_at,moderation_status').order('created_at',{ascending:false}).limit(50);
 if(error){feed.innerHTML='<div class="card">Could not load the community feed. Please refresh and try again.</div>';console.error(error);return}
 cloudPosts=data||[];
 if(!cloudPosts.length){feed.innerHTML='<div class="card">No community posts yet. Be the first to share something.</div>';return}
 const ids=[...new Set(cloudPosts.map(p=>p.created_by))],postIds=cloudPosts.map(p=>p.id);
 const [profilesResult,likesResult,commentsResult,followsResult]=await Promise.all([
  cloud.from('profiles').select('id,display_name,username,avatar_path').in('id',ids),
  cloud.from('community_post_likes').select('post_id,user_id').in('post_id',postIds),
  cloud.from('community_post_comments').select('id,post_id,user_id,body,created_at').in('post_id',postIds).order('created_at',{ascending:true}).limit(150),
  cloud.from('community_follows').select('follower_id,following_id').in('following_id',ids)
 ]);
 const profileMap=new Map((profilesResult.data||[]).map(p=>[p.id,p]));
 const likeRows=likesResult.data||[],commentRows=commentsResult.data||[],followRows=followsResult.data||[];
 cloudLikeIds=new Set(likeRows.filter(x=>x.user_id===cloudUser.id).map(x=>x.post_id));
 const commentsByPost=new Map();
 commentRows.forEach(c=>{if(!commentsByPost.has(c.post_id))commentsByPost.set(c.post_id,[]);commentsByPost.get(c.post_id).push(c)});
 const mediaPaths=cloudPosts.filter(p=>p.media_url&&p.media_type==='image').map(p=>p.media_url);
 let signedMap=new Map();
 if(mediaPaths.length){const {data:signed}=await cloud.storage.from('community-media').createSignedUrls(mediaPaths,3600);(signed||[]).forEach((item,i)=>{if(item.signedUrl)signedMap.set(mediaPaths[i],item.signedUrl)})}
 feed.innerHTML=cloudPosts.map(p=>{
  const profile=profileMap.get(p.created_by)||{},name=profile.display_name||'Olatuns member',photo=profile.avatar_path||'';
  const count=likeRows.filter(x=>x.post_id===p.id).length,liked=cloudLikeIds.has(p.id),mine=p.created_by===cloudUser.id;
  const media=signedMap.get(p.media_url),comments=commentsByPost.get(p.id)||[];
  const followers=followRows.filter(x=>x.following_id===p.created_by).length,following=followRows.some(x=>x.following_id===p.created_by&&x.follower_id===cloudUser.id);
  const status=p.moderation_status==='pending'&&mine?'<span class="chip">Awaiting review</span>':'';
  const commentHtml=comments.map(c=>'<div class="comment-row"><span>'+esc(c.body)+'</span><small>'+esc(displayDate(c.created_at))+'</small></div>').join('');
  const social=p.moderation_status==='published'?'<div class="postfoot"><button type="button" onclick="toggleCloudLike(\''+p.id+'\')">'+(liked?'♥':'♡')+' '+count+' Like</button>'+(mine?'<button type="button" onclick="deleteCloudPost(\''+p.id+'\')">Delete</button>':'')+(!mine?'<button type="button" onclick="toggleCommunityFollow(\''+p.created_by+'\')">'+(following?'Following':'Follow')+' · '+followers+'</button>':'')+'</div><div class="post-comments"><div class="comment-list">'+commentHtml+'</div><form class="comment-form" onsubmit="submitCommunityComment(event,\''+p.id+'\')"><input maxlength="1500" aria-label="Write a comment" placeholder="Write a comment…" required><button type="submit">Send</button></form></div>':'<div class="postfoot"><span class="small">Post is being reviewed</span></div>';
  return '<article class="post"><div class="posthead">'+avatar(name,photo)+'<div><b>'+esc(name)+'</b><div class="small">'+(profile.username?'@'+esc(profile.username)+' · ':'')+esc(displayDate(p.created_at))+'</div></div></div>'+status+'<div class="postbody">'+esc(p.caption||'')+'</div>'+(media?'<img class="postimg" alt="Community post image" src="'+esc(media)+'">':'')+social+'</article>';
 }).join('');
 const own=cloudPosts.filter(p=>p.created_by===cloudUser.id),ownIds=own.map(p=>p.id);
 document.getElementById('postCount').textContent=own.length;
 document.getElementById('likesCount').textContent=likeRows.filter(x=>ownIds.includes(x.post_id)).length;
}
async function submitCommunityComment(event,postId){
 event.preventDefault();if(!cloudUser)return;
 const form=event.currentTarget,input=form.querySelector('input'),body=input.value.trim();if(!body)return;
 const button=form.querySelector('button');button.disabled=true;
 const {error}=await cloud.from('community_post_comments').insert({post_id:postId,user_id:cloudUser.id,body});
 if(error){alert('Could not add comment: '+error.message);button.disabled=false;return}
 await loadCloudFeed();
}
async function toggleCommunityFollow(targetId){
 if(!cloudUser||targetId===cloudUser.id)return;
 const {data,error}=await cloud.from('community_follows').select('follower_id').eq('follower_id',cloudUser.id).eq('following_id',targetId).maybeSingle();
 if(error){alert('Could not check follow status: '+error.message);return}
 const result=data?await cloud.from('community_follows').delete().eq('follower_id',cloudUser.id).eq('following_id',targetId):await cloud.from('community_follows').insert({follower_id:cloudUser.id,following_id:targetId});
 if(result.error){alert('Could not update follow: '+result.error.message);return}
 await Promise.all([loadCloudFeed(),loadCloudProfile()]);
}
async function loadPendingPosts(){
 const el=document.getElementById('moderationList');
 const {data,error}=await cloud.from('community_posts').select('id,caption,media_url,media_type,created_by,created_at').eq('moderation_status','pending').order('created_at',{ascending:true}).limit(50);
 if(error){el.innerHTML='<div class="card">Could not load posts awaiting approval.</div>';console.error(error);return}
 if(!data?.length){el.innerHTML='<div class="card">There are no posts waiting for approval.</div>';return}
 const ids=[...new Set(data.map(p=>p.created_by))];
 const {data:profiles}=await cloud.from('profiles').select('id,display_name,username').in('id',ids);
 const names=new Map((profiles||[]).map(p=>[p.id,p.display_name||p.username||'Member']));
 el.innerHTML=data.map(p=>'<article class="card"><b>'+esc(names.get(p.created_by)||'Member')+'</b><p>'+esc(p.caption||'Image post')+'</p><div class="small">'+esc(displayDate(p.created_at))+'</div><div class="postfoot"><button class="btn" type="button" onclick="reviewCommunityPost(\''+p.id+'\',\'published\')">Approve</button><button class="btn danger" type="button" onclick="reviewCommunityPost(\''+p.id+'\',\'rejected\')">Reject</button></div></article>').join('');
}
async function reviewCommunityPost(id,status){
 if(!isOlatunsAdmin)return;
 const {error}=await cloud.from('community_posts').update({moderation_status:status,reviewed_by:cloudUser.id,reviewed_at:new Date().toISOString()}).eq('id',id);
 if(error){alert('Could not update this post: '+error.message);return}
 await Promise.all([loadCloudFeed(),loadPendingPosts()]);
}
async function toggleCloudLike(id){
 if(!cloudUser)return;
 const liked=cloudLikeIds.has(id);
 const result=liked?await cloud.from('community_post_likes').delete().eq('post_id',id).eq('user_id',cloudUser.id):await cloud.from('community_post_likes').insert({post_id:id,user_id:cloudUser.id});
 if(result.error){alert('Could not update your like: '+result.error.message);return}
 await loadCloudFeed();
}
async function deleteCloudPost(id){
 const post=cloudPosts.find(p=>p.id===id);
 if(!post||post.created_by!==cloudUser.id)return;
 if(!confirm('Delete your community post?'))return;
 const {error}=await cloud.from('community_posts').delete().eq('id',id);
 if(error){alert('Could not delete post: '+error.message);return}
 if(post.media_url)await cloud.storage.from('community-media').remove([post.media_url]);
 await loadCloudFeed();
}
document.getElementById('postImageFile').addEventListener('change',e=>{
 selectedCommunityFile=e.target.files[0]||null;
 const preview=document.getElementById('postPreview');
 if(!selectedCommunityFile){preview.innerHTML='';return}
 if(!['image/jpeg','image/png','image/webp'].includes(selectedCommunityFile.type)||selectedCommunityFile.size>5*1024*1024){
  selectedCommunityFile=null;e.target.value='';preview.textContent='Choose a JPG, PNG or WebP image up to 5 MB.';return
 }
 readImage(e.target.files[0],5*1024*1024,data=>preview.innerHTML='<img class="postimg" alt="Post preview" src="'+data+'">');
});
document.getElementById('postForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!cloudUser){safeMessage('postMsg','Please sign in to post.');return}
 const caption=document.getElementById('postText').value.trim();
 if(!caption&&!selectedCommunityFile){safeMessage('postMsg','Write a message or choose an image first.');return}
 const button=e.target.querySelector('button[type="submit"]');button.disabled=true;safeMessage('postMsg','Submitting your post for review…');
 try{
  let mediaPath=null;
  if(selectedCommunityFile){
   const ext=selectedCommunityFile.type.split('/')[1].replace('jpeg','jpg');
   mediaPath=cloudUser.id+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
   const {error:uploadError}=await cloud.storage.from('community-media').upload(mediaPath,selectedCommunityFile,{upsert:false,contentType:selectedCommunityFile.type});
   if(uploadError)throw uploadError;
  }
  const {error}=await cloud.from('community_posts').insert({title:'',caption,media_url:mediaPath,media_type:mediaPath?'image':null,created_by:cloudUser.id,moderation_status:'pending',category:'Member Community'});
  if(error){if(mediaPath)await cloud.storage.from('community-media').remove([mediaPath]);throw error}
  e.target.reset();selectedCommunityFile=null;document.getElementById('postPreview').innerHTML='';
  safeMessage('postMsg','Submitted. Your post will appear after approval.');
  await loadCloudFeed();if(isOlatunsAdmin)await loadPendingPosts();
 }catch(err){safeMessage('postMsg','Post failed: '+(err.message||'Please try again.'))}
 finally{button.disabled=false}
});
document.getElementById('announcementForm').addEventListener('submit',async e=>{
 e.preventDefault();if(!isOlatunsAdmin){safeMessage('announcementMsg','Admin access is required.');return}
 const title=document.getElementById('announcementTitle').value.trim(),message=document.getElementById('announcementMessage').value.trim();
 if(!title||!message)return;
 const button=e.target.querySelector('button[type="submit"]');button.disabled=true;safeMessage('announcementMsg','Publishing…');
 const {error}=await cloud.from('site_notifications').insert({title,message,published:true});
 if(error)safeMessage('announcementMsg','Could not publish: '+error.message);
 else{e.target.reset();safeMessage('announcementMsg','Announcement published.');await loadAnnouncements()}
 button.disabled=false;
});
