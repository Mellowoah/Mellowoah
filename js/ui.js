/* FUTURE ARCHITECT v2 — the room. Shell, stage scaling, room render, scene router. No menus: the room is the interface. */
(function(){
const FA=window.FA,G=FA.G;
const U=FA.UI={};
const $=s=>document.querySelector(s);
U.$=$;
U.esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const esc=U.esc;
U.S=()=>G.S;
U.hrot=(id,m)=>{const h=FA.hash(id);return ((h%1000)/1000-.5)*(m||5);};
U.lex=(l,e)=>FA.LEX[l][e==null?G.S.core.eraIdx:e];
U.reg=id=>(FA.REGIONS.find(r=>r.id===id)||{name:''}).name;
U.sfx=k=>{try{FA.Audio.sfx(k);}catch(e){}};
/* rooms: rects in stage percent [x,y,w,h] */
const ROOMS=[
 {board:[18,9,53,50],map:[62,60,24,28],phone:[71,32,7,16],door:[84,6,14,58]},
 {board:[42,8,40,40],map:[56,72,44,26],phone:[85,47,9,12],door:[86,16,12,52]},
 {board:[20,8,58,50],map:[54,62,32,30],phone:[75,70,9,10],door:[82,20,14,44]},
 {board:[29,13,53,45],map:[64,74,32,26],phone:[71,79,8,9],door:[84,14,13,46]},
 {board:[28,9,42,47],map:[62,70,24,20],phone:[75,38,6,12],door:[82,16,13,48]},
 {board:[27,25,50,40],map:[60,70,36,26],phone:[85,78,7,10],door:[80,15,14,50]}
];
U.ROOMS=ROOMS;
let sc=1;
U.fit=function(){
  const vw=window.innerWidth,vh=window.innerHeight;
  const phone=vw<700;
  document.body.classList.toggle('m',phone);
  sc=Math.max(vw/1600,vh/900);
  const wrap=$('#stagewrap');wrap.style.width=1600*sc+'px';wrap.style.height=900*sc+'px';
  $('#stage').style.transform='scale('+sc+')';
  const ds=phone?Math.min(.62,vw/735):Math.max(.7,Math.min(1.25,vh/900));
  $('#desk').style.setProperty('--ds',ds);
  document.body.classList.toggle('pano',1600*sc-vw>120);
  U.ds=ds;
  if(!U._centered){U.centerOn();U._centered=true;}
};
U.centerOn=function(){
  const S=G.S;const vp=$('#vp');if(!vp)return;
  const r=ROOMS[S?S.core.eraIdx:0].board;const cx=(r[0]+r[2]/2)/100*1600*sc;
  const extra=1600*sc-window.innerWidth;vp.scrollLeft=extra<300?extra/2:Math.max(0,Math.min(extra,cx-window.innerWidth/2));
};
/* ---------- toast / curtain / modal ---------- */
let tt=null;
U.toast=function(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('on'),2600);};
U.curtain=function(html,ms,cb){
  const c=$('#curtain');c.innerHTML=html;c.classList.add('on');U.sfx('year');
  setTimeout(()=>{if(cb)cb();setTimeout(()=>c.classList.remove('on'),300);},ms||1500);
};
U.modal=function(html,cls){
  const m=$('#modal');m.innerHTML=`<div class="sheet ${cls||''}"><button class="x" data-close>×</button>${html}</div>`;m.classList.remove('hidden');
  m.onclick=e=>{if(e.target===m||e.target.hasAttribute('data-close'))U.closeModal();};
  U.sfx('paper');
  return m.firstChild;
};
U.closeModal=function(){const m=$('#modal');m.classList.add('hidden');m.innerHTML='';if(U.onModalClose){const f=U.onModalClose;U.onModalClose=null;f();}};
/* ---------- scenes ---------- */
U.cur=null;
U.scenes={};
U.open=function(name,arg){
  const s=$('#scene');s.classList.remove('hidden');
  U.cur={name,arg};U.sfx('paper');
  s.innerHTML='';
  const back=document.createElement('button');back.className='back';back.textContent='← The room';back.onclick=()=>U.close();s.appendChild(back);
  const body=document.createElement('div');body.className='sc-body';body.id='scBody';s.appendChild(body);
  if(name!=='board'){const bg=document.createElement('div');bg.className='desk-bg';s.insertBefore(bg,back);}
  U.scenes[name](body,arg,s);
};
U.rerender=function(){if(U.cur&&!$('#scene').classList.contains('hidden')){const sc0=$('#scBody')&&$('#scBody').scrollTop;const c=U.cur;if(c.name==='board'&&U.boardRedraw){U.boardRedraw();return;}U.open(c.name,c.arg);const b=$('#scBody');if(b&&sc0)b.scrollTop=sc0;}};
U.close=function(){
  if(U.onSceneClose){const f=U.onSceneClose;U.onSceneClose=null;f();}
  $('#scene').classList.add('hidden');$('#scene').innerHTML='';U.cur=null;U.refresh();G.save(G.S);
};
document.addEventListener('keydown',e=>{if((e.key==='m'||e.key==='M')&&!/INPUT|TEXTAREA/.test((e.target||{}).tagName||'')){try{const on=FA.Audio.toggle();U.toast(on?'Sound on.':'Sound off.');}catch(x){}}if(e.key==='Escape'){if(!$('#modal').classList.contains('hidden'))U.closeModal();else if($('#reel'))U.stopReel&&U.stopReel();else if(U.cur)U.close();}});
/* do an action through the replayable log; show a typed error if refused */
U.do=function(){
  const r=G.do.apply(G,arguments);
  if(typeof r==='string'&&arguments[0]!=='newTheory'){U.sfx('err');U.toast(r);return r;}
  return r;
};
/* ---------- the room ---------- */
function rect(el,r){el.style.left=r[0]/100*1600+'px';el.style.top=r[1]/100*900+'px';el.style.width=r[2]/100*1600+'px';el.style.height=r[3]/100*900+'px';}
U.refresh=function(){
  const S=G.S;if(!S)return;
  const e=S.core.eraIdx,E=FA.ERAS[e],R=ROOMS[e];
  const bg=$('#roomBg');const src='assets/rooms/'+E.img+'.webp';if(!bg.src.endsWith(src))bg.src=src;
  document.body.dataset.era=e;
  // wall board (live miniature of the real board)
  const wb=$('#wallBoard');rect(wb,R.board);
  U.drawMini(wb);wb.style.cursor='pointer';wb.onclick=()=>U.open('board');
  $('#plBoard').textContent='Theory board';
  // hotspots
  const sp=$('#spots');sp.innerHTML='';
  [['map','Map table',R.map],['phone','Dispatch',R.phone],['door','Field work',R.door]].forEach(([k,lab,r])=>{
    const d=document.createElement('div');d.className='spot';rect(d,r);d.dataset.k=k;d.innerHTML=`<div class="plate">${lab}</div>`;
    d.onclick=()=>U.open(k);sp.appendChild(d);
  });
  // relics: a framed token of each past age
  const rel=$('#relics');rel.innerHTML=S.relics.map((r,i)=>`<div class="relic" style="--r:${U.hrot('rel'+i,5)}deg" title="${esc(FA.ERAS[r.era].year+' — '+r.name)}"><i>${esc(FA.ERAS[r.era].year)}<br>${esc(r.name.slice(0,26))}</i><b style="background:${r.kind==='vindicated'?'#2e7a4b':r.kind==='refuted'?'#8e2222':'#777'}">${r.kind==='vindicated'?'✓':r.kind==='refuted'?'✗':'·'}</b></div>`).join('');
  U.drawTeam();U.drawDesk();
};
U.drawTeam=function(){
  const S=G.S,t=$('#team');t.innerHTML='';const e=S.core.eraIdx;
  const hired=S.team.filter(a=>a.hired);
  const th=Object.values(S.th).filter(x=>x.era===e&&x.thesis&&!x.dead).sort((a,b)=>b.born-a.born)[0];
  const tray=Object.values(S.ev).filter(x=>x.state==='tray');
  hired.forEach((a,i)=>{
    const x=104+i*122,y=560;
    const d=document.createElement('div');d.className='person'+(a.busy?' busy':'');d.style.left=x+'px';d.style.top=y+'px';
    d.innerHTML=`<img src="assets/people/${a.img}.webp" alt="${esc(a.name)}"><div class="plate">${esc(a.name.split(' ').slice(-1)[0])}</div>${a.busy?'<div class="away">away — in the field</div>':''}`;
    d.onclick=()=>U.open('team');t.appendChild(d);
    if(i<2){
      let txt,cap;
      const R=FA.rng(S.seed,'slip'+a.id+S.gturn);
      if(th){const l=FA.T.line(S,a,th,null,R);txt=l.text;cap=th.name;}
      else if(tray.length){const ev=tray[(i+S.gturn)%tray.length];txt=FA.T.margin(S,a,ev);cap=ev.title;}
      else{txt=a.pers.charAt(0).toUpperCase()+a.pers.slice(1)+'.';cap=a.name;}
      const s=document.createElement('div');s.className='slip';s.style.left=(112+(i?6:0))+'px';s.style.top=(318+i*104)+'px';s.style.setProperty('--r',(i?1.6:-1.8)+'deg');s.style.width='164px';
      s.innerHTML=`<small>${esc(a.name.split(' ').slice(-1)[0])} on ${esc(cap.length>22?cap.slice(0,21)+'…':cap)}</small>${esc(txt.length>96?txt.slice(0,94)+'…':txt)}`;
      s.onclick=()=>U.open('team');t.appendChild(s);
    }
  });
};
U.drawDesk=function(){
  const S=G.S,d=$('#desk');const e=S.core.eraIdx;
  const tray=Object.values(S.ev).filter(x=>x.state==='tray');
  const sheets=tray.slice(0,3).map(x=>`<div class="sheet">${esc(FA.ETYPES[x.type].name.toUpperCase())}<br>${esc(x.title.slice(0,40))}</div>`).join('')||'<div class="sheet" style="opacity:.5">&nbsp;</div>';
  const left=S.weeks;
  const tally='<span>'+'|'.repeat(Math.min(left,10)).replace(/(\|{5})/g,'<s>$1</s> ')+'</span>';
  const reelsN=Object.values(S.th).filter(t=>t.thesis&&t.era===e).length;
  d.innerHTML=`
   <div class="obj tray" data-k="tray" style="--r:-1deg">${sheets}${tray.length?`<div class="cnt">${tray.length}</div>`:''}<div class="plate">In-tray</div></div>
   <div class="obj ledger" data-k="ledger" style="--r:1deg"><div class="slipin">Capital <b>${S.cap}</b><br>Favours <b>${S.inf}</b></div><div class="plate">Ledger</div></div>
   <div class="obj cal" data-k="calendar" style="--r:-1deg"><div class="tn">${S.core.turn+1} of ${FA.TURNS_PER_ERA}</div><div class="yr">${S.year}</div><div class="tally" title="weeks left this season">${tally}</div><div class="plate">${window.innerWidth<700?'Turn page':'Turn the page'}</div></div>
   <div class="obj reels" data-k="map" style="--r:1deg"><div class="can"><i>REEL</i></div><div class="can"><i>${reelsN?'FC':'—'}</i></div><div class="plate">Reels</div></div>
   <div class="obj arch" data-k="archive" style="--r:-1deg"><i>ARCHIVE</i><div class="plate">Cabinet</div></div>`;
  d.querySelectorAll('.obj').forEach(o=>o.onclick=()=>{const k=o.dataset.k;U.open(k,k==='map'?{reels:true}:undefined);});
};
/* ---------- play flow ---------- */
U.enterPlay=function(){
  $('#title').classList.add('hidden');
  U.fit();U._centered=false;U.fit();U.refresh();
  const S=G.S;
  if(S.phase==='reveal'){U.open('reveal');return;}
  if(S.phase==='end'){U.open('end');return;}
  try{FA.Audio.start&&FA.Audio.start();FA.Audio.setEra&&FA.Audio.setEra(S.core.eraIdx);}catch(e){}
  if(!S.seenMentor){U.open('tray',{note:true});}
};
U.endTurn=function(){
  const S=G.S;const e0=S.core.eraIdx;
  const y1=S.year+FA.YEARS_PER_TURN;
  U.close();
  U.curtain(`${y1}<small>${S.core.turn+1>=FA.TURNS_PER_ERA?'The age closes.':'The season turns.'}</small>`,1500,()=>{
    G.do('endTurn');U.refresh();
    if(S.phase==='reveal'){setTimeout(()=>U.open('reveal'),400);}
    else U.open('tray',{memo:true});
  });
};
U.title=function(){U.showTitle();};
window.addEventListener('resize',()=>{U.fit();if(G.S)U.refresh();});
/* quiet autosave on page hide */
window.addEventListener('pagehide',()=>{if(G.S)G.save(G.S);});
window.addEventListener('DOMContentLoaded',()=>{U.fit();U.showTitle();});
})();
