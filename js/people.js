/* FUTURE ARCHITECT v2 — analysts, rivals, and template dialogue. Deterministic; an LLM could later re-voice the same beats. */
(function(){
const FA=window.FA;
FA.ARCH={
 engineer:{name:'Engineer',trust:['patent','blueprint','schematic','photo','satellite'],dom:['EN','MF','IN','TR'],weak:['MD','GV','PO']},
 economist:{name:'Economist',trust:['market','econ','shipping'],dom:['CP','LB','MF','TR'],weak:['ME','EV','RS']},
 spy:{name:'Intelligence officer',trust:['intel','gov','footage'],dom:['MI','GV','CM'],weak:['FD','ED','ME']},
 journalist:{name:'Journalist',trust:['clipping','interview','photo','footage'],dom:['MD','PO','CM','GV'],weak:['CO','RS','EN']},
 scientist:{name:'Scientist',trust:['paper','schematic','patent'],dom:['RS','CO','ME','ED'],weak:['LB','GV','MD']},
 policy:{name:'Policy analyst',trust:['gov','econ','paper'],dom:['GV','EV','PO','LB'],weak:['MF','CO','TR']},
 physician:{name:'Physician-demographer',trust:['paper','gov','photo'],dom:['ME','PO','FD','EV'],weak:['CP','MI','CM']}
};
FA.ANALYSTS=[
[{id:'a0',name:'Edmund Hale',arch:'engineer',img:'p1a',age:52,edu:'Self-taught; apprenticed at the Sheffield forges',pers:'blunt, patient with machines and impatient with men',pol:'Liberal',opt:.3,bio:'Built bridges on three continents; trusts what he can measure with a rule.'},
 {id:'a1',name:'Agnes Pryce',arch:'spy',img:'p1b',age:34,edu:'Telegraph school; self-taught cipher clerk',pers:'quiet, exact, never forgets an intercept',pol:'Conservative',opt:-.2,bio:'Reads the world through other people\'s traffic and has learned not to believe it.'},
 {id:'a2',name:'Sir Walter Brandreth',arch:'economist',img:'p1c',age:61,edu:'Oxford; thirty years in the counting-house',pers:'courtly, cautious, dismissive of enthusiasms',pol:'Conservative',opt:-.4,bio:'Has survived three panics by doubting every boom.'},
 {id:'a3',name:'Josiah Weekes',arch:'journalist',img:'p1d',age:27,edu:'Mission school; apprenticed to the Courier',pers:'quick, charming, hungry for the next story',pol:'Radical',opt:.5,bio:'The first reporter in his city to cover the telephone as news, not novelty.'}],
[{id:'b0',name:'Nathaniel Fisk',arch:'economist',img:'p2a',age:48,edu:'Columbia; Federal Reserve board staff',pers:'dry, quotable, allergic to certainty',pol:'Centrist',opt:-.1,bio:'Publishes a monthly index nobody reads and everybody quotes.'},
 {id:'b1',name:'Margaret Ellery',arch:'scientist',img:'p2b',age:37,edu:'Girton; statistics under Pearson',pers:'precise, unflattering, kind in private',pol:'Liberal',opt:.1,bio:'Taught the office to say "n equals nine" before saying "therefore."'},
 {id:'b2',name:'Walter Kowalczyk',arch:'engineer',img:'p2c',age:44,edu:'Night school; chief engineer at three plants',pers:'gruff, proud of his hands, wary of theory',pol:'Labour',opt:.2,bio:'Ran the first line at a motor works; knows what a bottleneck sounds like.'},
 {id:'b3',name:'Dr. Rohan Desai',arch:'physician',img:'p2d',age:41,edu:'Edinburgh; public-health fellowship',pers:'gentle, stubborn, counts everything twice',pol:'Liberal',opt:.15,bio:'Mapped a cholera year by street and never trusted a headline again.'}],
[{id:'c0',name:'Maj. Alan Pierce',arch:'spy',img:'p3a',age:46,edu:'Cambridge; wartime signals intelligence',pers:'amiable, evasive, sees the hand behind every curtain',pol:'Hawk',opt:-.3,bio:'Sees threat in every announcement and has, twice, been right.'},
 {id:'c1',name:'Dr. Ruth Feldman',arch:'scientist',img:'p3b',age:38,edu:'Princeton; operations research',pers:'dry, mathematical, unimpressed by authority',pol:'Centrist',opt:.1,bio:'Wrote the first theory of how many analysts it takes to disagree.'},
 {id:'c2',name:'Prof. Edwin Hargreave',arch:'engineer',img:'p3c',age:57,edu:'Cavendish; Manhattan-era laboratories',pers:'courteous, enthusiastic, dangerous with a chalk',pol:'Technocrat',opt:.5,bio:'Believes any problem is an engineering problem delayed by funding.'},
 {id:'c3',name:'Lorraine Baptiste',arch:'journalist',img:'p3d',age:33,edu:'Howard; reporting for the Defender',pers:'sharp, watchful, unwilling to be managed',pol:'Radical',opt:.0,bio:'Covers the people at the edge of every announcement.'}],
[{id:'d0',name:'Dr. Carol Whitman',arch:'economist',img:'p4a',age:43,edu:'Chicago; Treasury staff',pers:'brisk, numerical, impatient with narratives',pol:'Market-liberal',opt:.3,bio:'Believes in prices the way others believe in providence.'},
 {id:'d1',name:'Frank Dombrowski',arch:'engineer',img:'p4b',age:51,edu:'Purdue; twenty years in Detroit tooling',pers:'plain-spoken, sceptical of software',pol:'Labour',opt:-.1,bio:'Has watched three "factories of the future" become museums.'},
 {id:'d2',name:'Daniel Cho',arch:'scientist',img:'p4c',age:29,edu:'Carnegie Mellon; systems programming',pers:'earnest, fast, overconfident about code',pol:'Libertarian',opt:.6,bio:'Believes the machines will be fine and the managers will not.'},
 {id:'d3',name:'Harold Pruitt',arch:'policy',img:'p4d',age:67,edu:'Yale law; four terms on the Hill',pers:'genial, strategic, never answers the question asked',pol:'Institutionalist',opt:-.2,bio:'Knows which committee kills which idea and when.'}],
[{id:'e0',name:'Maya Lindqvist',arch:'scientist',img:'p5a',age:31,edu:'Stanford; machine learning',pers:'direct, quantitative, impatient with hype',pol:'Technocrat',opt:.2,bio:'Left a big lab to ask whether the benchmarks meant anything.'},
 {id:'e1',name:'Brett Hollis',arch:'economist',img:'p5b',age:39,edu:'Wharton; two exits',pers:'affable, fast, allergic to doubt',pol:'Market-liberal',opt:.7,bio:'Has funded forty companies and can name the six that worked.'},
 {id:'e2',name:'Arjun Nair',arch:'engineer',img:'p5c',age:36,edu:'IIT Madras; semiconductor fabs',pers:'calm, thorough, collects failure analyses',pol:'Centrist',opt:.0,bio:'Reads supply chains like other people read novels.'},
 {id:'e3',name:'Dr. Imani Okoye',arch:'policy',img:'p5d',age:42,edu:'LSE; technology governance',pers:'principled, relentless, hard to flatter',pol:'Progressive',opt:-.2,bio:'Will tell you who gets hurt before she tells you who gets rich.'}],
[{id:'f0',name:'Dr. Elena Voronova',arch:'scientist',img:'p6a',age:48,edu:'Zurich; complex-systems modelling',pers:'measured, ironical, comfortable with uncertainty',pol:'Technocrat',opt:.1,bio:'Models cascades; trusts none of her models before breakfast.'},
 {id:'f1',name:'Dr. Hana Seo',arch:'economist',img:'p6b',age:44,edu:'Seoul National; orbital-economy institute',pers:'precise, wry, wary of belief',pol:'Centrist',opt:-.1,bio:'Prices the unpriceable and corrects herself in public.'},
 {id:'f2',name:'Amb. Mateo Rivas',arch:'policy',img:'p6c',age:71,edu:'Foreign service; forty years of negotiations',pers:'warm, unhurried, listens for what is not said',pol:'Institutionalist',opt:-.3,bio:'Believes every technology is a treaty waiting to happen.'},
 {id:'f3',name:'Zuri Mwangi',arch:'engineer',img:'p6d',age:26,edu:'Nairobi; orbital robotics',pers:'bright, fearless, short on patience',pol:'Radical',opt:.6,bio:'Built a tether climber at nineteen; assumes everything else is just logistics.'}]
];
/* Rivals: reuse v1 dynasty roster. Era 4/5 draw heirs from the modern pairs. */
FA.ARCHS=['Industrialist','Opportunist','Visionary','Politician'];
FA.RIVAL_LINES={
 Visionary:{intro:'"You are the one watching the edges. Good. The center is already lost."',pamph:['The future will not wait for consensus.','Those who hesitate will be footnotes.','I have seen it work; the rest is paperwork.']},
 Opportunist:{intro:'"Nice evidence. I especially like the parts I will be borrowing."',pamph:['Back what is already winning — and sell before it stops.','The market is the only expert that pays.','Be early, be loud, be out.']},
 Industrialist:{intro:'"Ideas are cheap. Steel is not. Remember who owns the steel."',pamph:['Scale settles every argument.','Build it and the doubters will use it.','Capacity is the only forecast that matters.']},
 Politician:{intro:'"I like to know who I am regulating."',pamph:['The public deserves safeguards before it deserves miracles.','Order first; progress is what order allows.','Whoever writes the rules writes the future.']}
};
FA.ROSTER=[
 {Visionary:{name:'Lady Evelyn Marsh',title:'The Lamplighter',img:'r_marsh'},Opportunist:{name:'Silas Crane',title:'The Silver Tongue',img:'r_crane'},Industrialist:{name:'Josiah Blackwood',title:'The Iron Road',img:'r_blackwood'},Politician:{name:'Sen. Alden Whitfield',title:'The Gavel',img:'r_harlan'}},
 {Visionary:{name:'Hiroshi Tanabe',title:'The Listener',img:'r_tanabe'},Opportunist:{name:'Dolores Vance',title:'The Broker',img:'r_vance'},Industrialist:{name:'Henry Calloway',title:'The Line',img:'r_calloway'},Politician:{name:'Gov. Beatrice Lyle',title:'The Governor',img:'r_lyle'}},
 {Visionary:{name:'Dr. Samuel Adeyemi',title:'The Physicist',img:'r_adeyemi'},Opportunist:{name:'Vincent Marlowe',title:'The Pitchman',img:'r_marlowe'},Industrialist:{name:'Gloria Brandt',title:'The Airframe',img:'r_brandt'},Politician:{name:'Sen. Dwight Harlan',title:'The Hawk',img:'r_harlan'}},
 {Visionary:{name:'Priya Raman',title:'The Compiler',img:'r_raman'},Opportunist:{name:'Gordon Stahl',title:'The Raider',img:'r_stahl'},Industrialist:{name:'Takeshi Mori',title:'The Keiretsu',img:'r_mori'},Politician:{name:'Margaret Ashworth',title:'The Resolute',img:'r_ashworth'}},
 {Visionary:{name:'Elara Voss',title:'The Silver Heretic',img:'r_voss'},Opportunist:{name:'Marcus Thorne',title:'The Mirror',img:'r_thorne'},Industrialist:{name:'Dmitri Volkov',title:'The Furnace',img:'r_volkov'},Politician:{name:'Sen. Helen Whitcombe',title:'The Gatekeeper',img:'r_whitcombe'}},
 {Visionary:{name:'Kenji Arata',title:'The Quiet Engineer',img:'r_arata'},Opportunist:{name:'Sofia Delacroix',title:'The Dealmaker',img:'r_delacroix'},Industrialist:{name:'Amara Okafor',title:'The Builder',img:'r_okafor'},Politician:{name:'Rafael Quintero',title:'The Tribune',img:'r_quintero'}}
];
/* which mechanism a rival champions */
FA.rivalWorldview=function(core,arch,R,taken){
  const ms=FA.MECHS[core.eraIdx].filter(m=>!taken.includes(m.id));
  const score=m=>{
    let s=R.n()*.4;
    if(arch==='Visionary')s+=(core.hype[m.id]?1:0)+m.buzz*.4;
    if(arch==='Opportunist')s+=m.buzz*.8+(m.kind==='R'?.2:0);
    if(arch==='Industrialist')s+=(['MF','EN','TR','IN'].reduce((a,l)=>a+Math.max(0,m.dr[l]||0),0))*1.4;
    if(arch==='Politician')s+=(['GV','MI','ED','PO','EV'].reduce((a,l)=>a+Math.abs(m.dr[l]||0),0))*1.4+(m.kind==='R'?.2:0);
    return s;};
  return ms.map(m=>[m,score(m)]).sort((a,b)=>b[1]-a[1])[0][0];
};
/* template voices — the same beats an LLM could later voice */
FA.VOICE={
 engineer:{for:['If I read the drawings straight, {impl}. The mechanics hold.','I have run the numbers twice. {Thing} does what the sketches say.'],doubt:['I would want to see {thing} run under load before I signed anything.','A sketch is not a machine. Where is the working unit?'],against:['Drawings lie. Show me one working unit, not a sketch.','The load figures are wishful. It will not stand.']},
 economist:{for:['Follow the money: the volumes agree with you. {Impl}.','The series is coherent. Capital is already moving toward {thing}.'],doubt:['A story, not a series. One good quarter is an anecdote.','It may be real. I would not price it yet.'],against:['Capital is not flowing there. When it does, I will believe it.','That is a promotion, not a market.']},
 spy:{for:['My sources say the same, and none of them like each other. Take that for what it is.','The quiet traffic agrees with the loud. That is rare.'],doubt:['Everybody is saying it. That is what worries me.','Someone wants us to look there. I would ask who.'],against:['I have an officer who calls it theatre. He has been right before.','The paperwork says one thing and the traffic says another.']},
 journalist:{for:['People are already behaving as if it were true. That is the story.','Ask anyone on the street. They have already moved on.'],doubt:['The coverage is louder than the facts. Who is paying for the coverage?','I have heard this pitch. I have also seen it work. Not often.'],against:['I wrote this story once before. It ended at a bankruptcy hearing.','Every source I trust has gone quiet. That is not a good sign.']},
 scientist:{for:['The measurements are small but they cohere. I would put it in the literature.','The mechanism is credible. {Impl}, if the second result holds.'],doubt:['One laboratory is not a result. Where is the replication?','Interesting, and under-powered. I would not stake the office on it.'],against:['The arithmetic does not close. They have hidden the error bars.','This will not survive a second laboratory.']},
 policy:{for:['It will change the rules whether we like it or not. We should shape it early.','The institutions are already adapting. {Impl}.'],doubt:['It may work, and cost more than anyone admits. Who pays when it breaks?','Look at who benefits from the headline before you cite it.'],against:['This is a lobby, not a trend. Follow the beneficiaries.','It cannot get through the legislature, and so it cannot happen.']},
 physician:{for:['The outcomes are in the ward books. Fewer cases, fewer burials.','The counts are on your side. {Impl}.'],doubt:['Promising, but I have seen epidemics outrun enthusiasm.','The mortality tables will tell us in a decade, not a season.'],against:['Nobody has shown me a patient who was better off for it.','The counts do not move. Whatever it is, it is not that.']}
};
FA.REPLY={agree:['I would add only this: {basis}.','That matches what I have seen. {Basis}.'],disagree:['With respect, {name}: {basis}.','{Name} sees the coast, not the weather. {Basis}.']};
FA.MENTOR=[
 'Mr. Alderidge\'s note, left on the blotter:\n\n"The first thing they will tell you is that the world is full of facts. It is not. It is full of claims about facts, and the clever ones come in newsprint.\n\nPin what arrives. String what belongs together. Then — and only then — write a name on a card and say what you believe. A theory is a thing you may be wrong about in public.\n\nNever trust a single source. Send someone to look. — A."',
];
})();
