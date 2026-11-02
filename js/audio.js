/* FUTURE ARCHITECT — generative ambient audio + SFX (WebAudio, no files). */
(function(){
const FA=window.FA;
const A=FA.Audio={ctx:null,on:true,started:false,mood:'steady',master:null,rev:null,timer:null,pad:null};
try{A.on=localStorage.getItem('fa_mute')!=='1';}catch(e){}
const SC={steady:[0,3,5,7,10],boom:[0,2,4,7,9],crisis:[0,1,3,6,8]};
const ROOT={steady:110,boom:123.47,crisis:98};
const ERAT=[.85,.95,1,1.05,1,1.12];A.eraK=1;
function mk(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  const c=A.ctx=new AC();A.master=c.createGain();A.master.gain.value=A.on?.8:0;A.master.connect(c.destination);
  // reverb impulse
  const len=c.sampleRate*2.6,buf=c.createBuffer(2,len,c.sampleRate);
  for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
  A.rev=c.createConvolver();A.rev.buffer=buf;const rg=c.createGain();rg.gain.value=.55;A.rev.connect(rg);rg.connect(A.master);
  A.bus=c.createGain();A.bus.gain.value=1;A.bus.connect(A.master);A.bus.connect(A.rev);
  // drone pad
  A.pad=[];const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=420;lp.Q.value=.7;const pg=c.createGain();pg.gain.value=.11;lp.connect(pg);pg.connect(A.bus);A.lp=lp;
  [1,1.5,2,.5].forEach((m,i)=>{const o=c.createOscillator();o.type=i===3?'sine':'sawtooth';o.frequency.value=ROOT.steady*m;o.detune.value=(i-1.5)*7;const g=c.createGain();g.gain.value=i===3?.9:.35;o.connect(g);g.connect(lp);o.start();A.pad.push({o,m});});
  const lfo=c.createOscillator();lfo.frequency.value=.07;const lg=c.createGain();lg.gain.value=160;lfo.connect(lg);lg.connect(lp.frequency);lfo.start();
  return true;
}
A.start=function(){
  if(A.started){if(A.ctx&&A.ctx.state==='suspended')A.ctx.resume();return;}
  if(!mk())return;A.started=true;if(A.ctx.state==='suspended')A.ctx.resume();A.setMood(A.mood);
  const tick=()=>{if(A.on&&!document.hidden)A.note();A.timer=setTimeout(tick,1800+Math.random()*3200);};tick();
};
A.setMood=function(m){A.mood=m;if(!A.ctx)return;const t=A.ctx.currentTime;A.pad.forEach(p=>p.o.frequency.linearRampToValueAtTime(ROOT[m]*A.eraK*p.m,t+4));
  A.lp.frequency.linearRampToValueAtTime(m==='crisis'?300:m==='boom'?640:420,t+4);};
A.setEra=function(k){A.eraK=ERAT[k]||1;A.setMood(A.mood);};
A.note=function(){
  const c=A.ctx;if(!c)return;const sc=SC[A.mood],s=sc[Math.floor(Math.random()*sc.length)]+(Math.random()<.4?12:0);
  const f=ROOT[A.mood]*A.eraK*2*Math.pow(2,s/12);const o=c.createOscillator(),g=c.createGain();o.type=A.mood==='crisis'?'triangle':'sine';o.frequency.value=f;
  const t=c.currentTime;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.07,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+2.2);o.connect(g);g.connect(A.bus);o.start(t);o.stop(t+2.3);
};
A.toggle=function(){A.on=!A.on;try{localStorage.setItem('fa_mute',A.on?'0':'1');}catch(e){}if(A.ctx)A.master.gain.linearRampToValueAtTime(A.on?.8:0,A.ctx.currentTime+.2);else if(A.on)A.start();return A.on;};
function tone(f,d,type,vol,when,slide){if(!A.ctx||!A.on)return;const c=A.ctx,t=c.currentTime+(when||0);const o=c.createOscillator(),g=c.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.12,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);o.connect(g);g.connect(A.bus);o.start(t);o.stop(t+d+.05);}
function noise(d,vol,f0,f1,when){if(!A.ctx||!A.on)return;const c=A.ctx,t=c.currentTime+(when||0);const n=c.sampleRate*d,b=c.createBuffer(1,n,c.sampleRate),dd=b.getChannelData(0);for(let i=0;i<n;i++)dd[i]=Math.random()*2-1;
  const s=c.createBufferSource();s.buffer=b;const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.setValueAtTime(f0,t);bp.frequency.exponentialRampToValueAtTime(f1,t+d);bp.Q.value=2;const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0001,t+d);s.connect(bp);bp.connect(g);g.connect(A.bus);s.start(t);}
A.sfx=function(k){
  if(!A.ctx&&A.on)A.start();if(!A.ctx||!A.on)return;
  switch(k){
    case 'tap':tone(620,.07,'triangle',.07);break;
    case 'scan':noise(.5,.09,400,3200);tone(880,.25,'sine',.05,.3);break;
    case 'reveal':[0,4,7,12].forEach((s,i)=>tone(440*Math.pow(2,s/12),.5,'sine',.1,i*.09));break;
    case 'link':tone(300,.2,'sawtooth',.06,0,600);tone(900,.3,'sine',.08,.15);break;
    case 'coin':tone(1200,.1,'square',.04);tone(1600,.2,'square',.04,.07);break;
    case 'launch':noise(1.4,.22,200,2400);tone(70,1.2,'sawtooth',.2,0,35);[0,7,12,16].forEach((s,i)=>tone(220*Math.pow(2,s/12),.9,'triangle',.09,.7+i*.08));break;
    case 'bad':tone(110,.8,'sawtooth',.14,0,45);noise(.6,.12,1200,120);break;
    case 'news':tone(880,.12,'square',.05);tone(660,.18,'square',.05,.12);break;
    case 'year':tone(55,1.5,'sine',.22,0,40);noise(1,.08,100,1500);break;
    case 'err':tone(160,.18,'square',.06);break;
    case 'rival':tone(196,.9,'sawtooth',.07,0,174);tone(233,.9,'sawtooth',.05,.05,208);break;
    case 'pin':tone(1500,.04,'square',.05);noise(.06,.1,2400,900);break;
    case 'string':noise(.28,.06,600,2600);tone(520,.14,'triangle',.05,.1);break;
    case 'paper':noise(.22,.08,1800,5200);noise(.14,.05,900,3000,.1);break;
    case 'stamp':tone(90,.16,'sine',.22,0,50);noise(.1,.16,500,120);break;
    case 'phone':tone(1400,.08,'square',.03);tone(1180,.08,'square',.03,.1);tone(1400,.08,'square',.03,.2);break;
    case 'type':tone(2200,.025,'square',.025);break;
    case 'legacy':[0,3,7,10,14].forEach((s,i)=>tone(220*Math.pow(2,s/12),2.2,'sine',.08,i*.35));break;
  }
};
document.addEventListener('visibilitychange',()=>{if(A.ctx){if(document.hidden)A.ctx.suspend();else if(A.on)A.ctx.resume();}});
})();
