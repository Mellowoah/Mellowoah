/* FUTURE ARCHITECT v2 — game state, actions, turn loop. Everything the player does goes through FA.G.do() so it can be replayed. */
(function(){
const FA=window.FA, clamp=FA.clamp;
const G=FA.G={};
const SAVE_KEY='fa2_save_v1';
G.S=null;
FA.IV={
 interview:{n:'Interview an engineer',w:1,c:1,i:0,d:1,out:['interview'],blurb:'A man who works with it, talking.',kind:'soft'},
 factory:{n:'Visit the factory',w:3,c:2,i:0,d:1,out:['photo','econ'],blurb:'See the floor. Count the crates.',kind:'hard',n2:2},
 patent:{n:'Analyze the patent',w:2,c:1,i:0,d:1,out:['patent','schematic'],blurb:'What was actually claimed, and what was shown?',kind:'soft'},
 shipments:{n:'Review shipment records',w:2,c:2,i:0,d:1,out:['shipping'],blurb:'What actually moved, and where.',kind:'hard'},
 prototype:{n:'Observe the prototype',w:2,c:3,i:0,d:1,out:['footage','photo'],blurb:'Watch it run. Or not.',kind:'hard'},
 archives:{n:'Access the archives',w:3,c:1,i:0,d:1,out:['gov','econ'],blurb:'Filed returns, old precedents.',kind:'trend'},
 journalist:{n:'Hire a journalist',w:1,c:2,i:0,d:1,out:['clipping','interview'],blurb:'Quick. Wide. Sometimes wrong.',kind:'soft'},
 bribe:{n:'Bribe a source',w:1,c:2,i:2,d:1,out:['intel'],blurb:'Costs favours. The truth varies with the price.',kind:'var'},
 research:{n:'Fund university research',w:1,c:5,i:0,d:2,out:['paper'],blurb:'Slow, careful, trusted — in two seasons.',kind:'soft'},
 field:{n:'Commission a field report',w:3,c:3,i:0,d:1,out:['econ','photo'],blurb:'A region, surveyed in person.',kind:'trend',n2:2}
};
FA.ACTIONS={
 fund:{n:'Fund',to:'the foundries and the backers',c:6,i:0,blurb:'Money in. Capacity follows.'},
 publish:{n:'Publish',to:'the newspapers and the journals',c:1,i:1,blurb:'Put your name to it in print.'},
 lobby:{n:'Lobby',to:'the ministry and the committees',c:0,i:3,blurb:'Change the rules around it.'},
 build:{n:'Build',to:'the works and the contractors',c:8,i:0,blurb:'Raise a prototype. See if it runs.'},
 short:{n:'Short',to:'the brokers and the exchange',c:4,i:0,blurb:'Bet it fails. Win only if it does.'},
 warn:{n:'Warn',to:'the press office and the regulators',c:0,i:2,blurb:'Raise the alarm. Slow it down.'}
};
G.WEEKS=10;
function log(S,text,kind){S.chron.push({y:S.year,t:S.gturn,text,kind:kind||'world'});}
G.log=log;
G.mech=id=>FA.MECH[id];
G.fresh=function(seed,opts){
  opts=opts||{};
  const S={v:2,seed,mode:opts.mode||'full',uidn:0,gturn:0,year:1890,core:null,ev:{},th:{},team:[],rivals:[],pamph:[],twine:[],
   cap:24,inf:6,weeks:G.WEEKS,pending:[],sched:[],push:{},dl:{},hist:[],snap:null,chron:[],eras:[],lineage:[],relics:[],acted:{},hot:{},
   phase:'play',alog:[],name:opts.name||'Marlow',heir:{first:'Eleanor',trait:'Idealist',era:0},mentor:FA.MENTOR[0],seenMentor:false,flags:{},reveal:null,lastCons:[],reels:[]};
  S.core=FA.sim.create(seed);
  G.setupEra(S,true);
  return S;
};
const HEIRS=['Eleanor','Theodore','Margot','Julian','Harriet','Raymond','Vivian','Desmond','Imogen','Calvin','Nadia','Felix','Odette','Silas','Wren','Anselm','Tamsin','Leopold'];
const TRAITS=['Idealist','Mercenary','Loyalist','Maverick','Perfectionist'];
const BONUS={Idealist:{inf:2},Mercenary:{cap:4},Loyalist:{inf:1,cap:2},Maverick:{weeks:2},Perfectionist:{inf:1,weeks:1}};
FA.TRAIT_TXT={Idealist:'+2 Influence',Mercenary:'+4 Capital',Loyalist:'+1 Influence, +2 Capital',Maverick:'+2 weeks each season',Perfectionist:'+1 Influence, +1 week each season'};
G.setupEra=function(S,first){
  const e=S.core.eraIdx;const R=FA.rng(S.seed,'team'+e);
  // analysts
  S.team=FA.ANALYSTS[e].map(a=>Object.assign({},a,{hired:false,trust:.5,busy:false}));
  const idx=R.shuffle([0,1,2,3]);
  // guarantee the first two hires cover different disciplines
  let h=[idx[0]];for(const i of idx.slice(1)){if(FA.ANALYSTS[e][i].arch!==FA.ANALYSTS[e][h[0]].arch){h.push(i);break;}}
  h.slice(0,2).forEach(i=>{S.team[i].hired=true;});
  S.team.forEach(a=>{a.cost=a.hired?0:8+R.int(0,4);a.nameSeed=a.name;});
  // rivals
  const prev=S.rivals.slice();
  const taken=[];
  S.rivals=FA.ARCHS.map((arch,k)=>{
    const rr=FA.ROSTER[e][arch];const RR=FA.rng(S.seed,'riv'+e+arch);
    const m=FA.rivalWorldview(S.core,arch,RR,taken);taken.push(m.id);
    const p=prev.find(x=>x.arch===arch);
    const rv={id:'r'+e+k,arch,name:rr.name,title:rr.title,img:rr.img,mech:m.id,rel:p?clamp(p.rel*-.5,-.6,.6)*(p.rel<0?1:-1)*-1:0,heirOf:p?p.name:null,met:false};
    if(p)rv.rel=p.rel<-.3?-.35:p.rel>.3?.2:0;
    return rv;
  });
  S.snap=FA.sim.clone(S.core);S.hist=[];S.push={};S.dl={};S.sched=S.sched.filter(x=>x.era===e);
  S.weeks=G.WEEKS+(BONUS[S.heir.trait].weeks||0);
  if(first){S.cap+=0;}
  // first arrivals
  S.lastCons=[];
  G.arrive(S,true);
  G.rivalMoves(S);
  log(S,`${FA.ERAS[e].year}: ${FA.ERAS[e].room} opens its doors.`,'era');
};
G.arrive=function(S){
  const items=FA.genTurnEvidence(S).concat(FA.genTurnEvidence(S,true));
  const pend=S.pending.filter(p=>p.due<=S.gturn);
  items.forEach(ev=>{ev.state='tray';});
  S.arrivals=items.map(e=>e.id);
  return items;
};
G.rivalMoves=function(S){
  const R=FA.rng(S.seed,'riv'+S.gturn);const e=S.core.eraIdx;
  S.pamph.forEach(p=>{if(S.gturn-p.t>=3)p.live=false;});
  S.rivals.forEach((r,i)=>{
    if((S.gturn+i)%2!==0)return;
    const m=FA.MECH[r.mech];const L=FA.RIVAL_LINES[r.arch];
    const s=clamp(.3+.35*(S.core.carry[m.id]||0)+m.buzz*.12+R.n()*.1+(r.arch==='Opportunist'?.05:0),0,.95);
    S.pamph.push({id:FA.uid(S,'p'),rival:r.id,mech:m.id,era:e,t:S.gturn,text:R.pick(L.pamph)+' '+FA.cap(m.impl)+'.',s,live:true});
  });
  S.pamph=S.pamph.filter(p=>S.gturn-p.t<8);
};
/* ---------- the wall ---------- */
const COLS=8;
G.slotFor=function(S){
  const used=new Set();Object.values(S.ev).forEach(e=>{if(e.state==='wall'&&e.pos)used.add(Math.round((e.pos.x-30)/150)+','+Math.round((e.pos.y-130)/112));});
  for(let r=0;r<12;r++)for(let c=0;c<COLS;c++){if(!used.has(c+','+r))return{x:30+c*150,y:130+r*112};}
  return{x:30,y:130};
};
G.pin=function(S,id,pos){
  const e=S.ev[id];if(!e||e.state==='wall')return false;
  e.state='wall';e.pos=pos||G.slotFor(S);e.seen=true;return true;
};
G.pinAll=function(S){let n=0;Object.values(S.ev).forEach(e=>{if(e.state==='tray'&&e.era===S.core.eraIdx){G.pin(S,e.id);n++;}});return n;};
G.move=function(S,kind,id,pos){const o=kind==='th'?S.th[id]:S.ev[id];if(o)o.pos=pos;};
G.archiveEv=function(S,id){const e=S.ev[id];if(!e)return;e.state='archive';S.twine=S.twine.filter(t=>t.a!==id&&t.b!==id);Object.values(S.th).forEach(t=>{t.links=t.links.filter(l=>l.ev!==id||false);});};
G.newTheory=function(S,name,pos){
  const id=FA.uid(S,'t');
  const n=Object.values(S.th).filter(t=>t.era===S.core.eraIdx).length;
  S.th[id]={id,name:(name||'Untitled').slice(0,48),thesis:null,links:[],preds:[],era:S.core.eraIdx,born:S.gturn,peak:0,pos:pos||{x:24+(n%5)*232,y:14},dead:false,acts:[],s:0,state:'Emerging',notes:[]};
  log(S,`You pin a blank card and write: "${S.th[id].name}".`,'theory');
  return id;
};
G.renameTheory=function(S,id,name){S.th[id].name=name.slice(0,48);};
G.link=function(S,evId,thId,kind){
  const th=S.th[thId];if(!th||!S.ev[evId])return false;
  th.links=th.links.filter(l=>l.ev!==evId);th.links.push({ev:evId,kind});
  S.ev[evId].hot=S.gturn;
  return true;
};
G.unlink=function(S,evId,thId){const th=S.th[thId];th.links=th.links.filter(l=>l.ev!==evId);};
G.twineEv=function(S,a,b){if(a===b)return;if(!S.twine.some(t=>(t.a===a&&t.b===b)||(t.a===b&&t.b===a)))S.twine.push({a,b});};
G.untwine=function(S,a,b){S.twine=S.twine.filter(t=>!((t.a===a&&t.b===b)||(t.a===b&&t.b===a)));};
/* thesis candidates = the explanations implied by the linked evidence (union), ranked */
G.thesisOptions=function(S,thId){
  const th=S.th[thId];const cnt={};
  th.links.filter(l=>l.kind==='s').forEach(l=>{const e=S.ev[l.ev];if(e)e.imp.forEach(m=>cnt[m]=(cnt[m]||0)+1);});
  return Object.keys(cnt).sort((a,b)=>cnt[b]-cnt[a]||(a<b?-1:1)).map(m=>({mech:m,n:cnt[m]}));
};
G.setThesis=function(S,thId,mech){
  const th=S.th[thId];th.thesis=mech;th.preds=th.preds.filter(p=>p.res);
  log(S,`"${th.name}" is now taken to mean: ${FA.MECH[mech].impl}.`,'theory');
};
G.setPrediction=function(S,thId,idx){
  const th=S.th[thId];const opts=FA.T.predOptions(S,th);const o=opts[idx];if(!o||th.preds.some(p=>!p.res))return false;
  th.preds.push({layer:o.layer,dir:o.dir,text:o.text,t0:S.gturn,due:S.gturn+2,l0:FA.sim.lv(S.core,o.layer),res:null});
  log(S,`You stake your name: ${o.text.toLowerCase()}.`,'theory');
  return true;
};
/* ---------- investigations ---------- */
G.canInvest=function(S,kind,analystId){
  const k=FA.IV[kind];const a=S.team.find(x=>x.id===analystId);
  if(!k||!a||!a.hired||a.busy)return 'No analyst free';
  if(S.weeks<k.w)return 'Not enough weeks left this season';
  if(S.cap<k.c)return 'Not enough capital';
  if(S.inf<k.i)return 'Not enough favours';
  return null;
};
G.investigate=function(S,kind,lead,analystId){
  const err=G.canInvest(S,kind,analystId);if(err)return err;
  const k=FA.IV[kind];const a=S.team.find(x=>x.id===analystId);
  S.weeks-=k.w;S.cap-=k.c;S.inf-=k.i;a.busy=true;
  S.pending.push({id:FA.uid(S,'i'),kind,lead,analyst:analystId,due:S.gturn+k.d,t:S.gturn,era:S.core.eraIdx});
  const le=S.ev[lead];log(S,`${a.name} is sent: ${k.n.toLowerCase()}${le?' — following "'+le.title+'"':lead?' — '+((FA.REGIONS.find(r=>r.id===lead)||{}).name||''):''}.`,'inv');
  return null;
};
function narrow(S,R,ev,m){ev.imp=R.chance(.25)?[m.id].concat(FA.confusers(m,R).slice(0,1).map(x=>x.id)):[m.id];ev.imp=R.shuffle(ev.imp);}
G.resolveInvestigation=function(S,inv){
  const R=FA.rng(S.seed,'inv'+inv.id);const e=S.core.eraIdx;const k=FA.IV[inv.kind];
  const a=S.team.find(x=>x.id===inv.analyst);const le=S.ev[inv.lead];
  let m=null;
  if(le&&le.src&&FA.MECH[le.src])m=FA.MECH[le.src];
  else{
    const pool=le&&le.imp?le.imp.map(x=>FA.MECH[x]):(inv.lead?FA.MECHS[e].filter(x=>S.core.home[x.id].includes(inv.lead)):FA.MECHS[e]);
    const ps=(pool.length?pool:FA.MECHS[e]).map(x=>[x,S.core.A[x.id]+R.n()*.1]).sort((x,y)=>y[1]-x[1]);
    m=ps[0][0];
  }
  const A=S.core.A[m.id],hyp=S.core.hype[m.id]&&A<.28;
  const n=k.n2||1;const out=[];
  const arch=FA.ARCH[a.arch];
  for(let i=0;i<n;i++){
    const types=FA.evTypesFor(e,k.out);const type=R.pick(types.length?types:[k.out[0]]);
    let ev;
    if(k.kind==='hard'||((k.kind==='trend')&&R.chance(.7))){
      ev=FA.genHard(S,R,m,{type,neg:hyp&&R.chance(.85)});
    }else if(inv.kind==='bribe'){
      const truthful=R.chance(.72);const neg=hyp?truthful:!truthful;
      if(neg){ev=FA.genHard(S,R,m,{type:'market',neg:true});ev.type='intel';ev.title='Report from a source inside '+m.thing.replace(/^the /,'');ev.body='Source states that '+R.pick(['the board knows the numbers are thin','the demonstration was arranged for the press','nothing has shipped in the last two quarters'])+'. Handler\'s note: reliability uncertain.';ev.rel=.5*(.7+R.n()*.5);}
      else{ev=FA.genSoft(S,R,m,{type:'intel',real:true});ev.truth='real';ev.rel=.5*(.8+R.n()*.5);ev.contra=[];}
    }else if(hyp&&R.chance(.6)){
      ev=FA.genSoft(S,R,m,{type,real:false});
      ev.truth='neg';ev.contra=[m.id];ev.title=ev.title.replace(/^(.*)$/,'Candid account: $1');ev.body=ev.body+' Asked privately, the informant added that the claim is "well ahead of the hardware".';ev.rel=FA.ETYPES[type].base*.9;
    }else ev=FA.genSoft(S,R,m,{type,real:true});
    narrow(S,R,ev,m);
    if(k.kind==='trend'&&inv.lead&&!le){ev.place=inv.lead;}
    // analyst skill and bias colour the report
    const fit=arch.trust.includes(ev.type);ev.rel=clamp(ev.rel*(fit?1.08:.94),.05,.98);
    ev.by=a.id;ev.tilt=a.opt*(ev.truth==='real'?.5:1);
    ev.stamp=Math.max(0,Math.min(3,ev.stamp-(a.opt>.35&&ev.truth!=='real'&&R.chance(.6)?1:0)));
    ev.state='tray';ev.fromInv=inv.id;out.push(ev.id);
  }
  a.busy=false;
  S.arrivals=(S.arrivals||[]).concat(out);
  log(S,`${a.name} returns with ${out.length===1?'a report':'reports'} on ${m.thing}.`,'inv');
  return out;
};
/* ---------- acting on a theory ---------- */
G.canAct=function(S,kind,thId){
  const th=S.th[thId];const k=FA.ACTIONS[kind];
  if(!th||!th.thesis)return 'Name what you believe first — choose a thesis.';
  if(th.era!==S.core.eraIdx)return 'That age is over.';
  if(S.cap<k.c)return 'Not enough capital';if(S.inf<k.i)return 'Not enough favours';
  if((th.acts||[]).includes(kind+S.gturn))return 'Already done this season';
  return null;
};
G.act=function(S,kind,thId){
  const err=G.canAct(S,kind,thId);if(err)return err;
  const th=S.th[thId];const m=FA.MECH[th.thesis];const k=FA.ACTIONS[kind];
  S.cap-=k.c;S.inf-=k.i;th.acts.push(kind+S.gturn);
  const add=(id,v)=>S.push[id]=(S.push[id]||0)+v;const dl=(l,v)=>S.dl[l]=(S.dl[l]||0)+v;
  S.acted[m.id]=(S.acted[m.id]||[]).concat([{kind,t:S.gturn,th:th.id}]);
  switch(kind){
    case 'fund':add(m.id,.25);dl('CP',-.01);S.sched.push({era:S.core.eraIdx,due:S.gturn+2,kind:'fundret',mech:m.id,th:th.id});break;
    case 'publish':add(m.id,.10);dl('MD',.03);S.hot[m.id]=(S.hot[m.id]||0)+1;S.sched.push({era:S.core.eraIdx,due:S.gturn+1,kind:'pubrep',mech:m.id,th:th.id});break;
    case 'lobby':add(m.id,.12);dl('GV',.03);dl('PO',-.008);break;
    case 'build':add(m.id,.30);dl('MF',.02);dl('IN',.015);dl('EV',-.02);dl('CP',-.01);S.sched.push({era:S.core.eraIdx,due:S.gturn+1,kind:'proto',mech:m.id,th:th.id});break;
    case 'short':add(m.id,-.12);S.sched.push({era:S.core.eraIdx,due:S.gturn+2,kind:'short',mech:m.id,th:th.id,stake:k.c});break;
    case 'warn':add(m.id,-.20);dl('MD',.02);for(const l in m.dr){if(m.dr[l]<0)dl(l,-m.dr[l]*.05);}break;
  }
  log(S,`${k.n}: "${th.name}" — ${m.name.toLowerCase()}.`,'act');
  return null;
};
G.hire=function(S,id){const a=S.team.find(x=>x.id===id);if(!a||a.hired||S.cap<a.cost)return 'Cannot hire';S.cap-=a.cost;a.hired=true;a.trust=.55;log(S,`${a.name} joins the office.`,'team');return null;};
G.parley=function(S,rid,mode){
  const r=S.rivals.find(x=>x.id===rid);if(!r)return 'No such rival';
  if(mode==='parley'){if(S.inf<1)return 'Not enough favours';S.inf-=1;r.rel=clamp(r.rel+.15,-1,1);r.met=true;
    const R=FA.rng(S.seed,'parley'+rid+S.gturn);const m=FA.MECH[r.mech];
    const ev=FA.genSoft(S,R,m,{type:'interview',real:!S.core.hype[m.id]});ev.title='Rival\'s account: '+r.name;ev.body='"'+FA.RIVAL_LINES[r.arch].pamph[0]+'" '+r.name+' would say only that '+m.sym[0]+'.';ev.state='tray';ev.by=null;S.arrivals=(S.arrivals||[]).concat([ev.id]);
    log(S,`You take tea with ${r.name}.`,'rival');}
  else if(mode==='ally'){if(r.rel<.15||S.inf<2)return r.rel<.15?'They do not trust you yet — parley first.':'Not enough favours';S.inf-=2;r.rel=clamp(r.rel+.3,-1,1);r.ally=S.gturn;log(S,`${r.name} agrees to back your thinking for a season.`,'rival');}
  else if(mode==='betray'){r.rel=clamp(r.rel-.5,-1,1);r.ally=null;S.inf+=1;log(S,`You leak ${r.name}'s numbers to the press. They will remember.`,'rival');}
  return null;
};
/* ---------- the turn ---------- */
G.rivalPush=function(S){
  const out={};const mine=Object.values(S.th).filter(t=>t.era===S.core.eraIdx&&t.thesis&&!t.dead).sort((a,b)=>b.s-a.s)[0];
  S.rivals.forEach(r=>{
    let tgt=r.mech;const base=r.arch==='Industrialist'?.14:r.arch==='Visionary'?.12:r.arch==='Opportunist'?.09:.07;
    if(r.ally&&S.gturn-r.ally<=2&&mine)tgt=mine.thesis;
    out[tgt]=(out[tgt]||0)+base;
    if(r.rel<-.45){const f=Object.keys(S.acted).filter(x=>(S.acted[x]||[]).some(a=>S.gturn-a.t<=2&&(a.kind==='fund'||a.kind==='build')));if(f.length)out[f[0]]=(out[f[0]]||0)-.08;}
  });
  return out;
};
G.recalc=function(S){
  Object.values(S.th).forEach(th=>{const v=FA.T.eval(S,th);th.s=v.s;th.state=v.state;th.eval=v;th.peak=Math.max(th.peak||0,S.core.A[th.thesis]||0);if(v.state==='Disproven'||v.state==='Obsolete')th.dead=true;});
};
G.endTurn=function(S){
  if(S.phase!=='play')return 'busy';
  const rp=G.rivalPush(S);
  const inp={push:S.push,rpush:rp,dl:S.dl};
  S.hist.push(JSON.parse(JSON.stringify(inp)));
  const before=S.core.L.slice();
  const Abefore=Object.assign({},S.core.A);
  FA.sim.step(S.core,inp);
  S.gturn=S.core.gturn;S.year+=FA.YEARS_PER_TURN;
  // consequences: second-order effects named in plain language
  S.lastCons=G.consequences(S,before,Abefore);
  S.lastCons.forEach(c=>log(S,c.text,'cons'));
  // scheduled outcomes
  const due=S.sched.filter(x=>x.due<=S.gturn&&x.era===S.core.eraIdx);S.sched=S.sched.filter(x=>!(x.due<=S.gturn));
  S.income=[];
  due.forEach(x=>{const A=S.core.A[x.mech],m=FA.MECH[x.mech];
    if(x.kind==='fundret'){const g=A>.35?Math.round(4+10*A):0;S.cap+=g;S.income.push(g?`The backers return ${g} on ${m.name.toLowerCase()}.`:`Nothing comes back from ${m.name.toLowerCase()}.`);}
    if(x.kind==='short'){const win=A<.25;if(win){S.cap+=Math.round(x.stake*2.6);S.income.push(`The short on ${m.name.toLowerCase()} pays.`);}else S.income.push(`The short on ${m.name.toLowerCase()} is lost.`);}
    if(x.kind==='pubrep'){const th=S.th[x.th];if(th&&th.state==='Dominant'){S.inf+=1;S.income.push('Your published case is quoted back to you with respect.');}else if(th&&(th.state==='Disproven')){S.inf=Math.max(0,S.inf-2);S.income.push('Your published case is quoted back to you with irony.');}}
    if(x.kind==='proto'){const R=FA.rng(S.seed,'proto'+x.th+S.gturn);const real=A>.2;const ev=FA.genHard(S,R,m,{type:R.pick(FA.evTypesFor(S.core.eraIdx,['photo','footage','shipping'])),neg:!real});ev.title='Prototype: '+ev.title;ev.state='tray';S.arrivals=(S.arrivals||[]).concat([ev.id]);S.income.push(real?`The prototype of ${m.thing} runs.`:`The prototype of ${m.thing} sits idle.`);}
  });
  // predictions
  Object.values(S.th).forEach(th=>{th.preds.forEach(p=>{if(!p.res&&S.gturn>=p.due){p.res=FA.T.resolvePred(S,p);
    const lbl=FA.cap(FA.LEX[p.layer][S.core.eraIdx]);
    log(S,p.res==='hit'?`Your forecast holds: ${lbl.toLowerCase()} moved as you said.`:p.res==='miss'?`Your forecast fails: ${lbl.toLowerCase()} went the other way.`:`Your forecast is inconclusive: ${lbl.toLowerCase()} barely moved.`,'pred');
    if(p.res==='hit'){S.inf+=1;}else if(p.res==='miss'){S.inf=Math.max(0,S.inf-1);}
    S.team.filter(a=>a.hired).forEach(a=>{const st=FA.T.stance(S,th,a);if(p.res==='hit'){a.trust=clamp(a.trust+(st>.25?.08:st<-.15?-.05:0),0,1);}else if(p.res==='miss'){a.trust=clamp(a.trust+(st>.25?-.07:st<-.15?.06:0),0,1);}});
  }});});
  // investigations arriving
  const arr=S.pending.filter(p=>p.due<=S.gturn);S.pending=S.pending.filter(p=>p.due>S.gturn);
  S.arrivals=S.arrivals||[];
  // new season
  S.weeks=G.WEEKS+(BONUS[S.heir.trait].weeks||0);
  S.cap+=5;S.inf+=1;
  S.push={};S.dl={};
  S.team.forEach(a=>{if(a.hired&&a.trust<.18&&FA.rng(S.seed,'def'+a.id+S.gturn).chance(.4)){a.hired=false;a.cost=14;a.trust=.4;log(S,`${a.name} leaves for a rival.`,'team');}});
  if(S.core.turn>=FA.TURNS_PER_ERA){
    const newEv=FA.genTurnEvidence(S);newEv.forEach(e=>e.state='tray');S.arrivals=newEv.map(e=>e.id).concat(S.arrivals);
    arr.forEach(i=>G.resolveInvestigation(S,i));
    FA.N.eraEnd(S);
    G.recalc(S);return null;
  }
  const items=FA.genTurnEvidence(S);items.forEach(e=>e.state='tray');
  S.arrivals=items.map(e=>e.id).concat(S.arrivals.filter(id=>S.ev[id]&&S.ev[id].state==='tray'));
  arr.forEach(i=>G.resolveInvestigation(S,i));
  G.rivalMoves(S);
  G.recalc(S);
  // wall hygiene: old unlinked evidence goes to the archive
  const wall=Object.values(S.ev).filter(e=>e.state==='wall');
  if(wall.length>36){wall.filter(e=>!Object.values(S.th).some(t=>t.links.some(l=>l.ev===e.id))).sort((a,b)=>a.turn-b.turn).slice(0,wall.length-36).forEach(e=>G.archiveEv(S,e.id));}
  return null;
};
/* plain-language second-order effects; attributes to the player's actions only when plausible */
G.consequences=function(S,before,Ab){
  const e=S.core.eraIdx;const out=[];
  const moves=FA.LAYERS.map((l,i)=>[l,S.core.L[i]-before[i]]).filter(x=>Math.abs(x[1])>.028).sort((a,b)=>Math.abs(b[1])-Math.abs(a[1])).slice(0,3);
  const acted=Object.keys(S.push).filter(m=>Math.abs(S.push[m])>0.05);
  moves.forEach(([l,d])=>{
    const lead=acted.find(m=>FA.MECH[m].dr[l]);
    const lex=FA.LEX[l][e];
    if(lead){
      const intended=(FA.MECH[lead].dr[l]>0)===(d>0);
      out.push({layer:l,d,mech:lead,text:`After your push on ${FA.MECH[lead].name.toLowerCase()}, ${lex} ${d>0?'rose':'fell'}${intended?'.':' — which nobody in the office had meant to happen.'}`});
    }else out.push({layer:l,d,text:`${FA.cap(lex)} ${d>0?'rose':'fell'} on its own account.`});
  });
  return out;
};
/* ---------- persistence ---------- */
G.save=function(S){try{localStorage.setItem(SAVE_KEY,JSON.stringify(S));return true;}catch(e){return false;}};
G.load=function(){try{const s=localStorage.getItem(SAVE_KEY);return s?JSON.parse(s):null;}catch(e){return null;}};
G.hasSave=()=>{try{return !!localStorage.getItem(SAVE_KEY);}catch(e){return false;}};
G.wipe=function(){try{localStorage.removeItem(SAVE_KEY);}catch(e){}};
/* every mutation goes through do() so a run is exactly (seed + action log) */
G.apply=function(S,name,args){
  const r=G[name].apply(G,[S].concat(args));
  if(['pin','pinAll','newTheory','link','unlink','setThesis','setPrediction','investigate','act','hire','parley','endTurn','nextEra'].includes(name))G.recalc(S);
  return r;
};
G.do=function(name){
  const args=Array.prototype.slice.call(arguments,1);const S=G.S;
  const r=G.apply(S,name,args);
  if(!(typeof r==='string'&&name!=='newTheory'))S.alog.push([name].concat(args));
  if(['pin','pinAll','newTheory','link','setThesis','setPrediction','investigate','act','hire','parley','endTurn','nextEra'].includes(name))G.save(S);
  return r;
};
G.nextEra=function(S){return FA.N.nextEra(S);};
G.start=function(seed,opts){G.S=G.fresh(seed,opts);G.recalc(G.S);return G.S;};
G.replay=function(seed,opts,alog){G.S=G.fresh(seed,opts);alog.forEach(a=>{G.apply(G.S,a[0],a.slice(1));});G.recalc(G.S);return G.S;};
})();
