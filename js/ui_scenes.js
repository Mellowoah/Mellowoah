/* FUTURE ARCHITECT v2 — closeups of the desk, the map table, the telephone, the door, the cabinet, the calendar; and the projector. */
(function(){
const FA=window.FA,G=FA.G,U=FA.UI,esc=U.esc,$=U.$;
const cap=FA.cap;
function ledgerSlip(S){return `<div style="position:absolute;right:12px;top:10px;z-index:61;background:#efe7cf;font:13px var(--type);padding:5px 10px;box-shadow:0 2px 6px #000;transform:rotate(1.5deg)">Capital <b class="hand">${S.cap}</b> · Favours <b class="hand">${S.inf}</b> · Weeks <b class="hand">${S.weeks}</b></div>`;}
U.slip=ledgerSlip;
/* ---------------- in-tray ---------------- */
U.scenes.tray=function(body,arg){
  const S=G.S;arg=arg||{};
  U.onSceneClose=()=>{if(!S.seenMentor)S.seenMentor=true;if(Object.values(S.ev).some(e=>e.state==='tray')){U.do('pinAll');U.sfx('pin');}};
  let h='';
  if(!S.seenMentor||arg.note)h+=`<div class="note fadeup"><div class="typed">${esc(S.mentor)}</div></div>`;
  const lines=S.chron.filter(c=>c.t===S.gturn&&c.kind!=='era'&&c.kind!=='theory'&&c.kind!=='act');
  const inc=S.income||[];
  if(S.gturn>0&&(lines.length||inc.length)){
    h+=`<div class="sheet memo fadeup" style="animation-delay:.1s"><h2>Overnight</h2><div class="typed">${inc.concat(lines.map(l=>l.text)).map(t=>'· '+esc(t)).join('<br>')}</div></div>`;
  }
  const tray=Object.values(S.ev).filter(e=>e.state==='tray').sort((a,b)=>b.turn-a.turn);
  if(tray.length){
    h+=`<div class="stackcards"><div class="hint" style="margin:0 0 10px">${tray.length} paper${tray.length>1?'s':''} came in${S.gturn?'':' this morning'}. Tap one to read it. They go up on the wall when you leave.</div>`;
    h+=tray.map(e=>`<div class="mini" data-ev="${e.id}">${U.evCard(e,{})}<div class="info"><b>${esc(e.title)}</b>${esc(FA.ETYPES[e.type].name)} · ${esc(U.reg(e.place))} · <span class="stampx st${e.stamp}" style="font-size:10px">${FA.ESTAMPS[e.stamp]}</span></div></div>`).join('');
    h+='</div>';
  }else if(!h)h='<div class="hint" style="text-align:center;margin-top:30vh">The tray is empty. The wall is up to date.</div>';
  body.innerHTML=h;
  body.querySelectorAll('.mini').forEach(m=>m.onclick=()=>U.inspectEv(m.dataset.ev));
};
/* ---------------- ledger ---------------- */
U.scenes.ledger=function(body){
  const S=G.S;
  const field=S.pending.map(p=>{const a=S.team.find(x=>x.id===p.analyst);return `<div class="ln" style="font:14px var(--mono)">· ${esc(a?a.name:'Someone')}: ${esc(FA.IV[p.kind].n.toLowerCase())} — back in ${Math.max(1,p.due-S.gturn)} season${p.due-S.gturn>1?'s':''}</div>`;}).join('')||'<div class="hand" style="opacity:.6">no one out</div>';
  const bets=S.sched.filter(x=>x.kind==='fundret'||x.kind==='short').map(x=>`<div class="ln" style="font:14px var(--mono)">· ${x.kind==='short'?'Short':'Funded'}: ${esc(FA.MECH[x.mech].name.toLowerCase())} — settles in ${Math.max(1,x.due-S.gturn)}</div>`).join('')||'<div class="hand" style="opacity:.6">nothing outstanding</div>';
  const chron=S.chron.slice().reverse().slice(0,26).map(c=>`<div class="ln ${c.kind}" style="font:14px/1.35 var(--mono);border-bottom:1px dotted rgba(0,0,0,.2);padding:2px 0"><i style="font:11px var(--type);color:#8a7a5c;margin-right:6px">${c.y||''}</i>${esc(c.text)}</div>`).join('');
  body.innerHTML=`<div class="cols"><div class="sheet"><h2>Accounts</h2>
    <div class="hand" style="font-size:30px">Capital ${S.cap} &nbsp; Favours ${S.inf}</div>
    <div class="typed">Weeks left this season: <b>${S.weeks}</b></div>
    <h3>Out in the field</h3>${field}<h3>Wagers outstanding</h3>${bets}
    <h3>The house</h3><div class="typed">${esc(S.heir.first)} ${esc(S.name)} — ${esc(S.heir.trait)}.<br>${esc(FA.TRAIT_TXT[S.heir.trait])}</div></div>
   <div class="sheet"><h2>Day book</h2>${chron}</div></div>`;
};
/* ---------------- map table ---------------- */
const RECT={wst:[30,50,240,480],mid:[290,50,270,230],pln:[290,300,270,230],cap:[580,50,210,170],atl:[810,50,160,330],del:[580,240,210,130],prt:[580,390,390,140]};
function poly(id){
  const [x,y,w,h]=RECT[id];const R=FA.rng('map',id);const pts=[];const j=()=>(R.n()-.5)*26;
  const n=4;for(let i=0;i<=n;i++)pts.push([x+w*i/n+j(),y+j()]);for(let i=1;i<=n;i++)pts.push([x+w+j(),y+h*i/n+j()]);
  for(let i=n-1;i>=0;i--)pts.push([x+w*i/n+j(),y+h+j()]);for(let i=n-1;i>0;i--)pts.push([x+j(),y+h*i/n+j()]);
  return pts.map(p=>p.join(',')).join(' ');
}
U.scenes.map=function(body,arg){
  const S=G.S;arg=arg||{};const e=S.core.eraIdx;
  const ths=Object.values(S.th).filter(t=>t.era===e&&!t.dead);
  const sel=ths.find(t=>t.id===U.mapTh)||null;
  const evs=Object.values(S.ev).filter(x=>x.era===e&&(x.state==='wall'||x.state==='tray'));
  const linkedPlaces=new Set();if(sel)sel.links.forEach(l=>{const x=S.ev[l.ev];if(x)linkedPlaces.add(x.place);});
  let svg='';
  FA.REGIONS.forEach(r=>{
    const [x,y,w,h]=RECT[r.id];
    svg+=`<polygon class="reg ${linkedPlaces.has(r.id)?'on':''}" data-r="${r.id}" points="${poly(r.id)}"/><text class="rlab" x="${x+14}" y="${y+30}">${esc(r.name)}</text>`;
    const here=evs.filter(v=>v.place===r.id);
    here.slice(0,12).forEach((v,i)=>{const px=x+24+(i%6)*34,py=y+58+Math.floor(i/6)*34;
      svg+=`<g class="mpin" data-r="${r.id}"><circle cx="${px}" cy="${py}" r="9" fill="${FA.ETYPES[v.type].hard?'#2a5fa8':'#b8332a'}" stroke="#fff6" stroke-width="2"/><circle cx="${px-3}" cy="${py-3}" r="3" fill="#fff8"/></g>`;});
  });
  svg+=`<path d="M30,560 C250,520 450,590 700,545 S 950,560 975,540" fill="none" stroke="#6c8ba0" stroke-width="5" opacity=".5"/>`;
  const reels=ths.filter(t=>t.thesis);
  body.innerHTML=`<div class="mapwrap"><div class="hint" style="margin-bottom:8px">Pins mark where evidence came from — red for stories, blue for records. Choose a card to see where it reaches.</div>
   <div class="row" style="margin-bottom:10px">${ths.map(t=>`<button class="btn ${t===sel?'red':'paper'}" data-t="${t.id}">${esc(t.name)}</button>`).join('')||'<span class="hint">No theory cards yet.</span>'}</div>
   <svg class="mapsvg" viewBox="0 0 1000 600"><defs><pattern id="gr" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#7a6840" stroke-opacity=".25"/></pattern></defs><rect width="1000" height="600" fill="url(#gr)"/>${svg}</svg>
   <h3 style="color:#e8dcb4;margin-top:22px;font:15px var(--type);letter-spacing:.14em;text-transform:uppercase">The reel shelf</h3>
   <div class="shelf" id="shelf">${reels.map((t,i)=>`<div class="shelfitem" data-t="${t.id}"><div class="can" style="position:relative;margin:0 auto"><i>FC-${i+1}</i></div><div class="cl">${esc(t.name.length>26?t.name.slice(0,24)+'…':t.name)}</div></div>`).join('')||'<span class="hint">A reel can be cut once a card says what it means.</span>'}</div></div>`;
  body.querySelectorAll('.btn[data-t]').forEach(b=>b.onclick=()=>{U.mapTh=U.mapTh===b.dataset.t?null:b.dataset.t;U.sfx('tap');U.rerender();});
  body.querySelectorAll('.shelfitem').forEach(b=>b.onclick=()=>U.playReel(FA.N.reelFor(S,b.dataset.t),{forecast:true}));
  body.querySelectorAll('[data-r]').forEach(p=>p.onclick=()=>{
    const id=p.dataset.r;const here=evs.filter(v=>v.place===id);
    const m=U.modal(`<h2>${esc(U.reg(id))}</h2>${here.length?here.map(v=>`<button class="opt" data-e="${v.id}">${esc(FA.ETYPES[v.type].name)} — ${esc(v.title)}</button>`).join(''):'<div class="hand" style="opacity:.6">Nothing on file from here yet.</div>'}<div style="margin-top:12px"><button class="btn" data-a="field">Commission a survey of this region</button></div>`);
    m.onclick=ev=>{const d=ev.target.dataset||{};if(d.e){U.closeModal();U.inspectEv(d.e);}else if(d.a==='field'){U.closeModal();U.open('door',{lead:id});}};
  });
};
/* ---------------- dispatch (the telephone) ---------------- */
U.scenes.phone=function(body,arg){
  const S=G.S;arg=arg||{};const e=S.core.eraIdx;
  const ths=Object.values(S.th).filter(t=>t.era===e&&!t.dead&&t.thesis);
  if(arg.th)U.dth=arg.th;
  if(!ths.find(t=>t.id===U.dth))U.dth=ths[0]?ths[0].id:null;
  const t=S.th[U.dth];
  const acts=Object.entries(FA.ACTIONS).map(([k,a])=>{const err=t?G.canAct(S,k,t.id):'no card';return `<div class="act ${err?'dis':''}" data-k="${k}"><b>${a.n}</b><span>${esc(a.blurb)}<br><i style="opacity:.6">to ${esc(a.to)}</i></span><em>${a.c?a.c+' cap':''}${a.c&&a.i?' · ':''}${a.i?a.i+' fav':''}${!a.c&&!a.i?'free':''}</em></div>`;}).join('');
  const rivs=S.rivals.map(r=>{const mood=r.rel>.3?'warm':r.rel<-.3?'hostile':'wary';return `<div class="riv"><img src="assets/people/${r.img}.webp" alt=""><div class="rb"><b>${esc(r.name)}</b><div>${esc(r.title)} · mood: ${mood}</div><div style="margin-top:4px"><button class="btn paper" data-r="${r.id}" data-m="parley">Take tea (1 fav)</button><button class="btn paper" data-r="${r.id}" data-m="ally">Ask for backing (2)</button><button class="btn paper" data-r="${r.id}" data-m="betray">Leak their numbers</button></div></div></div>`;}).join('');
  body.innerHTML=`${ledgerSlip(S)}<div class="cols">
   <div class="sheet"><h2>Dispatch</h2><div class="typed">Choose the card you are prepared to act on, then the line you will use.</div>
    ${ths.map(x=>`<button class="tcard ${x.id===U.dth?'on':''}" data-t="${x.id}">${esc(x.name)}<small>${esc(cap(FA.MECH[x.thesis].impl))} · ${x.state}</small></button>`).join('')||'<div class="hand" style="opacity:.7;margin-top:10px">No card says what it means yet. Write one on the board and choose what it implies. The wires are quiet until then.</div>'}
    ${t?`<h3>Send</h3>${acts}`:''}<div class="err" id="dmsg"></div></div>
   <div class="sheet"><h2>Other lines</h2><div class="typed">Their pamphlets cross your wall. You can ring them.</div>${rivs}</div></div>`;
  body.querySelectorAll('.tcard').forEach(b=>b.onclick=()=>{U.dth=b.dataset.t;U.sfx('tap');U.rerender();});
  body.querySelectorAll('.act').forEach(b=>b.onclick=()=>{
    const r=U.do('act',b.dataset.k,U.dth);
    if(r){$('#dmsg').textContent=r;return;}
    U.sfx('phone');U.toast(`${FA.ACTIONS[b.dataset.k].n}: sent.`);U.refresh();U.rerender();
  });
  body.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{
    const r=U.do('parley',b.dataset.r,b.dataset.m);if(r)return;U.sfx('rival');
    U.toast(b.dataset.m==='parley'?'You take tea. A paper arrives in the tray.':b.dataset.m==='ally'?'They agree — for a season.':'The numbers are in the press.');U.refresh();U.rerender();
  });
  if(arg.rival){const el=body.querySelector(`[data-r="${arg.rival}"]`);if(el)el.closest('.riv').style.outline='3px solid #a8322a';}
};
/* ---------------- analysts ---------------- */
U.scenes.team=function(body,arg){
  const S=G.S;const e=S.core.eraIdx;
  const ths=Object.values(S.th).filter(t=>t.era===e&&!t.dead&&t.thesis);
  if(arg&&arg.th)U.tth=arg.th;
  if(!ths.find(t=>t.id===U.tth))U.tth=ths[0]?ths[0].id:null;
  const th=S.th[U.tth];
  const R=th?FA.rng(S.seed,'team'+th.id+S.gturn):null;
  const round=th?S.team.filter(a=>a.hired).map(a=>{const l=FA.T.line(S,a,th,null,R);return `<div class="margin"><img src="assets/people/${a.img}.webp" alt="">${esc(l.text)}<small>${esc(a.name)} — ${l.stance==='for'?'persuaded':l.stance==='doubt'?'doubtful':'against'}</small></div>`;}).join(''):'';
  const trustWord=a=>a.trust>.75?'trusts your judgement':a.trust>.45?'keeps an open mind about you':a.trust>.25?'is losing patience':'has one foot out of the door';
  const dos=S.team.map(a=>{const A=FA.ARCH[a.arch];return `<div class="dossier ${a.hired?'':'off'}"><img src="assets/people/${a.img}.webp" alt=""><div class="db"><h3>${esc(a.name)}</h3><div class="sub">${esc(A.name)} · ${a.age}</div>
    <div>${esc(a.bio)}</div><div style="margin-top:4px"><b>Trained:</b> ${esc(a.edu)}.<br><b>Manner:</b> ${esc(a.pers)}.<br><b>Politics:</b> ${esc(a.pol)}.<br><b>Reads best:</b> ${A.trust.map(t=>FA.ETYPES[t].name.toLowerCase()).join(', ')}.</div>
    ${a.hired?`<div class="hand" style="margin-top:6px">${a.busy?'Away in the field.':esc(a.name.split(' ')[0])+' '+trustWord(a)+'.'}</div>`:`<div style="margin-top:8px"><button class="btn ${S.cap>=a.cost?'':'dis'}" data-h="${a.id}">Take on — ${a.cost} capital</button></div>`}</div></div>`;}).join('');
  body.innerHTML=`${ledgerSlip(S)}<div class="record"><div class="sheet"><h2>The room's view</h2>
   ${ths.length?`<div class="row" style="margin-bottom:6px">${ths.map(t=>`<button class="btn ${t===th?'red':'paper'}" data-t="${t.id}">${esc(t.name)}</button>`).join('')}</div>${round||'<div class="hand">You need two analysts to hear an argument.</div>'}`:'<div class="hand" style="opacity:.7">Nothing to argue about yet. They will each have an opinion the moment a card says what it means.</div>'}</div>${dos}</div>`;
  body.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{U.tth=b.dataset.t;U.rerender();});
  body.querySelectorAll('[data-h]').forEach(b=>b.onclick=()=>{const r=U.do('hire',b.dataset.h);if(r)return;U.sfx('coin');U.refresh();U.rerender();});
};
/* ---------------- the door: field work ---------------- */
U.scenes.door=function(body,arg){
  const S=G.S;const e=S.core.eraIdx;arg=arg||{};
  if(arg.lead!==undefined)U.dlead=arg.lead;
  if(!U.dkind)U.dkind='interview';
  const free=S.team.filter(a=>a.hired);
  if(!free.find(a=>a.id===U.dan&&!a.busy))U.dan=(free.find(a=>!a.busy)||{}).id;
  const kinds=Object.entries(FA.IV).map(([k,v])=>{const cost=[v.w+' wk',v.c?v.c+' cap':'',v.i?v.i+' fav':''].filter(Boolean).join(' · ');return `<div class="ivrow ${U.dkind===k?'on':''}" data-k="${k}"><b>${v.n}<small>${esc(v.blurb)}</small></b><em>${cost}<br>${v.d>1?'~2 seasons':'next season'}</em></div>`;}).join('');
  const lead=U.dlead&&S.ev[U.dlead]?S.ev[U.dlead]:null;const leadReg=U.dlead&&!lead&&FA.REGIONS.find(r=>r.id===U.dlead);
  const recent=Object.values(S.ev).filter(x=>x.era===e&&(x.state==='wall'||x.state==='tray')).sort((a,b)=>b.turn-a.turn).slice(0,8);
  body.innerHTML=`${ledgerSlip(S)}<div class="record"><div class="sheet"><h2>Requisition — field work</h2>
   <div class="typed">Someone has to go and look. They will come back with what they saw, and with what they wanted to see.</div>
   <h3>1 · What should they do</h3>${kinds}
   <h3>2 · Follow what</h3>
   <div class="hand" style="margin-bottom:6px">${lead?'“'+esc(lead.title)+'”':leadReg?'The '+esc(leadReg.name):'No particular lead — a general inquiry.'}</div>
   <div class="row">${recent.map(x=>`<button class="btn paper" data-l="${x.id}" style="font-size:12px">${esc(x.title.length>30?x.title.slice(0,28)+'…':x.title)}</button>`).join('')}</div>
   <div class="row" style="margin-top:4px">${FA.REGIONS.map(r=>`<button class="btn paper" data-l="${r.id}" style="font-size:12px">${esc(r.name)}</button>`).join('')}<button class="btn paper" data-l="" style="font-size:12px">— none —</button></div>
   <h3>3 · Send whom</h3><div class="heads">${free.map(a=>`<div class="head ${a.id===U.dan?'on':''} ${a.busy?'dis':''}" data-a="${a.id}"><img src="assets/people/${a.img}.webp" alt="">${esc(a.name.split(' ').slice(-1)[0])}${a.busy?'<br>(away)':''}</div>`).join('')}</div>
   <div class="err" id="dmsg"></div>
   <button class="btn red" id="go">Send them out</button></div>
   ${S.pending.length?`<div class="sheet"><h3>Already out</h3>${S.pending.map(p=>{const a=S.team.find(x=>x.id===p.analyst);return `<div class="typed">· ${esc(a?a.name:'')} — ${esc(FA.IV[p.kind].n.toLowerCase())}</div>`;}).join('')}</div>`:''}</div>`;
  body.querySelectorAll('.ivrow').forEach(b=>b.onclick=()=>{U.dkind=b.dataset.k;U.sfx('tap');U.rerender();});
  body.querySelectorAll('[data-l]').forEach(b=>b.onclick=()=>{U.dlead=b.dataset.l;U.sfx('tap');U.rerender();});
  body.querySelectorAll('.head').forEach(b=>b.onclick=()=>{U.dan=b.dataset.a;U.rerender();});
  $('#go').onclick=()=>{
    const r=U.do('investigate',U.dkind,U.dlead||null,U.dan);if(r){$('#dmsg').textContent=r;return;}
    U.sfx('stamp');U.toast('They are on their way.');U.refresh();U.rerender();
  };
};
/* ---------------- archive cabinet ---------------- */
U.scenes.archive=function(body){
  const S=G.S;
  const fol=(t,inner,open)=>`<div class="folder ${open?'open':''}"><div class="fh"><span>${t}</span><span>+</span></div><div class="fb">${inner}</div></div>`;
  const chron=S.chron.slice().reverse().map(c=>`<div class="ln ${c.kind}"><i>${c.y||''}</i>${esc(c.text)}</div>`).join('')||'<div class="ln">Nothing yet.</div>';
  const lin=S.lineage.map(l=>`<div class="ln"><i>${FA.ERAS[l.era].year}</i>${esc(l.first)} ${esc(S.name)} — ${esc(l.trait)}</div>`).concat([`<div class="ln"><i>${S.year}</i><b>${esc(S.heir.first)} ${esc(S.name)} — ${esc(S.heir.trait)} (now)</b></div>`]).join('');
  const ths=Object.values(S.th).sort((a,b)=>b.born-a.born).map(t=>`<div class="ln"><i>${FA.ERAS[t.era].year}</i><b>${esc(t.name)}</b> — ${esc(t.state)}${t.thesis?' · '+esc(cap(FA.MECH[t.thesis].impl)):''}</div>`).join('')||'<div class="ln">No theories yet.</div>';
  const tl=FA.N.worldTimeline(S).map(w=>`<div class="tl-era"><b>${w.year} — ${esc(w.name)}</b>${w.lines.map(l=>`<div>${esc(l)}</div>`).join('')}</div>`).join('')||'<div class="ln">The first age has not ended.</div>';
  const nEv=Object.values(S.ev).filter(e=>e.state==='archive').length;
  const set=`<div class="ln">Case number: <b>${esc(S.seed)}</b> (the same case number replays the same world)</div><div class="ln">Evidence filed away: ${nEv}</div>
   <div style="margin-top:8px"><button class="btn paper" id="snd">Sound: ${FA.Audio.on?'on':'off'}</button><button class="btn paper" id="nw">Walk out and begin another case…</button></div>`;
  body.innerHTML=`<div class="record"><div class="hint" style="margin-bottom:10px;text-align:center">The cabinet.</div>${fol('Day book',chron,true)}${fol('Theory archive',ths)}${fol('The house',lin)}${fol('World timeline',tl)}${fol('The office',set)}</div>`;
  body.querySelectorAll('.fh').forEach(h=>h.onclick=()=>{h.parentElement.classList.toggle('open');U.sfx('tap');});
  $('#snd').onclick=()=>{FA.Audio.toggle();U.rerender();};
  $('#nw').onclick=()=>{if(confirm('Leave this case and start another? The current case is kept until you start a new one.')){U.close();U.showTitle();}};
};
/* ---------------- calendar: end of turn ---------------- */
U.scenes.calendar=function(body){
  const S=G.S;const last=S.core.turn+1>=FA.TURNS_PER_ERA;
  const tray=Object.values(S.ev).filter(e=>e.state==='tray').length;
  body.innerHTML=`<div class="record" style="margin-top:12vh"><div class="sheet" style="text-align:center;max-width:520px;margin:0 auto"><div class="typed" style="letter-spacing:.2em">${S.year}</div><div class="bigtitle" style="margin:6px 0">${S.year+FA.YEARS_PER_TURN}</div>
   <p class="typed">${last?'This is the last season of the age. When the page turns, the age is judged by what actually happened.':'Five years pass. Whatever you set moving will move; whatever you ignored will not wait.'}</p>
   <p class="typed">${S.weeks} week${S.weeks===1?'':'s'} unspent.${tray?` ${tray} paper${tray>1?'s':''} still unread in the tray.`:''}${S.pending.length?` ${S.pending.length} inquiry out in the field.`:''}</p>
   <button class="btn red" id="turn">Turn the page</button></div></div>`;
  $('#turn').onclick=()=>U.endTurn();
};
/* ---------------- the projector ---------------- */
U.playReel=function(frames,opt){
  opt=opt||{};
  const old=$('#reel');if(old)old.remove();
  const r=document.createElement('div');r.id='reel';
  r.innerHTML=`<div class="bar t"></div><div class="bar b"></div><div class="tl">${opt.doc?'THE RECORD':'SIMULATION REPORT'} · ${opt.doc?'':'REEL 1'}</div><div class="cap" id="rcap"></div><div class="gr"></div><div class="vg"></div><button class="skip">skip ▸</button>`;
  $('#app').appendChild(r);
  let i=-1,timer=null,typ=null;
  const els=frames.map((f,k)=>{const d=document.createElement('div');d.className='fr'+(k%2?' alt':'');d.innerHTML=f.card?`<div class="im" style="background:#0c0a08;animation:none"></div><div class="tcardf">${esc(f.card)}</div>`:`<div class="im" style="background-image:url(${f.img})"></div>`;r.insertBefore(d,r.querySelector('.bar'));return d;});
  function show(){
    i++;if(i>=frames.length){end();return;}
    els.forEach((el,k)=>el.classList.toggle('on',k===i));
    const f=frames[i];const cap=$('#rcap');const st=r.querySelector('.stampr');if(st)st.remove();
    clearInterval(typ);cap.innerHTML='';let n=0;const txt=f.cap||'';
    typ=setInterval(()=>{n++;cap.textContent=txt.slice(0,n);if(n>=txt.length){clearInterval(typ);cap.innerHTML=esc(txt)+(f.sub?`<small>${esc(f.sub)}</small>`:'');}},34);
    const stamp=f.stamp===true?'FORECAST — NOT FACT':typeof f.stamp==='string'?f.stamp:(opt.forecast&&i===0?'FORECAST — NOT FACT':'');
    if(stamp){const s=document.createElement('div');s.className='stampr';s.textContent=stamp;r.appendChild(s);U.sfx('stamp');}
    clearTimeout(timer);timer=setTimeout(show,5200);
  }
  function end(){clearTimeout(timer);clearInterval(typ);r.remove();U.stopReel=null;if(opt.done)opt.done();}
  U.stopReel=end;
  r.onclick=()=>show();
  r.querySelector('.skip').onclick=e=>{e.stopPropagation();end();};
  show();
};
})();
