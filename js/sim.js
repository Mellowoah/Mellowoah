/* FUTURE ARCHITECT v2 — the hidden 17-layer simulation. Pure data in, pure data out. No DOM. */
(function(){
const FA=window.FA, clamp=FA.clamp;
const NL=FA.LAYERS.length;
FA.sim={};
/* core = {seed,eraIdx,turn,gturn,L[],A{},carry{},pot{},hype{},thr{},coup[[i,j,w]],Lprev[]} */
FA.sim.create=function(seed){
  const R=FA.rng(seed,'coup');
  const coup=FA.COUP.map(([a,b,w])=>[FA.LIDX[a],FA.LIDX[b],w*(0.7+R.n()*0.6)]);
  const rl=FA.rng(seed,'L0');
  const core={seed,eraIdx:-1,turn:0,gturn:0,L:FA.ERAS[0].base.map(v=>clamp(v/9+rl.gauss()*0.008,.03,.97)),A:{},carry:{},pot:{},hype:{},thr:{},home:{},coup,Lprev:[]};
  FA.sim.startEra(core,0);
  return core;
};
FA.sim.startEra=function(core,e){
  const R=FA.rng(core.seed,'era'+e);
  const base=FA.ERAS[e].base;
  if(core.eraIdx>=0){const ob=FA.ERAS[core.eraIdx].base;core.L=core.L.map((v,i)=>clamp(base[i]/9+(v-ob[i]/9)*.7,.03,.97));} // the world re-bases; what history did persists as deviation
  core.eraIdx=e;core.turn=0;core.A={};core.carry={};
  const ms=FA.MECHS[e];
  ms.forEach(m=>{
    let hype;
    if(m.kind==='R')hype=false;else if(m.kind==='H')hype=R.chance(.7);else hype=R.chance(.4);
    core.hype[m.id]=hype;
    core.pot[m.id]=hype?.08+R.n()*.14:(m.kind==="R"?.65+R.n()*.3:.6+R.n()*.3);
    const ba=FA.avg(m.req.map(l=>base[FA.LIDX[l]]/9));
    core.thr[m.id]=ba-.10+(R.n()-.5)*.08+(m.kind==="R"&&R.chance(.25)?.12:0);
    core.A[m.id]=0;core.carry[m.id]=0;
    core.home[m.id]=R.shuffle(FA.REGIONS.map(r=>r.id)).slice(0,2);
  });
  core.Lprev=core.L.slice();
};
FA.sim.gate=function(core,m){return FA.sig(9*(FA.avg(m.req.map(l=>core.L[FA.LIDX[l]]))-core.thr[m.id]));};
/* one turn (5 years). inputs.push = player-driven mechanism pushes, inputs.rpush = rival pushes, inputs.dl = direct layer shocks */
FA.sim.step=function(core,inp){
  inp=inp||{};const push=inp.push||{},rpush=inp.rpush||{},dl=inp.dl||{};
  const R=FA.rng(core.seed,'tick'+core.gturn);
  const ms=FA.MECHS[core.eraIdx];
  core.Lprev=core.L.slice();
  ms.forEach(m=>{
    core.carry[m.id]=(core.carry[m.id]||0)*.5+(push[m.id]||0)+(rpush[m.id]||0);
    const on=core.turn>=m.onset;
    const c=core.carry[m.id];
    const tgt=on?clamp(core.pot[m.id]*FA.sim.gate(core,m)+c,0,1):clamp(c*.4,0,1);
    core.A[m.id]=clamp(core.A[m.id]+(tgt-core.A[m.id])*.5,0,1);
  });
  const base=FA.ERAS[core.eraIdx].base.map(v=>v/9);
  const nL=core.L.slice();
  const cs=new Array(NL).fill(0);
  core.coup.forEach(([i,j,w])=>{cs[j]+=w*(core.L[i]-base[i])*.5;});
  for(let i=0;i<NL;i++){
    let tg=base[i]+cs[i];
    ms.forEach(m=>{const v=m.dr[FA.LAYERS[i]];if(v)tg+=core.A[m.id]*v*.32;});
    nL[i]=clamp(core.L[i]+(tg-core.L[i])*.4+R.gauss()*.008+(dl[FA.LAYERS[i]]||0),.02,.98);
  }
  core.L=nL;core.turn++;core.gturn++;
  return core;
};
FA.sim.clone=c=>JSON.parse(JSON.stringify(c));
/* Counterfactual fork: replay from snapshot with the architect's own pushes removed. log=[{push,rpush,dl}] */
FA.sim.fork=function(snap,log,mode){
  const c=FA.sim.clone(snap);
  log.forEach(inp=>{FA.sim.step(c,mode==='nobody'?{rpush:{},push:{},dl:{}}:{push:mode==='me'?inp.push:{},rpush:inp.rpush,dl:mode==='me'?inp.dl:{}});});
  return c;
};
FA.sim.delta=function(core,l){return core.L[FA.LIDX[l]]-core.Lprev[FA.LIDX[l]];};
FA.sim.lv=function(core,l){return core.L[FA.LIDX[l]];};
})();
