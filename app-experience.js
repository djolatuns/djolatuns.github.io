let activeConversationId=null,activeAssistantConversationId=null,experienceUserId=null,activeMessageChannel=null,voiceRecorder=null,voiceStream=null,voiceChunks=[],voiceBlob=null,voiceStartedAt=0,voiceDurationMs=0,voicePreviewUrl=null,voiceStopTimer=null,voiceDiscarding=false;
window.showExperiencePanel=function(id){document.querySelectorAll('.experience-panel').forEach(p=>p.hidden=true);const panel=document.getElementById(id);if(panel)panel.hidden=false;};
window.hideExperiencePanels=function(){document.querySelectorAll('.experience-panel').forEach(p=>p.hidden=true);};
function expMsg(id,text){const el=document.getElementById(id);if(el)el.textContent=text||''}
function expEsc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function expDate(v){return v?new Date(v).toLocaleString():''}
async function experienceInit(){
 if(!cloudUser||experienceUserId===cloudUser.id)return;experienceUserId=cloudUser.id;
 await Promise.all([loadMemberNotifications(),loadMessages()]);
 const bind=(id,fn)=>{const el=document.getElementById(id);if(el&&!el.dataset.bound){el.dataset.bound='1';el.addEventListener('submit',fn)}};
 bind('experienceSearchForm',searchExperience);bind('messengerSearchForm',searchMessengerMembers);bind('directMessageForm',sendDirectMessage);const voiceBind=(id,fn)=>{const el=document.getElementById(id);if(el&&!el.dataset.bound){el.dataset.bound='1';el.addEventListener('click',fn)}};voiceBind('voiceRecordButton',startVoiceRecording);voiceBind('voiceStopButton',stopVoiceRecording);voiceBind('voiceCancelButton',cancelVoiceRecording);voiceBind('voicePreviewCancelButton',cancelVoiceRecording);voiceBind('voiceSendButton',sendVoiceMessage);bind('memberSettingsForm',saveMemberSettings);bind('supportRequestForm',submitSupportRequest);bind('createPlaylistForm',createMixtapePlaylist);
}
cloud.auth.onAuthStateChange((event,session)=>{if(session?.user){experienceUserId=null;setTimeout(experienceInit,0)}else{experienceUserId=null;activeConversationId=null;hideExperiencePanels()}});
cloud.auth.getSession().then(({data})=>{if(data?.session?.user)experienceInit()});
window.openMemberProfile=async function(id){
 if(!cloudUser||!id)return;showExperiencePanel('memberProfilePanel');const el=document.getElementById('memberProfileContent');el.innerHTML='<p class="small">Loading member profile…</p>';
 const [{data:p,error},{data:posts},{count:followers},{count:following}]=await Promise.all([cloud.from('profiles').select('id,display_name,username,bio,avatar_path').eq('id',id).maybeSingle(),cloud.from('community_posts').select('id,caption,created_at').eq('created_by',id).eq('moderation_status','published').order('created_at',{ascending:false}).limit(12),cloud.from('community_follows').select('follower_id',{count:'exact',head:true}).eq('following_id',id),cloud.from('community_follows').select('following_id',{count:'exact',head:true}).eq('follower_id',id)]);
 if(error||!p){el.innerHTML='<p>This profile is private or unavailable.</p>';return}
 const self=id===cloudUser.id;const {data:follow}=self?{data:null}:await cloud.from('community_follows').select('follower_id').eq('follower_id',cloudUser.id).eq('following_id',id).maybeSingle();
 el.innerHTML='<div class="posthead">'+(p.avatar_path?'<img class="avatar" loading="lazy" decoding="async" src="'+expEsc(p.avatar_path)+'" alt="">':'<div class="avatar">'+expEsc(profileInitials(p.display_name||p.username))+'</div>')+'<div><b>'+expEsc(p.display_name||'Olatuns member')+'</b><div class="small">@'+expEsc(p.username||'member')+'</div></div></div><p>'+expEsc(p.bio||'')+'</p><div class="chip">'+(followers||0)+' followers</div><div class="chip">'+(following||0)+' following</div><div class="postfoot">'+(!self?'<button class="btn secondary" onclick="toggleCommunityFollow(\''+id+'\')">'+(follow?'Following · Unfollow':'Follow')+'</button><button class="btn" onclick="startMemberMessage(\''+id+'\')">Message</button>':'<span class="small">Your profile</span>')+'</div><h3>Recent posts</h3>'+(posts||[]).map(x=>'<div class="card"><p>'+expEsc(x.caption||'')+'</p><span class="small">'+expDate(x.created_at)+'</span></div>').join('');
};
window.searchExperience=async function(e){
 e.preventDefault();const q=document.getElementById('experienceSearchInput').value.trim().replace(/[^a-zA-Z0-9_ -]/g,' ');if(!q)return;const out=document.getElementById('experienceSearchResults');out.innerHTML='<p class="small">Searching…</p>';
 const [{data:people},{data:posts},{data:tracks}]=await Promise.all([cloud.from('profiles').select('id,display_name,username').or('display_name.ilike.%'+q+'%,username.ilike.%'+q+'%').limit(12),cloud.from('community_posts').select('id,caption,created_by').eq('moderation_status','published').ilike('caption','%'+q+'%').limit(12),cloud.from('olatuns_mixtapes').select('id,title,description').eq('published',true).ilike('title','%'+q+'%').limit(12)]);
 const ph=(people||[]).map(p=>'<div class="experience-result"><div class="result-main"><b>'+expEsc(p.display_name||p.username)+'</b><div class="small">@'+expEsc(p.username)+'</div></div><button class="btn secondary" onclick="openMemberProfile(\''+p.id+'\')">View</button></div>').join('');
 const th=(tracks||[]).map(t=>'<div class="experience-result"><div class="result-main"><b>'+expEsc(t.title)+'</b><div class="small">'+expEsc(t.description||'DJ Olatuns release')+'</div></div><button class="btn secondary" onclick="go(\'mixtapes\')">Music</button></div>').join('');
 const po=(posts||[]).map(p=>'<div class="experience-result"><div class="result-main">'+expEsc(p.caption||'Community post')+'</div><button class="btn secondary" onclick="openMemberProfile(\''+p.created_by+'\')">Author</button></div>').join('');
 out.innerHTML=(ph?'<h3>Members</h3>'+ph:'')+(th?'<h3>Mixtapes</h3>'+th:'')+(po?'<h3>Posts</h3>'+po:'')+(!ph&&!th&&!po?'<p class="small">No results found.</p>':'');
};
async function searchMessengerMembers(e){
 e.preventDefault();if(!cloudUser)return;const input=document.getElementById('messengerSearchInput'),out=document.getElementById('messengerSearchResults');const q=input.value.trim().replace(/[,%()]/g,' ').replace(/\\s+/g,' ');if(q.length<2){out.innerHTML='<p class="small">Enter at least two characters to find a member.</p>';return}
 out.innerHTML='<p class="small">Finding members…</p>';
 const {data,error}=await cloud.from('profiles').select('id,display_name,username,avatar_path').or('display_name.ilike.%'+q+'%,username.ilike.%'+q+'%').neq('id',cloudUser.id).limit(12);
 if(error){out.innerHTML='<p class="small">Member search is unavailable right now.</p>';return}
 out.innerHTML=(data||[]).map(p=>'<div class="messenger-search-result">'+(p.avatar_path?'<img class="messenger-avatar" src="'+expEsc(p.avatar_path)+'" alt="">':'<div class="messenger-avatar">'+expEsc((p.display_name||p.username||'M').slice(0,1).toUpperCase())+'</div>')+'<div class="result-main"><b>'+expEsc(p.display_name||p.username||'Member')+'</b><div class="small">@'+expEsc(p.username||'member')+'</div></div><button class="btn" type="button" onclick="startMemberMessage(\''+p.id+'\')">Chat</button></div>').join('')||'<p class="small">No members found. Check the spelling or username.</p>';
}
window.startMemberMessage=async function(id){if(!cloudUser||!id)return;expMsg('directMessageStatus','Opening private chat…');const {data,error}=await cloud.rpc('start_direct_conversation',{target_user_id:id});if(error){expMsg('directMessageStatus',error.message);return}activeConversationId=data;showExperiencePanel('messagesPanel');await loadMessages();await openConversation(data);document.getElementById('messengerSearchResults').innerHTML='';document.getElementById('messengerSearchInput').value='';};
async function loadMessages(){
 if(!cloudUser)return;const list=document.getElementById('conversationList');if(!list)return;list.innerHTML='<p class="small">Loading your chats…</p>';
 const {data:members,error}=await cloud.from('conversation_members').select('conversation_id,user_id').eq('user_id',cloudUser.id);
 if(error){list.innerHTML='<p class="small">Could not load private chats.</p>';return}
 const ids=(members||[]).map(x=>x.conversation_id);if(!ids.length){list.innerHTML='<div class="messenger-empty compact"><span>✉</span><b>No chats yet</b><p>Search for a member above to start a private conversation.</p></div>';return}
 const [{data:convos},{data:allMembers},{data:recentMessages}]=await Promise.all([
  cloud.from('conversations').select('id,last_message_at').in('id',ids).order('last_message_at',{ascending:false}),
  cloud.from('conversation_members').select('conversation_id,user_id').in('conversation_id',ids),
  cloud.from('direct_messages').select('id,conversation_id,sender_id,body,message_type,created_at,read_at').in('conversation_id',ids).order('created_at',{ascending:false}).limit(120)
 ]);
 const otherIds=[...new Set((allMembers||[]).filter(x=>x.user_id!==cloudUser.id).map(x=>x.user_id))];
 const {data:profiles}=otherIds.length?await cloud.from('profiles').select('id,display_name,username,avatar_path').in('id',otherIds):{data:[]};
 const profileMap=new Map((profiles||[]).map(p=>[p.id,p]));
 const latest=new Map(),unread=new Map();
 (recentMessages||[]).forEach(m=>{if(!latest.has(m.conversation_id))latest.set(m.conversation_id,m);if(m.sender_id!==cloudUser.id&&!m.read_at)unread.set(m.conversation_id,(unread.get(m.conversation_id)||0)+1)});
 list.innerHTML=(convos||[]).map(c=>{const other=(allMembers||[]).find(x=>x.conversation_id===c.id&&x.user_id!==cloudUser.id),p=profileMap.get(other?.user_id)||{},last=latest.get(c.id),label=p.display_name||p.username||'Member',photo=p.avatar_path?'<img class="messenger-avatar" src="'+expEsc(p.avatar_path)+'" alt="">':'<div class="messenger-avatar">'+expEsc(label.slice(0,1).toUpperCase())+'</div>';return '<button class="messenger-conversation '+(activeConversationId===c.id?'active':'')+'" type="button" onclick="openConversation(\''+c.id+'\')">'+photo+'<span class="messenger-conversation-copy"><b>'+expEsc(label)+'</b><small>'+(last?expEsc(last.message_type==='audio'?(last.sender_id===cloudUser.id?'You: 🎙 Voice message':'🎙 Voice message'):(last.sender_id===cloudUser.id?'You: '+last.body:last.body)):'No messages yet')+'</small></span>'+(unread.get(c.id)?'<span class="messenger-unread">'+unread.get(c.id)+'</span>':'')+'</button>'}).join('')||'<p class="small">No chats yet.</p>';
}
window.openConversation=async function(id){
 if(!cloudUser||!id)return;activeConversationId=id;
 if(activeMessageChannel){await cloud.removeChannel(activeMessageChannel);activeMessageChannel=null}
 const members=await cloud.from('conversation_members').select('user_id').eq('conversation_id',id);const other=(members.data||[]).find(x=>x.user_id!==cloudUser.id);const profile=other?await cloud.from('profiles').select('display_name,username,avatar_path').eq('id',other.user_id).maybeSingle():{data:null};
 const title=profile.data?.display_name||profile.data?.username||'Private conversation';
 const head=document.getElementById('messageThreadTitle');head.innerHTML=(profile.data?.avatar_path?'<img class="messenger-avatar" src="'+expEsc(profile.data.avatar_path)+'" alt="">':'<span class="messenger-avatar">'+expEsc(title.slice(0,1).toUpperCase())+'</span>')+'<span><b>'+expEsc(title)+'</b><small>@'+expEsc(profile.data?.username||'member')+' · Private chat</small></span>';
 const {data,error}=await cloud.from('direct_messages').select('id,sender_id,body,message_type,audio_path,audio_mime_type,audio_duration_ms,created_at,read_at').eq('conversation_id',id).order('created_at',{ascending:true}).limit(300);const thread=document.getElementById('messageThread');
 if(error){thread.innerHTML='<p class="small">Could not load this conversation.</p>';return}
 const rendered=await Promise.all((data||[]).map(async m=>{let content=m.message_type==='audio'?'<div class="voice-message"><span class="voice-message-icon">🎙</span><audio controls preload="none" aria-label="Voice message"'+(m.audio_mime_type?' type="'+expEsc(m.audio_mime_type)+'"':'')+' src="'+expEsc((await cloud.storage.from('private-voice-messages').createSignedUrl(m.audio_path,3600)).data?.signedUrl||'')+'"></audio><small>'+formatVoiceDuration(m.audio_duration_ms)+'</small></div>':expEsc(m.body);return '<div class="message-bubble '+(m.sender_id===cloudUser.id?'mine':'')+'">'+content+'<div class="message-meta">'+expDate(m.created_at)+(m.sender_id===cloudUser.id?' · '+(m.read_at?'Read ✓✓':'Sent ✓'):'')+'</div></div>'}));thread.innerHTML=rendered.join('')||'<div class="messenger-empty"><span>✉</span><b>Say hello</b><p>This is the beginning of your private conversation.</p></div>';
 const unread=(data||[]).filter(m=>m.sender_id!==cloudUser.id&&!m.read_at).map(m=>m.id);
 if(unread.length)await cloud.from('direct_messages').update({read_at:new Date().toISOString()}).in('id',unread);
 thread.scrollTop=thread.scrollHeight;document.getElementById('directMessageInput').disabled=false;
 const status=document.getElementById('messengerConnectionStatus');status.textContent='Private one-to-one conversation';
 activeMessageChannel=cloud.channel('private-chat-'+id).on('postgres_changes',{event:'INSERT',schema:'public',table:'direct_messages',filter:'conversation_id=eq.'+id},payload=>{if(activeConversationId===id){openConversation(id);loadMessages()}}).on('postgres_changes',{event:'UPDATE',schema:'public',table:'direct_messages',filter:'conversation_id=eq.'+id},payload=>{if(activeConversationId===id)openConversation(id)}).subscribe((state)=>{if(status)status.textContent=state==='SUBSCRIBED'?'Live chat connected':'Connecting to live chat…'});
 await loadMessages();
};
async function sendDirectMessage(e){
 e.preventDefault();if(!activeConversationId)return expMsg('directMessageStatus','Open a private chat first.');const input=document.getElementById('directMessageInput'),body=input.value.trim();if(!body)return;
 const {data:sentMessage,error}=await cloud.from('direct_messages').insert({conversation_id:activeConversationId,sender_id:cloudUser.id,body,message_type:'text'}).select('id').single();if(error){expMsg('directMessageStatus',error.message);return}
 await notifyDirectMessage(sentMessage.id);input.value='';expMsg('directMessageStatus','Message sent.');await openConversation(activeConversationId);await loadMessages();
}
function formatVoiceDuration(ms){const s=Math.max(0,Math.floor((ms||0)/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')}
async function notifyDirectMessage(id){try{const {error}=await cloud.functions.invoke('member-push',{body:{action:'direct-message-created',message_id:id}});if(error){console.warn('Message push notification unavailable:',error.message);expMsg('directMessageStatus','Message sent. Push notification could not be delivered: '+error.message)}}catch(error){console.warn('Message push notification unavailable:',error)}}
async function startVoiceRecording(){
 if(!activeConversationId)return expMsg('directMessageStatus','Open a private chat before recording.');
 if(!navigator.mediaDevices?.getUserMedia||typeof MediaRecorder==='undefined')return expMsg('directMessageStatus','Voice recording is not supported by this browser. Try the latest Chrome browser.');
 try{
  voiceStream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
  const types=['audio/webm;codecs=opus','audio/ogg;codecs=opus','audio/mp4'];const mime=types.find(t=>MediaRecorder.isTypeSupported(t));
  voiceRecorder=mime?new MediaRecorder(voiceStream,{mimeType:mime}):new MediaRecorder(voiceStream);voiceDiscarding=false;voiceChunks=[];voiceBlob=null;voiceStartedAt=Date.now();
  voiceRecorder.ondataavailable=e=>{if(e.data&&e.data.size)voiceChunks.push(e.data)};
  voiceRecorder.onstop=()=>{voiceDurationMs=Math.min(300000,Date.now()-voiceStartedAt);voiceBlob=new Blob(voiceChunks,{type:voiceRecorder?.mimeType||'audio/webm'});voiceStream?.getTracks().forEach(t=>t.stop());voiceStream=null;voiceRecorder=null;clearTimeout(voiceStopTimer);const rec=document.getElementById('voiceRecordingPanel'),preview=document.getElementById('voicePreviewPanel'),audio=document.getElementById('voicePreviewAudio'),button=document.getElementById('voiceRecordButton');if(rec)rec.hidden=true;if(button)button.disabled=false;if(voiceDiscarding){voiceDiscarding=false;voiceBlob=null;if(preview)preview.hidden=true;return}if(preview)preview.hidden=false;if(voicePreviewUrl)URL.revokeObjectURL(voicePreviewUrl);voicePreviewUrl=URL.createObjectURL(voiceBlob);if(audio)audio.src=voicePreviewUrl;expMsg('voicePreviewDuration','Duration '+formatVoiceDuration(voiceDurationMs));expMsg('directMessageStatus','Listen to your recording, then send it or discard it.')};
  voiceRecorder.start(250);document.getElementById('voiceRecordingPanel').hidden=false;document.getElementById('voicePreviewPanel').hidden=true;document.getElementById('voiceRecordButton').disabled=true;expMsg('voiceRecordingStatus','Recording… 0:00');voiceStopTimer=setTimeout(stopVoiceRecording,300000);
  const tick=()=>{if(voiceRecorder&&voiceRecorder.state==='recording'){expMsg('voiceRecordingStatus','Recording… '+formatVoiceDuration(Date.now()-voiceStartedAt));setTimeout(tick,1000)}};tick();
 }catch(error){voiceStream?.getTracks().forEach(t=>t.stop());voiceStream=null;expMsg('directMessageStatus',error.name==='NotAllowedError'?'Microphone permission was denied. Allow microphone access in Chrome site settings.':'Could not start recording: '+error.message)}
}
function stopVoiceRecording(){if(voiceRecorder&&voiceRecorder.state==='recording'){voiceRecorder.stop()}const b=document.getElementById('voiceRecordButton');if(b)b.disabled=false}
function cancelVoiceRecording(){const rec=document.getElementById('voiceRecordingPanel'),preview=document.getElementById('voicePreviewPanel'),audio=document.getElementById('voicePreviewAudio'),button=document.getElementById('voiceRecordButton');const stopping=!!(voiceRecorder&&voiceRecorder.state==='recording');if(stopping){voiceDiscarding=true;voiceRecorder.stop();voiceStream?.getTracks().forEach(t=>t.stop());if(rec)rec.hidden=true;if(preview)preview.hidden=true;clearTimeout(voiceStopTimer)}else{voiceStream?.getTracks().forEach(t=>t.stop());voiceStream=null;voiceRecorder=null;voiceBlob=null;if(rec)rec.hidden=true;if(preview)preview.hidden=true}if(audio){audio.pause();audio.removeAttribute('src');audio.load()}if(voicePreviewUrl)URL.revokeObjectURL(voicePreviewUrl);voicePreviewUrl=null;if(button)button.disabled=stopping;expMsg('directMessageStatus','Voice recording discarded.')}
async function sendVoiceMessage(){
 if(!activeConversationId||!cloudUser||!voiceBlob)return expMsg('directMessageStatus','Record a voice message first.');
 if(voiceBlob.size>10485760)return expMsg('directMessageStatus','This recording is too large. Please record a shorter message.');
 const mime=(voiceBlob.type||'audio/webm').split(';')[0];const ext=mime.includes('ogg')?'ogg':mime.includes('mp4')?'m4a':mime.includes('mpeg')?'mp3':mime.includes('3gpp')?'3gp':mime.includes('wav')?'wav':'webm';
 const path=activeConversationId+'/'+cloudUser.id+'/'+crypto.randomUUID()+'.'+ext;const send=document.getElementById('voiceSendButton');send.disabled=true;expMsg('directMessageStatus','Uploading your voice message securely…');
 const {data:upload,error:uploadError}=await cloud.storage.from('private-voice-messages').upload(path,voiceBlob,{contentType:mime,upsert:false,cacheControl:'3600'});
 if(uploadError){send.disabled=false;expMsg('directMessageStatus','Voice upload failed: '+uploadError.message);return}
 const {data:sentMessage,error}=await cloud.from('direct_messages').insert({conversation_id:activeConversationId,sender_id:cloudUser.id,body:'',message_type:'audio',audio_path:upload.path,audio_mime_type:mime,audio_duration_ms:Math.max(1,Math.min(300000,voiceDurationMs))}).select('id').single();
 if(error){await cloud.storage.from('private-voice-messages').remove([path]);send.disabled=false;expMsg('directMessageStatus','Could not send voice message: '+error.message);return}
 const conversation=activeConversationId;cancelVoiceRecording();await notifyDirectMessage(sentMessage.id);expMsg('directMessageStatus','Voice message sent.');await openConversation(conversation);await loadMessages();
}
async function loadMemberNotifications(){
 if(!cloudUser)return;const list=document.getElementById('memberNotificationList');if(!list)return;
 const {data:pref}=await cloud.from('member_settings').select('push_enabled').eq('user_id',cloudUser.id).maybeSingle();
 if(pref?.push_enabled===false){list.innerHTML='<p class="small">In-app notifications are paused in your settings.</p>';const badge=document.getElementById('notificationBadge');if(badge)badge.textContent='Paused';return}
 const {data,error}=await cloud.from('member_notifications').select('id,actor_id,notification_type,title,body,entity_id,read_at,created_at').eq('recipient_id',cloudUser.id).order('created_at',{ascending:false}).limit(80);
 if(error){list.innerHTML='<p class="small">Notifications are unavailable.</p>';return}const unread=(data||[]).filter(x=>!x.read_at).length;const badge=document.getElementById('notificationBadge');if(badge)badge.textContent=unread+' new';const drawerBadge=document.getElementById('drawerNotificationBadge');if(drawerBadge)drawerBadge.textContent=unread?unread+' new':'•';const topButton=document.querySelector('.top-notifications');if(topButton)topButton.classList.toggle('has-unread',unread>0);
 list.innerHTML=(data||[]).map(n=>'<button class="card" style="display:block;width:100%;text-align:left;'+(!n.read_at?'border-color:#80622a':'')+'" onclick="openNotification(\''+n.id+'\',\''+(n.actor_id||'')+'\',\''+n.notification_type+'\',\''+(n.entity_id||'')+'\')"><b>'+expEsc(n.title)+'</b><p>'+expEsc(n.body)+'</p><span class="small">'+expDate(n.created_at)+'</span></button>').join('')||'<p class="small">You are all caught up.</p>';
}
window.openNotification=async function(id,actor,type,entity){await cloud.from('member_notifications').update({read_at:new Date().toISOString()}).eq('id',id);if(type==='message'){showExperiencePanel('messagesPanel');await loadMessages();if(entity)await openConversation(entity)}else if(actor)await openMemberProfile(actor);await loadMemberNotifications()};
async function loadMemberSettings(){if(!cloudUser)return;const {data,error}=await cloud.from('member_settings').select('*').eq('user_id',cloudUser.id).maybeSingle();if(error){expMsg('settingsStatus','Could not load settings.');return}document.getElementById('profileVisibility').value=data?.profile_visibility||'public';document.getElementById('messagePermission').value=data?.allow_messages||'everyone';document.getElementById('privateProfileToggle').checked=(data?.profile_visibility||'public')==='private';document.getElementById('allowMessagesToggle').checked=(data?.allow_messages||'everyone')!=='nobody';document.getElementById('pushPreference').checked=data?.push_enabled!==false;const status=document.getElementById('devicePushStatus'),button=document.getElementById('enablePushButton');if(button){const enabled=('Notification'in window)&&Notification.permission==='granted';button.textContent=enabled?'Refresh device alerts':'Turn on';button.classList.toggle('secondary',enabled)}if(status){status.textContent=('Notification'in window)&&Notification.permission==='granted'?'This browser allows notifications. Tap Refresh device alerts to confirm delivery.':('Notification'in window)&&Notification.permission==='denied'?'Notifications are blocked in browser settings. Allow them in Chrome site settings.':'Allow notifications on this device to receive alerts outside the app.'}}
async function saveMemberSettings(e){e.preventDefault();const privateToggle=document.getElementById('privateProfileToggle'),messageToggle=document.getElementById('allowMessagesToggle'),messageSelect=document.getElementById('messagePermission');document.getElementById('profileVisibility').value=privateToggle.checked?'private':'public';if(!messageToggle.checked)messageSelect.value='nobody';else if(messageSelect.value==='nobody')messageSelect.value='everyone';const {error}=await cloud.from('member_settings').upsert({user_id:cloudUser.id,profile_visibility:document.getElementById('profileVisibility').value,allow_messages:messageSelect.value,push_enabled:document.getElementById('pushPreference').checked,updated_at:new Date().toISOString()});expMsg('settingsStatus',error?'Could not save settings: '+error.message:'Settings saved securely.')}
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
const OLATUNS_APP_VERSION='2026.11.26.1';
async function checkAppUpdate(){const el=document.getElementById('appUpdateStatus');if(!el)return;el.textContent='DJ OLATUNS App version '+OLATUNS_APP_VERSION+'. Checking for updates…';if(!('serviceWorker'in navigator)){el.textContent='Service-worker updates are not available in this browser.';return}try{const reg=await navigator.serviceWorker.getRegistration('./');if(!reg){el.textContent='App update service is not registered yet.';return}await reg.update();el.textContent='DJ OLATUNS App version '+OLATUNS_APP_VERSION+'. '+(reg.waiting?'An update is ready. Reload the app to use it.':'You are using the latest version available to this device.')}catch(e){el.textContent='Could not check for updates. Please try again when online.'}}

function pushBase64ToBytes(value){
 const padding='='.repeat((4-value.length%4)%4);
 const raw=atob((value+padding).replace(/-/g,'+').replace(/_/g,'/'));
 return Uint8Array.from(raw,c=>c.charCodeAt(0));
}
window.enablePushNotifications=async function(){
 const status=document.getElementById('devicePushStatus'),button=document.getElementById('enablePushButton');
 if(!cloudUser){if(status)status.textContent='Please sign in first.';return}
 if(!('serviceWorker' in navigator)||!('PushManager' in window)){if(status)status.textContent='This browser does not support device notifications. Keep in-app notifications enabled instead.';return}
 if(!('Notification' in window)){if(status)status.textContent='Notifications are not supported by this browser.';return}
 if(button)button.disabled=true;
 if(status)status.textContent='Preparing secure notifications…';
 try{
  const permission=await Notification.requestPermission();
  if(permission!=='granted')throw new Error('Notification permission was not granted. Enable notifications in your browser settings and try again.');
  const registration=await navigator.serviceWorker.ready;
  const {data:keyData,error:keyError}=await cloud.functions.invoke('member-push',{body:{action:'public-key'}});
  if(keyError)throw keyError;
  if(!keyData?.publicKey)throw new Error(keyData?.error||'Push notifications are not configured on the server yet.');
  let subscription=await registration.pushManager.getSubscription();
  if(!subscription)subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushBase64ToBytes(keyData.publicKey)});
  const {data:saveData,error:saveError}=await cloud.functions.invoke('member-push',{body:{action:'subscribe',subscription:subscription.toJSON()}});
  if(saveError)throw saveError;
  if(saveData?.error)throw new Error(saveData.error);
  if(status)status.textContent='Device registered. Sending a test alert…';
  const {data:testData,error:testError}=await cloud.functions.invoke('member-push',{body:{action:'test-device'}});
  if(testError)throw testError;
  if(testData?.error)throw new Error(testData.error);
  if(status)status.textContent=testData?.sent>0?'Notifications are enabled. A test alert has been sent to this device.':'Device registered, but the test alert was not delivered. Check the browser notification permission and try again.';
 }catch(error){
  console.error('Device notification setup failed:',error);
  if(status)status.textContent=error?.message||'Could not enable device notifications. Please try again.';
 }finally{if(button)button.disabled=false}
};

window.addEventListener('online',()=>{if(cloudUser){loadMessages();loadMemberNotifications()}});
