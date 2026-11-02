/* FUTURE ARCHITECT v2 — static world data: 17 hidden layers, couplings, eras, 42 mechanisms. */
(function(){
const FA=window.FA;
FA.LAYERS=['EN','TR','MF','CP','MD','GV','ME','MI','EV','PO','ED','CO','CM','LB','IN','FD','RS'];
FA.LNAME={EN:'Energy',TR:'Transportation',MF:'Manufacturing',CP:'Capital',MD:'Media',GV:'Government',ME:'Medicine',MI:'Military',EV:'Environment',PO:'Population',ED:'Education',CO:'Computing',CM:'Communication',LB:'Labor',IN:'Infrastructure',FD:'Food',RS:'Research'};
FA.LIDX={};FA.LAYERS.forEach((l,i)=>FA.LIDX[l]=i);
/* sparse coupling matrix: src dst weight (per-seed +-30% jitter) */
FA.COUP=[['EN','MF',.5],['EN','TR',.3],['EN','IN',.3],['EN','EV',-.3],['MF','CP',.3],['MF','LB',.3],['MF','TR',.2],['MF','EV',-.25],
['CP','RS',.3],['CP','MF',.3],['CP','IN',.3],['RS','CO',.3],['RS','ME',.3],['RS','EN',.2],['RS','MF',.2],['ED','RS',.4],['ED','LB',.3],['ED','ME',.2],
['CM','MD',.4],['CM','CP',.2],['CM','GV',.2],['CO','CM',.3],['CO','RS',.3],['CO','MF',.2],['CO','LB',-.2],['MD','GV',.2],['MD','PO',.1],
['GV','MI',.2],['MI','RS',.2],['MI','GV',.2],['MI','EV',-.2],['ME','PO',.4],['FD','PO',.4],['PO','LB',.3],['PO','ED',.2],['PO','FD',-.3],
['EV','FD',.3],['EV','PO',.2],['EV','ME',.15],['IN','TR',.3],['IN','CM',.2],['TR','CP',.2],['TR','CM',.2],['LB','CP',.1],['LB','GV',-.1],['FD','LB',.2]];
FA.ERAS=[
 {id:0,year:1890,name:'The Age of Steam and Wire',room:'The Telegraph Office',short:'Telegraph Office',base:[2,3,3,4,3,4,2,4,8,4,2,0,2,5,2,4,2],bg:'e1',img:'room1',ev:['ev1a','ev1b'],loc:'1890 · telegraph office'},
 {id:1,year:1920,name:'The Age of the Assembly Line',room:'The Industrial Forecasting Bureau',short:'Forecasting Bureau',base:[4,5,5,5,5,5,4,5,7,5,4,1,4,5,4,5,4],bg:'e2',img:'room2',ev:['ev2a','ev2b']},
 {id:2,year:1950,name:'The Cold War Analysis Center',room:'The Analysis Center',short:'Analysis Center',base:[6,6,6,6,6,6,6,7,6,6,5,3,5,6,6,6,6],bg:'e3',img:'room3',ev:['ev3a','ev3b']},
 {id:3,year:1980,name:'The Corporate Strategy Group',room:'The Strategy Group',short:'Strategy Group',base:[7,7,7,7,7,6,7,6,5,6,6,5,6,6,7,7,6],bg:'e4',img:'room4',ev:['ev4a','ev4b']},
 {id:4,year:2010,name:'The Technology Accelerator',room:'The Accelerator',short:'Accelerator',base:[6,7,7,8,8,6,7,6,4,7,7,8,8,6,7,7,7],bg:'e5',img:'room5',ev:['ev5a','ev5b']},
 {id:5,year:2050,name:'The Orbital Forecasting Institute',room:'The Orbital Institute',short:'Orbital Institute',base:[7,7,7,8,8,6,8,6,3,7,8,9,9,5,7,6,8],bg:'e5',img:'room6',ev:['ev6a','ev6b']}
];
FA.TURNS_PER_ERA=6; FA.YEARS_PER_TURN=5;
/* Per-era noun phrases for each layer — used by captions, reports, consequences */
FA.LEX={
EN:['coal and steam output','electric power supply','nuclear and oil-fired power','oil and grid power','renewable generation','fusion and storage capacity'],
TR:['rail and steamship traffic','road and rail traffic','airline and highway traffic','container and freight traffic','ride-hailing and logistics traffic','maglev and orbital freight'],
MF:['foundry and mill output','assembly-line output','factory output','offshore-factory output','robotic-factory output','orbital and printed manufacture'],
CP:['bank credit and trade finance','installment credit and equity','corporate capital','leveraged finance','venture capital','sovereign and orbital capital'],
MD:['newspaper circulation','radio and tabloid audience','television audience','cable and talk-media audience','feed and platform audience','synthetic-media audience'],
GV:['municipal and colonial administration','regulatory authority','state planning capacity','deregulatory politics','platform regulation','supranational governance'],
ME:['sanitation and surgery','vaccine and clinical care','hospital and drug supply','biotech and clinic capacity','genomic medicine','longevity medicine'],
MI:['naval and army strength','mechanised armies','nuclear and air forces','precision weapons','cyber and drone forces','orbital and autonomous forces'],
EV:['air and river quality','urban air and water','landscape and fishery health','ozone and watershed health','climate and ecosystem stability','coastal and climate stability'],
PO:['city growth and migration','urban population and wages','suburban and baby-boom population','ageing and migrating population','urban and ageing population','climate-shifted population'],
ED:['literacy and schooling','secondary schooling','university enrolment','schooling and training','online learning and skills','tutor-driven learning'],
CO:['clerical calculation','tabulating machines','mainframe computing','personal computing','cloud and machine learning','distributed machine intelligence'],
CM:['telegraph and post','telephone and radio networks','broadcast and teleprinter networks','satellite and cellular networks','broadband and mobile networks','mesh and orbital networks'],
LB:['wages and union strength','factory employment','white-collar employment','service employment','gig and platform employment','portfolio and robot-assisted work'],
IN:['roads, rails and mains','power lines and highways','airports and interstates','ports and fibre','data-centre and charging','smart-grid and orbital infrastructure'],
FD:['harvests and food prices','mechanised farm yield','hybrid-crop yield','global grain supply','precision-farm yield','cultured and vertical food supply'],
RS:['laboratory and patent activity','industrial research','state and corporate research','corporate R&D','open and venture research','automated discovery']};
FA.REGIONS=[{id:'atl',name:'Atlantic Coast'},{id:'mid',name:'Industrial Midlands'},{id:'del',name:'River Delta'},{id:'cap',name:'Capital District'},{id:'wst',name:'Western Frontier'},{id:'prt',name:'Eastern Ports'},{id:'pln',name:'Southern Plains'}];
/* Evidence types (14). base = base reliability; hard = tied to physical outcomes. era = first era it exists. */
FA.ETYPES={
 clipping:{name:'Newspaper clipping',base:.55,hard:0,era:0,cls:'np'},
 patent:{name:'Patent',base:.8,hard:0,era:0,cls:'pat'},
 photo:{name:'Photograph',base:.78,hard:1,era:0,cls:'ph'},
 interview:{name:'Interview',base:.6,hard:0,era:0,cls:'tx'},
 intel:{name:'Intelligence report',base:.5,hard:0,era:0,cls:'int'},
 blueprint:{name:'Blueprint',base:.72,hard:0,era:0,cls:'bp'},
 paper:{name:'Research paper',base:.76,hard:0,era:0,cls:'rp'},
 shipping:{name:'Shipping log',base:.86,hard:1,era:0,cls:'sl'},
 econ:{name:'Economic report',base:.74,hard:1,era:0,cls:'er'},
 schematic:{name:'Technical schematic',base:.7,hard:0,era:2,cls:'bp'},
 gov:{name:'Government document',base:.7,hard:1,era:0,cls:'gd'},
 footage:{name:'Historical footage',base:.72,hard:1,era:1,cls:'ft'},
 satellite:{name:'Satellite imagery',base:.82,hard:1,era:3,cls:'sat'},
 market:{name:'Market record',base:.8,hard:1,era:0,cls:'mk'}
};
FA.SOFT=['clipping','patent','interview','intel','blueprint','paper','schematic'];
FA.HARD=['shipping','econ','gov','market','photo','footage','satellite'];
/* Mechanisms. [id,name,thing,kind(R real/H hype-prone/W wildcard),drives,req,onset,impl,[3 symptom clauses],hardness] */
const M=(id,name,thing,kind,dr,req,on,impl,sym,buzz)=>({id,name,thing,kind,dr:Object.fromEntries(dr.split(',').map(s=>{const[a,b]=s.split(':');return[a,+b];})),req:req.split(','),onset:on,impl,sym,buzz:buzz||0});
FA.MECHS=[
// ---- 1890
[M('steel','Cheap bulk steel','the Bessemer converters','R','MF:.5,IN:.3,TR:.2,EN:-.1,EV:-.1','EN,MF',0,'cheap steel will remake rail, bridge and building',['rail mills are quoting prices a third lower than last year','girder spans once thought impossible are going out to tender','ironmongers fear the converters will leave them with nothing to sell'],0),
 M('electric','Central-station electricity','the dynamo stations','R','EN:.6,IN:.3,MF:.3,TR:.1','EN,CP',1,'central-station electricity will replace steam shafts and gaslight',['a mill has dismissed its overhead belting for wired motors','the arc-lit streets draw crowds after dark','insurers have begun to ask about wiring, not boilers'],1),
 M('phone','Telephone exchanges','the telephone exchanges','R','CM:.6,CP:.2,MD:.1,LB:.1','CM,IN',0,'the voice-wire will bind commerce into one market',['merchants are putting wires in before they put in clerks','the exchange has more subscribers than it has operators','brokers are quoting by voice in minutes, not by letter in days'],0),
 M('sanit','Municipal sanitation','the sewer and water works','R','ME:.5,PO:.3,IN:.2,EV:.1','GV,CP',1,'germ theory and municipal works will empty the fever wards',['typhoid wards stand half empty in the sewered wards','the medical officer links the pump to the epidemic','insurers shave premiums where the sewers run'],0),
 M('airship','Passenger airships','the dirigible company','H','TR:.25,CP:.1','EN,MF',2,'rigid airships will carry passengers across oceans',['the company has pre-sold a thousand passages','a model airship circled the exhibition hall to applause','investors queue to subscribe to the new company'],2),
 M('pneu','Pneumatic-tube cities','the pneumatic-tube scheme','H','CM:.3,IN:.2,CP:.1','IN,CP',2,'pneumatic tubes will carry post, parcels and people under every city',['an experimental line carried a bishop under the river','the engineers promise parcels across town in minutes','the syndicate has taken the grandest offices in the Exchange'],1),
 M('wireless','Wireless telegraphy','the wireless sets','W','CM:.4,MI:.2,TR:.1','CM,RS',2,'signals without wires will reach ships, armies and remote farms',['a ship at sea reported her position by spark','the Admiralty has asked for sets in quantity','amateurs are building spark sets from catalogue parts'],1)],
// ---- 1920
[M('assembly','The moving assembly line','the moving lines','R','MF:.5,LB:.2,TR:.2,CP:.2,EV:-.1','EN,MF',0,'the moving assembly line will make goods cheaper than wages',['unit costs have halved at the works with the moving line','workers queue at the gates; turnover is a scandal','rivals are tearing out their benches and copying the line'],0),
 M('radio','Mass radio','the broadcast stations','R','CM:.5,MD:.5,GV:.1,CP:.1','CM,CP',0,'mass broadcasting will make one nation hear one voice',['receiving-set sales outrun every forecast','a candidate has won a district he never visited','advertisers pay by the minute to be heard'],0),
 M('auto','The automobile and the road','the motor trade','R','TR:.6,IN:.4,EN:.2,EV:-.2,PO:.1','MF,IN',1,'the motor car and the paved road will reorganise where people live',['county roads are being paved faster than rails were laid','garages outnumber blacksmiths in the market towns','land beyond the tram line is selling by the acre'],0),
 M('vaccine','Vaccines and serum programs','the serum institutes','R','ME:.6,PO:.4,ED:.1','RS,GV',1,'serum and vaccine campaigns will break the epidemics',['the institute reports diphtheria all but gone in treated schools','a mass campaign reached forty thousand children in a month','insurers are quietly lowering rates in vaccinated counties'],0),
 M('credit','Installment credit and equity','the instalment houses','W','CP:.5,MF:.1,LB:.1,GV:-.1','CP,MD',2,'easy instalment credit will carry demand ever higher',['the stores report every third sale on the instalment plan','small clerks speculate in equities on the margin','the lenders are lowering the deposit again'],1),
 M('techno','Technocratic planning','the planning commissions','H','GV:.4,MF:.2,LB:-.1','GV,ED',2,'engineers, not politicians, will run a planned economy',['the engineers claim waste can be abolished by chart','a commission has promised a ten-year plan','the lecture halls are full for the new science of management'],1),
 M('mechtv','Mechanical television','the scanning-disc television','H','MD:.3,CM:.2','CM,RS',3,'moving pictures by wire will enter every parlour',['a demonstration showed a face flickering across a room','the syndicate has a hundred-line picture and promises more','crowds gather to watch the scanning disc spin'],2)],
// ---- 1950
[M('compute','Electronic computing','the electronic computers','R','CO:.6,RS:.2,MF:.1,LB:-.1','RS,CP',0,'electronic computers will absorb the world\'s clerical work',['payroll that took a hundred clerks now runs overnight','the census bureau has ordered a second machine','the laboratory waits months for its slot on the machine'],0),
 M('jet','Jet aviation','the jet fleets','R','TR:.5,MI:.3,EN:.1,EV:-.1','EN,MF',1,'the jet will shrink the world and the air arm that rules it',['airlines have ordered jets they cannot yet fuel','the new bomber can reach any capital without refuelling','airports are lengthening runways across the country'],0),
 M('tv','Broadcast television','the television networks','R','MD:.5,CM:.2,ED:.1,GV:.1','CM,CP',0,'television will become the common living room of the nation',['the network added forty stations in a year','families are moving the set into the best room','politicians are hiring stylists before speechwriters'],0),
 M('hybrid','Hybrid crops and fertiliser','the seed and fertiliser programs','R','FD:.6,PO:.4,EV:-.1,LB:-.1','RS,IN',1,'new seed and fertiliser will outrun famine',['trial plots yield double the old strains','the ministry has ordered seed for a million acres','bread prices have stopped climbing for the first time in memory'],0),
 M('atompower','Atomic power too cheap to meter','the atomic power programme','H','EN:.7,EV:.1','RS,MI',2,'atomic power will be too cheap to meter within a generation',['the minister promises electricity without bills','a pilot reactor lit a town for an afternoon','the utilities have signed options for stations not yet designed'],2),
 M('flycar','Personal aircraft and rocket mail','the family aircraft','H','TR:.25,MF:.1','MF,CP',2,'every family will soon keep a small aircraft in the garage',['a prototype took off from a lawn to cheering crowds','the maker claims a hundred thousand reservations','the magazine cover shows commuters in the sky'],1),
 M('transistor','The transistor','the solid-state devices','W','CO:.4,RS:.2,CM:.2','RS,MF',2,'solid-state devices will shrink electronics out of the cabinet',['a laboratory radio runs on a battery for months','the lab is cutting valves from its next design','military buyers have asked for samples'],1)],
// ---- 1980
[M('pc','The personal computer','the desktop machines','R','CO:.6,ED:.2,MF:.2,LB:-.2','CO,CP',0,'a computer on every desk will rewire office and school',['small firms are buying desktops without asking permission','the school board has voted for a lab','the spreadsheet is replacing the analyst pool'],0),
 M('container','Containerised global shipping','the container terminals','R','TR:.5,MF:.3,CP:.3,LB:-.2,EV:-.15','TR,IN',0,'the shipping container will make the factory floor global',['docks that took a week now turn a ship in a day','factories are moving across oceans to follow cheap labour','the unions complain of cranes where gangs once stood'],0),
 M('biotech','Recombinant biotechnology','the gene-splicing firms','R','ME:.5,FD:.3,RS:.2','RS,CP',1,'splicing genes will make medicine and crops to order',['a start-up has produced insulin from bacteria','the university lab spun out a company in a month','crop trials of spliced seed are under licence'],0),
 M('finance','Deregulated finance','the leveraged-buyout houses','R','CP:.5,GV:-.2,LB:-.2,MF:-.1','CP,GV',1,'deregulation will unlock capital and strip the slack from firms',['a raider has bought a conglomerate with its own debt','the banks are lending against what has not been built','takeovers now outnumber factory openings'],0),
 M('fusion','Clean fusion power','the table-top fusion claim','H','EN:.6,EV:.2','RS,EN',2,'fusion on a bench-top will end the energy question',['a press conference announced excess heat','three universities are chasing the result','the minister promises a reactor by decade\'s end'],2),
 M('expert','Expert-system artificial intelligence','the expert-system firms','H','CO:.4,RS:.2,LB:-.1','CO,RS',2,'expert-system AI will do the work of professionals',['the shell promises a diagnostician in a box','venture money is chasing every knowledge-engineering firm','the demonstration answered a bank\'s credit questions flawlessly'],1),
 M('cellular','Cellular telephony','the cellular networks','W','CM:.5,CP:.2,LB:.05','CM,IN',2,'a telephone in every pocket will unbind work from the desk',['a brick-sized handset sold out in a week','the carrier covers only three cities but has a waiting list','executives want one in the car and one in the briefcase'],1)],
// ---- 2010
[M('smart','Smartphones and platforms','the app platforms','R','CM:.5,CO:.3,MD:.3,LB:-.1,GV:-.1','CM,CO',0,'the smartphone will become the platform on which commerce and talk run',['app downloads double every half-year','news is read on the phone before it is read in print','a platform now holds more user hours than any broadcaster'],0),
 M('cloud','Cloud and data centres','the cloud data centres','R','CO:.6,EN:-.1,CP:.2,RS:.2','CO,IN',0,'rented computing at scale will replace the corporate server room',['firms are closing their server rooms','a start-up scaled to millions on rented machines','the utility says data centres are now its fastest-growing load'],0),
 M('crispr','Gene editing and mRNA','the gene-editing laboratories','R','ME:.5,RS:.2,FD:.1','RS,CP',1,'programmable genes and mRNA will turn medicine into engineering',['a trial reversed a disease once thought permanent','editing costs fell a hundredfold in five years','regulators are scrambling to write a category for it'],0),
 M('solar','Solar and batteries','the solar and battery factories','R','EN:.5,EV:.3,MF:.1,IN:.1','EN,MF',1,'cheap solar and batteries will undercut every other power source',['panel prices fell below a coal station\'s fuel bill','a state ran for a day on sun and storage','grid operators are bidding storage into peaks'],0),
 M('chain','Blockchain currencies','the token exchanges','H','CP:.3,GV:-.2,EN:-.2','CP,CO',2,'tokens on a public ledger will replace banks and states',['a token rose twenty-fold in a season','a hundred founders have raised money on a white paper','a bank has announced a task force on the distributed ledger'],2),
 M('selfdrive','Self-driving vehicles','the self-driving fleets','H','TR:.4,LB:-.3,EN:-.05','CO,TR',2,'driverless cars will be carrying paying passengers within two years',['a fleet map shows cars gliding downtown at no cost','every automaker has announced a driverless date','the prototype navigated a test circuit unattended'],1),
 M('ml','Large-scale machine learning','the learning-model labs','W','CO:.5,LB:-.3,RS:.3,MD:.1','CO,RS',2,'learning machines will take over perception and then judgment',['a model beat the best human at a game once thought safe','image-sorting jobs are disappearing in a back office','labs are hiring PhDs at football-player salaries'],1)],
// ---- 2050
[M('orbital','Orbital manufacturing','the orbital foundries','R','MF:.4,RS:.2,IN:.2,EN:-.05','MF,RS',0,'microgravity foundries will make what Earth cannot',['alloys from orbit are specified in turbine blades','a yard has launched its fourth crane','insurers now price risk for objects, not ships'],0),
 M('grid','Continental smart grid','the continental grid','R','EN:.4,IN:.3,EV:.2,CO:.1','EN,IN',0,'a continental grid will let weather power everything',['storage and grid links absorbed a record calm week','a tie-line across two climate zones cut peak prices','neighbours are trading hours of sunlight'],0),
 M('cultured','Cultured and vertical food','the vertical farms and vats','R','FD:.5,EV:.2,PO:.2,LB:-.1','FD,EN',1,'grown food in towers and vats will free the land',['a metropolis ate its own vats for a season','farm land near cities is being rewilded','a bread-and-meat price index fell for the third year'],0),
 M('tutor','Personal AI tutors and agents','the tutor agents','R','ED:.5,CO:.2,LB:-.2,GV:-.05','CO,ED',1,'a personal tutor-agent for every child will rewrite schooling and work',['the pilot district doubled its reading results','employers ask what the agent can do, not the degree','teachers\' unions are bargaining over the agent\'s place'],0),
 M('longevity','Radical longevity medicine','the longevity clinics','H','ME:.4,PO:.3,GV:-.2','ME,RS',2,'senolytic therapies will add decades of healthy life',['the clinics advertise reversal of a decade','a billionaire\'s foundation has thrown a prize at it','the trial mouse lived to astonishing ages'],2),
 M('upload','Brain-computer merging','the neural-interface firms','H','CO:.3,ME:.2','CO,ME',3,'brain-computer interfaces will let minds join the net',['a volunteer typed with thought at sixty words a minute','the founder says memory will be backed up by decade\'s end','a thousand early adopters sit on the waiting list'],2),
 M('fusion2','Commercial fusion','the fusion plants','W','EN:.7,EV:.1,IN:.1','EN,RS',2,'fusion plants will make energy abundant',['the reactor held net power for a full day','the grid has pre-bought power from a plant not yet built','three consortia are racing for the first plant'],1)]
];
FA.MECH={};FA.MECHS.forEach((arr,e)=>arr.forEach(m=>{m.era=e;FA.MECH[m.id]=m;}));
FA.ESTAMPS=['CONFIRMED','SINGLE SOURCE','UNVERIFIED','RUMOUR'];
})();
