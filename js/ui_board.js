/* FUTURE ARCHITECT v2 — the Theory Board: evidence pinned to cork, string dragged between pins, theory cards you write yourself. */
(function(){
const FA=window.FA,G=FA.G,U=FA.UI,esc=U.esc,$=U.$;
const EW=132,EH=98,TW=214;
function dims(S){
  const wall=Object.values(S.ev).filter(e=>e.state==='wall'&&e.pos);
  const maxY=wall.reduce((m,e)=>Math.max(m,e.pos.y+EH),0);
  const H=Math.max(800,maxY+36+104);
  return {wall,H};
}
function pinPt(S,kind,id){
  if(kind==='ev'){const e=S.ev[id];return e&&e.pos?{x:e.pos.x+EW/2,y:e.pos.y+2}:null;}
  const t=S.th[id];return t&&t.pos?{x:t.pos.x+TW/2,y:t.pos.y+2}:null;
}
function path(a,b){const mx=(a.x+b.x)/2,my=(a.y+b.y)/2+Math.min(46,16+Math.hypot(a.x-b.x,a.y-b.y)*.07);return {d:`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`,kx:.25*a.x+.5*mx+.25*b.x,ky:.25*a.y+.5*my+.25*b.y};}
U.stringsSVG=function(S,H,mini){
  const e=S.core.eraIdx;let out='';
  Object.values(S.th).filter(t=>t.era===e).forEach(t=>{
    t.links.forEach(l=>{
      const ev=S.ev[l.ev];if(!ev||ev.state!=='wall')return;
      const a=pinPt(S,'th',t.id),b=pinPt(S,'ev',ev.id);if(!a||!b)return;
      const p=path(a,b);const col=l.kind==='s'?'#b3302a':'#23304f';
      out+=`<path class="thread" d="${p.d}" stroke="${col}" ${l.kind==='c'?'stroke-dasharray="7 5"':''} ${t.dead?'opacity=".45"':''}/>`;
      if(!mini)out+=`<circle class="knot" cx="${p.kx}" cy="${p.ky}" r="9" data-kn="l:${ev.id}:${t.id}"/>`;
    });
  });
  S.twine.forEach(w=>{
    const a=pinPt(S,'ev',w.a),b=pinPt(S,'ev',w.b);if(!a||!b||!S.ev[w.a]||S.ev[w.a].state!=='wall'||S.ev[w.b].state!=='wall')return;
    const p=path(a,b);out+=`<path class="thread tw" d="${p.d}"/>`;
    if(!mini)out+=`<circle class="knot" cx="${p.kx}" cy="${p.ky}" r="8" data-kn="w:${w.a}:${w.b}"/>`;
  });
  return `<svg class="strs" width="1200" height="${H}" viewBox="0 0 1200 ${H}">${out}<path id="tmpStr" class="thread" d="" stroke="#e8d9a8" style="display:none"/></svg>`;
};
U.boardInner=function(S,mini){
  const e=S.core.eraIdx;const {wall,H}=dims(S);
  const ths=Object.values(S.th).filter(t=>t.era===e);
  const pam=S.pamph.filter(p=>p.era===e).sort((a,b)=>b.t-a.t).slice(0,5).map((p,i)=>{p.pos={x:20+i*236,y:H-92};return p;});
  const html=`<div class="zone"></div><div class="zlab" style="left:1000px;top:90px">what I believe</div>
   <div class="strip" style="top:${H-104}px"></div><div class="zlab" style="left:22px;top:${H-124}px">what the others are saying</div>
   ${wall.map(x=>U.evCard(x,{pos:true})).join('')}${ths.map(t=>U.thCard(t,{pos:true})).join('')}${pam.map(p=>U.pmCard(p,{pos:true})).join('')}
   ${U.stringsSVG(S,H,mini)}`;
  return {html,H};
};
/* the live miniature on the wall of the room */
U.drawMini=function(wb){
  const S=G.S;const host=wb.querySelector('#miniBoard');
  const {html,H}=U.boardInner(S,true);
  host.innerHTML=`<div class="bd" style="width:1200px;height:${H}px">${html}</div>`;
  const w=wb.clientWidth||parseFloat(wb.style.width),h=parseFloat(wb.style.height);
  const s=Math.min(w/1224,h/(H+24));
  host.style.transform=`translate(${(w-1200*s)/2}px,${(h-H*s)/2}px) scale(${s})`;
  host.querySelectorAll('.card .pin').forEach(p=>p.style.pointerEvents='none');
};
/* ---------------- the closeup ---------------- */
U.bv=null;
U.scenes.board=function(body,arg,scene){
  const S=G.S;
  body.className='';body.style.cssText='position:absolute;inset:0;padding:0;overflow:hidden';
  body.innerHTML=`<div class="bdview" id="bdv"><div class="bd" id="bd"></div></div><div class="bdhud" id="bdhud"></div>`;
  const bdv=$('#bdv'),bd=$('#bd'),hud=$('#bdhud');
  let H=800;
  const vw=()=>bdv.clientWidth,vh=()=>bdv.clientHeight;
  if(!U.bv){const phone=window.innerWidth<700;const fit=Math.min(vw()/1250,vh()/(840));U.bv={s:phone?.62:Math.max(.5,fit),x:12,y:52};
    if(!phone){U.bv.x=(vw()-1200*U.bv.s)/2;U.bv.y=Math.max(46,(vh()-800*U.bv.s)/2);}}
  const V=U.bv;
  let sm=null;let pop=null;
  function apply(){bd.style.transform=`translate(${V.x}px,${V.y}px) scale(${V.s})`;}
  function toB(cx,cy){const r=bdv.getBoundingClientRect();return {x:(cx-r.left-V.x)/V.s,y:(cy-r.top-V.y)/V.s};}
  function toScr(bx,by){const r=bdv.getBoundingClientRect();return {x:r.left+V.x+bx*V.s,y:r.top+V.y+by*V.s};}
  function strings(){const o=U.boardInner(S);const svg=bd.querySelector('svg.strs');const tmp=document.createElement('div');tmp.innerHTML=U.stringsSVG(S,H);svg.replaceWith(tmp.firstChild);}
  function setHud(){
    const un=Object.values(S.ev).filter(e=>e.state==='tray').length;
    const nth=Object.values(S.th).filter(t=>t.era===S.core.eraIdx).length;
    hud.innerHTML=`${un?`<div class="pile" id="pile"><i style="--r:-3deg"></i><i style="--r:2deg"></i><i style="--r:-1deg"></i><span>${un} unpinned — pin them</span></div>`:''}
     <div class="cardbox" id="cbox"><i style="--r:3deg"></i><i style="--r:-2deg"></i><span>${nth>=5?'the box is empty':'write a theory'}</span></div>
     <div class="zoomk"><button id="zp">+</button><button id="zm">−</button></div>
     <div class="hudnote" id="hnote" style="display:none"></div>`;
    $('#zp').onclick=()=>zoomAt(1.2,vw()/2,vh()/2);$('#zm').onclick=()=>zoomAt(1/1.2,vw()/2,vh()/2);
    const pile=$('#pile');if(pile)pile.onclick=()=>{U.do('pinAll');U.sfx('pin');draw(true);U.refresh();};
    $('#cbox').onclick=newTheory;
    note();
  }
  function note(){const n=$('#hnote');if(!n)return;if(sm){n.style.display='';n.textContent='Now tap what it connects to — or tap the cork to let go.';}else n.style.display='none';}
  function draw(land){
    const o=U.boardInner(S);H=o.H;
    bd.style.width='1200px';bd.style.height=H+'px';bd.innerHTML=o.html;
    if(land)bd.querySelectorAll('.card').forEach(c=>c.classList.add('land'));
    if(sm){const p=bd.querySelector(`[data-pin="${sm.kind}:${sm.id}"]`);if(p)p.parentElement.classList.add('sel');}
    apply();setHud();
  }
  U.boardRedraw=function(){draw();};
  U.onSceneClose=()=>{U.boardRedraw=null;U.bv=V;closePop();};
  function zoomAt(f,cx,cy){const ns=Math.max(.3,Math.min(1.8,V.s*f));const bx=(cx-V.x)/V.s,by=(cy-V.y)/V.s;V.s=ns;V.x=cx-bx*ns;V.y=cy-by*ns;apply();}
  bdv.addEventListener('wheel',e=>{e.preventDefault();const r=bdv.getBoundingClientRect();zoomAt(e.deltaY<0?1.1:1/1.1,e.clientX-r.left,e.clientY-r.top);},{passive:false});
  function closePop(){if(pop){pop.remove();pop=null;}}
  function showPop(kind,a,b,bx,by){
    closePop();const sp=toScr(bx,by);
    const el=document.createElement('div');el.className='pop';el.style.left=sp.x+'px';el.style.top=sp.y+'px';
    if(kind==='l'){const t=S.th[b],lk=t.links.find(l=>l.ev===a);
      el.innerHTML=`<button data-k="s" class="${lk&&lk.kind==='s'?'on':''}">Supports</button><button data-k="c" class="${lk&&lk.kind==='c'?'on':''}">Contradicts</button><button data-k="x">Cut</button>`;}
    else el.innerHTML=`<button data-k="x">Cut</button>`;
    el.onclick=ev=>{const k=ev.target.dataset.k;if(!k)return;
      if(kind==='l'){if(k==='x')U.do('unlink',a,b);else U.do('link',a,b,k);}
      else U.do('untwine',a,b);
      U.sfx(k==='x'?'tap':'string');closePop();draw();U.refresh();};
    hud.appendChild(el);
  }
  function connect(from,to){
    // from/to: {kind:'ev'|'th', id}
    if(from.kind===to.kind&&from.id===to.id)return;
    if(from.kind==='th'&&to.kind==='th'){U.toast('Theories do not string to each other — string evidence to them.');return;}
    let a,b,bx,by;
    if(from.kind==='ev'&&to.kind==='ev'){U.do('twineEv',from.id,to.id);const A=pinPt(S,'ev',from.id),B=pinPt(S,'ev',to.id);draw();U.sfx('string');U.refresh();const p=path(A,B);showPop('w',from.id,to.id,p.kx,p.ky);return;}
    const ev=from.kind==='ev'?from.id:to.id,th=from.kind==='th'?from.id:to.id;
    if(S.th[th].dead||S.th[th].era!==S.core.eraIdx){U.toast('That card is closed.');return;}
    U.do('link',ev,th,'s');U.sfx('string');draw();U.refresh();
    const p=path(pinPt(S,'th',th),pinPt(S,'ev',ev));showPop('l',ev,th,p.kx,p.ky);
  }
  /* ---- pointer handling: card drag, pin->string drag, pan, pinch ---- */
  const ptrs=new Map();let mode=null,pinch=null;
  function targetAt(x,y){const els=document.elementsFromPoint(x,y);for(const el of els){const c=el.closest&&el.closest('.card');if(c&&(c.dataset.ev||c.dataset.th))return c;}return null;}
  function ref(c){return c.dataset.ev?{kind:'ev',id:c.dataset.ev}:{kind:'th',id:c.dataset.th};}
  bdv.addEventListener('pointerdown',e=>{
    if(e.target.closest('.pop'))return;
    bdv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),s:V.s};mode=null;return;}
    const t=e.target;const knot=t.closest&&t.closest('.knot');const pin=t.closest&&t.closest('.pin');const card=t.closest&&t.closest('.card');
    mode={sx:e.clientX,sy:e.clientY,moved:false,id:e.pointerId};
    if(knot){mode.type='knot';mode.kn=knot.dataset.kn;}
    else if(pin&&pin.dataset.pin){const [k,id]=pin.dataset.pin.split(':');mode.type='pin';mode.from={kind:k,id};}
    else if(card&&(card.dataset.ev||card.dataset.th)){
      mode.type='card';mode.card=card;mode.ref=ref(card);const o=mode.ref.kind==='ev'?S.ev[mode.ref.id]:S.th[mode.ref.id];mode.ox=o.pos.x;mode.oy=o.pos.y;
      mode.lp=setTimeout(()=>{if(mode&&!mode.moved&&mode.card===card){mode.long=true;sm=mode.ref;U.sfx('tap');card.classList.add('sel');note();}},520);
    }
    else if(card&&card.dataset.pm){mode.type='pm';mode.pm=card.dataset.pm;}
    else mode.type='pan',mode.vx=V.x,mode.vy=V.y;
  });
  let raf=0;
  bdv.addEventListener('pointermove',e=>{
    if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
    if(pinch&&ptrs.size>=2){const [a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);const r=bdv.getBoundingClientRect();const cx=(a.x+b.x)/2-r.left,cy=(a.y+b.y)/2-r.top;const ns=Math.max(.3,Math.min(1.8,pinch.s*d/pinch.d));const bx=(cx-V.x)/V.s,by=(cy-V.y)/V.s;V.s=ns;V.x=cx-bx*ns;V.y=cy-by*ns;apply();return;}
    if(!mode||e.pointerId!==mode.id)return;
    const dx=e.clientX-mode.sx,dy=e.clientY-mode.sy;
    if(!mode.moved&&Math.hypot(dx,dy)>(mode.type==='pin'?5:6)){mode.moved=true;clearTimeout(mode.lp);}
    if(!mode.moved)return;
    if(mode.type==='pan'){V.x=mode.vx+dx;V.y=mode.vy+dy;apply();}
    else if(mode.type==='card'&&!mode.long){
      mode.card.classList.add('drag');
      const nx=mode.ox+dx/V.s,ny=mode.oy+dy/V.s;mode.nx=nx;mode.ny=ny;
      mode.card.style.left=nx+'px';mode.card.style.top=ny+'px';
      const o=mode.ref.kind==='ev'?S.ev[mode.ref.id]:S.th[mode.ref.id];o.pos={x:nx,y:ny};
      if(!raf)raf=requestAnimationFrame(()=>{raf=0;strings();});
    }else if(mode.type==='pin'){
      const a=pinPt(S,mode.from.kind,mode.from.id);const b=toB(e.clientX,e.clientY);const tmp=bd.querySelector('#tmpStr');
      if(tmp&&a){const p=path(a,b);tmp.setAttribute('d',p.d);tmp.style.display='';}
      bd.querySelectorAll('.card.glow').forEach(c=>c.classList.remove('glow'));
      const tg=targetAt(e.clientX,e.clientY);if(tg&&!(tg.dataset[mode.from.kind]===mode.from.id))tg.classList.add('glow');
    }
  });
  function up(e){
    ptrs.delete(e.pointerId);
    if(pinch){if(ptrs.size<2)pinch=null;mode=null;return;}
    if(!mode||e.pointerId!==mode.id)return;
    const m=mode;mode=null;clearTimeout(m.lp);
    bd.querySelectorAll('.card.glow').forEach(c=>c.classList.remove('glow'));
    if(m.type==='pan'){if(!m.moved){if(sm){sm=null;draw();}closePop();}return;}
    if(m.type==='knot'){if(!m.moved){const [k,a,b]=m.kn.split(':');const ev=k==='l'?S.ev[a]:null;
        const t=k==='l'?pinPt(S,'ev',a):pinPt(S,'ev',a),u=k==='l'?pinPt(S,'th',b):pinPt(S,'ev',b);const p=path(u,t);showPop(k,a,b,p.kx,p.ky);}return;}
    if(m.type==='pm'){if(!m.moved){const pm=S.pamph.find(x=>x.id===m.pm);if(pm)U.inspectRival(pm.rival);}return;}
    if(m.type==='pin'){
      if(!m.moved){ // tap fallback: begin / complete a string
        if(sm){connect(sm,m.from);sm=null;draw();}else{sm=m.from;U.sfx('tap');draw();}return;}
      const tmp=bd.querySelector('#tmpStr');if(tmp)tmp.style.display='none';
      const tg=targetAt(e.clientX,e.clientY);
      if(tg)connect(m.from,ref(tg));else draw();
      return;
    }
    if(m.type==='card'){
      if(m.long)return;
      if(m.moved){
        let x=Math.max(0,Math.min(1200-(m.ref.kind==='th'?TW:EW),m.nx)),y=Math.max(0,m.ny);
        x=Math.round(x);y=Math.round(y);U.do('move',m.ref.kind,m.ref.id,{x,y});U.sfx('tap');draw();U.refresh();return;
      }
      if(sm){connect(sm,m.ref);sm=null;draw();return;}
      if(m.ref.kind==='ev')U.inspectEv(m.ref.id);else U.inspectTh(m.ref.id);
    }
  }
  bdv.addEventListener('pointerup',up);bdv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);mode=null;pinch=null;});
  function newTheory(){
    const n=Object.values(S.th).filter(t=>t.era===S.core.eraIdx).length;
    if(n>=5){U.toast('The card box is empty — five theories to an age.');return;}
    const m=U.modal(`<div style="font:11px var(--type);letter-spacing:.14em;color:#8a7a5c">A BLANK CARD</div><h3>Write what you believe</h3><input class="field" id="nt" maxlength="48" placeholder="e.g. The telephone will outrun the telegraph" autocomplete="off"><div class="hand" style="opacity:.7;margin-top:6px">A name is only a name. What it means is decided by what you string to it.</div><div style="margin-top:14px"><button class="btn" id="ntok">Pin the card</button></div>`,'paper-th');
    const inp=m.querySelector('#nt');setTimeout(()=>inp.focus(),50);
    const go=()=>{const v=inp.value.trim();if(!v){inp.focus();return;}const id=U.do('newTheory',v);U.sfx('stamp');U.closeModal();draw(true);U.refresh();setTimeout(()=>U.inspectTh(id),150);};
    m.querySelector('#ntok').onclick=go;inp.onkeydown=e=>{if(e.key==='Enter')go();};
  }
  draw();
};
})();
