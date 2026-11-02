/* FUTURE ARCHITECT v2 — core helpers. Classic script, no modules (works from file://). */
(function(){
const FA = window.FA = window.FA || {};
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
FA.clamp=clamp;
function xmur(str){let h=1779033703^str.length;for(let i=0;i<str.length;i++){h=Math.imul(h^str.charCodeAt(i),3432918353);h=h<<13|h>>>19;}
  return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return(h^=h>>>16)>>>0;};}
function mulberry(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
FA.rng=function(seed,label){
  const n=mulberry(xmur(seed+'|'+label)());
  const o={n,
    int:(a,b)=>a+Math.floor(n()*(b-a+1)),
    pick:arr=>arr[Math.floor(n()*arr.length)],
    chance:p=>n()<p,
    gauss:()=>{let u=0,v=0;while(!u)u=n();while(!v)v=n();return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v);},
    shuffle:arr=>{const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(n()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}};
  return o;
};
FA.hash=function(s){return xmur(String(s))();};
FA.randomSeed=function(){const c='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let s='';for(let i=0;i<4;i++)s+=c[Math.floor(Math.random()*c.length)];return 'FA-'+s+'-'+Math.floor(10+Math.random()*90);};
FA.cap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
FA.sig=x=>1/(1+Math.exp(-x));
FA.fill=(t,o)=>t.replace(/\{(\w+)\}/g,(m,k)=>o[k]!==undefined?o[k]:m);
FA.avg=a=>a.length?a.reduce((x,y)=>x+y,0)/a.length:0;
FA.sum=a=>a.reduce((x,y)=>x+y,0);
FA.uid=(S,p)=>p+(++S.uidn).toString(36);
})();
