/* FUTURE ARCHITECT v2 — chapter reveals, counterfactuals, mentor notes, reels, endgame. */
(function(){
const FA=window.FA, clamp=FA.clamp;
const N=FA.N={};
const HEIRS=['Theodore','Margot','Julian','Harriet','Raymond','Vivian','Desmond','Imogen','Calvin','Nadia','Felix','Odette','Silas','Wren','Anselm','Tamsin','Leopold','Marisol'];
const TRAITS=['Idealist','Mercenary','Loyalist','Maverick','Perfectionist'];
const THEME={MF:'w',CP:'w',LB:'w',EN:'w',IN:'w',TR:'s',CO:'w',RS:'l',ED:'l',ME:'l',MD:'s',GV:'s',PO:'s',EV:'s',MI:'s',FD:'s',CM:'s'};
FA.stillFor=function(e,layer){return 'assets/fc/f'+(e+1)+(THEME[layer]||'s')+'.webp';};
N.eraEnd=function(S){
  const e=S.core.eraIdx,core=S.core;
  const actual=FA.sim.clone(core);
  const cf=FA.sim.fork(S.snap,S.hist,'nobody');
  const mechs=FA.MECHS[e].map(m=>{
    const A=core.A[m.id],B=cf.A[m.id];
    const verdict=core.hype[m.id]&&A<.28?'hollow':A>.55?'arrived':A>.3?'took hold':'faltered';
    return {id:m.id,name:m.name,hype:core.hype[m.id]&&A<.28,A,cfA:B,verdict,backed:(S.acted[m.id]||[]).length>0};
  });
  const ths=Object.values(S.th).filter(t=>t.era===e).map(t=>{
    const m=t.thesis?FA.MECH[t.thesis]:null;const A=m?core.A[m.id]:0;
    const o=!m?'unsettled':(core.hype[m.id]&&A<.28)?'refuted':A>.4?'vindicated':'unsettled';
    return {id:t.id,name:t.name,thesis:t.thesis,state:t.state,outcome:o,hits:t.preds.filter(p=>p.res==='hit').length,miss:t.preds.filter(p=>p.res==='miss').length};
  });
  const cons=FA.LAYERS.map((l,i)=>({l,d:actual.L[i]-cf.L[i]})).filter(x=>Math.abs(x.d)>.02).sort((a,b)=>Math.abs(b.d)-Math.abs(a.d)).slice(0,4)
    .map(x=>({l:x.l,d:x.d,text:`${FA.cap(FA.LEX[x.l][e])} ended ${x.d>0?'higher':'lower'} than it would have without your office.`}));
  const shifts=mechs.filter(m=>Math.abs(m.A-m.cfA)>.12).map(m=>({id:m.id,text:m.A>m.cfA?`${m.name} came sooner and stronger because of your push.`:`${m.name} was held back — by your warnings, or by what you drew away from it.`}));
  const missed=mechs.filter(m=>m.A>.55&&!ths.some(t=>t.thesis===m.id));
  const fooled=ths.filter(t=>t.outcome==='refuted'&&(S.acted[t.thesis]||[]).some(a=>a.kind==='fund'||a.kind==='build'));
  const right=ths.filter(t=>t.outcome==='vindicated');
  S.reveal={era:e,mechs,ths,cons,shifts,missed:missed.map(m=>m.name),fooled:fooled.map(t=>t.name),right:right.map(t=>t.name),year:S.year,L:core.L.slice(),cfL:cf.L.slice()};
  S.eras.push({era:e,year:S.year,right:right.length,fooled:fooled.length,missed:missed.length,theories:ths.length,L:core.L.slice(),mechs:mechs.map(m=>({id:m.id,v:m.verdict})),heir:S.heir.first+' '+S.name,cons:cons.map(c=>c.text),shifts:shifts.map(s=>s.text),fooledN:fooled.map(t=>t.name),rightN:right.map(t=>t.name)});
  S.relics.push({era:e,name:right[0]?right[0].name:(fooled[0]?fooled[0].name:'An unfinished file'),kind:right[0]?'vindicated':fooled[0]?'refuted':'open'});
  Object.values(S.th).forEach(t=>{if(t.era===e)t.dead=true;});
  FA.G.log(S,`The age of the ${FA.ERAS[e].short} ends.`,'era');
  S.phase='reveal';
};
N.nextEra=function(S){
  if(S.phase!=='reveal')return 'busy';
  const e=S.core.eraIdx;
  if(S.mode==='sprint'||e>=5){S.phase='end';return null;}
  Object.values(S.ev).forEach(x=>{x.state='archive';});
  const R=FA.rng(S.seed,'heir'+e);
  const prev=S.heir;const trait=R.pick(TRAITS);
  S.lineage.push({first:prev.first,name:S.name,trait:prev.trait,era:e});
  S.heir={first:R.pick(HEIRS),trait,era:e+1};
  const b={Idealist:{inf:2},Mercenary:{cap:4},Loyalist:{inf:1,cap:2},Maverick:{},Perfectionist:{inf:1}}[trait];
  S.cap+=(b.cap||0);S.inf+=(b.inf||0);
  S.mentor=N.mentorNote(S,prev);S.seenMentor=false;
  S.year=FA.ERAS[e+1].year;
  FA.sim.startEra(S.core,e+1);
  S.acted={};S.hot={};S.twine=[];
  S.pending=[];S.team.forEach(a=>a.busy=false);
  FA.G.setupEra(S,false);
  S.phase='play';S.reveal=null;
  return null;
};
N.mentorNote=function(S,prev){
  const r=S.eras[S.eras.length-1];const rev=S.reveal;
  const R=FA.rng(S.seed,'mn'+S.core.eraIdx);
  const good=rev.right.length,bad=rev.fooled.length;
  let body;
  if(good&&!bad)body=R.pick(['You were right more than you were wrong. People will tell you so. Be suspicious of the compliment.','The record favours you, which is the most dangerous thing a record can do.']);
  else if(bad&&!good)body=R.pick(['You were taken in. It happens to everyone once — the clever ones remember what it cost.','The money followed the story, and the story was empty. Learn the difference between a headline and a shipment.']);
  else if(good&&bad)body=R.pick(['A mixed ledger. That is what honest work looks like.','You saw the future twice and invented it once. Count both.']);
  else body=R.pick(['You kept your name off the wall, and the age passed you by. Caution has a cost too.','A quiet age for the office. History does not wait for the cautious.']);
  const miss=rev.missed.length?` We never named ${rev.missed[0].toLowerCase()}; it arrived anyway.`:'';
  return `${prev.first} ${S.name}'s note, left in the drawer — ${r.year}:\n\n"${body}${miss}\n\nThe room is new and the instruments are different. The problem is the same: everyone will tell you what is coming, and almost no one will show you the shipping log.\n\nThe walls are bare. Start again. — ${prev.first}"`;
};
/* ---- a forecast reel for one theory: the sim run forward with the mechanism pushed ---- */
N.reelFor=function(S,thId){
  const th=S.th[thId];const m=FA.MECH[th.thesis];const e=S.core.eraIdx;
  const a=FA.sim.clone(S.core),b=FA.sim.clone(S.core);
  FA.sim.step(a,{push:{[m.id]:.45}});FA.sim.step(a,{});FA.sim.step(a,{});
  FA.sim.step(b,{});FA.sim.step(b,{});FA.sim.step(b,{});
  const ds=FA.LAYERS.map((l,i)=>({l,d:a.L[i]-b.L[i]})).filter(x=>Math.abs(x.d)>.008).sort((x,y)=>Math.abs(y.d)-Math.abs(x.d)).slice(0,3);
  const frames=[{img:'assets/eras/'+FA.ERAS[e].bg+'.webp',cap:`SIMULATION REPORT — "${th.name}"`,sub:`Projection ${S.year} → ${S.year+15}`},];
  ds.forEach(x=>frames.push({img:FA.stillFor(e,x.l),cap:`${FA.cap(FA.LEX[x.l][e])} ${x.d>0?'grow':'shrink'}${Math.abs(x.d)>.04?' markedly':''}.`,sub:`If ${m.impl}.`}));
  if(!ds.length)frames.push({img:FA.stillFor(e,'MD'),cap:'The model shows little change.',sub:'Either the effect is small, or this has been mis-specified.'});
  frames.push({img:FA.stillFor(e,ds[0]?ds[0].l:'MD'),cap:'FORECAST — NOT FACT',sub:'A projection is a reasoned guess, not a record.',stamp:true});
  return frames;
};
/* ---- documentary of the whole run ---- */
N.documentary=function(S){
  const fr=[];
  S.eras.forEach((r,i)=>{
    fr.push({img:'assets/eras/'+FA.ERAS[i].bg+'.webp',cap:`${FA.ERAS[i].year}. ${FA.ERAS[i].name}.`,sub:`${r.heir} at the ${FA.ERAS[i].short.toLowerCase()}.`});
    const best=Object.values(S.ev).filter(e=>e.era===i&&e.img&&(e.state==='wall'||e.state==='archive')&&S.th&&Object.values(S.th).some(t=>t.links.some(l=>l.ev===e.id))).slice(0,1);
    best.forEach(e=>fr.push({img:'assets/ev/'+e.img+'.webp',cap:e.title,sub:`Evidence — ${FA.ETYPES[e.type].name.toLowerCase()}.`}));
    const mech=r.mechs.find(m=>m.v==='arrived')||r.mechs[0];
    const lay=Object.keys(FA.MECH[mech.id].dr)[0];
    fr.push({img:FA.stillFor(i,lay),cap:`${FA.MECH[mech.id].name} ${mech.v==='arrived'?'arrived':mech.v==='hollow'?'never came':'faltered'}.`,sub:r.cons[0]||''});
    if(r.rightN[0])fr.push({card:r.rightN[0],cap:`"${r.rightN[0]}" — vindicated.`,sub:'Theory archive.'});
    else if(r.fooledN[0])fr.push({card:r.fooledN[0],cap:`"${r.fooledN[0]}" — refuted.`,sub:'The office was taken in.',stamp:'DISPROVEN'});
  });
  fr.push({img:'assets/eras/'+FA.ERAS[S.eras[S.eras.length-1].era].bg+'.webp',cap:'There is no winning. There is the record.',sub:'THE END'});
  return fr;
};
N.legacy=function(S){
  const t=S.eras.reduce((a,r)=>({right:a.right+r.right,fooled:a.fooled+r.fooled,missed:a.missed+r.missed,th:a.th+r.theories}),{right:0,fooled:0,missed:0,th:0});
  let title,text;
  if(t.th<3){title='The Bystander';text='You kept your name off the cards. History was written in the next office along.';}
  else if(t.fooled>t.right){title='The Believer';text='You were persuaded often and verified rarely. Your money built several futures that never arrived.';}
  else if(t.right>=t.fooled*2&&t.right>=3){title='The Cartographer';text='You mapped what was coming more often than not, and you knew the difference between a signal and a story.';}
  else{title='The Auditor';text='You were right some of the time and wrong some of the time, and you wrote down which. That is most of the discipline.';}
  return {title,text,t};
};
N.worldTimeline=function(S){
  return S.eras.map(r=>{
    const e=r.era;const ds=FA.LAYERS.map((l,i)=>({l,v:r.L[i]-FA.ERAS[e].base[i]/9})).sort((a,b)=>Math.abs(b.v)-Math.abs(a.v)).slice(0,3);
    return {year:FA.ERAS[e].year,name:FA.ERAS[e].name,lines:ds.map(d=>`${FA.cap(FA.LEX[d.l][e])} ${d.v>0?'above':'below'} what was expected`)};
  });
};
})();
