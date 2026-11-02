/* FUTURE ARCHITECT v2 — evidence / theory / pamphlet cards and their inspect sheets. Strength is shown as pin colour, wear and stamps. */
(function(){
const FA=window.FA,G=FA.G,U=FA.UI,esc=U.esc;
const PINS=['#b8332a','#2a5fa8','#d1a021','#b8332a','#3a3a3a'];
U.evCard=function(e,o){
  o=o||{};const S=G.S,T=FA.ETYPES[e.type];
  const age=S.gturn-e.turn;
  const cls=['card','ev','t-'+T.cls,e.img?'hasimg':'',age>=3?'old':'',o.cls||''].join(' ');
  const pos=o.pos&&e.pos?`left:${e.pos.x}px;top:${e.pos.y}px;`:'';
  const isnew=o.pos&&e.turn>=S.gturn&&S.core.turn>0;
  return `<div class="${cls}" data-ev="${e.id}" style="${pos}--r:${U.hrot(e.id,5)}deg">
   <div class="face"><div class="ch">${esc(T.name)}</div>${e.img?`<div class="ci" style="background-image:url(assets/ev/${e.img}.webp)"></div>`:''}<div class="ct">${esc(e.title)}</div><div class="cs st${e.stamp}">${FA.ESTAMPS[e.stamp]}</div></div>
   ${isnew?'<div class="new">NEW</div>':''}${o.pos?`<div class="pin" data-pin="ev:${e.id}" style="--pc:${PINS[FA.hash(e.id)%PINS.length]}"></div>`:''}</div>`;
};
U.thCard=function(t,o){
  o=o||{};const S=G.S;const L=FA.T.look(t);
  const m=t.thesis?FA.MECH[t.thesis]:null;
  const pred=t.preds[t.preds.length-1];
  const pm=!pred?'':!pred.res?'forecast: pending':pred.res==='hit'?'forecast held ✓':pred.res==='miss'?'forecast failed ✗':'forecast: inconclusive';
  const nl=t.links.filter(l=>S.ev[l.ev]).length;
  const pos=o.pos&&t.pos?`left:${t.pos.x}px;top:${t.pos.y}px;`:'';
  const st=t.state;
  return `<div class="card th w${L.wear} ${st}" data-th="${t.id}" style="${pos}--r:${U.hrot(t.id,3)}deg;">
   <div class="face"><div class="thn">${esc(t.name)}</div><div class="tht">${m?esc(FA.cap(m.impl)):'— taken to mean… (not yet decided)'}</div>
   <div class="thm">${nl} string${nl===1?'':'s'}${pm?' · '+pm:''}</div>
   ${L.stamp?`<div class="tst">${L.stamp}</div>`:''}${st==='Contested'?'<div class="q">?</div>':''}${st==='Promising'?'<div class="tick">✓</div>':''}</div>
   ${o.pos?`<div class="pin" data-pin="th:${t.id}" style="--pc:${L.pin}"></div>`:''}</div>`;
};
U.pmCard=function(p,o){
  const S=G.S;const r=S.rivals.find(x=>x.id===p.rival);if(!r)return '';
  const pos=o&&o.pos?`left:${p.pos.x}px;top:${p.pos.y}px;`:'';
  const pc=p.s>.7?'#2e8b57':p.s>.5?'#9bb03a':p.s>.35?'#d9a526':'#c86c2e';
  return `<div class="card pm ${p.live?'':'dead'}" data-pm="${p.id}" style="${pos}--r:${U.hrot(p.id,4)}deg"><img src="assets/people/${r.img}.webp" alt=""><div class="face"><div class="pn">${esc(r.name)}</div><div class="pt">“${esc(p.text.length>96?p.text.slice(0,94)+'…':p.text)}”</div></div><div class="pin" data-nopin="1" style="--pc:${pc};pointer-events:none"></div></div>`;
};
U.impPhrases=function(e){return e.imp.map(id=>FA.cap(FA.MECH[id].impl));};
/* evidence inspect — a big sheet in the style of its type */
U.inspectEv=function(id,fromScene){
  const S=G.S,e=S.ev[id];if(!e)return;const T=FA.ETYPES[e.type];
  const hired=S.team.filter(a=>a.hired);
  const notes=hired.slice(0,2).map(a=>`<div class="margin"><img src="assets/people/${a.img}.webp" alt="">${esc(FA.T.margin(S,a,e))}<small>${esc(a.name)}</small></div>`).join('');
  const ths=Object.values(S.th).filter(t=>t.era===S.core.eraIdx&&!t.dead);
  const linked=ths.filter(t=>t.links.some(l=>l.ev===e.id));
  const onWall=e.state==='wall';
  const html=`<h3>${esc(T.name)}</h3><h2>${esc(e.title)}</h2>
   ${e.img?`<div class="photo" style="background-image:url(assets/ev/${e.img}.webp)"></div>`:''}
   <p class="typed">${esc(e.body)}</p>
   <div class="meta"><b>What</b> ${esc(T.name.toLowerCase())} · <b>Who</b> ${esc(e.who?e.who+(e.role?', '+e.role:''):'official returns')} · <b>Where</b> ${esc(U.reg(e.place))} · <b>When</b> ${e.year}<br><b>Reliability</b> <span class="stampx st${e.stamp}">${FA.ESTAMPS[e.stamp]}</span></div>
   <h3>Might point to</h3>${U.impPhrases(e).map(p=>`<div class="hand">· ${esc(p)}</div>`).join('')}
   ${notes}
   <div style="margin-top:14px">
    ${!onWall?`<button class="btn" data-a="pin">Pin to the wall</button>`:''}
    ${onWall&&ths.length?`<button class="btn" data-a="string">String to a card…</button>`:''}
    <button class="btn paper" data-a="look">Send someone to look</button>
    ${onWall&&!linked.length?`<button class="btn paper" data-a="arch">File away</button>`:''}
   </div><div id="insx"></div>`;
  const m=U.modal(html,'ev-'+T.cls);
  const x=m.querySelector('#insx');
  m.onclick=ev=>{const h=ev.target.closest&&ev.target.closest('[data-a]');const a=h&&h.dataset.a;if(!a)return;
    if(a==='pin'){U.do('pin',e.id);U.sfx('pin');U.closeModal();U.refresh();U.rerender();}
    else if(a==='arch'){U.do('archiveEv',e.id);U.closeModal();U.refresh();U.rerender();}
    else if(a==='look'){U.closeModal();U.open('door',{lead:e.id});}
    else if(a==='string'){x.innerHTML='<h3>String it to…</h3>'+ths.map(t=>`<button class="opt" data-t="${t.id}">${esc(t.name)}</button>`).join('');}
  };
  m.addEventListener('click',ev=>{const h=ev.target.closest&&ev.target.closest('[data-t]');const t=h&&h.dataset.t;if(t){U.do('link',e.id,t,'s');U.sfx('string');U.closeModal();U.refresh();U.rerender();}});
};
/* theory inspect: name, thesis, prediction, roundtable, actions */
U.inspectTh=function(id){
  const S=G.S,t=S.th[id];if(!t)return;
  const live=t.era===S.core.eraIdx&&!t.dead;
  const opts=G.thesisOptions(S,id);
  const m=t.thesis?FA.MECH[t.thesis]:null;
  const lnk=t.links.map(l=>{const e=S.ev[l.ev];return e?`<div class="lnk"><b class="${l.kind==='c'?'c':''}">${l.kind==='s'?'FOR':'AGAINST'}</b><span>${esc(e.title)}</span>${live?`<a data-cut="${e.id}">cut</a>`:''}</div>`:'';}).join('')||'<div class="hand" style="opacity:.6">no strings yet — drag from a pin</div>';
  const rt=live&&t.thesis?FA.T.roundtable(S,t).map(l=>{const a=S.team.find(x=>x.id===l.who);return `<div class="margin"><img src="assets/people/${a.img}.webp" alt="">${esc(l.text)}<small>${esc(a.name)} — ${l.stance==='for'?'persuaded':l.stance==='doubt'?'doubtful':'against'}</small></div>`;}).join(''):'';
  const pending=t.preds.find(p=>!p.res);
  const po=live&&m&&!pending?FA.T.predOptions(S,t):[];
  const hist=t.preds.filter(p=>p.res).map(p=>`<div class="hand">· ${esc(p.text)} — <span class="${p.res==='hit'?'':'redhand'}">${p.res==='hit'?'held':p.res==='miss'?'failed':'inconclusive'}</span></div>`).join('');
  const rivalsHot=live&&t.state==='Contested'?S.pamph.filter(p=>p.live&&p.mech!==t.thesis&&p.s>.35).slice(0,1).map(p=>{const r=S.rivals.find(x=>x.id===p.rival);return r?`<div class="margin" style="color:#6a2a2a"><img src="assets/people/${r.img}.webp" alt="">${esc(r.name)} argues it means something else: “${esc(FA.cap(FA.MECH[p.mech].impl))}.”<small>rival reading</small></div>`:'';}).join(''):'';
  const html=`<div style="font:11px var(--type);letter-spacing:.14em;color:#8a7a5c">THEORY CARD · ${t.state.toUpperCase()}</div>
   ${live?`<input class="field" id="thName" maxlength="48" value="${esc(t.name)}" placeholder="Name your theory">`:`<h2 class="hand" style="font-size:30px">${esc(t.name)}</h2>`}
   <h3>Taken to mean</h3>
   ${m?`<div class="hand" style="font-size:24px">${esc(FA.cap(m.impl))}.</div>`:'<div class="hand" style="opacity:.6">— not yet decided. String evidence first; what it implies will appear below.</div>'}
   ${live&&opts.length&&m?'<a class="hand" data-a="recon" style="font-size:17px;text-decoration:underline;cursor:pointer;color:#6a2a2a">reconsider what it means</a>':''}${live&&opts.length?`<div id="thOpts" style="${m?'display:none':''}">${opts.slice(0,5).map(o=>`<button class="opt ${o.mech===t.thesis?'on':''}" data-m="${o.mech}">${esc(FA.cap(FA.MECH[o.mech].impl))} <i style="opacity:.55">— ${o.n} piece${o.n>1?'s':''} point here</i></button>`).join('')}</div>`:''}
   <h3>Strings</h3>${lnk}
   ${rt?`<h3>The room's view</h3>${rt}`:''}${rivalsHot}
   ${hist?`<h3>On the record</h3>${hist}`:''}
   ${live&&m?`<h3>Stake your name</h3>${pending?`<div class="hand">Forecast pending: ${esc(pending.text.toLowerCase())}.</div>`:po.map((o,i)=>`<button class="opt" data-p="${i}">${esc(o.text)}</button>`).join('')}`:''}
   ${live?`<div style="margin-top:14px"><button class="btn red" data-a="act">Act on it…</button>${m?'<button class="btn paper" data-a="reel">Run a projection</button>':''}<button class="btn paper" data-a="shut">Done</button></div>`:''}`;
  const mm=U.modal(html,'paper-th');
  const inp=mm.querySelector('#thName');
  if(inp)inp.onchange=()=>{U.do('renameTheory',id,inp.value||'Untitled');G.save(S);U.refresh();U.rerender();};
  mm.onclick=ev=>{const hit=ev.target.closest&&ev.target.closest('[data-m],[data-p],[data-cut],[data-a]');const d=hit?hit.dataset:{};
    if(d.m){U.do('setThesis',id,d.m);U.sfx('stamp');U.closeModal();U.refresh();U.rerender();U.inspectTh(id);}
    else if(d.p!==undefined){if(!U.do('setPrediction',id,+d.p)){U.sfx('stamp');}U.closeModal();U.refresh();U.rerender();U.inspectTh(id);}
    else if(d.cut){U.do('unlink',d.cut,id);U.closeModal();U.refresh();U.rerender();U.inspectTh(id);}
    else if(d.a==='act'){U.closeModal();U.open('phone',{th:id});}
    else if(d.a==='reel'){U.closeModal();U.playReel(FA.N.reelFor(S,id),{forecast:true});}
    else if(d.a==='shut')U.closeModal();
    else if(d.a==='recon'){const o=mm.querySelector('#thOpts');if(o)o.style.display='';hit.remove();}
  };
};
U.inspectRival=function(rid){
  const S=G.S,r=S.rivals.find(x=>x.id===rid);if(!r)return;
  const m=FA.MECH[r.mech];const L=FA.RIVAL_LINES[r.arch];
  const mood=r.rel>.3?'warm':r.rel<-.3?'hostile':'wary';
  const html=`<div class="riv" style="background:none"><img src="assets/people/${r.img}.webp" alt=""><div class="rb"><b>${esc(r.name)}</b><div style="font-family:var(--type);font-size:11px;letter-spacing:.1em;text-transform:uppercase">${esc(r.title)} · ${esc(r.arch)}</div><div>${esc(L.intro)}</div>${r.heirOf?`<div style="color:#6a2a2a">Carries on from ${esc(r.heirOf)}.</div>`:''}<div>Mood: <b>${mood}</b></div></div></div>
   <h3>What they are telling people</h3><p class="typed">“${esc(FA.RIVAL_LINES[r.arch].pamph[S.gturn%3])} ${esc(FA.cap(m.impl))}.”</p>
   <div style="margin-top:10px"><button class="btn paper" data-a="call">Call them…</button></div>`;
  const mm=U.modal(html);mm.onclick=ev=>{if(ev.target.closest('[data-a=call]')){U.closeModal();U.open('phone',{rival:rid});}};
};
})();
