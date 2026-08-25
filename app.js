const $=id=>document.getElementById(id);
const grid=$("grid"),empty=$("empty"),searchEl=$("search"),countEl=$("noteCount");
const sheet=$("sheet"),edTitle=$("edTitle"),edBody=$("edBody"),edMeta=$("edMeta"),photoStrip=$("photoStrip");
const toastEl=$("toast"),colorRow=$("colorRow"),edTags=$("edTags");
let notes=[],editingId=null,editTarget=null,toastTimer=null;
let S={fontSize:"m",anims:true,haptics:true,sort:"recent",theme:"dark",cols:"2"};
let pinBuf="",lockMode="unlock",pendingPin=null;
let currentPhotos=[],currentColor="",currentTags=[];
const APP_VER="1.2.0";let UPD=null;
function cmpVer(a,b){a=String(a).replace(/^v/,"").split(".").map(Number);b=String(b).replace(/^v/,"").split(".").map(Number);for(let i=0;i<3;i++){if((a[i]||0)>(b[i]||0))return 1;if((a[i]||0)<(b[i]||0))return -1}return 0}
async function checkUpdates(manual){try{const r=await fetch("https://api.github.com/repos/rkkizar777-design/lostnote/releases/latest",{headers:{Accept:"application/vnd.github+json"}});if(!r.ok)throw new Error("http");const j=await r.json();const tag=j.tag_name||"";if(!tag)throw new Error("tag");if(cmpVer(tag,APP_VER)>0){UPD={tag:tag,apk:"",exe:""};(j.assets||[]).forEach(a=>{if(/\.apk$/i.test(a.name))UPD.apk=a.browser_download_url;if(/\.exe$/i.test(a.name))UPD.exe=a.browser_download_url});showUpd();if(manual)showToast("Update found: "+UPD.tag.replace(/^v/,""))}else{const c=$("updCur");if(c)c.textContent="Up to date (v"+APP_VER+")";if(manual)showToast("You are on the latest version")}}catch(e){if(manual)showToast("Could not check for updates")}}
function showUpd(){const b=$("updBanner");if(!b||!UPD)return;$("updVer").textContent="LostNote "+UPD.tag.replace(/^v/,"")+" available";b.classList.remove("hidden")}
function extGo(url){let opened=false;try{const w=window.open(url,"_blank","noopener");opened=!!w;if(w&&w.focus)try{w.focus()}catch(e){}}catch(e){opened=false}if(!opened){try{const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";document.body.appendChild(a);a.click();setTimeout(function(){a.remove()},800);opened=true}catch(e2){}}return opened}
async function updGet(){if(!UPD)return showToast("No update info - tap Check first");haptic();const ua=navigator.userAgent||"";const isAndroid=/android/i.test(ua)||(!!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform()));const url=isAndroid?(UPD.apk||UPD.exe):(UPD.exe||UPD.apk);if(!url)return showToast("No download link in latest release");showToast("Starting download...");if(isAndroid){try{const r=await fetch(url,{mode:"cors",redirect:"follow"});if(!r.ok)throw new Error("HTTP "+r.status);const blob=await r.blob();if(blob.size<100000)throw new Error("Download looks incomplete");const fname="LostNote-"+String(UPD.tag).replace(/^v/,"")+".apk";const file=new File([blob],fname,{type:"application/vnd.android.package-archive"});if(navigator.canShare&&navigator.canShare({files:[file]})&&navigator.share){await navigator.share({files:[file]});showToast("APK ready - choose Save or Install");return}}catch(e1){console.warn("share path failed:",e1)}try{await fetch(url,{method:"HEAD"})}catch(e2){}
if(extGo(url)){showToast("If nothing opened: get it at github.com/rkkizar777-design/lostnote/releases")}else{showToast("Please open github.com/rkkizar777-design/lostnote/releases in your browser")}}else{if(extGo(url)){showToast("Opening your browser to download...")}else{try{const {shell}=require("electron");shell.openExternal(url);showToast("Opening your browser...")}catch(e3){showToast("Open github.com/rkkizar777-design/lostnote/releases in your browser")}}}}
function updAuto(){let last=0;try{last=+localStorage.getItem("ln_upd_at")||0}catch(e){}if(Date.now()-last>20*3600000){try{localStorage.setItem("ln_upd_at",String(Date.now()))}catch(e){}setTimeout(function(){checkUpdates(false)},2500)}}
let activeTag=null;
const COLORS=["","#ef4444","#f97316","#eab308","#22c55e","#3b82f6","#a855f7","#ec4899"];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
function relTime(ts){const s=Math.floor((Date.now()-ts)/1000);if(s<60)return"just now";const m=Math.floor(s/60);if(m<60)return m+"m ago";const h=Math.floor(m/60);if(h<24)return h+"h ago";const d=Math.floor(h/24);if(d<7)return d+"d ago";return new Date(ts).toLocaleDateString(undefined,{month:"short",day:"numeric"})}
function haptic(){if(S.haptics&&navigator.vibrate)try{navigator.vibrate(12)}catch{}}
function lockScroll(on){const w=$("scrollWrap");if(w)w.style.overflow=on?"hidden":""}
async function sha256(str){const b=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(str));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,"0")).join("")}
function uid(){try{return crypto.randomUUID()}catch{return"xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==="x"?r:r&0x3|0x8).toString(16)})}}
function hexA(hex,a){try{const n=parseInt(hex.slice(1),16);return"rgba("+(n>>16&255)+","+(n>>8&255)+","+(n&255)+","+a+")"}catch{return""}}
function applyTheme(){const t=S.theme;const sysLight=window.matchMedia("(prefers-color-scheme:light)").matches;const light=t==="light"||(t==="auto"&&sysLight);document.body.classList.toggle("light",light);const m=document.querySelector('meta[name="theme-color"]');if(m)m.content=light?"#f5f5f7":"#060608";if(!window.__mmBound){window.__mmBound=true;try{window.matchMedia("(prefers-color-scheme:light)").addEventListener("change",()=>{if(S.theme==="auto")applyTheme()})}catch{}}}
function dismissSplash(){const s=$("splash");if(!s||s.classList.contains("out"))return;const elapsed=Date.now()-(window.__t0||Date.now());const wait=Math.max(0,2400-elapsed);setTimeout(()=>{const el=$("splash");if(el&&!el.classList.contains("out")){el.classList.add("out");setTimeout(()=>{if(el.parentNode)el.parentNode.removeChild(el)},700)}},wait)}
function safeOn(el,ev,fn){if(el)el.addEventListener(ev,fn)}
function qsa(sel,fn){document.querySelectorAll(sel).forEach(fn)}async function loadSettings(){try{const v=await db.getMeta("settings");if(v)S={...S,...v}}catch{}try{const p=await db.getMeta("pinHash");S.pinSet=!!p}catch{S.pinSet=false}try{const a=await db.getMeta("archivePinHash");S.archiveLocked=!!a}catch{S.archiveLocked=false}applySettings();applyTheme()}
function saveSettings(){db.setMeta("settings",{fontSize:S.fontSize,anims:S.anims,haptics:S.haptics,sort:S.sort,theme:S.theme,cols:S.cols})}
function applySettings(){const b=document.body;b.classList.remove("fs-s","fs-m","fs-l","no-anim","cols-1","cols-2");b.classList.add("fs-"+S.fontSize);b.classList.add(S.cols==="1"?"cols-1":"cols-2");qsa("#colSeg button",x=>x.classList.toggle("active",x.dataset.cols===S.cols));if(!S.anims)b.classList.add("no-anim");$("swAnims").checked=S.anims;$("swHaptics").checked=S.haptics;$("selSort").value=S.sort;$("selTheme").value=S.theme;qsa("#fsSeg button",x=>x.classList.toggle("active",x.dataset.fs===S.fontSize));$("sPinLabel").textContent=S.pinSet?"Change PIN":"Set PIN lock";$("sPinRemove").hidden=!S.pinSet;$("sArchiveLockLabel").textContent=S.archiveLocked?"Remove archive lock":"Lock archive (PIN)";updateStats();applyTheme()}
async function updateStats(){const active=notes.filter(n=>!n.deleted&&!n.archived);const photos=active.reduce((c,n)=>(n.photos||[]).length+c,0);const bytes=JSON.stringify(notes).length;const mb=(bytes/1048576).toFixed(1);$("statLine").textContent=active.length+" notes \xb7 "+photos+" photos \xb7 ~"+mb+" MB"}
function renderColorRow(){colorRow.innerHTML=COLORS.map(c=>{const sel=c===currentColor;const bg=c||"var(--sf2)";const border=c?"":"var(--line)";return'<button class="color-dot'+(sel?" active":"")+'" data-color="'+c+'" style="background:'+bg+';border-color:'+border+'"></button>'}).join("");qsa(".color-dot",b=>b.addEventListener("click",()=>{currentColor=b.dataset.color;renderColorRow();tintSheet(currentColor)}))}
function tintSheet(c){const tb=document.querySelector("#sheet .ed-top");if(!tb)return;if(c){tb.style.background="linear-gradient(180deg,"+hexA(c,.22)+","+hexA(c,.07)+")"}else{tb.style.background=""}}
function render(){const q=searchEl.value.trim().toLowerCase();let list=notes.filter(n=>!n.deleted&&!n.archived);if(activeTag)list=list.filter(n=>(n.tags||[]).includes(activeTag));if(q)list=list.filter(n=>(n.title+" "+n.body+" "+(n.tags||[]).join(" ")).toLowerCase().includes(q));if(S.sort==="title")list.sort((a,b)=>(a.title||"").localeCompare(b.title||""));else if(S.sort==="oldest")list.sort((a,b)=>a.createdAt-b.createdAt);else list.sort((a,b)=>(b.pinned-a.pinned)||(b.updatedAt-a.updatedAt));const active=notes.filter(n=>!n.deleted&&!n.archived);const allTags=[...new Set(active.flatMap(n=>n.tags||[]))].sort();const filterRow=document.querySelector(".filter-row");if(filterRow){filterRow.innerHTML=allTags.map(t=>'<button class="filter-chip'+(activeTag===t?" active":"")+'" data-tag="'+esc(t)+'">'+esc(t)+'</button>').join("");qsa(".filter-chip",b=>b.addEventListener("click",()=>{activeTag=activeTag===b.dataset.tag?null:b.dataset.tag;render()}))}grid.innerHTML=list.map((n,i)=>{const thumbs=(n.photos||[]).slice(0,3).map(p=>'<img src="'+p.dataUrl+'" alt="">').join("");const tags=(n.tags||[]).map(t=>'<span class="tag-pill">'+esc(t)+'</span>').join("");const c=n.color;const st=c?'background:linear-gradient(180deg,'+hexA(c,.24)+','+hexA(c,.10)+');border-color:'+hexA(c,.32):"";return'<article class="note'+(n.pinned?" pinned":"")+'" data-id="'+n.id+'" style="--d:'+Math.min(i*35,350)+'ms;'+st+'"><div class="note-title">'+(n.pinned?'<span class="pin-flag">&#x1F4CC;</span>':"")+(esc(n.title)||"<i>Untitled</i>")+'</div><div class="note-body">'+esc(n.body)+'</div>'+(thumbs?'<div class="note-thumbs">'+thumbs+'</div>':"")+(tags?'<div class="note-tags">'+tags+'</div>':"")+'<div class="note-date">'+relTime(n.updatedAt)+'</div></article>'}).join("");empty.classList.add("hidden");if(active.length===0&&notes.length===0){empty.classList.remove("hidden");empty.querySelector("h2").textContent="Nothing here... yet";empty.querySelector("p").innerHTML='Tap <b>+</b> to catch your first thought.'}else if(list.length===0&&(q||activeTag)){empty.classList.remove("hidden");empty.querySelector("h2").textContent="No matches";empty.querySelector("p").textContent="Try a different search or filter."}countEl.textContent=active.length+" note"+(active.length===1?"":"s")}
function openEditor(id){const n=id?notes.find(x=>x.id===id):null;editingId=n?n.id:null;editTarget=n;edTitle.value=n?n.title:"";edBody.value=n?n.body:"";currentPhotos=n?[...n.photos]:[];currentColor=n?n.color||"":"";currentTags=n?[...(n.tags||[])]:[];edTags.value=currentTags.join(", ");$("btnPinNote").classList.toggle("active",!!(n&&n.pinned));$("btnDeleteNote").style.display=n?"":"none";$("btnArchiveNote").classList.toggle("active",!!(n&&n.archived));updateMeta();renderStrip();renderColorRow();tintSheet(currentColor);$("edMenu").classList.add("hidden");sheet.classList.remove("hidden");lockScroll(true);setTimeout(()=>edBody.focus(),150)}
async function closeEditor(){let savedId=null;try{const title=edTitle.value.trim(),body=edBody.value;const tags=edTags.value.split(",").map(t=>t.trim()).filter(Boolean);if(editingId){const n=editTarget||notes.find(x=>x.id===editingId);if(n){n.title=title;n.body=body;n.photos=currentPhotos;n.color=currentColor;n.tags=tags;n.updatedAt=Date.now();await db.putNote(n);savedId=n.id;haptic();showToast("Saved")}}else{if(title||body.trim()||currentPhotos.length){const n={id:uid(),title:title,body:body,photos:currentPhotos,color:currentColor,tags:tags,pinned:false,archived:false,createdAt:Date.now(),updatedAt:Date.now(),deleted:false};notes.unshift(n);await db.putNote(n);savedId=n.id;haptic();showToast("Created")}}}catch(e){showToast("Error saving");console.error(e)}const flashId=savedId;editingId=null;editTarget=null;currentPhotos=[];currentColor="";currentTags=[];tintSheet("");$("edMenu").classList.add("hidden");sheet.classList.add("hidden");lockScroll(false);render();if(flashId)requestAnimationFrame(()=>{const el=grid.querySelector('.note[data-id="'+flashId+'"]');if(el)el.classList.add("flash")})}
function renderStrip(){const photos=(editTarget?editTarget.photos:currentPhotos)||[];photoStrip.innerHTML=(photos||[]).map((p,i)=>'<div class="ph-thumb" data-pidx="'+i+'"><img src="'+p.dataUrl+'" alt=""></div>').join("")+'<button class="ph-add" id="addTile">+</button>';qsa(".ph-thumb",el=>el.addEventListener("click",()=>openLightbox(+el.dataset.pidx)));safeOn($("addTile"),"click",()=>$("filePhotos").click())}
function updateMeta(){const t=edBody.value.trim();const words=t?t.split(/\s+/).length:0;edMeta.textContent=words+" word"+(words===1?"":"s")+" \xb7 "+edBody.value.length+" chars"}
async function compressImage(file){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>{const img=new Image();img.onload=()=>{const c=document.createElement("canvas");let w=img.width,h=img.height;if(w>1600){h=h*1600/w;w=1600}c.width=w;c.height=h;c.getContext("2d").drawImage(img,0,0,w,h);res({id:uid(),dataUrl:c.toDataURL("image/jpeg",.82),name:file.name})};img.onerror=()=>rej(new Error("bad image"));img.src=r.result};r.onerror=()=>rej(new Error("read error"));r.readAsDataURL(file)})}
async function onPhotosSelected(files){try{if(!editingId){const n={id:uid(),title:edTitle.value.trim(),body:edBody.value,photos:[],color:currentColor,tags:edTags.value.split(",").map(t=>t.trim()).filter(Boolean),pinned:false,archived:false,createdAt:Date.now(),updatedAt:Date.now(),deleted:false};notes.unshift(n);editingId=n.id;await db.putNote(n)}const note=notes.find(x=>x.id===editingId);let added=0;for(const f of files){try{const p=await compressImage(f);note.photos.push(p);added++}catch{}}if(added){currentPhotos=[...note.photos];note.updatedAt=Date.now();await db.putNote(note);renderStrip();haptic();showToast("Added "+added+" photo"+(added>1?"s":""))}}catch(e){console.error(e);showToast("Error adding photo")}}
let lbPhotoIdx=null;
function openLightbox(idx){lbPhotoIdx=idx;const n=editTarget;if(!n||!n.photos[idx])return;$("lbImg").src=n.photos[idx].dataUrl;$("lightbox").classList.remove("hidden")}
function closeLightbox(){$("lightbox").classList.add("hidden");lbPhotoIdx=null}
async function deletePhoto(){if(lbPhotoIdx===null||!editTarget)return;const n=editTarget;if(!n)return;n.photos.splice(lbPhotoIdx,1);currentPhotos=[...n.photos];await db.putNote(n);closeLightbox();renderStrip();haptic();showToast("Photo removed")}
async function softDelete(id){const n=notes.find(x=>x.id===id);if(!n)return;n.deleted=true;n.deletedAt=Date.now();n.updatedAt=Date.now();await db.putNote(n);render();haptic();showToast("Deleted",()=>{n.deleted=false;n.deletedAt=null;db.putNote(n);render()})}
async function archiveNote(id){const n=notes.find(x=>x.id===id);if(!n)return;n.archived=true;n.archivedAt=Date.now();n.updatedAt=Date.now();await db.putNote(n);haptic()}
async function unarchiveNote(id){const n=notes.find(x=>x.id===id);if(!n)return;n.archived=false;n.archivedAt=null;n.updatedAt=Date.now();await db.putNote(n);haptic();showToast("Unarchived")}
function showTrash(){$("trashView").classList.remove("hidden");lockScroll(true);renderTrash()}
function renderTrash(){const trashed=notes.filter(n=>n.deleted).sort((a,b)=>(b.deletedAt||0)-(a.deletedAt||0));$("trashEmpty").classList.toggle("hidden",trashed.length>0);$("trashList").innerHTML=trashed.map(n=>'<div class="trash-item" data-id="'+n.id+'"><div class="trash-title">'+(esc(n.title)||"Untitled")+'</div><div class="trash-snippet">'+esc((n.body||"").slice(0,80))+'</div><div class="trash-date">Deleted '+relTime(n.deletedAt)+'</div><div class="trash-actions"><button class="trash-btn restore" data-id="'+n.id+'">Restore</button><button class="trash-btn danger forever" data-id="'+n.id+'">Delete forever</button></div></div>').join("");qsa(".trash-btn.restore",b=>b.addEventListener("click",async()=>{const n=notes.find(x=>x.id===b.dataset.id);if(!n)return;n.deleted=false;n.deletedAt=null;await db.putNote(n);renderTrash();render();haptic()}));qsa(".trash-btn.forever",b=>{let armed=false;b.addEventListener("click",async()=>{if(!armed){armed=true;b.textContent="Sure?";b.classList.add("arm");setTimeout(()=>{armed=false;b.textContent="Delete forever";b.classList.remove("arm")},3000);return}const id=b.dataset.id;notes=notes.filter(x=>x.id!==id);await db.delNote(id);renderTrash();render();haptic();showToast("Permanently deleted")})})}
function closeTrash(){$("trashView").classList.add("hidden");lockScroll(false)}
function showArchive(){$("archiveView").classList.remove("hidden");lockScroll(true);renderArchive()}
function renderArchive(){const archived=notes.filter(n=>n.archived&&!n.deleted).sort((a,b)=>(b.archivedAt||0)-(a.archivedAt||0));$("archiveEmpty").classList.toggle("hidden",archived.length>0);$("archiveList").innerHTML=archived.map(n=>{const tags=(n.tags||[]).map(t=>'<span class="tag-pill">'+esc(t)+'</span>').join("");return'<div class="trash-item" data-id="'+n.id+'"><div class="trash-title">'+(esc(n.title)||"Untitled")+'</div><div class="trash-snippet">'+esc((n.body||"").slice(0,80))+'</div>'+(tags?'<div class="note-tags" style="margin-top:6px">'+tags+'</div>':"")+'<div class="trash-date">Archived '+relTime(n.archivedAt)+'</div><div class="trash-actions"><button class="trash-btn restore" data-id="'+n.id+'">Unarchive</button><button class="trash-btn danger" data-id="'+n.id+'">Delete</button></div></div>'}).join("");qsa("#archiveList .trash-btn.restore",b=>b.addEventListener("click",async()=>{await unarchiveNote(b.dataset.id);renderArchive();render()}));qsa("#archiveList .trash-btn.danger",b=>{let armed=false;b.addEventListener("click",async()=>{if(!armed){armed=true;b.textContent="Sure?";b.classList.add("arm");setTimeout(()=>{armed=false;b.textContent="Delete";b.classList.remove("arm")},3000);return}const id=b.dataset.id;notes=notes.filter(x=>x.id!==id);await db.delNote(id);renderArchive();render();haptic();showToast("Deleted")})})}
function closeArchive(){$("archiveView").classList.add("hidden");lockScroll(false)}
function wrapText(ctx,text,x,y,maxW,lh){const words=text.split(" ");let line="";for(const word of words){const test=line+word+" ";if(ctx.measureText(test).width>maxW&&line){ctx.fillText(line.trim(),x,y);line=word+" ";y+=lh}else line=test}ctx.fillText(line.trim(),x,y);return y}
async function shareAsImage(note){try{const c=document.createElement("canvas");const ctx=c.getContext("2d");c.width=1080;c.height=1920;const bg=note.color||"#060608";ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle="#ffffff";ctx.font="bold 56px -apple-system,sans-serif";let y=wrapText(ctx,note.title||"Untitled",80,140,c.width-160,70);ctx.fillStyle="#aaaaaa";ctx.font="36px -apple-system,sans-serif";y=wrapText(ctx,note.body||"",80,y+80,c.width-160,48);if(note.tags&&note.tags.length){ctx.fillStyle="#a78bfa";ctx.font="bold 28px -apple-system,sans-serif";ctx.fillText("#"+note.tags.join("  #"),80,c.height-100)}ctx.fillStyle="#555555";ctx.font="24px -apple-system,sans-serif";ctx.fillText("LostNote \xb7 "+new Date(note.updatedAt).toLocaleString(),80,c.height-50);return new Promise(resolve=>{c.toBlob(async blob=>{if(navigator.share&&navigator.canShare){const file=new File([blob],"note.png",{type:"image/png"});try{if(navigator.canShare({files:[file]})){await navigator.share({files:[file]});showToast("Shared!");resolve();return}}catch{}}const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=(note.title||"note")+".png";a.click();URL.revokeObjectURL(url);showToast("Saved as image");resolve()},"image/png")})}catch(e){console.error(e);showToast("Share failed")}}
function showSettings(){$("settingsView").classList.remove("hidden");lockScroll(true)}
function closeSettings(){$("settingsView").classList.add("hidden");lockScroll(false)}
function showToast(msg,onUndo){clearTimeout(toastTimer);toastEl.innerHTML="<span>"+esc(msg)+"</span>";if(onUndo){const b=document.createElement("button");b.textContent="Undo";b.onclick=()=>{onUndo();hideToast()};toastEl.appendChild(b)}toastEl.classList.remove("hidden");toastTimer=setTimeout(hideToast,onUndo?5000:1800)}
function hideToast(){toastEl.classList.add("hidden")}
function buildKeypad(){$("keypad").innerHTML="";["1","2","3","4","5","6","7","8","9","","0","&#9003;"].forEach(k=>{const b=document.createElement("button");if(k===""){b.className="empty";$("keypad").appendChild(b);return}b.innerHTML=k;b.dataset.k=k==="&#9003;"?"back":k;b.addEventListener("click",()=>onKey(b.dataset.k));$("keypad").appendChild(b)})}
function updateDots(){const dots=$("pinDots").children;for(let i=0;i<4;i++)dots[i].classList.toggle("fill",i<pinBuf.length)}
function onKey(k){if(k==="back"){pinBuf=pinBuf.slice(0,-1);updateDots();return}if(pinBuf.length>=4)return;pinBuf+=k;updateDots();haptic();if(pinBuf.length===4)verifyPin()}
async function verifyPin(){const salt=await db.getMeta("salt")||"";const hash=await sha256(salt+pinBuf);const stored=await db.getMeta("pinHash");const archiveHash=await db.getMeta("archivePinHash");if(lockMode==="unlock"){if(hash===stored){sessionStorage.unlocked="1";hideLock();showToast("Unlocked")}else shakeLock()}else if(lockMode==="archive-unlock"){if(archiveHash&&hash===archiveHash){sessionStorage.archiveUnlocked="1";hideLock();showArchive()}else if(!archiveHash){hideLock();showArchive()}else shakeLock()}else if(lockMode==="new"){pendingPin=pinBuf;lockMode="confirm";pinBuf="";updateDots();$("lockMsg").textContent="Confirm your PIN"}else if(lockMode==="confirm"){if(pinBuf===pendingPin){const s=Math.random().toString(36).slice(2,10);await db.setMeta("salt",s);await db.setMeta("pinHash",await sha256(s+pinBuf));S.pinSet=true;applySettings();sessionStorage.unlocked="1";hideLock();showToast("PIN enabled")}else shakeLock()}else if(lockMode==="remove"){if(hash===stored){await db.delMeta("pinHash");S.pinSet=false;applySettings();hideLock();showToast("PIN removed")}else shakeLock()}else if(lockMode==="change-verify"){if(hash===stored){lockMode="new";pinBuf="";updateDots();$("lockMsg").textContent="Enter new PIN"}else shakeLock()}else if(lockMode==="archive-set"){pendingPin=pinBuf;lockMode="archive-confirm";pinBuf="";updateDots();$("lockMsg").textContent="Confirm archive PIN"}else if(lockMode==="archive-confirm"){if(pinBuf===pendingPin){const s=Math.random().toString(36).slice(2,10);await db.setMeta("archiveSalt",s);await db.setMeta("archivePinHash",await sha256(s+pinBuf));S.archiveLocked=true;applySettings();hideLock();showToast("Archive locked")}else shakeLock()}else if(lockMode==="archive-remove"){if(hash===archiveHash){await db.delMeta("archivePinHash");await db.delMeta("archiveSalt");S.archiveLocked=false;applySettings();hideLock();showToast("Archive unlocked")}else if(!archiveHash){S.archiveLocked=false;applySettings();hideLock();showToast("Archive unlocked")}else shakeLock()}}
function shakeLock(){$("lockCard").classList.add("shake");pinBuf="";updateDots();setTimeout(()=>$("lockCard").classList.remove("shake"),500);haptic()}
function showLock(mode){lockMode=mode;pinBuf="";updateDots();$("lockCard").classList.remove("shake");const titles={unlock:["Vault locked","Enter your PIN",true],new:["Set PIN","Enter a 4-digit PIN",false],confirm:["Confirm PIN","Re-enter your PIN",false],remove:["Verify PIN","Enter current PIN to remove lock",false],"change-verify":["Change PIN","Enter current PIN first",false],"archive-unlock":["Archive locked","Enter archive PIN to access",false],"archive-set":["Set archive PIN","Enter a 4-digit PIN for archive",false],"archive-confirm":["Confirm archive PIN","Re-enter archive PIN",false],"archive-remove":["Verify PIN","Enter archive PIN to remove lock",false]};const t=titles[mode]||titles.unlock;$("lockTitle").textContent=t[0];$("lockMsg").textContent=t[1];$("lockCancel").classList.toggle("hidden",t[2]);$("lock").classList.remove("hidden");lockScroll(true)}
function hideLock(){$("lock").classList.add("hidden");lockScroll(false)}
async function exportAllPdf(){const active=notes.filter(n=>!n.deleted&&!n.archived);if(!active.length)return showToast("No notes");exportPdf(active,active.length+" notes");showToast("Exporting PDF...")}
async function backupAll(){try{const ns=await db.listNotes();const mt=await db.listMeta();const payload={app:"lostnote",v:2,exportedAt:new Date().toISOString(),notes:ns,meta:mt};const blob=new Blob([JSON.stringify(payload)],{type:"application/json"});const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="lostnote-backup-"+new Date().toISOString().slice(0,10)+".json";a.click();URL.revokeObjectURL(url);showToast("Backup saved ("+ns.length+" notes)")}catch(e){console.error(e);showToast("Backup failed")}}
function restoreBackup(){const inp=$("fileRestore");inp.onchange=async()=>{const file=inp.files[0];if(!file)return;try{const text=await file.text();const data=JSON.parse(text);const inc=Array.isArray(data.notes)?data.notes:Array.isArray(data)?data:null;if(!inc)return showToast("Unrecognized backup file");let added=0,updated=0;const cur=new Map(notes.map(n=>[n.id,n]));for(const n of inc){if(!n||!n.id||!n.title&&!n.body&&!(n.photos||[]).length)continue;const ex=cur.get(n.id);if(ex){if((n.updatedAt||0)>(ex.updatedAt||0)){Object.assign(ex,n);await db.putNote(ex);updated++}}else{notes.push(n);cur.set(n.id,n);await db.putNote(n);added++}}if(Array.isArray(data.meta))for(const m of data.meta){if(!m||m.key===undefined)continue;try{if((await db.getMeta(m.key))===undefined)await db.setMeta(m.key,m.value)}catch{}}showToast("Restored: "+added+" new \xb7 "+updated+" updated");render();updateStats();setTimeout(()=>location.reload(),900)}catch(e){console.error(e);showToast("Restore failed")}};inp.click()}
function closeAllPanels(){closeTrash();closeArchive();closeSettings()}
async function init(){
    const sv=document.querySelector("#settingsView .panel-box")||$("settingsView");
    if(sv&&!document.getElementById("licLine")){const l=document.createElement("div");l.id="licLine";l.style.cssText="opacity:.45;font-size:11px;text-align:center;padding:0 0 4px";l.textContent="\u00a9 2026 Kizar \u00b7 LostNote is proprietary software \u00b7 not open source";sv.insertBefore(l,sv.firstChild)}if(sv&&!document.getElementById("verLine")){const v=document.createElement("div");v.id="verLine";v.style.cssText="opacity:.55;font-size:12px;text-align:center;padding:6px 0 2px";v.textContent="LostNote v1.2.0 \u00b7 transfer v3";sv.appendChild(v)}
  try{await loadSettings();notes=await db.listNotes();notes.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));const _seen=new Set();notes=notes.filter(n=>!_seen.has(n.id)&&_seen.add(n.id));render();renderColorRow()}catch(e){console.error("Init load error:",e)}
  dismissSplash();
  updAuto();
  if(!sessionStorage.unlocked&&S.pinSet){showLock("unlock")}else{try{const p=await db.getMeta("pinHash");if(p)sessionStorage.unlocked="1"}catch{}}
  safeOn(searchEl,"input",render);
  safeOn($("fab"),"click",()=>{openEditor(null);haptic()});
  safeOn($("btnDone"),"click",()=>closeEditor());
  safeOn($("btnOptions"),"click",()=>$("edMenu").classList.toggle("hidden"));
  safeOn($("btnDeleteNote"),"click",async()=>{if(!editingId)return;await softDelete(editingId);editingId=null;sheet.classList.add("hidden");lockScroll(false);render()});
  safeOn($("btnPinNote"),"click",async()=>{const n=editTarget;if(!n)return;n.pinned=!n.pinned;n.updatedAt=Date.now();await db.putNote(n);$("btnPinNote").classList.toggle("active",n.pinned);haptic()});
  safeOn($("btnArchiveNote"),"click",async()=>{const n=editTarget;if(!n)return;await archiveNote(n.id);closeEditor();render();showToast("Archived")});
  safeOn($("btnShare"),"click",async()=>{const n=editTarget;if(!n)return;await shareAsImage(n)});
  safeOn($("btnAttach"),"click",()=>$("filePhotos").click());
  safeOn(edBody,"input",updateMeta);
  safeOn(edTitle,"keydown",e=>{if(e.key==="Enter"){e.preventDefault();edBody.focus()}});
  safeOn($("btnTrash"),"click",showTrash);
  qsa("[data-close-trash]",el=>el.addEventListener("click",closeTrash));
  safeOn($("btnSettings"),"click",showSettings);
  safeOn($("btnCheckUpd"),"click",()=>checkUpdates(true));
  safeOn($("btnUpdGet"),"click",updGet);
  qsa("[data-close-settings]",el=>el.addEventListener("click",closeSettings));
  safeOn($("btnArchive"),"click",async()=>{if(S.archiveLocked&&!sessionStorage.archiveUnlocked){const h=await db.getMeta("archivePinHash").catch(()=>null);if(h){showLock("archive-unlock");return}}showArchive()});
  qsa("[data-close-archive]",el=>el.addEventListener("click",closeArchive));
  safeOn($("filePhotos"),"change",e=>{onPhotosSelected(e.target.files);e.target.value=""});
  safeOn($("lbDelete"),"click",deletePhoto);
  safeOn($("lbClose"),"click",closeLightbox);
  qsa("[data-close-lb]",el=>el.addEventListener("click",closeLightbox));
  safeOn($("sAllPdf"),"click",exportAllPdf);
  safeOn($("sBackup"),"click",backupAll);
  safeOn($("sRestore"),"click",restoreBackup);
  safeOn($("sPin"),"click",()=>{if(S.pinSet){lockMode="change-verify";pinBuf="";updateDots();$("lockTitle").textContent="Change PIN";$("lockMsg").textContent="Enter current PIN";$("lockCancel").classList.remove("hidden");$("lock").classList.remove("hidden")}else showLock("new")});
  safeOn($("sPinRemove"),"click",()=>showLock("remove"));
  safeOn($("sArchiveLock"),"click",async()=>{if(S.archiveLocked){showLock("archive-remove")}else{showLock("archive-set")}});
  safeOn($("lockCancel"),"click",()=>{if(lockMode==="unlock")showLock("unlock");else hideLock()});
  qsa("#fsSeg button",b=>b.addEventListener("click",async()=>{S.fontSize=b.dataset.fs;saveSettings();applySettings();haptic()}));
  qsa("#colSeg button",b=>b.addEventListener("click",async()=>{S.cols=b.dataset.cols;saveSettings();applySettings();haptic()}));
  safeOn($("swAnims"),"change",async()=>{S.anims=$("swAnims").checked;saveSettings();applySettings();haptic()});
  safeOn($("swHaptics"),"change",async()=>{S.haptics=$("swHaptics").checked;saveSettings();applySettings();haptic()});
  safeOn($("selSort"),"change",async()=>{S.sort=$("selSort").value;saveSettings();applySettings();render()});
  safeOn($("selTheme"),"change",async()=>{S.theme=$("selTheme").value;saveSettings();applySettings();render();haptic()});
  safeOn(document,"keydown",e=>{if(e.key==="Escape"&&!sheet.classList.contains("hidden"))closeEditor()});
  buildKeypad();await updateStats();
  let lpTimer=null,suppressClick=false;
  grid.addEventListener("contextmenu",e=>{if(e.target.closest(".note"))e.preventDefault()});
  grid.addEventListener("pointerdown",e=>{
    const el=e.target.closest(".note");if(!el||!el.dataset.id)return;
    const id=el.dataset.id;
    lpTimer=setTimeout(()=>{suppressClick=true;lpTimer=null;haptic();softDelete(id)},550);
  });
  ["pointerup","pointercancel","pointermove","pointerleave"].forEach(ev=>grid.addEventListener(ev,()=>{if(lpTimer){clearTimeout(lpTimer);lpTimer=null}}));
  grid.addEventListener("click",e=>{
    if(suppressClick){suppressClick=false;return}
    const el=e.target.closest(".note");if(el&&el.dataset.id){haptic();openEditor(el.dataset.id)}
  });
  safeOn($("sXferSend"),"click",startSend);
  safeOn($("sXferRecv"),"click",openRecv);
  qsa("[data-close-xfer]",el=>el.addEventListener("click",closeXfer));
  safeOn($("btnGoRecv"),"click",()=>submitRecvCode());
  qsa("#codeInputs input",inp=>{
    inp.addEventListener("input",()=>{inp.value=inp.value.replace(/\D/g,"").slice(0,1);inp.classList.toggle("filled",!!inp.value);if(inp.value){const n=inp.nextElementSibling;if(n)n.focus()}});
    inp.addEventListener("keydown",e=>{if(e.key==="Backspace"&&!inp.value){const p=inp.previousElementSibling;if(p)p.focus()}});
    inp.addEventListener("paste",e=>{const t=(e.clipboardData||window.clipboardData).getData("text").replace(/\D/g,"");if(t.length>1){e.preventDefault();const inputs=[...document.querySelectorAll("#codeInputs input")];inputs.forEach((x,i)=>{x.value=t[i]||"";x.classList.toggle("filled",!!x.value)});inputs[Math.min(t.length,4)].focus()}});
  });
  console.log("%c LostNote ","background:#8b5cf6;color:#fff;border-radius:6px;padding:2px 6px;font-weight:700","http://"+location.host);
}
init();

