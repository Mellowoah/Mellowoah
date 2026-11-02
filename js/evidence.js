/* FUTURE ARCHITECT v2 — evidence generation. Evidence is what the sim leaves behind in the world. */
(function(){
const FA=window.FA, clamp=FA.clamp;
const SUR=[['Hartley','Pryce','Ashdown','Mercer','Wickham','Lowell','Garrity','Thorne','Fenwick','Okonkwo','Brennan','Kessler','Voss','Delgado','Marek','Ito','Sandoval','Whelan','Abara','Lindgren'],
 ['Carver','Dunmore','Rosen','Haddad','Petrov','Ellison','Moreau','Tanaka','Quigley','Baptiste','Novak','Strand','Ramos','Keane','Oyelaran','Falk','Maddox','Chandra','Voigt','Greer'],
 ['Whitaker','Lindqvist','Castellano','Iwata','Rourke','Abernathy','Sokolov','Bellamy','Nwosu','Hargrove','Teller','Moss','Aguilar','Kowal','Draper','Ng','Fairley','Ostrowski','Laurent','Dalton'],
 ['Sinclair','Yamamoto','Reyes','Bauer','Okoro','Hallett','Prasad','Ferrante','Lowry','Nakamura','Quinn','Wozniak','Delmar','Hurst','Andrade','Choi','Ferris','Mbeki','Stroud','Valdez'],
 ['Park','Mehra','Lindgren','Okafor-Reid','Castro','Hines','Zhao','Brandt','Adeyemi','Keller','Navarro','Sato','Wilder','Osei','Petrenko','Dunn','Ahmadi','Rao','Holm','Cruz'],
 ['Varga','Osei-Bonsu','Lund','Tamura','Ibarra','Soleil','Achterberg','Quill','Nakagawa','Roy','Salazar','Hendry','Mbatha','Orlov','Teague','Faro','Kim','Adler','Sorensen','Idowu']];
const FIRST=['A.','B.','C.','D.','E.','F.','G.','H.','J.','K.','L.','M.','N.','P.','R.','S.','T.','V.','W.'];
const PAPERS=[['The Daily Courier','The Evening Standard','The Mercantile Gazette'],['The Morning Post','The Sunday Record','The Trade Herald'],['The Ledger','The Globe-Dispatch','The Business Review'],['The Financial Courier','The Metro Tribune','The Weekly Observer'],['The Wire','The Daily Signal','TechPress'],['The Orbital Dispatch','The Meridian','The Systems Review']];
const ORGS=[['the Board of Trade','the Admiralty','the Exchange'],['the Commerce Dept.','the Statistics Bureau','the Port Authority'],['the Ministry of Supply','the Census Bureau','the Defence Board'],['the Trade Commission','the Federal Statistics Office','the Ports Council'],['the Regulatory Authority','the Exchange Commission','the Energy Agency'],['the Orbital Compact','the Planetary Statistics Office','the Grid Authority']];
function who(R,e){return R.pick(FIRST)+' '+R.pick(SUR[e]);}
FA.who=who;
const ROLE={clipping:null,patent:['inventor','patent agent','assignee'],photo:['photographer','survey officer','correspondent'],interview:['foreman','chief engineer','plant clerk','former employee','union delegate','distributor'],intel:['station officer','desk analyst','attaché'],blueprint:['draughtsman','design office'],paper:['reader in applied science','research fellow','laboratory director'],shipping:['harbour agent','freight clerk','customs officer'],econ:null,schematic:['systems engineer','design lead'],gov:null,footage:['newsreel crew','field camera unit'],satellite:['orbital survey'],market:['broker','exchange clerk']};
/* hard outcome phrases by activation */
function outPhrase(a,thing,R,neg){
  if(neg)return R.pick([`${thing}: consignments flat; ${R.int(3,11)} orders quietly cancelled`,`${thing}: volumes at a standstill, ${R.int(20,60)} per cent of the stock unsold`,`${thing}: no deliveries recorded in the period; the order book is empty`]);
  if(a>.55)return R.pick([`${thing}: consignments up ${R.int(40,120)} per cent on the last period`,`${thing}: volumes more than doubled; yards are working three shifts`]);
  if(a>.3)return `${thing}: consignments up ${R.int(12,35)} per cent; new orders entered for next period`;
  return `${thing}: first regular consignments logged, ${R.int(4,9)} per cent of the older trade`;
}
/* card text templates per soft type: [title, body] with {thing} {sym} {place} {who} {role} {org} {paper} */
const SOFT={
 clipping:[['Talk of {place}: {thing}','{Sym}. {who} told our correspondent: "This is only the beginning."'],['What {thing} mean for {place}','Our correspondent reports that {sym}. A rival interest called the whole business "an excitement".']],
 patent:[['Patent: improvements in {thing}','Filed by {who} of {place}. The specification claims that {sym}, and sets out claims reaching well beyond what is shown.'],['Patent: a method for {thing}','Assignee {who}. The drawings are thorough; the examples are thinner than the claims.']],
 interview:[['Interview with {who}, {role}','"{Sym}," says {who}. "Whether it lasts is another matter. Ask me in a year."'],['{who}, {role}, on {thing}','"I have seen it with my own eyes: {sym}. But I cannot tell you how long the money will hold."']],
 intel:[['Report: {thing} in {place}','Source {who} ({role}) states that {sym}. Reliability of source not established; corroboration requested.'],['Intercept summary: {place}','An officer in {place} reports that {sym}. Treat as unconfirmed.']],
 blueprint:[['Blueprint: {thing}','Drawing by {who}. The layout assumes {sym}; load figures are marked "provisional".'],['General arrangement: {thing}','Prepared by {who}. Notes in the margin: {sym}.']],
 paper:[['On {thing}: a preliminary note','By {who}, {role}. The author reports that {sym}. Replication is invited.'],['Observations on {thing}','{who} presents measurements suggesting that {sym}; the sample is small.']],
 schematic:[['Schematic: {thing}','Engineer {who}. The design indicates that {sym}; a reviewer pencilled "feasible but untested".']]
};
const HARD={
 shipping:['Shipping log: {place}','Agent {who} ({role}) records — {out}.'],
 econ:['Economic report: {place}','{Org} reports — {out}.'],
 gov:['Government return: {place}','Return filed with {org}: {out}.'],
 market:['Market record: {place}','Exchange tape, clerk {who}: {out}.'],
 photo:['Photograph: {place}','{who} ({role}) photographed the site. Caption: {out}.'],
 footage:['Newsreel footage: {place}','Footage by {who}\'s crew. Intertitle: {out}.'],
 satellite:['Satellite imagery: {place}','Orbital survey pass over {place}. Analyst annotation: {out}.']
};
const TREND={up:['{Layer} rising in {place}','Returns from {place} show {layer} well up on the last period, with several causes suggested.'],down:['{Layer} slipping in {place}','Returns from {place} show {layer} falling away on the last period; the cause is disputed.']};
FA.evTypesFor=function(eraIdx,list){return list.filter(t=>FA.ETYPES[t].era<=eraIdx);};
function stamp(rel,R){const r=rel+R.gauss()*.12;return r>.72?0:r>.55?1:r>.38?2:3;}
function overlap(a,b){let s=0;for(const l in a.dr){if(b.dr[l]&&a.dr[l]*b.dr[l]>0)s+=Math.abs(a.dr[l]*b.dr[l]);}return s;}
FA.confusers=function(m,R){
  const others=FA.MECHS[m.era].filter(x=>x.id!==m.id).map(x=>({x,o:overlap(m,x)+R.n()*.04})).sort((a,b)=>b.o-a.o);
  return others.map(o=>o.x);
};
function mk(S,R,o){
  const e=S.core.eraIdx,id=FA.uid(S,'e');
  const ev=Object.assign({id,turn:S.gturn,year:S.year-R.int(0,3),era:e,seen:false,state:'tray',links:[],hot:0},o);
  if(!ev.who&&FA._lw&&ev.truth!=='trend'){ev.who=FA._lw;ev.role=FA._lr;}FA._lw=null;FA._lr='';
  ev.stamp=stamp(ev.rel,R);
  S.ev[id]=ev;return ev;
}
FA.fillText=function(S,tmpl,m,R,extra){
  const e=S.core.eraIdx;const regs=FA.REGIONS;
  const place=extra&&extra.place||regs[0].name;
  const o=Object.assign({thing:m?m.thing:'',Thing:m?FA.cap(m.thing):'',sym:'',Sym:'',place,who:who(R,e),role:'',org:R.pick(ORGS[e]),paper:R.pick(PAPERS[e])},extra||{});
  o.Sym=FA.cap(o.sym);o.Org=FA.cap(o.org);FA._lw=o.who;FA._lr=o.role||'';return [FA.fill(tmpl[0],o),FA.fill(tmpl[1],o)];
};
function placeFor(S,R,m){const id=(m&&R.chance(.8))?R.pick(S.core.home[m.id]):R.pick(FA.REGIONS).id;return FA.REGIONS.find(r=>r.id===id);}
FA.genSoft=function(S,R,m,opts){
  opts=opts||{};const e=S.core.eraIdx,hyp=S.core.hype[m.id];
  const types=FA.evTypesFor(e,hyp&&!opts.real?['clipping','clipping','interview','patent','intel','blueprint']:['patent','paper','blueprint','interview','clipping','intel','schematic']);
  const type=opts.type||R.pick(types);
  const place=placeFor(S,R,m);
  const sym=R.pick(m.sym);
  const tm=R.pick(SOFT[type]||SOFT.clipping);
  const role=ROLE[type]?R.pick(ROLE[type]):'';
  const [title,body]=FA.fillText(S,tm,m,R,{sym,place:place.name,role});
  const hollow=hyp&&!opts.real;
  const base=FA.ETYPES[type].base;
  const rel=hollow?base*(.42+R.n()*.4):base*(.72+R.n()*.3);
  const cf=FA.confusers(m,R);
  const imp=[m.id].concat(cf.slice(0,hollow||R.chance(.5)?2:1).filter(()=>R.chance(.85)).map(x=>x.id));
  return mk(S,R,{type,title,body,who:'',place:place.id,src:m.id,truth:hollow?'hollow':'real',rel,imp:R.shuffle(imp),contra:[],img:FA.ETYPES[type].hard||type==='photo'?R.pick(FA.ERAS[e].ev):null,chain:opts.chain||null});
};
FA.genHard=function(S,R,m,opts){
  opts=opts||{};const e=S.core.eraIdx,A=S.core.A[m.id];const neg=!!opts.neg;
  const type=opts.type||R.pick(FA.evTypesFor(e,['shipping','shipping','econ','market','gov','photo','footage','satellite']));
  const place=placeFor(S,R,m);
  const out=outPhrase(A,m.thing,R,neg);
  const t=HARD[type];const role=ROLE[type]?R.pick(ROLE[type]):'';
  const [title,body]=FA.fillText(S,t,m,R,{out,place:place.name,role});
  const rel=FA.ETYPES[type].base*(.95+R.n()*.1);
  const cf=FA.confusers(m,R);
  const imp=[m.id].concat(R.chance(.45)?[cf[0].id]:[]);
  return mk(S,R,{type,title,body,place:place.id,src:m.id,truth:neg?'neg':'real',rel,imp:R.shuffle(imp),contra:neg?[m.id]:[],img:['photo','footage','satellite'].includes(type)?R.pick(FA.ERAS[e].ev):null});
};
FA.genTrend=function(S,R,li,d){
  const e=S.core.eraIdx,l=FA.LAYERS[li];
  const up=d>0;const place=R.pick(FA.REGIONS);
  const type=R.pick(FA.evTypesFor(e,['econ','market','gov','shipping']));
  const lexn=FA.LEX[l][e];
  const imp=FA.MECHS[e].filter(m=>m.dr[l]&&m.dr[l]*(up?1:-1)>=.1).map(m=>m.id);
  if(R.chance(.2)){const others=FA.MECHS[e].filter(m=>!imp.includes(m.id));if(others.length)imp.push(R.pick(others).id);}
  if(!imp.length){const any=R.pick(FA.MECHS[e]);imp.push(any.id);}
  const tm=TREND[up?'up':'down'];
  const org=R.pick(ORGS[e]);
  const ti=FA.fill(tm[0],{Layer:FA.cap(lexn),layer:lexn,place:place.name}),bo=FA.fill(tm[1],{Layer:FA.cap(lexn),layer:lexn,place:place.name});
  return mk(S,R,{type,title:ti,body:bo+' — filed with '+org+'.',place:place.id,src:l,truth:'trend',rel:FA.ETYPES[type].base*.92,imp:R.shuffle(imp),contra:[],layer:l,dir:up?1:-1,img:null});
};
/* Generate this turn's arrivals from the sim state. Deterministic given (seed, gturn). */
FA.genTurnEvidence=function(S,first){
  const R=FA.rng(S.seed,'ev'+S.gturn+(first?'b':''));const core=S.core;const e=core.eraIdx;const out=[];
  FA.MECHS[e].forEach(m=>{
    const a=core.A[m.id],hyp=core.hype[m.id],c=core.carry[m.id]||0;
    let rate=.30+a*.85+(hyp?m.buzz*.75:m.buzz*.12)+Math.max(0,c)*.9;
    if(S.core.turn<=m.onset-2)rate*=.4;
    let n=Math.floor(rate+R.n()*.9);n=Math.min(n,2);
    for(let i=0;i<n;i++)out.push(FA.genSoft(S,R,m));
    if(a>.18&&S.core.turn>=m.onset&&R.chance(.8))out.push(FA.genHard(S,R,m));
    else if(hyp&&S.core.turn>=m.onset+1&&R.chance(.22))out.push(FA.genHard(S,R,m,{neg:true}));
  });
  const ts=[];FA.LAYERS.forEach((l,i)=>{const d=core.L[i]-core.Lprev[i];if(Math.abs(d)>.022)ts.push([i,d]);});
  ts.sort((a,b)=>Math.abs(b[1])-Math.abs(a[1]));ts.slice(0,3).forEach(([i,d])=>out.push(FA.genTrend(S,R,i,d)));
  // cap the tray so it stays a stack, not a feed
  const keep=out.length>9?R.shuffle(out).slice(0,9):out;
  out.forEach(ev=>{if(!keep.includes(ev))delete S.ev[ev.id];});
  return keep;
};
FA.evText=function(ev){return ev.title;};
})();
