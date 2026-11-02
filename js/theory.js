/* FUTURE ARCHITECT v2 — theories: strength, state, analyst stance, predictions. The strength number is never shown. */
(function(){
const FA=window.FA, clamp=FA.clamp;
FA.T={};
FA.T.STATES=['Emerging','Promising','Contested','Dominant','Disproven','Obsolete'];
function evWeight(S,e,thesis){
  if(!thesis||!e.imp.includes(thesis))return 0;
  const spec=1/(1+.22*(e.imp.length-1));
  const trend=e.truth==='trend'?.6:1;
  const neg=e.truth==='neg'?0:1;
  return e.rel*spec*trend*neg;
}
FA.T.supportOf=function(S,th,filter){
  let sup=0,contra=0;const seen={};
  th.links.forEach(l=>{
    const e=S.ev[l.ev];if(!e)return;if(filter&&!filter(e))return;
    if(l.kind==='s'){
      const k=(seen[e.type]=(seen[e.type]||0)+1);
      sup+=evWeight(S,e,th.thesis)*Math.pow(.78,k-1);
    }else{
      // a contradiction claim only bites when the evidence truly cuts against this thesis
      if(e.contra.includes(th.thesis))contra+=e.rel;
      else if(e.imp.length<=2&&!e.imp.includes(th.thesis)&&th.thesis)contra+=e.rel*.5;
    }
  });
  // the world speaks even when you do not string it: disproving evidence on the wall counts
  Object.values(S.ev).forEach(e=>{
    if(e.state==='tray'||e.era!==S.core.eraIdx)return;
    if(!th.links.some(l=>l.ev===e.id&&l.kind==='c')&&e.contra.includes(th.thesis)&&(!filter||filter(e)))contra+=e.rel*.8;
  });
  return {sup,contra};
};
FA.T.affinity=function(a,m){
  const A=FA.ARCH[a.arch];let s=0;
  for(const l in m.dr){const v=m.dr[l];if(A.dom.includes(l))s+=Math.abs(v)*.5;if(A.weak.includes(l)&&Math.abs(v)>=.3)s-=.12;}
  return clamp(s,-.2,.35);
};
FA.T.stance=function(S,th,a){
  const m=FA.MECH[th.thesis];if(!m)return 0;
  const A=FA.ARCH[a.arch];
  const r=FA.T.supportOf(S,th,e=>A.trust.includes(e.type)||FA.rng(S.seed,'aw'+a.id+e.id).chance(.55));
  let st=FA.T.affinity(a,m)+a.opt*(m.buzz?.35:.12)+.9*Math.tanh(.55*(r.sup-1.1*r.contra))-.25;
  if(S.core.hype[m.id]&&A.trust.some(t=>FA.HARD.includes(t)))st-=.05;
  return clamp(st,-1,1);
};
FA.T.eval=function(S,th){
  const core=S.core;const m=FA.MECH[th.thesis];
  const r=FA.T.supportOf(S,th);
  const team=S.team.filter(a=>a.hired);
  const stances=team.map(a=>({id:a.id,st:FA.T.stance(S,th,a)}));
  const cons=stances.length?FA.avg(stances.map(x=>x.st)):0;
  const mean=cons,spread=stances.length>1?Math.sqrt(FA.avg(stances.map(x=>(x.st-mean)*(x.st-mean)))):0;
  let pred=0;
  const hits=th.preds.filter(p=>p.res==='hit').length,miss=th.preds.filter(p=>p.res==='miss').length;
  pred=.25*Math.min(2,hits)-.4*Math.min(2,miss);
  let s=Math.tanh(.55*(r.sup-1.1*r.contra))+pred+.15*cons;
  s=clamp(s,-1,1);
  let state='Emerging';
  const nsup=th.links.filter(l=>l.kind==='s').length;
  const peak=th.peak||0;
  // competing explanations
  let rival=0;
  if(m){
    S.pamph.forEach(p=>{if(p.era===core.eraIdx&&p.mech!==th.thesis&&p.s>.35&&p.live&&th.links.some(l=>S.ev[l.ev]&&S.ev[l.ev].imp.includes(p.mech)))rival=Math.max(rival,p.s);});
    Object.values(S.th).forEach(o=>{if(o.id!==th.id&&o.era===th.era&&o.thesis&&o.thesis!==th.thesis&&!o.dead&&o.links.filter(l=>th.links.some(k=>k.ev===l.ev)).length>=2)rival=Math.max(rival,.45);});
  }
  if(!th.thesis||nsup===0)state='Emerging';
  else if(s>.62&&hits>=1&&r.sup>=1.7&&cons>.1&&spread<.62)state='Dominant';
  else if((spread>.62&&s>.1)||(rival>.35&&s>.1&&s<.6))state='Contested';
  else if(s>.28)state='Promising';
  else state='Emerging';
  const broken=th.preds.some(p=>p.res==='miss');
  if(th.thesis&&broken&&(r.contra>.4||core.A[th.thesis]<.2)&&th.era===core.eraIdx)state='Disproven';
  if(th.thesis&&th.era===core.eraIdx&&core.turn>=2&&r.contra>1.1&&s<0)state='Disproven';
  if(th.era!==core.eraIdx||(th.thesis&&core.A[th.thesis]<.5*peak&&peak>.35))state=th.era!==core.eraIdx?'Obsolete':(state==='Disproven'?'Disproven':'Obsolete');
  return {s,state,sup:r.sup,contra:r.contra,cons,spread,stances,hits,miss,rival,nsup};
};
/* the physical cues for strength: pin colour, wear, stamps */
FA.T.look=function(ev){
  const s=ev.s;
  let pin=s>.7?'#2e8b57':s>.45?'#9bb03a':s>.25?'#d9a526':s>0?'#c86c2e':'#8e2b2b';
  if(ev.state==='Emerging')pin='#b9893a';
  if(ev.state==='Contested')pin='#c8742a';
  if(ev.state==='Dominant')pin='#2e8b57';
  if(ev.state==='Disproven')pin='#7b1f1f';
  if(ev.state==='Obsolete')pin='#777';
  return {pin,wear:ev.state==='Contested'?2:ev.state==='Disproven'||ev.state==='Obsolete'?3:ev.state==='Emerging'?0:1,stamp:ev.state==='Dominant'?'DOMINANT':ev.state==='Disproven'?'DISPROVEN':ev.state==='Obsolete'?'OBSOLETE':''};
};
/* prediction options drawn from the mechanism's real drives (and a decoy) */
FA.T.predOptions=function(S,th){
  const m=FA.MECH[th.thesis];if(!m)return[];
  const e=S.core.eraIdx;const R=FA.rng(S.seed,'pred'+th.id+th.thesis);
  const ds=Object.entries(m.dr).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));
  const opts=[];
  ds.slice(0,3).forEach(([l,v])=>opts.push({layer:l,dir:v>0?1:-1}));
  const none=FA.LAYERS.filter(l=>!m.dr[l]);
  const dec=R.pick(none);
  const net=FA.MECHS[e].reduce((a,x)=>a+(x.dr[dec]||0),0);
  opts.push({layer:dec,dir:net>0.05?-1:net<-0.05?1:(R.chance(.5)?1:-1)});
  return R.shuffle(opts).map(o=>Object.assign(o,{text:`${FA.cap(FA.LEX[o.layer][e])} ${o.dir>0?'will be measurably higher':'will be measurably lower'} within two turns`}));
};
FA.T.resolvePred=function(S,p){
  const d=FA.sim.lv(S.core,p.layer)-p.l0;
  return Math.abs(d)<.012?'void':(d*p.dir>0?'hit':'miss');
};
FA.T.line=function(S,a,th,ev,R){
  const m=FA.MECH[th.thesis];const v=FA.VOICE[a.arch];
  const st=FA.T.stance(S,th,a);
  const k=st>.25?'for':st>-.15?'doubt':'against';
  const o={thing:m.thing,Thing:FA.cap(m.thing),impl:m.impl,Impl:FA.cap(m.impl)};
  return {who:a.id,stance:k,st,text:FA.fill(R.pick(v[k]),o)};
};
FA.T.roundtable=function(S,th){
  const R=FA.rng(S.seed,'rt'+th.id+S.gturn);
  const team=S.team.filter(a=>a.hired);if(!th.thesis||team.length<2)return[];
  const ls=team.map(a=>FA.T.line(S,a,th,null,R)).sort((a,b)=>b.st-a.st);
  const out=[ls[0],ls[ls.length-1]];
  if(ls.length>2&&Math.abs(ls[0].st-ls[ls.length-1].st)>.25){const mid=ls[1];out.splice(1,0,mid);}
  return out;
};
/* margin note: how an analyst reads a single piece of evidence — coloured by trust and bias */
FA.T.margin=function(S,a,ev){
  const A=FA.ARCH[a.arch];const trusted=A.trust.includes(ev.type);const R=FA.rng(S.seed,'mn'+a.id+ev.id);
  const hard=FA.ETYPES[ev.type].hard;
  const first=a.name.split(' ').pop();
  if(ev.truth==='neg'&&trusted)return R.pick(['This one cuts the other way.','Read it twice. Someone will not like it.']);
  if(trusted&&ev.rel>.65)return R.pick(['Solid.','This is the kind I rely on.','Good paper, this.']);
  if(trusted)return R.pick(['Plausible, but I want a second.','Suggestive.']);
  if(!hard&&ev.rel<.5)return R.pick(['Hearsay. I would not stake anything on it.','Someone is selling something here.','Soft. Who gains?']);
  if(a.opt>.3&&!hard)return R.pick(['I like this. It fits where things are going.','This feels right.']);
  if(a.opt<-.2)return R.pick(['Another promise.','I have seen this before.']);
  return R.pick(['Not my kind of evidence.','File it and keep an eye.']);
};
})();