let xferPeer=null,xferConn=null,xferBusy=false;
const XFER_PEER_OPTS={debug:0,config:{iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:global.stun.twilio.com:3478"},{urls:"turn:openrelay.metered.ca:80",username:"openrelayproject",credential:"openrelayproject"},{urls:"turn:openrelay.metered.ca:443",username:"openrelayproject",credential:"openrelayproject"},{urls:"turn:openrelay.metered.ca:443?transport=tcp",username:"openrelayproject",credential:"openrelayproject"}]}};
const XFER_RELAY_OPTS={debug:0,iceTransportPolicy:"relay",config:{iceServers:XFER_PEER_OPTS.config.iceServers}};
function setXStatus(id,text,cls){const el=$(id);if(!el)return;el.textContent=text;const box=el.closest(".xfer-status");if(box){const d=box.querySelector(".xdot");if(d)d.className="xdot"+(cls?" "+cls:"")}}
function showStage(stage){$("stageSend").classList.toggle("hidden",stage!=="send");$("stageRecv").classList.toggle("hidden",stage!=="recv")}
function setProgress(f){const p=$("xferProg");p.classList.remove("hidden");p.querySelector("i").style.width=Math.round(f*100)+"%"}
function openXferView(){closeSettings();$("xfer").classList.remove("hidden");lockScroll(true)}
function openRecv(){openXferView();$("xferTitle").textContent="Receive notes";showStage("recv");setXStatus("recvStatus","Enter a code to begin","");qsa("#codeInputs input",x=>{x.value="";x.classList.remove("filled")});setTimeout(()=>document.querySelector("#codeInputs input").focus(),350)}
function closeXfer(){const wasBusy=xferBusy;xferBusy=false;try{if(xferConn)xferConn.close()}catch{}try{if(xferPeer)xferPeer.destroy()}catch{}xferPeer=null;xferConn=null;$("xfer").classList.add("hidden");lockScroll(false);if(wasBusy)showToast("Transfer cancelled")}
async function startSend(){
  if(xferBusy)return showToast("Already sending\u2026");
  if(!notes.length)return showToast("No notes to send yet");
  xferBusy=true;
  openXferView();$("xferTitle").textContent="Send all notes";showStage("send");
  const code=String(Math.floor(Math.random()*100000)).padStart(5,"0");
  $("sendCode").textContent=code.split("").join(" ");
  setXStatus("sendStatus","Contacting relay\u2026","pulse");
  if(typeof Peer==="undefined"){setXStatus("sendStatus","\u2717 Transfer library failed to load \u2014 check internet","err");xferBusy=false;return}
  try{
    xferPeer=new Peer("lostnote-x-"+code,XFER_PEER_OPTS);
    await new Promise((res,rej)=>{const ok=()=>res(),bad=()=>rej(new Error("relay"));xferPeer.on("open",ok);xferPeer.on("error",e=>rej(new Error(e.type||"relay")))});
    const arc=notes.filter(n=>n.archived&&!n.deleted).length,trh=notes.filter(n=>n.deleted).length;
    setXStatus("sendStatus","Waiting for other device\u2026 ("+notes.length+" notes \xb7 "+arc+" archived \xb7 "+trh+" in trash)","pulse");
    const waitConn=(p)=>new Promise(res=>p.on("connection",c=>res(c)));
    let gotC=await Promise.race([waitConn(xferPeer),new Promise(r=>setTimeout(()=>r(null),20000))]);
    if(!gotC){
      try{xferPeer.destroy()}catch{}
      setXStatus("sendStatus","Direct link blocked \u2014 retrying via relay\u2026","pulse");
      xferPeer=new Peer("lostnote-x-"+code,XFER_RELAY_OPTS);
      await new Promise((res,rej)=>{xferPeer.on("open",res);xferPeer.on("error",e=>rej(new Error(e.type||"relay")))});
      setXStatus("sendStatus","Relay up \u2014 waiting for other device\u2026","pulse");
      gotC=await waitConn(xferPeer);
    }
    xferConn=gotC;
    const conn=xferConn;
    
    await new Promise(res=>{if(conn.open)res();else conn.on("open",res)});
    setXStatus("sendStatus","Linked! Sending\u2026","busy");
    const payload=JSON.stringify({app:"lostnote",v:2,notes:notes});
    const CH=180000,chunks=[];
    for(let i=0;i<payload.length;i+=CH)chunks.push(payload.slice(i,i+CH));
    conn.send({type:"meta",total:chunks.length,size:payload.length});
    for(let i=0;i<chunks.length;i++){conn.send({type:"chunk",idx:i,data:chunks[i]});setProgress((i+1)/chunks.length);if(i%4===3)await new Promise(r=>setTimeout(r))}
    conn.send({type:"end"});
    const ack=await new Promise(res=>{conn.on("data",d=>{if(d&&d.type==="done")res(true)});setTimeout(()=>res(false),20000)});
    setProgress(1);
    setXStatus("sendStatus",ack?"\u2713 Delivered! All notes are on the other device.":"\u26a0 Sent (confirmation timed out)",ack?"ok":"busy");
    showToast(ack?"All notes delivered":"Sent");haptic();
  }catch(e){
    const t=e&&e.message?e.message:"failed";
    setXStatus("sendStatus","\u2717 "+(t==="unavailable-id"?"Code busy \u2014 tap Send again":t==="network"||t==="server-error"?"Relay unreachable \u2014 check internet":"Link failed: "+t),"err");
  }finally{xferBusy=false}
}
async function submitRecvCode(forced){
  if(xferBusy)return showToast("Already connecting\u2026");
  const inputs=[...document.querySelectorAll("#codeInputs input")];
  const code=(forced!==undefined?String(forced):inputs.map(x=>x.value).join(""));
  if(!/^\d{5}$/.test(code))return setXStatus("recvStatus","Enter all 5 digits","err");
  if(typeof Peer==="undefined")return setXStatus("recvStatus","\u2717 Transfer library failed to load \u2014 check internet","err");
  xferBusy=true;
  openXferView();
  setXStatus("recvStatus","Contacting relay\u2026","pulse");setProgress(0);
  try{
    xferPeer=new Peer(XFER_PEER_OPTS);
    await new Promise((res,rej)=>{xferPeer.on("open",res);xferPeer.on("error",e=>rej(new Error(e.type||"relay")))});
    setXStatus("recvStatus","Dialing "+code+"\u2026","pulse");
    const dial=(peer)=>new Promise((res,fail)=>{
      const cn=peer.connect("lostnote-x-"+code,{reliable:true});
      xferConn=cn;
      const to=setTimeout(()=>{try{cn.close()}catch{};fail(new Error("__TIMEOUT__"))},15000);
      try{peer.on("error",e=>{if(e.type==="peer-unavailable"){clearTimeout(to);fail(new Error("No device answered that code"))}})}catch{}
      cn.on("open",()=>{clearTimeout(to);res(cn)});
      cn.on("error",()=>{clearTimeout(to);fail(new Error("No device answered that code"))});
    });
    let conn;
    try{conn=await dial(xferPeer)}
    catch(e1){
      if(e1&&e1.message==="__TIMEOUT__"){
        setXStatus("recvStatus","Direct link blocked \u2014 retrying via relay\u2026","pulse");
        try{xferPeer.destroy()}catch{}
        xferPeer=new Peer(XFER_RELAY_OPTS);
        await new Promise((res,rej)=>{xferPeer.on("open",res);xferPeer.on("error",er=>rej(new Error(er.type||"relay")))});
        setXStatus("recvStatus","Relay up \u2014 dialing "+code+"\u2026","pulse");
        conn=await dial(xferPeer);
      } else { xferBusy=false; throw e1; }
    }
    setXStatus("recvStatus","Linked! Receiving\u2026","busy");
    let total=0,got=0,parts=[];
    const full=await new Promise((res,rej)=>{
      conn.on("data",d=>{
        if(!d||!d.type)return;
        if(d.type==="meta"){total=d.total;parts=new Array(total)}
        else if(d.type==="chunk"){parts[d.idx]=d.data;got++;if(total)setProgress(got/total)}
        else if(d.type==="end")res(parts.join(""));
      });
      setTimeout(()=>rej(new Error("Transfer timed out")),120000);
    });
    const parsed=JSON.parse(full);
    if(parsed.app!=="lostnote"||!Array.isArray(parsed.notes))throw new Error("Unrecognized data");
    let added=0,updated=0;
    for(const inc of parsed.notes){
      if(!inc||!inc.id)continue;
      const ex=notes.find(n=>n.id===inc.id);
      if(ex){if((inc.updatedAt||0)>(ex.updatedAt||0)){Object.assign(ex,inc);await db.putNote(ex);updated++}}
      else{notes.push(inc);await db.putNote(inc);added++}
    }
    try{conn.send({type:"done"})}catch{}
    render();
    setProgress(1);
    setXStatus("recvStatus","\u2713 Synced: "+added+" new \u00b7 "+updated+" updated (archive & trash included)","ok");
    showToast("Got "+parsed.notes.length+" notes");haptic();
  }catch(e){
    const m=e&&e.message?e.message:"Failed";
    let msg;
    if(/answered|peer-unavailable/i.test(m))msg="No device with that code";
    else if(m==="__TIMEOUT__"||/timeout|network|disconnected/i.test(m))msg="Couldn't reach the other device \u2014 make sure both are open, on the same Wi-Fi, and the code matches. (Windows: click Allow if the firewall asks.)";
    else msg=m;
    setXStatus("recvStatus","\u2717 "+msg,"err");
  }finally{xferBusy=false}
}
