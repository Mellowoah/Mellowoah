/* FUTURE ARCHITECT v2 — title, the era-end Record, and the endgame binder. */
(function(){
const FA=window.FA,G=FA.G,U=FA.UI,esc=U.esc,$=U.$,cap=FA.cap;
U.showTitle=function(){
  const t=$('#title');t.classList.remove('hidden');
  const has=G.hasSave();
  const seed=FA.randomSeed();
  t.innerHTML=`<div class="bg" style="background-image:url(assets/rooms/room1.webp)"></div>
   <div class="letter"><div class="sub">Office of Forecasting · est. 1890</div><h1>Future Architect</h1>
   <p>Everybody in this building will tell you what is coming. Almost none of them will show you the shipping log.</p>
   <p>The wall is bare. The in-tray is not. Work out what is actually happening, and write down what you believe.</p>
   <button class="slipb" id="tNew">Open the office<small>1890 — a telegraph office. Six ages, one family, no winning.</small></button>
   ${has?`<button class="slipb" id="tCont">Take up where I left off<small>The papers are as you left them.</small></button>`:''}
   <button class="slipb" id="tSprint">One age only<small>A single season of work: the 1890 office, six turns, then the record.</small></button>
   <div style="margin-top:12px;font:14px var(--type);color:#6a5a3c">Case no. <input id="tSeed" class="field" style="width:120px;font-size:22px;display:inline-block" value="${seed}" maxlength="10" autocomplete="off"> <span class="hand" style="font-size:16px">— the same number is the same world</span></div></div>`;
  const seedv=()=>($('#tSeed').value||seed).trim().toUpperCase().slice(0,10)||seed;
  const begin=(mode)=>{U.sfx('paper');try{FA.Audio.start();}catch(e){}
    U.curtain(`1890<small>The telegraph office.</small>`,1300,()=>{G.wipe();G.start(seedv(),{mode});U.cur=null;$('#scene').classList.add('hidden');$('#scene').innerHTML='';U.bv=null;U.mapTh=U.dth=U.tth=U.dlead=null;U.endSeen=false;U.enterPlay();});};
  $('#tNew').onclick=()=>begin('full');$('#tSprint').onclick=()=>begin('sprint');
  const c=$('#tCont');if(c)c.onclick=()=>{const s=G.load();if(!s){return;}try{FA.Audio.start();}catch(e){}G.S=s;G.recalc(s);U.bv=null;U.enterPlay();};
};
/* ---------------- The Record ---------------- */
const VD={arrived:['ARRIVED','vd-arrived'],'took hold':['TOOK HOLD','vd-took'],hollow:['HOLLOW','vd-hollow'],faltered:['FALTERED','vd-faltered']};
U.scenes.reveal=function(body,arg,scene){
  const S=G.S,rv=S.reveal;const E=FA.ERAS[rv.era];
  scene.querySelector('.back').style.display='none';
  let d=0;const fu=()=>`style="animation-delay:${(d+=.18).toFixed(2)}s"`;
  const mech=rv.mechs.map(m=>{const v=VD[m.verdict];return `<div class="vrow"><span>${esc(m.name)}${m.backed?' <i style="color:#8a6a2b">· you moved on this</i>':''}</span><span class="stampx ${v[1]}">${v[0]}</span></div>`;}).join('');
  const ths=rv.ths.length?rv.ths.map(t=>`<div class="vrow"><span>“${esc(t.name)}”${t.thesis?'<br><i style="font-size:12px;opacity:.7">'+esc(cap(FA.MECH[t.thesis].impl))+'</i>':''}</span><span class="stampx ${t.outcome==='vindicated'?'vd-arrived':t.outcome==='refuted'?'vd-hollow':'vd-faltered'}">${t.outcome==='vindicated'?'VINDICATED':t.outcome==='refuted'?'REFUTED':'UNSETTLED'}</span></div>`).join(''):'<div class="typed">You pinned no cards in this age.</div>';
  const ch=rv.cons.concat(rv.shifts).map(c=>`<div class="typed">· ${esc(c.text)}</div>`).join('')||'<div class="typed">Almost nothing would have been different without your office. History did not need you.</div>';
  const extra=[];
  if(rv.missed.length)extra.push(`Never named, yet it came: ${rv.missed.map(esc).join('; ')}.`);
  if(rv.fooled.length)extra.push(`You put money or weight behind a story that was empty: ${rv.fooled.map(x=>'“'+esc(x)+'”').join('; ')}.`);
  if(rv.right.length)extra.push(`You saw it before it was obvious: ${rv.right.map(x=>'“'+esc(x)+'”').join('; ')}.`);
  body.innerHTML=`<div class="record"><div class="sheet fadeup" ${fu()}><div class="typed" style="letter-spacing:.2em">THE RECORD</div><h1 class="bigtitle">${rv.year}</h1><div class="typed">${esc(E.name)}. This is what actually happened. You could not see it from here.</div></div>
   <div class="sheet fadeup" ${fu()}><h3>What came of it</h3>${mech}</div>
   <div class="sheet fadeup" ${fu()}><h3>Your cards</h3>${ths}${extra.map(x=>`<div class="typed" style="margin-top:6px">${x}</div>`).join('')}</div>
   <div class="sheet fadeup" ${fu()}><h3>What your office changed</h3>${ch}</div>
   <div class="fadeup" ${fu()} style="text-align:center;margin:18px 0 40px"><button class="btn red" id="cont">${S.mode==='sprint'||rv.era>=5?'Close the file':'Close the file — the next age'}</button></div></div>`;
  U.sfx('reveal');
  $('#cont').onclick=()=>{
    const wasLast=S.mode==='sprint'||rv.era>=5;
    U.do('nextEra');U.cur=null;
    if(S.phase==='end'){U.open('end');return;}
    U.bv=null;
    $('#scene').classList.add('hidden');$('#scene').innerHTML='';
    U.curtain(`${S.year}<small>${esc(FA.ERAS[S.core.eraIdx].name)}.</small>`,1900,()=>{U.refresh();U.centerOn();U.open('tray',{note:true});try{FA.Audio.setEra(S.core.eraIdx);}catch(e){}});
  };
};
/* ---------------- endgame binder ---------------- */
U.scenes.end=function(body,arg,scene){
  const S=G.S;scene.querySelector('.back').style.display='none';
  G.save(S);
  const lg=FA.N.legacy(S);
  const first=!U.endSeen;U.endSeen=true;
  const fol=(t,inner,open)=>`<div class="folder ${open?'open':''}"><div class="fh"><span>${t}</span><span>+</span></div><div class="fb">${inner}</div></div>`;
  const cons=S.eras.map(r=>`<div class="tl-era"><b>${FA.ERAS[r.era].year} — ${esc(FA.ERAS[r.era].name)}</b>${(r.cons.concat(r.shifts)).map(c=>`<div>· ${esc(c)}</div>`).join('')||'<div>· Little changed by your hand.</div>'}</div>`).join('');
  const lin=S.lineage.map(l=>`<div class="ln"><i>${FA.ERAS[l.era].year}</i>${esc(l.first)} ${esc(S.name)} — ${esc(l.trait)}</div>`).join('')||'<div class="ln">One generation.</div>';
  const ths=Object.values(S.th).sort((a,b)=>a.born-b.born).map(t=>`<div class="ln"><i>${FA.ERAS[t.era].year}</i><b>${esc(t.name)}</b> — ${esc(t.state)}${t.thesis?' · '+esc(cap(FA.MECH[t.thesis].impl)):''}</div>`).join('')||'<div class="ln">No theories were written.</div>';
  const tl=FA.N.worldTimeline(S).map(w=>`<div class="tl-era"><b>${w.year} — ${esc(w.name)}</b>${w.lines.map(l=>`<div>${esc(l)}</div>`).join('')}</div>`).join('');
  body.innerHTML=`<div class="record"><div class="sheet fadeup" style="text-align:center"><div class="typed" style="letter-spacing:.2em">CIVILIZATION HISTORY · CASE ${esc(S.seed)}</div><h1 class="bigtitle">${esc(lg.title)}</h1><p class="typed" style="max-width:520px;margin:10px auto">${esc(lg.text)}</p>
    <div class="typed">${lg.t.right} theor${lg.t.right===1?'y':'ies'} vindicated · ${lg.t.fooled} taken in · ${lg.t.missed} arrival${lg.t.missed===1?'':'s'} never named</div>
    <div style="margin-top:12px"><button class="btn" id="doc">Play the documentary</button></div></div>
   ${fol('Consequence report',cons,true)}${fol('Theory archive',ths)}${fol('Lineage archive',lin)}${fol('World timeline',tl)}
   <div style="text-align:center;margin:26px 0 50px"><div class="hint">There is no winning. There is the record.</div><button class="btn red" id="again">Begin another case</button></div></div>`;
  body.querySelectorAll('.fh').forEach(h=>h.onclick=()=>{h.parentElement.classList.toggle('open');U.sfx('tap');});
  const play=()=>U.playReel(FA.N.documentary(S),{doc:true});
  $('#doc').onclick=play;
  $('#again').onclick=()=>{G.wipe();U.cur=null;$('#scene').classList.add('hidden');$('#scene').innerHTML='';U.showTitle();};
  U.sfx('legacy');
  if(first&&!window.__noAuto)setTimeout(play,900);
};
})();
