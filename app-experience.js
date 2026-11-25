let activeConversationId=null,activeAssistantConversationId=null,experienceUserId=null;
window.showExperiencePanel=function(id){document.querySelectorAll('.experience-panel').forEach(p=>p.hidden=true);const panel=document.getElementById(id);if(panel)panel.hidden=false;};
window.hideExperiencePanels=function(){document.querySelectorAll('.experience-panel').forEach(p=>p.hidden=true);};
function expMsg(id,text){const el=document.getElementById(id);if(el)el.textContent=text||''}
function expEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function expDate(v){return v?new Date(v).toLocaleString():''}
async function experienceInit(){
 if(!cloudUser||experienceUserId===cloudUser.id)return;experienceUserId=cloudUser.id;
 await Promise.all([loadMemberNotifications(),loadMessages()]);
 const bind=(id,fn)=>{const el=document.getElementById(id);if(el&&!el.dataset.bound){el.dataset.bound='1';el.addEventListener('submit',fn)}};
 bind('experienceSearchForm',searchExperience);bind('directMessageForm',sendDirectMessage);bind('memberSettingsForm',saveMemberSettings);bind('supportRequestForm',submitSupportRequest);bind('createPlaylistForm',createMixtapePlaylist);
}
cloud.auth.onAuthStateChange((event,session)=>{if(session?.user){experienceUserId=null;setTimeout(experienceInit,0)}else{experienceUserId=null;activeConversationId=null;hideExperiencePanels()}});
cloud.auth.getSession().then(({data})=>{if(data?.session?.user)experienceInit()});
window.openMemberProfile=async function(id){
 if(!cloudUser||!id)return;showExperiencePanel('memberProfilePanel');const el=document.getElementById('memberProfileContent');el.innerHTML='<p class="small">Loading member profile…</p>';
 const [{data:p,error},{data:posts},{count:followers},{count:following}]=await Promise.all([cloud.from('profiles').select('id,display_name,username,bio,avatar_path').eq('id',id).maybeSingle(),cloud.from('community_posts').select('id,caption,created_at').eq('created_by',id).eq('moderation_status','published').order('created_at',{ascending:false}).limit(12),cloud.from('community_follows').select('follower_id',{count:'exact',head:true}).eq('following_id',id),cloud.from('community_follows').select('following_id',{count:'exact',head:true}).eq('follower_id',id)]);
 if(error||!p){el.innerHTML='<p>This profile is private or unavailable.</p>';return}
 const self=id===cloudUser.id;const {data:follow}=self?{data:null}:await cloud.from('community_follows').select('follower_id').eq('follower_id',cloudUser.id).eq('following_id',id).maybeSingle();
 el.innerHTML='<div class="posthead">'+(p.avatar_path?'<img class="avatar" src="'+expEsc(p.avatar_path)+'" alt="">':'<div class="avatar">'+expEsc(profileInitials(p.display_name||p.username))+'</div>')+'<div><b>'+expEsc(p.display_name||'Olatuns member')+'</b><div class="small">@'+expEsc(p.username||'member')+'</div></div></div><p>'+expEsc(p.bio||'')+'</p><div class="chip">'+(followers||0)+' followers</div><div class="chip">'+(following||0)+' following</div><div class="postfoot">'+(!self?'<button class="btn secondary" onclick="toggleCommunityFollow(\''+id+'\')">'+(follow?'Following · Unfollow':'Follow')+'</button><button class="btn" onclick="startMemberMessage(\''+id+'\')">Message</button>':'<span class="small">Your profile</span>')+'</div><h3>Recent posts</h3>'+(posts||[]).map(x=>'<div class="card"><p>'+expEsc(x.caption||'')+'</p><span class="small">'+expDate(x.created_at)+'</span></div>').join('');
};
window.searchExperience=async function(e){
 e.preventDefault();const q=document.getElementById('experienceSearchInput').value.trim();if(!q)return;const out=document.getElementById('experienceSearchResults');out.innerHTML='<p class="small">Searching…</p>';
 const [{data:people},{data:posts},{data:tracks}]=await Promise.all([cloud.from('profiles').select('id,display_name,username').or('display_name.ilike.%'+q+'%,username.ilike.%'+q+'%').limit(12),cloud.from('community_posts').select('id,caption,created_by').eq('moderation_status','published').ilike('caption','%'+q+'%').limit(12),cloud.from('olatuns_mixtapes').select('id,title,description').eq('published',true).ilike('title','%'+q+'%').limit(12)]);
 const ph=(people||[]).map(p=>'<div class="experience-result"><div class="result-main"><b>'+expEsc(p.display_name||p.username)+'</b><div class="small">@'+expEsc(p.username)+'</div></div><button class="btn secondary" onclick="openMemberProfile(\''+p.id+'\')">View</button></div>').join('');
 const th=(tracks||[]).map(t=>'<div class="experience-result"><div class="result-main"><b>'+expEsc(t.title)+'</b><div class="small">'+expEsc(t.description||'DJ Olatuns release')+'</div></div><button class="btn secondary" onclick="go(\'mixtapes\')">Music</button></div>').join('');
 const po=(posts||[]).map(p=>'<div class="experience-result"><div class="result-main">'+expEsc(p.caption||'Community post')+'</div><button class="btn secondary" onclick="openMemberProfile(\''+p.created_by+'\')">Author</button></div>').join('');
 out.innerHTML=(ph?'<h3>Members</h3>'+ph:'')+(th?'<h3>Mixtapes</h3>'+th:'')+(po?'<h3>Posts</h3>'+po:'')+(!ph&&!th&&!po?'<p class="small">No results found.</p>':'');
};
window.startMemberMessage=async function(id){const {data,error}=await cloud.rpc('start_direct_conversation',{target_user_id:id});if(error){alert(error.message);return}activeConversationId=data;showExperiencePanel('messagesPanel');await loadMessages();await openConversation(data)};
async function loadMessages(){
 if(!cloudUser)return;const list=document.getElementById('conversationList');if(!list)return;list.innerHTML='<p class="small">Loading conversations…</p>';
 const {data:members,error}=await cloud.from('conversation_members').select('conversation_id,user_id').eq('user_id',cloudUser.id);
 if(error){list.innerHTML='<p class="small">Could not load conversations.</p>';return}
 const ids=(members||[]).map(x=>x.conversation_id);if(!ids.length){list.innerHTML='<p class="small">No messages yet. Open a member profile and choose Message to start.</p>';return}
 const [{data:convos},{data:allMembers}]=await Promise.all([cloud.from('conversations').select('id,last_message_at').in('id',ids).order('last_message_at',{ascending:false}),cloud.from('conversation_members').select('conversation_id,user_id').in('conversation_id',ids)]);
 const otherIds=[...new Set((allMembers||[]).filter(x=>x.user_id!==cloudUser.id).map(x=>x.user_id))];const {data:profiles}=otherIds.length?await cloud.from('profiles').select('id,display_name,username').in('id',otherIds):{data:[]};const names=new Map((profiles||[]).map(p=>[p.id,p.display_name||p.username||'Member']));
 list.innerHTML=(convos||[]).map(c=>{const other=(allMembers||[]).find(x=>x.conversation_id===c.id&&x.user_id!==cloudUser.id);return '<button class="card" style="display:block;width:100%;text-align:left" onclick="openConversation(\''+c.id+'\')"><b>'+expEsc(names.get(other?.user_id)||'Member')+'</b><div class="small">'+expDate(c.last_message_at)+'</div></button>'}).join('');
}
window.openConversation=async function(id){
 activeConversationId=id;const members=await cloud.from('conversation_members').select('user_id').eq('conversation_id',id);const other=(members.data||[]).find(x=>x.user_id!==cloudUser.id);const profile=other?await cloud.from('profiles').select('display_name,username').eq('id',other.user_id).maybeSingle():{data:null};
 document.getElementById('messageThreadTitle').textContent=profile.data?.display_name||profile.data?.username||'Conversation';
 const {data,error}=await cloud.from('direct_messages').select('id,sender_id,body,created_at,read_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(200);const thread=document.getElementById('messageThread');
 if(error){thread.innerHTML='<p class="small">Could not load messages.</p>';return}
 thread.innerHTML=(data||[]).map(m=>'<div class="message-bubble '+(m.sender_id===cloudUser.id?'mine':'')+'">'+expEsc(m.body)+'<div class="small">'+expDate(m.created_at)+'</div></div>').join('')||'<p class="small">Say hello to start the conversation.</p>';
 const unread=(data||[]).filter(m=>m.sender_id!==cloudUser.id&&!m.read_at).map(m=>m.id);if(unread.length)await cloud.from('direct_messages').update({read_at:new Date().toISOString()}).in('id',unread);thread.scrollTop=thread.scrollHeight;
};
async function sendDirectMessage(e){
 e.preventDefault();if(!activeConversationId)return expMsg('directMessageStatus','Choose a conversation first.');const input=document.getElementById('directMessageInput'),body=input.value.trim();if(!body)return;
 const {error}=await cloud.from('direct_messages').insert({conversation_id:activeConversationId,sender_id:cloudUser.id,body});if(error){expMsg('directMessageStatus',error.message);return}input.value='';expMsg('directMessageStatus','Sent.');await openConversation(activeConversationId);await loadMessages();
}
async function loadMemberNotifications(){
 if(!cloudUser)return;const list=document.getElementById('memberNotificationList');if(!list)return;
 const {data:pref}=await cloud.from('member_settings').select('push_enabled').eq('user_id',cloudUser.id).maybeSingle();
 if(pref?.push_enabled===false){list.innerHTML='<p class="small">In-app notifications are paused in your settings.</p>';const badge=document.getElementById('notificationBadge');if(badge)badge.textContent='Paused';return}
 const {data,error}=await cloud.from('member_notifications').select('id,actor_id,notification_type,title,body,entity_id,read_at,created_at').eq('recipient_id',cloudUser.id).order('created_at',{ascending:false}).limit(80);
 if(error){list.innerHTML='<p class="small">Notifications are unavailable.</p>';return}const unread=(data||[]).filter(x=>!x.read_at).length;const badge=document.getElementById('notificationBadge');if(badge)badge.textContent=unread+' new';
 list.innerHTML=(data||[]).map(n=>'<button class="card" style="display:block;width:100%;text-align:left;'+(!n.read_at?'border-color:#80622a':'')+'" onclick="openNotification(\''+n.id+'\',\''+(n.actor_id||'')+'\',\''+n.notification_type+'\',\''+(n.entity_id||'')+'\')"><b>'+expEsc(n.title)+'</b><p>'+expEsc(n.body)+'</p><span class="small">'+expDate(n.created_at)+'</span></button>').join('')||'<p class="small">You are all caught up.</p>';
}
window.openNotification=async function(id,actor,type,entity){await cloud.from('member_notifications').update({read_at:new Date().toISOString()}).eq('id',id);if(type==='message'){showExperiencePanel('messagesPanel');await loadMessages();if(entity)await openConversation(entity)}else if(actor)await openMemberProfile(actor);await loadMemberNotifications()};
async function loadMemberSettings(){if(!cloudUser)return;const {data,error}=await cloud.from('member_settings').select('*').eq('user_id',cloudUser.id).maybeSingle();if(error){expMsg('settingsStatus','Could not load settings.');return}document.getElementById('profileVisibility').value=data?.profile_visibility||'public';document.getElementById('messagePermission').value=data?.allow_messages||'everyone';document.getElementById('pushPreference').checked=data?.push_enabled!==false}
async function saveMemberSettings(e){e.preventDefault();const {error}=await cloud.from('member_settings').upsert({user_id:cloudUser.id,profile_visibility:document.getElementById('profileVisibility').value,allow_messages:document.getElementById('messagePermission').value,push_enabled:document.getElementById('pushPreference').checked,updated_at:new Date().toISOString()});expMsg('settingsStatus',error?'Could not save settings: '+error.message:'Settings saved securely.')}
async function submitSupportRequest(e){e.preventDefault();const subject=document.getElementById('supportSubject').value.trim(),message=document.getElementById('supportMessage').value.trim();const {error}=await cloud.from('support_requests').insert({user_id:cloudUser.id,subject,message});expMsg('supportStatus',error?'Could not send request: '+error.message:'Your support request has been sent.');if(!error){e.target.reset();await loadSupportRequests()}}
async function loadSupportRequests(){if(!cloudUser)return;const el=document.getElementById('supportRequestList');const {data,error}=await cloud.from('support_requests').select('id,subject,status,created_at').eq('user_id',cloudUser.id).order('created_at',{ascending:false}).limit(20);el.innerHTML=error?'<p class="small">Could not load requests.</p>':(data||[]).map(x=>'<div class="card"><b>'+expEsc(x.subject)+'</b><div class="small">'+expEsc(x.status)+' · '+expDate(x.created_at)+'</div></div>').join('')||'<p class="small">No support requests yet.</p>'}
async function loadTransactions(){if(!cloudUser)return;const el=document.getElementById('transactionList');const {data,error}=await cloud.from('payment_transactions').select('provider,provider_reference,amount_minor,currency,status,created_at').eq('user_id',cloudUser.id).order('created_at',{ascending:false}).limit(50);el.innerHTML=error?'<p class="small">Could not load transactions.</p>':(data||[]).map(x=>'<div class="card"><b>'+expEsc(x.currency)+' '+(Number(x.amount_minor)/100).toLocaleString()+'</b><div class="small">'+expEsc(x.status)+' · '+expEsc(x.provider)+' · '+expDate(x.created_at)+'</div><div class="small">Reference: '+expEsc(x.provider_reference)+'</div></div>').join('')||'<p class="small">No verified transactions yet. Payments are not enabled in this version.</p>'}
async function requestAccountDeletion(){if(!confirm('Send an account deletion request to the DJ Olatuns team? This will not delete your account immediately.'))return;const {error}=await cloud.from('support_requests').insert({user_id:cloudUser.id,subject:'Account deletion request',message:'Please contact me to confirm and process my account deletion request.'});expMsg('deletionStatus',error?'Could not send request: '+error.message:'Request submitted. Your account remains active until the team processes it.')}
async function loadSavedMixtapes(){
 if(!cloudUser)return;
 const el=document.getElementById('savedMixtapeList');
 const [{data:saved,error},{data:playlists, error:playlistError}]=await Promise.all([
  cloud.from('user_saved_mixtapes').select('mixtape_id,created_at').eq('user_id',cloudUser.id).order('created_at',{ascending:false}),
  cloud.from('mixtape_playlists').select('id,name,created_at').eq('user_id',cloudUser.id).order('created_at',{ascending:false})
 ]);
 if(error){el.textContent='Could not load saved music.';return}
 const ids=(saved||[]).map(x=>x.mixtape_id);
 const {data:tracks}=ids.length?await cloud.from('olatuns_mixtapes').select('id,title,description').in('id',ids):{data:[]};
 el.innerHTML=(tracks||[]).map(t=>'<div class="experience-result"><div class="result-main"><b>'+expEsc(t.title)+'</b><div class="small">'+expEsc(t.description||'')+'</div></div><button class="btn secondary" onclick="toggleSavedMixtape(\''+t.id+'\')">Remove</button></div>').join('')||'<p class="small">You have not saved any mixtapes yet.</p>';
 const list=document.getElementById('playlistList');
 list.innerHTML=playlistError?'<p class="small">Could not load playlists.</p>':(playlists||[]).map(p=>'<div class="experience-result"><div class="result-main"><b>'+expEsc(p.name)+'</b></div><button class="btn secondary" onclick="openMixtapePlaylist(\''+p.id+'\')">Open</button></div>').join('')||'<p class="small">Create your first playlist above.</p>';
}
async function createMixtapePlaylist(e){
 e.preventDefault();const input=document.getElementById('newPlaylistName'),name=input.value.trim();if(!name)return;
 const {error}=await cloud.from('mixtape_playlists').insert({user_id:cloudUser.id,name});
 if(error){alert('Could not create playlist: '+error.message);return}
 input.value='';await loadSavedMixtapes();
}
window.openMixtapePlaylist=async function(id){
 const detail=document.getElementById('playlistDetail');
 const [{data:items,error},{data:saved}]=await Promise.all([
  cloud.from('mixtape_playlist_items').select('mixtape_id,position').eq('playlist_id',id).eq('user_id',cloudUser.id).order('position'),
  cloud.from('user_saved_mixtapes').select('mixtape_id').eq('user_id',cloudUser.id)
 ]);
 if(error){detail.textContent='Could not load playlist.';return}
 const ids=(items||[]).map(x=>x.mixtape_id);
 const {data:tracks}=ids.length?await cloud.from('olatuns_mixtapes').select('id,title').in('id',ids):{data:[]};
 const savedIds=(saved||[]).map(x=>x.mixtape_id),available=savedIds.filter(x=>!ids.includes(x));
 const {data:savedTracks}=available.length?await cloud.from('olatuns_mixtapes').select('id,title').in('id',available):{data:[]};
 detail.innerHTML='<h3>Playlist</h3>'+((tracks||[]).map(t=>'<div class="experience-result"><b class="result-main">'+expEsc(t.title)+'</b><button class="btn secondary" onclick="removePlaylistItem(\''+id+'\',\''+t.id+'\')">Remove</button></div>').join('')||'<p class="small">This playlist is empty.</p>')+(savedTracks?.length?'<div class="field"><label>Add a saved mixtape</label><select id="playlistTrackSelect">'+savedTracks.map(t=>'<option value="'+t.id+'">'+expEsc(t.title)+'</option>').join('')+'</select></div><button class="btn" onclick="addPlaylistItem(\''+id+'\')">Add to playlist</button>':'<p class="small">Save a mixtape first to add it here.</p>');
};
window.addPlaylistItem=async function(id){
 const track=document.getElementById('playlistTrackSelect')?.value;if(!track)return;
 const {error}=await cloud.from('mixtape_playlist_items').insert({playlist_id:id,user_id:cloudUser.id,mixtape_id:track});
 if(error)alert('Could not add mixtape: '+error.message);else{await openMixtapePlaylist(id);await loadSavedMixtapes()}
};
window.removePlaylistItem=async function(id,track){
 const {error}=await cloud.from('mixtape_playlist_items').delete().eq('playlist_id',id).eq('user_id',cloudUser.id).eq('mixtape_id',track);
 if(error)alert('Could not remove mixtape: '+error.message);else{await openMixtapePlaylist(id);await loadSavedMixtapes()}
};
window.toggleSavedMixtape=async function(id){const {data,error}=await cloud.from('user_saved_mixtapes').select('mixtape_id').eq('user_id',cloudUser.id).eq('mixtape_id',id).maybeSingle();if(error)return alert('Could not check saved music.');const result=data?await cloud.from('user_saved_mixtapes').delete().eq('user_id',cloudUser.id).eq('mixtape_id',id):await cloud.from('user_saved_mixtapes').insert({user_id:cloudUser.id,mixtape_id:id});if(result.error)alert(result.error.message);else{await loadSavedMixtapes();await loadOlatunsMixtapes()}};
window.playOlatunsMix=function(id){const src=window.olatunsMixSources?.[id];if(!src)return;const audio=document.getElementById('olatunsAudioPlayer'),panel=document.getElementById('miniPlayer');audio.src=src;panel.hidden=false;document.getElementById('miniPlayerTitle').textContent=window.olatunsMixTitles?.[id]||'DJ Olatuns Mixtape';audio.play().catch(()=>expMsg('miniPlayerTitle','Tap play to start listening.'));if(typeof recordMixtapePlay==='function')recordMixtapePlay(id)};
async function loadAssistantHistory(){if(!cloudUser)return;const list=document.getElementById('assistantConversationList');const {data,error}=await cloud.from('ai_support_conversations').select('id,title,updated_at').eq('user_id',cloudUser.id).order('updated_at',{ascending:false}).limit(30);list.innerHTML=error?'<p class="small">Could not load AI history.</p>':(data||[]).map(c=>'<button class="card" style="display:block;width:100%;text-align:left" onclick="openAssistantConversation(\''+c.id+'\')">'+expEsc(c.title)+'<div class="small">'+expDate(c.updated_at)+'</div></button>').join('')||'<p class="small">No saved AI conversations yet.</p>'}
window.createAssistantConversation=async function(){const {data,error}=await cloud.from('ai_support_conversations').insert({user_id:cloudUser.id,title:'New conversation'}).select('id').single();if(error){alert('Could not create conversation: '+error.message);return}activeAssistantConversationId=data.id;await loadAssistantHistory();await openAssistantConversation(data.id)};
window.openAssistantConversation=async function(id){activeAssistantConversationId=id;const {data,error}=await cloud.from('ai_support_messages').select('id,role,content,created_at').eq('conversation_id',id).eq('user_id',cloudUser.id).order('created_at',{ascending:true}).limit(100);const el=document.getElementById('assistantMessages');el.innerHTML=error?'<p class="small">Could not load this conversation.</p>':(data||[]).map(m=>'<div class="message-bubble '+(m.role==='user'?'mine':'')+'"><b>'+expEsc(m.role)+'</b><p>'+expEsc(m.content)+'</p><span class="small">'+expDate(m.created_at)+'</span></div>').join('')||'<p class="small">This conversation is empty.</p>'};

window.loadCreatorAnalytics=async function(){
 const el=document.getElementById('creatorAnalytics');if(!isOlatunsAdmin){el.textContent='Administrator access required.';return}
 el.innerHTML='<p class="small">Loading creator analytics…</p>';
 const [posts,follows,likes,tracks,bookings,support,transactions]=await Promise.all([
  cloud.from('community_posts').select('id',{count:'exact',head:true}),
  cloud.from('community_follows').select('follower_id',{count:'exact',head:true}),
  cloud.from('community_post_likes').select('post_id',{count:'exact',head:true}),
  cloud.from('olatuns_mixtapes').select('play_count').eq('published',true),
  cloud.from('booking_requests').select('id',{count:'exact',head:true}),
  cloud.from('support_requests').select('id,subject,status,created_at').order('created_at',{ascending:false}).limit(30),
  cloud.from('payment_transactions').select('id',{count:'exact',head:true})
 ]);
 const plays=(tracks.data||[]).reduce((sum,x)=>sum+Number(x.play_count||0),0);
 el.innerHTML='<div class="grid"><div class="card"><b>'+(posts.count||0)+'</b><div class="small">Community posts</div></div><div class="card"><b>'+(follows.count||0)+'</b><div class="small">Member connections</div></div><div class="card"><b>'+(likes.count||0)+'</b><div class="small">Post likes</div></div><div class="card"><b>'+plays+'</b><div class="small">Mixtape plays</div></div><div class="card"><b>'+(bookings.count||0)+'</b><div class="small">Booking requests</div></div><div class="card"><b>'+(transactions.count||0)+'</b><div class="small">Verified transactions</div></div></div><h3>Support requests</h3>'+((support.data||[]).map(x=>'<div class="card"><b>'+expEsc(x.subject)+'</b><div class="small">'+expEsc(x.status)+' · '+expDate(x.created_at)+'</div><select id="support-status-'+x.id+'"><option value="open" '+(x.status==='open'?'selected':'')+'>Open</option><option value="in_progress" '+(x.status==='in_progress'?'selected':'')+'>In progress</option><option value="resolved" '+(x.status==='resolved'?'selected':'')+'>Resolved</option><option value="closed" '+(x.status==='closed'?'selected':'')+'>Closed</option></select><button class="btn secondary" onclick="updateSupportStatus(\''+x.id+'\')">Update</button></div>').join('')||'<p class="small">No support requests yet.</p>');
};
window.updateSupportStatus=async function(id){
 if(!isOlatunsAdmin)return;const status=document.getElementById('support-status-'+id).value;
 const {error}=await cloud.from('support_requests').update({status,updated_at:new Date().toISOString()}).eq('id',id);
 if(error)alert('Could not update support request: '+error.message);else loadCreatorAnalytics();
};
async function checkAppUpdate(){const el=document.getElementById('appUpdateStatus');if(!el)return;el.textContent='Checking for updates…';if(!('serviceWorker'in navigator)){el.textContent='Service-worker updates are not available in this browser.';return}try{const reg=await navigator.serviceWorker.getRegistration('./');if(!reg){el.textContent='App update service is not registered yet.';return}await reg.update();el.textContent=reg.waiting?'An update is ready. Reload the app to use it.':'You are using the latest version available to this device.'}catch(e){el.textContent='Could not check for updates. Please try again when online.'}}
window.addEventListener('online',()=>{if(cloudUser){loadMessages();loadMemberNotifications()}});
